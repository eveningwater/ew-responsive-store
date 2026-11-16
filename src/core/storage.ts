import { isBrowser, isFunction, isNull, isUndefined } from '@ew-color-picker/utils';
import {
  BaseStoreOptions,
  IStorageManager,
  ParseMode,
  StorageErrorContext,
  StorageErrorOperation,
  StorageUpdater,
  StoreType,
} from './types';
import {
  PARSE_FAILED,
  createMemoryStorage,
  defaultDeserialize,
  defaultEquals,
  defaultSerialize,
  getStorageArea,
  isStorageEnabled,
} from './utils';

const UNINITIALIZED = Symbol('ew-responsive-store:uninitialized');
const VERSION_SUFFIX = '::__rds_version__';

interface ResolvedOptions<T> {
  storage: StoreType;
  parse: ParseMode;
  serializer: (value: T) => string | null | undefined;
  deserializer: ((raw: string) => T) | null;
  equals: (a: T, b: T) => boolean;
  version?: number;
  migrate?: (oldValue: unknown, oldVersion: number) => T;
  memoryFallback: boolean;
  onError?: (context: StorageErrorContext) => void;
}

const resolveOptions = <T>(options: BaseStoreOptions<T>): ResolvedOptions<T> => ({
  storage: options.storage ?? StoreType.LOCAL,
  parse: options.parse ?? 'json',
  serializer: options.serializer ?? ((value: T) => defaultSerialize(value, options.parse ?? 'json')),
  deserializer: options.deserializer ?? null,
  equals: options.equals ?? defaultEquals,
  version: options.version,
  migrate: options.migrate,
  memoryFallback: options.memoryFallback !== false,
  onError: options.onError,
});

export class StorageManager<T> implements IStorageManager<T> {
  readonly key: string;
  readonly storageType: StoreType;

  private options: ResolvedOptions<T>;
  private storageArea: Storage | null;
  private memoryArea: Storage;
  private initialValue: T | (() => T);
  private initialResolved: T | typeof UNINITIALIZED = UNINITIALIZED;
  private current: T | typeof UNINITIALIZED = UNINITIALIZED;
  private lastRaw: string | null | undefined = undefined;
  private usingMemory = false;
  // 迁移结果延迟到非渲染阶段落盘，保证 getSnapshot 不产生写副作用
  private pendingMigration = false;
  private listeners = new Set<(value: T) => void>();
  private windowListener?: (e: StorageEvent) => void;

  constructor(
    key: string,
    initialValue: T | (() => T),
    options: BaseStoreOptions<T> = {},
  ) {
    this.key = key;
    this.initialValue = initialValue;
    this.options = resolveOptions(options);
    this.storageType = this.options.storage;
    this.memoryArea = createMemoryStorage();
    this.storageArea = this.getAvailableArea();

    if (!this.storageArea) {
      this.report('unavailable', new Error(`[rds error]: ${this.storageType} is not available!`));
      if (!this.options.memoryFallback) {
        throw new Error(`[rds error]: ${this.storageType} is not available!`);
      }
      this.usingMemory = true;
    }
  }

  getValue(): T {
    return this.getSnapshot();
  }

  getSnapshot = (): T => {
    if (this.current === UNINITIALIZED) {
      const raw = this.readRaw();
      this.lastRaw = raw;
      this.current = this.loadValue(raw);
    }
    return this.current as T;
  };

  getInitialSnapshot = (): T => this.resolveInitial();

  setValue = (valueOrUpdater: StorageUpdater<T>): void => {
    this.flushPendingMigration();
    const prev = this.getSnapshot();
    const next = isFunction(valueOrUpdater)
      ? (valueOrUpdater as (prev: T) => T)(prev)
      : valueOrUpdater;

    const serialized = this.serializeValue(next);
    if (isNull(serialized)) return;

    // 序列化结果一致才跳过；这样 Vue deep watch 的就地修改（引用不变）也能落盘
    if (serialized === this.lastRaw && this.options.equals(prev, next)) return;

    this.writeSerialized(serialized);
    this.current = next;
    this.notify(next);
  };

