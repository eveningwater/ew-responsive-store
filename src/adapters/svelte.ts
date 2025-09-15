import { writable, type Writable } from 'svelte/store';
import { StorageManager } from '../core/storage';
import { StoreType, SvelteStoreOptions } from '../core/types.js';

export function useStorage<T>(
  key: string,
  initialValue: T,
  options: SvelteStoreOptions = {
    storage: StoreType.LOCAL
  }
): Writable<T> {
  const { storage = StoreType.LOCAL } = options;
  
  const storageManager = new StorageManager(key, initialValue, storage);
  const initialData = storageManager.getValue();
  
  const store = writable<T>(initialData);

  // 监听store变化并同步到storage
  store.subscribe((value) => {
    storageManager.setValue(value);
  });

  // 监听storage变化（跨标签页同步）
  const unsubscribe = storageManager.subscribe((newValue) => {
    store.set(newValue);
  });

  // 返回增强的store，包含清理方法
  return {
    ...store,
    destroy: () => {
      unsubscribe();
      storageManager.destroy();
    }
  } as Writable<T> & { destroy: () => void };
}
