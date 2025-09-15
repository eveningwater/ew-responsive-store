// 导出核心功能
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

// 默认导出原生版本（无外部依赖）
export { useStorage, GlobalStorageManager, globalStorage } from './adapters/vanilla';

// 注意：框架特定的适配器现在通过独立的入口文件提供
// 这样可以避免在非目标框架环境中导入相关依赖
// 
// 使用方式：
// - 原生JS: import { useStorage } from 'ew-responsive-store'
// - React: import { useStorage } from 'ew-responsive-store/react'
// - Vue: import { useStorage } from 'ew-responsive-store/vue'
// - Preact: import { useStorage } from 'ew-responsive-store/preact'
// - Solid: import { useStorage } from 'ew-responsive-store/solid'
// - Svelte: import { useStorage } from 'ew-responsive-store/svelte'
// - Angular: import { useStorage } from 'ew-responsive-store/angular'
