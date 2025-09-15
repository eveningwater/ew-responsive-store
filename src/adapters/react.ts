import { useState, useEffect, useCallback } from 'react';
import { StorageManager } from '../core/storage';
import { StoreType, ReactStoreOptions, StorageReturn } from '../core/types.js';

export function useStorage<T>(
  key: string,
  initialValue: T,
  options: ReactStoreOptions = {
    storage: StoreType.LOCAL
  }
): StorageReturn<T> {
  const { storage = StoreType.LOCAL } = options;
  
  const storageManager = new StorageManager(key, initialValue, storage);
  
  const [value, setValue] = useState<T>(() => {
    return storageManager.getValue();
  });

  const updateValue = useCallback((newValue: T) => {
    setValue(newValue);
    storageManager.setValue(newValue);
  }, [storageManager]);

  // 监听storage变化（跨标签页同步）
  useEffect(() => {
    const unsubscribe = storageManager.subscribe((newValue) => {
      setValue(newValue);
    });

    return () => {
      unsubscribe();
      storageManager.destroy();
    };
  }, [storageManager]);

  return [value, updateValue];
}
