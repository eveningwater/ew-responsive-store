import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { getStorageManager, releaseStorageManager, retainStorageManager } from '../core/storage';
import {
  PreactStoreOptions,
  StorageActions,
  StorageReturn,
  StorageUpdater,
  StoreType,
} from '../core/types';

/**
 * Preact 版 useStorage。
 * 与 React 版行为一致，但使用 `useState` + 订阅实现（preact/hooks 不提供 useSyncExternalStore）。
 */
export function useStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: PreactStoreOptions<T> = {},
): StorageReturn<T> {
  const storageType = options.storage ?? StoreType.LOCAL;

  const manager = useMemo(
    () => getStorageManager<T>(key, initialValue, options),
    [key, storageType],
  );

  const [state, setState] = useState(() => ({
    manager,
    value: manager.getSnapshot(),
  }));

  // key 变化时同步切换（渲染阶段更新，避免闪一帧旧值）
  let current = state;
  if (state.manager !== manager) {
    current = { manager, value: manager.getSnapshot() };
    setState(current);
  }

  useEffect(() => {
    const sync = (next: T) => {
      setState((prev) =>
        prev.manager === manager && Object.is(prev.value, next)
          ? prev
          : { manager, value: next },
      );
    };

    const unsubscribe = manager.subscribe(sync);
    retainStorageManager(manager.key, manager.storageType);
    // 覆盖订阅前可能发生的变更
    sync(manager.getSnapshot());
    return () => {
      unsubscribe();
      releaseStorageManager(manager.key, manager.storageType);
    };
  }, [manager]);

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

  return [current.value, setValue, actions];
}
