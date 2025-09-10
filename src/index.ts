// 导出所有核心功能
export { useStorage } from './core/core';
export type { StoreOptions } from './core/core';
export { useReactStorage } from './core/use-react-storage';
export type { ReactStoreOptions } from './core/use-react-storage';
export { StoreType, parseStrType } from './core/enum';
export { parseStr, isValidJSON, isStorageEnabled } from './core/utils';
