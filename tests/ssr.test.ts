// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { StorageManager } from '../src/core/storage';

describe('SSR', () => {
  it('无 window 环境下不抛错，降级到内存存储', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(typeof window).toBe('undefined');

    const manager = new StorageManager('profile', { name: 'John' });

    expect(manager.getSnapshot()).toEqual({ name: 'John' });
    expect(manager.getInitialSnapshot()).toEqual({ name: 'John' });

    manager.setValue({ name: 'Jane' });
    expect(manager.getSnapshot()).toEqual({ name: 'Jane' });

    // 订阅不会因为缺少 window 而报错
    const subscriber = vi.fn();
    const unsubscribe = manager.subscribe(subscriber);
    manager.setValue({ name: 'Bob' });
    expect(subscriber).toHaveBeenLastCalledWith({ name: 'Bob' });
    unsubscribe();

    vi.restoreAllMocks();
  });

  it('getInitialSnapshot 引用稳定，适合作为服务端快照', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const manager = new StorageManager('settings', { theme: 'light' });
    expect(manager.getInitialSnapshot()).toBe(manager.getInitialSnapshot());
    vi.restoreAllMocks();
  });
});
