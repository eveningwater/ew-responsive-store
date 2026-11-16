import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { getStorageManager } from '../core/storage';
import {
  AngularStorageReturn,
  AngularStoreOptions,
  StorageUpdater,
  StoreType,
} from '../core/types';

/**
 * Angular 存储服务。
 * 通过 `inject(StorageService)` 获取，内部按 key 复用同一个管理器实例。
 */
export class StorageService {
  private destroyRef = inject(DestroyRef);

  useStorage<T>(
    key: string,
    initialValue: T | (() => T),
    options: AngularStoreOptions<T> = {},
  ): AngularStorageReturn<T> {
    const manager = getStorageManager<T>(key, initialValue, options);

    const store = signal<T>(manager.getSnapshot());
    const unsubscribe = manager.subscribe((next) => store.set(next));
    this.destroyRef.onDestroy(unsubscribe);

    return {
      value: computed(() => store()),
      setValue: (next: StorageUpdater<T>) => manager.setValue(next),
      updateValue: (updater: (current: T) => T) => manager.setValue(updater),
      reset: () => manager.remove(),
      remove: () => manager.remove(),
      clear: () => manager.clear(),
    };
  }
}

// 不使用装饰器语法，避免使用方 tsconfig 未开启 experimentalDecorators
Injectable({ providedIn: 'root' })(StorageService);

/** 便捷的 inject 函数，需在注入上下文中调用（如组件构造函数） */
export function useStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: AngularStoreOptions<T> = {
    storage: StoreType.LOCAL,
  },
): AngularStorageReturn<T> {
  return inject(StorageService).useStorage(key, initialValue, options);
}
