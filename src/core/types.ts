export enum StoreType {
  LOCAL = 'localStorage',
  SESSION = 'sessionStorage',
}

export enum ParseStrType {
  EVAL = 'eval',
  JSON = 'json',
}

// 基础存储选项
export interface BaseStoreOptions {
  storage?: StoreType;
}

// Vue存储选项
export interface VueStoreOptions extends BaseStoreOptions {
  immediate?: boolean;
  deep?: boolean;
}

// React存储选项
export interface ReactStoreOptions extends BaseStoreOptions {
  // React特有选项可以在这里添加
}

// Preact存储选项（与React相同）
export interface PreactStoreOptions extends ReactStoreOptions {
  // Preact特有选项可以在这里添加
}

// Solid存储选项
export interface SolidStoreOptions extends BaseStoreOptions {
  // Solid特有选项可以在这里添加
}

// Svelte存储选项
export interface SvelteStoreOptions extends BaseStoreOptions {
  // Svelte特有选项可以在这里添加
}

// Angular存储选项
export interface AngularStoreOptions extends BaseStoreOptions {
  // Angular特有选项可以在这里添加
}

// 原生JavaScript存储选项
export interface VanillaStoreOptions extends BaseStoreOptions {
  // 原生JavaScript特有选项可以在这里添加
}

// 存储返回值类型
export type StorageReturn<T> = [T, (value: T) => void];

// Angular存储返回值类型
export interface AngularStorageReturn<T> {
  value: () => T;
  setValue: (value: T) => void;
  updateValue: (updater: (current: T) => T) => void;
  reset: () => void;
}

// 存储管理器接口
export interface IStorageManager<T> {
  getValue(): T;
  setValue(value: T): void;
  subscribe(listener: (value: T) => void): () => void;
  destroy(): void;
}
