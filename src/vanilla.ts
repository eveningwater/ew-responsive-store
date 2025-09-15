// 原生JavaScript专用入口文件
// 不包含任何框架依赖

// 导出核心功能
export { StorageManager } from './core/storage';
export { StoreType, ParseStrType } from './core/types';
export type { 
  BaseStoreOptions,
  VanillaStoreOptions,
  IStorageManager
} from './core/types';

export { parseStr, isValidJSON, isStorageEnabled } from './core/utils';

// 导出原生适配器
export { useStorage, GlobalStorageManager, globalStorage } from './adapters/vanilla';
