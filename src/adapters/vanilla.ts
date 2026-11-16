import { clearStorageManagerRegistry, getStorageManager } from '../core/storage';
import { StorageUpdater, VanillaStoreOptions } from '../core/types';

// 导出StoreType供原生JavaScript使用
export { StoreType } from '../core/types';

export interface VanillaStorageReturn<T> {
  readonly value: T;
  setValue: (value: StorageUpdater<T>) => void;
  updateValue: (updater: (current: T) => T) => void;
  reset: () => void;
  remove: () => void;
  clear: () => void;
  subscribe: (listener: (value: T) => void) => () => void;
  destroy: () => void;
}

/**
 * 原生 JavaScript 版 useStorage。
 * 同一个 key 的所有调用共享同一个管理器实例。
 */
export function useStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: VanillaStoreOptions<T> = {},
): VanillaStorageReturn<T> {
  const manager = getStorageManager<T>(key, initialValue, options);
  const listeners = new Set<(value: T) => void>();

  const unsubscribeManager = manager.subscribe((next) => {
    listeners.forEach((listener) => listener(next));
  });

  const result: VanillaStorageReturn<T> = {
    get value() {
      return manager.getSnapshot();
    },
    setValue: (next) => manager.setValue(next),
    updateValue: (updater) => manager.setValue(updater),
    reset: () => manager.remove(),
    remove: () => manager.remove(),
    clear: () => manager.clear(),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy: () => {
      listeners.clear();
      unsubscribeManager();
    },
  };

  return result;
}

// 便捷的全局存储管理器
export class GlobalStorageManager {
  private instances = new Set<VanillaStorageReturn<any>>();

  getStorage<T>(
    key: string,
    initialValue: T | (() => T),
    options?: VanillaStoreOptions<T>,
  ): VanillaStorageReturn<T> {
    const storage = useStorage(key, initialValue, options);
    this.instances.add(storage);
    return storage;
  }

  destroyAll() {
    this.instances.forEach((storage) => storage.destroy());
    this.instances.clear();
  }

  /** 清空由本库管理的所有 key */
  clearAll() {
    clearStorageManagerRegistry();
    this.instances.clear();
  }
}

// 全局单例实例
export const globalStorage = new GlobalStorageManager();
