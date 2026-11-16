// Angular专用入口文件
// 只包含Angular相关的依赖和功能

// 导出核心功能
export {
  StorageManager,
  getStorageManager,
  getRegisteredManagers,
  clearManagedStorage,
  clearStorageManagerRegistry,
} from '../core/storage';
export { StoreType, ParseStrType } from '../core/types';
export type {
  ParseMode,
  StorageErrorContext,
  StorageUpdater,
  BaseStoreOptions,
  AngularStoreOptions,
  AngularStorageReturn,
  IStorageManager,
} from '../core/types';

export { parseStr, isValidJSON, isStorageEnabled } from '../core/utils';

// 导出Angular适配器
export { useStorage as useAngularStorage, StorageService } from '../adapters/angular';

// 导出原生版本作为备用
export { useStorage as useVanillaStorage, GlobalStorageManager, globalStorage } from '../adapters/vanilla';
