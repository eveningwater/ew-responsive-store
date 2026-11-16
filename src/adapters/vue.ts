import { getCurrentScope, onScopeDispose, ref, watch, type Ref } from '@vue/reactivity';
import { getStorageManager } from '../core/storage';
import { StoreType, VueStoreOptions } from '../core/types';

/**
 * Vue 版 useStorage。
 *
 * - 同 key 的所有组件共享同一个管理器实例
 * - `deep`：是否深度监听对象内部变化（默认 true）
 * - `immediate`：是否在创建时立即把当前值写回存储（默认 false，值已经由存储初始化）
 * - 其余选项会透传给 Vue 的 `watch`
 */
export function useStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: VueStoreOptions<T> = {},
): Ref<T> {
  const {
    storage = StoreType.LOCAL,
    immediate = false,
    deep = true,
    parse,
    serializer,
    deserializer,
    version,
    migrate,
    equals,
    memoryFallback,
    onError,
    ...watchOptions
  } = options;

  const manager = getStorageManager<T>(key, initialValue, {
    storage,
    parse,
    serializer,
    deserializer,
    version,
    migrate,
    equals,
    memoryFallback,
    onError,
  });

  const value = ref<T>(manager.getSnapshot()) as Ref<T>;

  if (immediate) {
    manager.setValue(value.value);
  }

  const stopWatch = watch(
    value,
    (next) => manager.setValue(next as T),
    { deep, ...watchOptions },
  );

  const unsubscribe = manager.subscribe((next) => {
    if (Object.is(value.value, next)) return;
    value.value = next;
  });

  if (getCurrentScope()) {
    onScopeDispose(() => {
      stopWatch();
      unsubscribe();
    });
  }

  return value;
}
