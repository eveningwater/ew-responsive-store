import { ref, watch } from '@vue/reactivity';
import { StorageManager } from '../core/storage';
import { StoreType, VueStoreOptions } from '../core/types.js';

export function useStorage<T>(
  key: string,
  initialValue: T,
  options: VueStoreOptions = {
    storage: StoreType.LOCAL,
    immediate: true,
    deep: true
  }
) {
  const { storage = StoreType.LOCAL, immediate = true, deep = true, ...rest } = options;
  
  const storageManager = new StorageManager(key, initialValue, storage);
  const value = ref<T>(storageManager.getValue());

  // 监听value变化并同步到storage
  watch(value, (newValue) => {
    storageManager.setValue(newValue);
  }, { immediate, deep, ...rest });

  // 监听storage变化（跨标签页同步）
  const unsubscribe = storageManager.subscribe((newValue) => {
    value.value = newValue;
  });

  // 注意：在Vue 3 Composition API中，清理逻辑需要在setup函数中处理
  // 这里我们返回一个包含清理方法的对象
  const cleanup = () => {
    unsubscribe();
    storageManager.destroy();
  };

  // 为Vue组件提供清理方法
  if (typeof window !== 'undefined' && (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    // 在开发环境中，可以通过Vue DevTools进行清理
    (value as any).__cleanup = cleanup;
  }

  return value;
}
