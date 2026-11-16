import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { getStorageManager, releaseStorageManager, retainStorageManager } from '../core/storage';
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
  // 服务自身（通常是根级）的销毁时机，仅作为非注入上下文的兜底
  private rootDestroyRef = inject(DestroyRef);

  useStorage<T>(
    key: string,
    initialValue: T | (() => T),
    options: AngularStoreOptions<T> = {},
  ): AngularStorageReturn<T> {
    const manager = getStorageManager<T>(key, initialValue, options);

    // 在组件构造函数 / 字段初始化器中调用时，这里拿到的是「调用方组件」的 DestroyRef；
    // 因此即使 StorageService 是 providedIn: 'root'，也能随组件销毁自动释放。
    let destroyRef = this.rootDestroyRef;
    try {
      destroyRef = inject(DestroyRef);
    } catch {
      // 不在注入上下文中（例如延迟到组件外调用），退回根级并依赖手动 release
    }

    const store = signal<T>(manager.getSnapshot());
    const unsubscribe = manager.subscribe((next) => store.set(next));
    retainStorageManager(manager.key, manager.storageType);
    destroyRef.onDestroy(() => {
      unsubscribe();
      releaseStorageManager(manager.key, manager.storageType);
    });

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
