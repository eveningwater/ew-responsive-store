// Svelte专用入口文件
// 只包含Svelte相关的依赖和功能

// 导出核心功能
export { StorageManager } from './core/storage';
export { StoreType, ParseStrType } from './core/types';
export type { 
  BaseStoreOptions,
  SvelteStoreOptions,
  StorageReturn,
  IStorageManager
} from './core/types';

export { parseStr, isValidJSON, isStorageEnabled } from './core/utils';

// 导出Svelte适配器
export { useStorage as useSvelteStorage } from './adapters/svelte';

// 导出原生版本作为备用
export { useStorage as useVanillaStorage, GlobalStorageManager, globalStorage } from './adapters/vanilla';
