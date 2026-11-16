import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePreactStorage } from '../src/export/preact';
import { clearStorageManagerRegistry, getStorageManager } from '../src/core/storage';
import { installMockStorage, restoreStorage, silenceConsoleError } from './helpers';

// preact/hooks 不提供 useSyncExternalStore，这里用最小实现验证适配器接线
vi.mock('preact/hooks', () => ({
  useState: (initial: unknown) => {
    let value = typeof initial === 'function' ? (initial as () => unknown)() : initial;
    const setState = (next: unknown) => {
      value = typeof next === 'function' ? (next as (prev: unknown) => unknown)(value) : next;
    };
    return [value, setState];
  },
  useEffect: (effect: () => unknown) => {
    const cleanup = effect();
    if (typeof cleanup === 'function') cleanup();
  },
  useMemo: (factory: () => unknown) => factory(),
  useCallback: (callback: unknown) => callback,
}));

describe('Preact Adapter', () => {
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

  it('返回 [value, setValue, actions]', () => {
    const result = usePreactStorage('count', 0);
    expect(result[0]).toBe(0);
    expect(typeof result[1]).toBe('function');
    expect(result[2].key).toBe('count');
  });

  it('写入并同步到存储', () => {
    const [, setValue] = usePreactStorage('count', 0);
    setValue(3);
    expect(mocked.local.storage.getItem('count')).toBe('3');
  });

  it('支持函数式更新', () => {
    usePreactStorage('count', 0);
    getStorageManager('count', 0).setValue((prev) => prev + 4);
    expect(getStorageManager('count', 0).getSnapshot()).toBe(4);
  });

  it('actions.remove 删除 key', () => {
    const [, setValue, actions] = usePreactStorage('count', 0);
    setValue(1);
    actions.remove();
    expect(mocked.local.storage.getItem('count')).toBeNull();
  });

  it('读取已有数据', () => {
    mocked.local.storage.setItem('profile', JSON.stringify({ name: 'Jane' }));
    const [value] = usePreactStorage('profile', { name: 'John' });
    expect(value).toEqual({ name: 'Jane' });
  });
});
