// 动态导入Angular依赖，避免构建时错误
let AngularCore: any = null;

// 检查是否在Node.js环境中
if (typeof (globalThis as any).require !== 'undefined') {
  try {
    AngularCore = (globalThis as any).require('@angular/core');
  } catch (e) {
    // Angular未安装时的处理
    console.warn('@angular/core not found, Angular adapter will not work');
  }
}

import { StorageManager } from '../core/storage';
import { StoreType, AngularStoreOptions } from '../core/types';

// 检查Angular是否可用
const isAngularAvailable = () => AngularCore && AngularCore.Injectable;

// Angular服务类
export class StorageService {
  private destroyRef: any = null;
  private storageManagers = new Map<string, StorageManager<any>>();

  constructor() {
    if (isAngularAvailable()) {
      this.destroyRef = AngularCore.inject(AngularCore.DestroyRef);
    }
  }

  useStorage<T>(
    key: string,
    initialValue: T,
    options: AngularStoreOptions = {
      storage: StoreType.LOCAL
    }
  ) {
    const { storage = StoreType.LOCAL } = options;
    
    // 如果已经存在相同key的manager，复用它
    const managerKey = `${key}-${storage}`;
    if (!this.storageManagers.has(managerKey)) {
      const manager = new StorageManager(key, initialValue, storage);
      this.storageManagers.set(managerKey, manager);
      
      // 组件销毁时清理
      if (this.destroyRef) {
        this.destroyRef.onDestroy(() => {
          manager.destroy();
          this.storageManagers.delete(managerKey);
        });
      }
    }
    
    const manager = this.storageManagers.get(managerKey)!;
    
    if (!isAngularAvailable()) {
      // 降级到原生实现
      return {
        value: () => manager.getValue(),
        setValue: (newValue: T) => manager.setValue(newValue),
        updateValue: (updater: (current: T) => T) => {
          const current = manager.getValue();
          manager.setValue(updater(current));
        },
        reset: () => manager.setValue(initialValue)
      };
    }
    
    // 使用Angular signal创建响应式状态
    const value = AngularCore.signal(manager.getValue());
    
    // 监听storage变化并更新signal
    const unsubscribe = manager.subscribe((newValue) => {
      value.set(newValue);
    });
    
    // 监听signal变化并更新storage
    AngularCore.effect(() => {
      const currentValue = value();
      manager.setValue(currentValue);
    });
    
    // 组件销毁时取消订阅
    if (this.destroyRef) {
      this.destroyRef.onDestroy(() => {
        unsubscribe();
      });
    }
    
    return {
      value: AngularCore.computed(() => value()),
      setValue: (newValue: T) => value.set(newValue),
      updateValue: (updater: (current: T) => T) => value.update(updater),
      reset: () => value.set(initialValue)
    };
  }
}

// 便捷的inject函数
export function useStorage<T>(
  key: string,
  initialValue: T,
  options?: AngularStoreOptions
) {
  if (!isAngularAvailable()) {
    throw new Error('Angular is not available. Please install @angular/core or use other adapters.');
  }
  
  const storageService = AngularCore.inject(StorageService);
  return storageService.useStorage(key, initialValue, options);
}
