import { createSignal, onCleanup } from 'solid-js';
import { getStorageManager, releaseStorageManager, retainStorageManager } from '../core/storage';
import {
  SolidStoreOptions,
  StorageActions,
  StorageReturn,
  StorageUpdater,
} from '../core/types';

/**
 * Solid 版 useStorage，返回 `[signal, setValue, actions]`。
 * 同 key 的所有组件共享同一个管理器实例。
 */
export function useStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: SolidStoreOptions<T> = {},
): StorageReturn<T> {
  const manager = getStorageManager<T>(key, initialValue, options);

  const [value, setSignal] = createSignal<T>(manager.getSnapshot(), {
    equals: Object.is,
  });

  const unsubscribe = manager.subscribe((next) => {
    setSignal(() => next);
  });
  retainStorageManager(manager.key, manager.storageType);

  onCleanup(() => {
    unsubscribe();
    releaseStorageManager(manager.key, manager.storageType);
  });

  const setValue = (next: StorageUpdater<T>) => manager.setValue(next);

  const actions: StorageActions<T> = {
    key,
    remove: () => manager.remove(),
    clear: () => manager.clear(),
    manager,
  };

  return [value, setValue, actions] as unknown as StorageReturn<T>;
}
