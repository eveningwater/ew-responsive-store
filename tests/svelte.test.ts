import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSvelteStorage } from '../src/export/svelte';
import { clearStorageManagerRegistry, getRegisteredManagers, getStorageManager } from '../src/core/storage';
import { installMockStorage, restoreStorage, silenceConsoleError } from './helpers';

describe('Svelte Adapter', () => {
  let mocked: ReturnType<typeof installMockStorage>;

  beforeEach(() => {
    mocked = installMockStorage();
    silenceConsoleError();
  });

  afterEach(() => {
    clearStorageManagerRegistry();
    restoreStorage();
    vi.restoreAllMocks();
  });

  it('退订回收后再次订阅会重新获取管理器', async () => {
    const store = useSvelteStorage('draft:x', 0);
    const unsubscribe = store.subscribe(() => {});
    unsubscribe();
    await Promise.resolve();

    expect(getRegisteredManagers().some((item) => item.key === 'draft:x')).toBe(false);

    const values: number[] = [];
    const unsubscribeAgain = store.subscribe((value) => values.push(value));
    store.set(7);

    expect(getStorageManager('draft:x', 0).getSnapshot()).toBe(7);
    expect(values).toEqual([0, 7]);
    unsubscribeAgain();
  });

  it('订阅时立即派发当前值', () => {
    const store = useSvelteStorage('count', 0);
    const values: number[] = [];
    const unsubscribe = store.subscribe((value) => values.push(value));

    expect(values).toEqual([0]);
    unsubscribe();
  });

  it('set / update 写入并通知', () => {
    const store = useSvelteStorage('count', 0);
    const values: number[] = [];
    const unsubscribe = store.subscribe((value) => values.push(value));

    store.set(1);
    store.update((prev) => prev + 1);

    expect(values).toEqual([0, 1, 2]);
    expect(mocked.local.storage.getItem('count')).toBe('2');
    unsubscribe();
  });

  it('外部管理器更新时通知订阅者', () => {
    const store = useSvelteStorage('count', 0);
    const subscriber = vi.fn();
    const unsubscribe = store.subscribe(subscriber);

    getStorageManager('count', 0).setValue(4);

    expect(subscriber).toHaveBeenLastCalledWith(4);
    unsubscribe();
  });

  it('读取已有数据', () => {
    mocked.local.storage.setItem('profile', JSON.stringify({ name: 'Jane' }));
    const store = useSvelteStorage('profile', { name: 'John' });
    const values: Array<{ name: string }> = [];
    const unsubscribe = store.subscribe((value) => values.push(value));
    expect(values[0]).toEqual({ name: 'Jane' });
    unsubscribe();
  });

  it('remove 回落初始值', () => {
    const store = useSvelteStorage('count', 0);
    store.set(5);
    const subscriber = vi.fn();
    const unsubscribe = store.subscribe(subscriber);

    store.remove();

    expect(subscriber).toHaveBeenLastCalledWith(0);
    expect(mocked.local.storage.getItem('count')).toBeNull();
    unsubscribe();
  });

  it('destroy 后不再通知', () => {
    const store = useSvelteStorage('count', 0);
    const subscriber = vi.fn();
    store.subscribe(subscriber);
    store.destroy();

    getStorageManager('count', 0).setValue(6);

    expect(subscriber).toHaveBeenCalledTimes(1);
  });
});