  subscribe = (listener: (value: T) => void): (() => void) => {
    this.flushPendingMigration();
    if (this.listeners.size === 0) {
      // 无订阅者期间存储可能已被其他标签页或外部代码修改，先刷新一次
      this.refresh();
      this.attachWindowListener();
    }
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.detachWindowListener();
      }
    };
  };

  remove = (): void => {
    this.pendingMigration = false;
    const area = this.getWritableArea();
    this.safeRun('remove', () => area.removeItem(this.key));
    this.safeRun('remove', () => area.removeItem(this.versionKey));
    if (area !== this.memoryArea) {
      this.safeRun('remove', () => this.memoryArea.removeItem(this.key));
    }

    this.lastRaw = null;
    const prev = this.getSnapshot();
    const next = this.resolveInitial();
    if (this.options.equals(prev, next)) return;
    this.current = next;
    this.notify(next);
  };

  clear = (): void => {
    clearManagedStorage(this.storageType);
  };

  destroy(): void {
    this.detachWindowListener();
    this.listeners.clear();
  }

  private get versionKey() {
    return `${this.key}${VERSION_SUFFIX}`;
  }

  private getAvailableArea(): Storage | null {
    const area = getStorageArea(this.options.storage);
    if (!area) return null;
    return isStorageEnabled(area) ? area : null;
  }

  private getWritableArea(): Storage {
    return this.usingMemory || !this.storageArea ? this.memoryArea : this.storageArea;
  }

  private readRaw(): string | null {
    const area = this.getWritableArea();
    const raw = this.safeGet(area, this.key);

    if (isNull(raw) && area !== this.memoryArea) {
      const memoryRaw = this.safeGet(this.memoryArea, this.key);
      if (!isNull(memoryRaw)) return memoryRaw;
    }
    return raw;
  }

  private readStoredVersion(): number {
    const raw = this.safeGet(this.getWritableArea(), this.versionKey);
    if (isNull(raw)) return 0;
    const version = Number(raw);
    return Number.isFinite(version) ? version : 0;
  }

  private loadValue(raw: string | null): T {
    if (isNull(raw)) return this.resolveInitial();

    let value = this.deserialize(raw);

    const { version, migrate } = this.options;
    if (!isUndefined(version) && isFunction(migrate)) {
      const oldVersion = this.readStoredVersion();
      if (oldVersion < version) {
        try {
          value = migrate(value, oldVersion);
          this.pendingMigration = true;
        } catch (error) {
          this.report('migrate', error);
        }
      }
    }

    return value;
  }

  private deserialize(raw: string): T {
    if (this.options.deserializer) {
      try {
        return this.options.deserializer(raw);
      } catch (error) {
        this.report('parse', error);
        return this.resolveInitial();
      }
    }

    const parsed = defaultDeserialize(raw, this.options.parse);
    if (parsed === PARSE_FAILED) {
      this.report('parse', new Error(`[rds error]: failed to parse stored value of "${this.key}"`));
      return this.resolveInitial();
    }
    return parsed as T;
  }

  private serializeValue(value: T): string | null {
    let serialized: string | null | undefined;
    try {
      serialized = this.options.serializer(value);
    } catch (error) {
      this.report('write', error);
      return null;
    }

    if (isNull(serialized) || isUndefined(serialized)) {
      this.report(
        'write',
        new Error(`[rds error]: value of "${this.key}" can not be serialized, write skipped`),
      );
      return null;
    }

    return serialized;
  }

  private writeValue(value: T): void {
    const serialized = this.serializeValue(value);
    if (isNull(serialized)) return;
    this.writeSerialized(serialized);
  }

  private writeSerialized(serialized: string): void {
    const area = this.getWritableArea();
    try {
      area.setItem(this.key, serialized);
    } catch (error) {
      this.report('write', error);
      if (this.options.memoryFallback) {
        this.usingMemory = true;
        this.safeRun('write', () => this.memoryArea.setItem(this.key, serialized));
      }
    }

    this.lastRaw = serialized;

    if (!isUndefined(this.options.version)) {
      this.safeRun('write', () => {
        this.getWritableArea().setItem(this.versionKey, String(this.options.version));
      });
    }
  }

  private refresh(): void {
    if (this.current === UNINITIALIZED) {
      this.getSnapshot();
    } else {
      const raw = this.readRaw();
      if (raw === this.lastRaw) {
        this.flushPendingMigration();
        return;
      }
      this.lastRaw = raw;
      this.current = this.loadValue(raw);
    }
    this.flushPendingMigration();
  }

  private flushPendingMigration(): void {
    if (!this.pendingMigration || this.current === UNINITIALIZED) return;
    this.pendingMigration = false;
    this.writeValue(this.current as T);
  }

  private applyExternalValue(raw: string | null): void {
    if (raw === this.lastRaw) return;
    this.lastRaw = raw;
    this.current = this.loadValue(raw);
    this.flushPendingMigration();
    this.notify(this.current as T);
  }

  private attachWindowListener(): void {
    if (!isBrowser || !this.storageArea) return;

    this.windowListener = (event: StorageEvent) => {
      if (event.storageArea && event.storageArea !== this.storageArea) return;

      // 其它标签页调用了 storage.clear()
      if (isNull(event.key)) {
        this.applyExternalValue(null);
        return;
      }

      if (event.key === this.key) {
        this.applyExternalValue(event.newValue);
        return;
      }

      if (event.key === this.versionKey) {
        this.refresh();
        this.notify(this.getSnapshot());
      }
    };

    window.addEventListener('storage', this.windowListener);
  }

  private detachWindowListener(): void {
    if (this.windowListener && isBrowser) {
      window.removeEventListener('storage', this.windowListener);
    }
    this.windowListener = undefined;
  }

  private notify(value: T): void {
    this.listeners.forEach((listener) => {
      try {
        listener(value);
      } catch (error) {
        this.report('write', error);
      }
    });
  }

  private resolveInitial(): T {
    if (this.initialResolved === UNINITIALIZED) {
      this.initialResolved = isFunction(this.initialValue)
        ? (this.initialValue as () => T)()
        : (this.initialValue as T);
    }
    return this.initialResolved as T;
  }

  private safeGet(area: Storage, key: string): string | null {
    try {
      return area.getItem(key);
    } catch (error) {
      this.report('read', error);
      return null;
    }
  }

  private safeRun(operation: StorageErrorOperation, fn: () => void): void {
    try {
      fn();
    } catch (error) {
      this.report(operation, error);
    }
  }

  private report(operation: StorageErrorOperation, error: unknown): void {
    const context: StorageErrorContext = {
      key: this.key,
      storage: this.storageType,
      operation,
      error,
    };
    if (this.options.onError) {
      try {
        this.options.onError(context);
      } catch (e) {
        // onError 自身异常不应影响存储流程
      }
      return;
    }
    if (isBrowser && typeof console !== 'undefined') {
      console.error(`[rds error](${operation}):`, error);
    }
  }
}

