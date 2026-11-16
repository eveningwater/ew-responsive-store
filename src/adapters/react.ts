import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { getStorageManager } from '../core/storage';
import {
  ReactStoreOptions,
  StorageActions,
  StorageReturn,
  StorageUpdater,
  StoreType,
} from '../core/types';

/**
 * React 版 useStorage。
 *
 * - 基于 `useSyncExternalStore`，天然支持同标签页多组件、跨标签页与 SSR
 * - 同 key 的所有组件共享同一个管理器实例
 * - setter 支持函数式更新：`setValue(prev => ({ ...prev, a: 1 }))`
 *
 * 注意：`options` 与 `initialValue` 只在首次按 key 创建实例时生效，
 * 之后同一 key 会复用已有实例。
 */
export function useStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: ReactStoreOptions<T> = {},
): StorageReturn<T> {
  const storageType = options.storage ?? StoreType.LOCAL;

  const manager = useMemo(
    () => getStorageManager<T>(key, initialValue, options),
    // key / 存储区域变化时重新创建，保证能读到新 key 的数据
    [key, storageType],
  );

  const value = useSyncExternalStore(
    manager.subscribe,
    manager.getSnapshot,
    manager.getInitialSnapshot,
  );

  const setValue = useCallback(
    (next: StorageUpdater<T>) => manager.setValue(next),
    [manager],
  );

  const actions = useMemo<StorageActions<T>>(
    () => ({
      key,
      remove: () => manager.remove(),
      clear: () => manager.clear(),
      manager,
    }),
    [key, manager],
  );

  return [value, setValue, actions];
}
