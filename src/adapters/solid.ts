import { createSignal, createEffect, onCleanup } from 'solid-js';
import { StorageManager } from '../core/storage';
import { StoreType, SolidStoreOptions, StorageReturn } from '../core/types.js';

export function useStorage<T>(
  key: string,
  initialValue: T,
  options: SolidStoreOptions = {
    storage: StoreType.LOCAL
  }
): StorageReturn<T> {
  const { storage = StoreType.LOCAL } = options;
  
  const storageManager = new StorageManager(key, initialValue, storage);
  
  const [value, setValue] = createSignal<T>(storageManager.getValue());

  // 监听value变化并同步到storage
  createEffect(() => {
    storageManager.setValue(value());
  });

  // 监听storage变化（跨标签页同步）
  const unsubscribe = storageManager.subscribe((newValue) => {
    setValue(() => newValue);
  });

  // 组件卸载时清理
  onCleanup(() => {
    unsubscribe();
    storageManager.destroy();
  });

  return [value, setValue] as unknown as StorageReturn<T>;
}
