// Preact专用入口文件
// 只包含Preact相关的依赖和功能

// 导出核心功能
export {
  StorageManager,
  getStorageManager,
  retainStorageManager,
  releaseStorageManager,
  getRegisteredManagers,
  clearManagedStorage,
  clearStorageManagerRegistry,
} from '../core/storage';
export { StoreType, ParseStrType } from '../core/types';
export type {
  ParseMode,
  StorageErrorContext,
  StorageUpdater,
  StorageActions,
  BaseStoreOptions,
  PreactStoreOptions,
  StorageReturn,
  IStorageManager,
} from '../core/types';

export { parseStr, isValidJSON, isStorageEnabled } from '../core/utils';

// 导出Preact适配器
export { useStorage, useStorage as usePreactStorage } from '../adapters/preact';

// 导出原生版本作为备用
export { useStorage as useVanillaStorage, GlobalStorageManager, globalStorage } from '../adapters/vanilla';