const managerRegistry = new Map<string, StorageManager<any>>();

const getRegistryId = (key: string, storage: StoreType) => `${storage}:${key}`;

/**
 * 获取（或创建）同 key 的共享管理器。
 * 同一 key + 存储区域的所有组件共用同一个实例，因此同标签页内天然同步。
 * 注意：options 与 initialValue 只在首次创建时生效。
 */
export function getStorageManager<T>(
  key: string,
  initialValue: T | (() => T),
  options: BaseStoreOptions<T> = {},
): StorageManager<T> {
  const id = getRegistryId(key, options.storage ?? StoreType.LOCAL);
  const existing = managerRegistry.get(id);
  if (existing) return existing as StorageManager<T>;

  const manager = new StorageManager<T>(key, initialValue, options);
  managerRegistry.set(id, manager);
  return manager;
}

/** 获取已注册的管理器列表 */
export function getRegisteredManagers(storage?: StoreType): StorageManager<any>[] {
  if (isUndefined(storage)) return Array.from(managerRegistry.values());
  return Array.from(managerRegistry.values()).filter((manager) => manager.storageType === storage);
}

/**
 * 清空由本库管理的 key。
 * 注意：不会调用原生 `storage.clear()`，避免误删业务方自己的数据。
 */
export function clearManagedStorage(storage?: StoreType): void {
  getRegisteredManagers(storage).forEach((manager) => manager.remove());
}

/** 销毁并移除所有已注册的管理器（主要用于测试或热更新） */
export function clearStorageManagerRegistry(): void {
  managerRegistry.forEach((manager) => manager.destroy());
  managerRegistry.clear();
}
