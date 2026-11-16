import type { Unsubscriber, Updater, Writable } from 'svelte/store';
import { getStorageManager } from '../core/storage';
import { SvelteStoreOptions, StorageUpdater } from '../core/types';

export interface SvelteStorage<T> extends Writable<T> {
  /** 删除当前 key，值回落初始值 */
  remove(): void;
  /** 清空由本库管理的 key */
  clear(): void;
  /** 取消底层订阅 */
  destroy(): void;
}

/**
 * Svelte 版 useStorage。
 * 返回标准 store（支持 `$store` 自动订阅），并额外提供 remove / clear / destroy。
 */
export function useStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: SvelteStoreOptions<T> = {},
): SvelteStorage<T> {
  const manager = getStorageManager<T>(key, initialValue, options);

  const subscribers = new Set<(value: T) => void>();
  let unsubscribeManager: Unsubscriber | null = null;

  const start = () => {
    if (subscribers.size !== 1) return;
    unsubscribeManager = manager.subscribe((next) => {
      subscribers.forEach((listener) => listener(next));
    });
  };

  const stop = () => {
    if (subscribers.size !== 0) return;
    unsubscribeManager?.();
    unsubscribeManager = null;
  };

  return {
    subscribe(run, _invalidate) {
      subscribers.add(run);
      start();
      run(manager.getSnapshot());
      return () => {
        subscribers.delete(run);
        stop();
      };
    },
    set(value: T) {
      manager.setValue(value);
    },
    update(updater: Updater<T>) {
      manager.setValue(updater as StorageUpdater<T>);
    },
    remove() {
      manager.remove();
    },
    clear() {
      manager.clear();
    },
    destroy() {
      subscribers.clear();
      unsubscribeManager?.();
      unsubscribeManager = null;
    },
  };
}
