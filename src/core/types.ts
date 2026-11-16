export enum StoreType {
  LOCAL = 'localStorage',
  SESSION = 'sessionStorage',
}

/**
 * 字符串解析方式。
 * @deprecated EVAL 内部使用 `new Function`，在严格 CSP（含 Tauri / Electron 加固）环境下会直接抛错，
 * 请改用 `JSON` 或 `AUTO`。该类仅为兼容旧版本保留。
 */
export enum ParseStrType {
  EVAL = 'eval',
  JSON = 'json',
  AUTO = 'auto',
}

/**
 * 反序列化模式：
 * - `json`：严格 JSON，解析失败回落到初始值（默认）
 * - `auto`：兼容历史裸字符串。读取时只有以 `{`、`[`、`"` 开头的字符串才尝试 JSON 解析，
 *   其余原样返回；写入时字符串原样存储，其他类型仍走 JSON.stringify。
 *   这样 `'dark'`、`'1'` 这类历史裸字符串不会被破坏。
 */
export type ParseMode = 'json' | 'auto';

/** 出错的环节 */
export type StorageErrorOperation =
  | 'read'
  | 'write'
  | 'parse'
  | 'remove'
  | 'migrate'
  | 'unavailable';

/** 错误上下文，交给 `onError` 处理 */
export interface StorageErrorContext {
  key: string;
  storage: StoreType;
  operation: StorageErrorOperation;
  error: unknown;
}

// 基础存储选项
export interface BaseStoreOptions<T = any> {
  /** 使用的存储区域，默认 localStorage */
  storage?: StoreType;
  /** 反序列化模式，默认 'json' */
  parse?: ParseMode;
  /** 自定义序列化，返回 null / undefined 时拒绝写入 */
  serializer?: (value: T) => string | null | undefined;
  /** 自定义反序列化 */
  deserializer?: (raw: string) => T;
  /** 数据版本号，配合 migrate 使用 */
  version?: number;
  /** 版本迁移，返回迁移后的新值 */
  migrate?: (oldValue: unknown, oldVersion: number) => T;
  /** 相等判断，默认按引用 / JSON 字符串比较，相等时跳过写入与通知 */
  equals?: (a: T, b: T) => boolean;
  /** 存储不可用或写入失败时是否降级到内存存储，默认 true */
  memoryFallback?: boolean;
  /** 错误回调，便于接入日志 / 上报 */
  onError?: (context: StorageErrorContext) => void;
}

// Vue存储选项
export interface VueStoreOptions<T = any> extends BaseStoreOptions<T> {
  /** 是否在创建时立即把当前值写回存储（默认 false，值已经由存储初始化） */
  immediate?: boolean;
  /** 是否深度监听值变化，默认 true */
  deep?: boolean;
  [key: string]: any;
}

// React存储选项
export interface ReactStoreOptions<T = any> extends BaseStoreOptions<T> {
  // React特有选项可以在这里添加
}

// Preact存储选项（与React相同）
export interface PreactStoreOptions<T = any> extends ReactStoreOptions<T> {
  // Preact特有选项可以在这里添加
}

// Solid存储选项
export interface SolidStoreOptions<T = any> extends BaseStoreOptions<T> {
  // Solid特有选项可以在这里添加
}

// Svelte存储选项
export interface SvelteStoreOptions<T = any> extends BaseStoreOptions<T> {
  // Svelte特有选项可以在这里添加
}

// Angular存储选项
export interface AngularStoreOptions<T = any> extends BaseStoreOptions<T> {
  // Angular特有选项可以在这里添加
}

// 原生JavaScript存储选项
export interface VanillaStoreOptions<T = any> extends BaseStoreOptions<T> {
  // 原生JavaScript特有选项可以在这里添加
}

/** 值更新器：直接给新值，或基于旧值计算 */
export type StorageUpdater<T> = T | ((prev: T) => T);

/** 除值以外的操作集合 */
export interface StorageActions<T> {
  key: string;
  /** 删除当前 key，值回落初始值 */
  remove(): void;
  /** 清空当前存储区域内由本库管理的所有 key */
  clear(): void;
  /** 底层管理器，便于高级用法 */
  manager: IStorageManager<T>;
}

// 存储返回值类型
export type StorageReturn<T> = readonly [
  T,
  (value: StorageUpdater<T>) => void,
  StorageActions<T>
];

// Angular存储返回值类型
export interface AngularStorageReturn<T> {
  value: () => T;
  setValue: (value: StorageUpdater<T>) => void;
  updateValue: (updater: (current: T) => T) => void;
  reset: () => void;
  remove: () => void;
  clear: () => void;
}

// 存储管理器接口
export interface IStorageManager<T> {
  readonly key: string;
  readonly storageType: StoreType;
  /** 读取当前值（等价于 getSnapshot） */
  getValue(): T;
  /** 读取稳定的当前值引用，可直接给 useSyncExternalStore 使用 */
  getSnapshot(): T;
  /** 服务端 / 首次渲染快照，始终返回初始值 */
  getInitialSnapshot(): T;
  /** 写入值，支持函数式更新 */
  setValue(value: StorageUpdater<T>): void;
  /** 订阅变化，返回取消订阅函数 */
  subscribe(listener: (value: T) => void): () => void;
  /** 删除当前 key 并回落初始值 */
  remove(): void;
  /** 清空当前存储区域内由本库管理的所有 key */
  clear(): void;
  /** 销毁监听器（共享实例请谨慎调用） */
  destroy(): void;
}
