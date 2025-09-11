import { useState, useEffect, useCallback } from 'react';
import { StoreType } from '../core/enum';
import { isStorageEnabled, isValidJSON, parseStr } from '../core/utils';

export interface ReactStoreOptions {
  storage?: StoreType;
}

export function useReactStorage<T>(
  key: string,
  initialValue: T,
  options: ReactStoreOptions = {
    storage: StoreType.LOCAL
  }
) {
  const { storage = StoreType.LOCAL } = options;
  const currentStorage = storage === StoreType.LOCAL ? localStorage : sessionStorage;
  
  if (!isStorageEnabled(currentStorage)) {
    throw new Error(`[rds error]:${currentStorage} is not enabled!`);
  }

  const [value, setValue] = useState<T>(() => {
    const storedValue = currentStorage.getItem(key);
    return storedValue && isValidJSON(storedValue) 
      ? parseStr<T>(storedValue)! 
      : initialValue;
  });

  const updateValue = useCallback((newValue: T) => {
    setValue(newValue);
    currentStorage.setItem(key, JSON.stringify(newValue));
  }, [key, currentStorage]);

  // 监听storage变化（跨标签页同步）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.storageArea === currentStorage) {
        const newValue = e.newValue && isValidJSON(e.newValue) 
          ? parseStr<T>(e.newValue)! 
          : initialValue;
        setValue(newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, currentStorage, initialValue]);

  return [value, updateValue] as const;
}