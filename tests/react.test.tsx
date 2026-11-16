import React, { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useReactStorage } from '../src/export/react';
import { clearStorageManagerRegistry, getRegisteredManagers } from '../src/core/storage';
import {
  dispatchStorageEvent,
  installMockStorage,
  restoreStorage,
  silenceConsoleError,
} from './helpers';

describe('React Adapter', () => {
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

  it('存储为空时使用初始值', () => {
    const { result } = renderHook(() => useReactStorage('profile', { name: 'John' }));
    expect(result.current[0]).toEqual({ name: 'John' });
  });

  it('读取已有数据', () => {
    mocked.local.storage.setItem('profile', JSON.stringify({ name: 'Jane' }));
    const { result } = renderHook(() => useReactStorage('profile', { name: 'John' }));
    expect(result.current[0]).toEqual({ name: 'Jane' });
  });

  it('写入并同步到存储', () => {
    const { result } = renderHook(() => useReactStorage('profile', { name: 'John' }));

    act(() => {
      result.current[1]({ name: 'Jane' });
    });

    expect(result.current[0]).toEqual({ name: 'Jane' });
    expect(mocked.local.storage.getItem('profile')).toBe(JSON.stringify({ name: 'Jane' }));
  });

  it('支持函数式更新', () => {
    const { result } = renderHook(() => useReactStorage('count', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(2);
  });

  it('动态 key 切换与卸载后回收管理器', async () => {
    const { rerender, unmount } = renderHook(
      ({ key }: { key: string }) => useReactStorage(key, ''),
      { initialProps: { key: 'draft:1' } },
    );

    expect(getRegisteredManagers().some((item) => item.key === 'draft:1')).toBe(true);

    rerender({ key: 'draft:2' });
    await act(async () => {
      await Promise.resolve();
    });

    expect(getRegisteredManagers().some((item) => item.key === 'draft:1')).toBe(false);
    expect(getRegisteredManagers().some((item) => item.key === 'draft:2')).toBe(true);

    unmount();
    await act(async () => {
      await Promise.resolve();
    });

    expect(getRegisteredManagers().some((item) => item.key === 'draft:2')).toBe(false);
  });

  it('同标签页多组件共享实例并同步', () => {
    const first = renderHook(() => useReactStorage('count', 0));
    const second = renderHook(() => useReactStorage('count', 0));

    act(() => {
      first.result.current[1](5);
    });

    expect(second.result.current[0]).toBe(5);
  });

  it('key 变化时重新读取', () => {
    const { result, rerender } = renderHook(
      ({ storageKey }: { storageKey: string }) => useReactStorage(storageKey, 'default'),
      { initialProps: { storageKey: 'key-a' } },
    );

    act(() => {
      result.current[1]('A');
    });

    rerender({ storageKey: 'key-b' });
    expect(result.current[0]).toBe('default');

    rerender({ storageKey: 'key-a' });
    expect(result.current[0]).toBe('A');
  });

  it('响应跨标签页 storage 事件', () => {
    const { result } = renderHook(() => useReactStorage('count', 0));

    act(() => {
      mocked.local.storage.setItem('count', '5');
      dispatchStorageEvent('count', '5');
    });

    expect(result.current[0]).toBe(5);
  });

  it('外部清空存储时回落初始值', () => {
    const { result } = renderHook(() => useReactStorage('count', 1));

    act(() => {
      result.current[1](9);
    });
    expect(result.current[0]).toBe(9);

    act(() => {
      dispatchStorageEvent(null, null);
    });

    expect(result.current[0]).toBe(1);
  });

  it('actions 提供 remove / clear', () => {
    const { result } = renderHook(() => useReactStorage('count', 0));

    act(() => {
      result.current[1](3);
    });

    act(() => {
      result.current[2].remove();
    });

    expect(result.current[0]).toBe(0);
    expect(mocked.local.storage.getItem('count')).toBeNull();
  });

  it('StrictMode 双挂载不丢数据', () => {
    const { result } = renderHook(() => useReactStorage('strict', 0), {
      wrapper: StrictMode,
    });

    act(() => {
      result.current[1](2);
    });

    expect(result.current[0]).toBe(2);
    expect(mocked.local.storage.getItem('strict')).toBe('2');
  });

  it('SSR renderToString 使用初始值', () => {
    mocked.local.storage.setItem('ssr-key', JSON.stringify('stored'));

    const App = () => {
      const [value] = useReactStorage('ssr-key', 'initial');
      return <span>{value}</span>;
    };

    expect(renderToString(<App />)).toContain('initial');
  });
});
