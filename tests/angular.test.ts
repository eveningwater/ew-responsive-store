import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StorageService } from '../src/export/angular';
import { clearStorageManagerRegistry, getRegisteredManagers } from '../src/core/storage';
import { StoreType } from '../src/core/types';
import { installMockStorage, restoreStorage, silenceConsoleError } from './helpers';

const destroyCallbacks: Array<() => void> = [];
(globalThis as any).__angularDestroyCallbacks = destroyCallbacks;

vi.mock('@angular/core', () => {
  const signal = (initial: unknown) => {
    let value = initial;
    const read = (() => value) as any;
    read.set = (next: unknown) => {
      value = next;
    };
    read.update = (updater: (prev: unknown) => unknown) => {
      value = updater(value);
    };
    return read;
  };

  const destroyRef = {
    onDestroy: (callback: () => void) => {
      destroyCallbacks.push(callback);
    },
  };

  return {
    signal,
    computed: (fn: () => unknown) => fn,
    inject: () => destroyRef,
    DestroyRef: class DestroyRef {},
    Injectable: () => (target: unknown) => target,
  };
});

describe('Angular Adapter', () => {
  let mocked: ReturnType<typeof installMockStorage>;

  beforeEach(() => {
    mocked = installMockStorage();
    silenceConsoleError();
    destroyCallbacks.length = 0;
  });

  afterEach(() => {
    clearStorageManagerRegistry();
    restoreStorage();
    vi.restoreAllMocks();
  });

  it('使用初始值', () => {
    const service = new StorageService();
    const state = service.useStorage('count', 0);
    expect(state.value()).toBe(0);
  });

  it('setValue 写入并同步 signal', () => {
    const service = new StorageService();
    const state = service.useStorage('count', 0);

    state.setValue(2);

    expect(state.value()).toBe(2);
    expect(mocked.local.storage.getItem('count')).toBe('2');
  });

  it('updateValue 支持函数式更新', () => {
    const service = new StorageService();
    const state = service.useStorage('count', 0);

    state.updateValue((prev) => prev + 3);

    expect(state.value()).toBe(3);
  });

  it('reset / remove 回落初始值', () => {
    const service = new StorageService();
    const state = service.useStorage('count', 1);
    state.setValue(9);

    state.reset();

    expect(state.value()).toBe(1);
    expect(mocked.local.storage.getItem('count')).toBeNull();
  });

  it('读取已有数据', () => {
    mocked.local.storage.setItem('profile', JSON.stringify({ name: 'Jane' }));
    const service = new StorageService();
    const state = service.useStorage('profile', { name: 'John' });
    expect(state.value()).toEqual({ name: 'Jane' });
  });

  it('使用 sessionStorage', () => {
    const service = new StorageService();
    const state = service.useStorage('count', 0, { storage: StoreType.SESSION });
    state.setValue(5);

    expect(mocked.session.storage.getItem('count')).toBe('5');
    expect(mocked.local.storage.getItem('count')).toBeNull();
  });

  it('销毁时释放管理器', async () => {
    const service = new StorageService();
    service.useStorage('count', 0);
    expect(getRegisteredManagers().some((item) => item.key === 'count')).toBe(true);

    destroyCallbacks.forEach((callback) => callback());
    await Promise.resolve();

    expect(getRegisteredManagers().some((item) => item.key === 'count')).toBe(false);
  });
});
