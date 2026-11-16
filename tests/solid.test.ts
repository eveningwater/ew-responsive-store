import { createRoot } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSolidStorage } from '../src/export/solid';
import { clearStorageManagerRegistry, getStorageManager } from '../src/core/storage';
import { installMockStorage, restoreStorage, silenceConsoleError } from './helpers';

describe('Solid Adapter', () => {
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

  it('返回 signal 并写入存储', () => {
    createRoot((dispose) => {
      const [value, setValue] = useSolidStorage('count', 0);

      expect(value()).toBe(0);
      setValue(2);
      expect(value()).toBe(2);
      expect(mocked.local.storage.getItem('count')).toBe('2');

      dispose();
    });
  });

  it('支持函数式更新', () => {
    createRoot((dispose) => {
      const [value, setValue] = useSolidStorage('count', 0);
      setValue((prev) => prev + 1);
      expect(value()).toBe(1);
      dispose();
    });
  });

  it('外部管理器更新时同步 signal', () => {
    createRoot((dispose) => {
      const [value] = useSolidStorage('count', 0);
      getStorageManager('count', 0).setValue(5);
      expect(value()).toBe(5);
      dispose();
    });
  });

  it('读取已有数据', () => {
    mocked.local.storage.setItem('profile', JSON.stringify({ name: 'Jane' }));
    createRoot((dispose) => {
      const [value] = useSolidStorage('profile', { name: 'John' });
      expect(value()).toEqual({ name: 'Jane' });
      dispose();
    });
  });

  it('卸载后取消订阅', () => {
    let read: () => number = () => 0;
    createRoot((dispose) => {
      const [value] = useSolidStorage('count', 0);
      read = value;
      dispose();
    });

    getStorageManager('count', 0).setValue(9);
    expect(read()).toBe(0);
  });
});
