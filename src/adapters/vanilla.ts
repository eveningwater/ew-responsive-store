import { StorageManager } from '../core/storage';
import { StoreType, VanillaStoreOptions } from '../core/types';

// 导出StoreType供原生JavaScript使用
export { StoreType } from '../core/types';

export interface VanillaStorageReturn<T> {
  value: T;
  setValue: (value: T) => void;
  updateValue: (updater: (current: T) => T) => void;
  reset: () => void;
  subscribe: (listener: (value: T) => void) => () => void;
  destroy: () => void;
}

export function useStorage<T>(
  key: string,
  initialValue: T,
  options: VanillaStoreOptions = {
    storage: StoreType.LOCAL
  }
): VanillaStorageReturn<T> {
  const { storage = StoreType.LOCAL } = options;
  
  const storageManager = new StorageManager(key, initialValue, storage);
  let currentValue = storageManager.getValue();
  const listeners = new Set<(value: T) => void>();

  const notifyListeners = (value: T) => {
    listeners.forEach(listener => listener(value));
  };

  const setValue = (value: T) => {
    currentValue = value;
    storageManager.setValue(value);
    notifyListeners(value);
  };

  const updateValue = (updater: (current: T) => T) => {
    const newValue = updater(currentValue);
    setValue(newValue);
  };

  const reset = () => {
    setValue(initialValue);
  };

  const subscribe = (listener: (value: T) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const destroy = () => {
    listeners.clear();
    storageManager.destroy();
  };

  // 监听storage变化（跨标签页同步）
  const unsubscribe = storageManager.subscribe((newValue) => {
    currentValue = newValue;
    notifyListeners(newValue);
  });

  // 返回包含清理方法的对象
  const result = {
    get value() { return currentValue; },
    setValue,
    updateValue,
    reset,
    subscribe,
    destroy: () => {
      unsubscribe();
      destroy();
    }
  };

  return result;
}

// 便捷的全局存储管理器
export class GlobalStorageManager {
  private instances = new Map<string, VanillaStorageReturn<any>>();

  getStorage<T>(key: string, initialValue: T, options?: VanillaStoreOptions): VanillaStorageReturn<T> {
    const instanceKey = `${key}-${options?.storage || StoreType.LOCAL}`;
    
    if (!this.instances.has(instanceKey)) {
      const storage = useStorage(key, initialValue, options);
      this.instances.set(instanceKey, storage);
    }
    
    return this.instances.get(instanceKey)!;
  }

  destroyAll() {
    this.instances.forEach(storage => storage.destroy());
    this.instances.clear();
  }
}

// 全局单例实例
export const globalStorage = new GlobalStorageManager();
