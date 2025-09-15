// React专用入口文件
// 只包含React相关的依赖和功能

// 导出核心功能
export { StorageManager } from './core/storage';
export { StoreType, ParseStrType } from './core/types';
export type { 
  BaseStoreOptions,
  ReactStoreOptions,
  StorageReturn,
  IStorageManager
} from './core/types';

export { parseStr, isValidJSON, isStorageEnabled } from './core/utils';

// 导出React适配器
export { useStorage as useReactStorage } from './adapters/react';

// 导出原生版本作为备用
export { useStorage as useVanillaStorage, GlobalStorageManager, globalStorage } from './adapters/vanilla';
