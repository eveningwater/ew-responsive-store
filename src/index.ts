export { StorageManager } from './core/storage';
export { StoreType, ParseStrType } from './core/types';
export type { 
  BaseStoreOptions,
  VueStoreOptions,
  ReactStoreOptions,
  PreactStoreOptions,
  SolidStoreOptions,
  SvelteStoreOptions,
  AngularStoreOptions,
  VanillaStoreOptions,
  StorageReturn,
  AngularStorageReturn,
  IStorageManager
} from './core/types';

export { parseStr, isValidJSON, isStorageEnabled } from './core/utils';

export { useStorage, GlobalStorageManager, globalStorage } from './adapters/vanilla';

