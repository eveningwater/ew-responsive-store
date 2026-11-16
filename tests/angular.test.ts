import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StorageService } from '../src/export/angular';
import { clearStorageManagerRegistry } from '../src/core/storage';
import { StoreType } from '../src/core/types';
import { installMockStorage, restoreStorage, silenceConsoleError } from './helpers';

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

  return {
    signal,
    computed: (fn: () => unknown) => fn,
    inject: () => ({ onDestroy: () => {} }),
    DestroyRef: class DestroyRef {},
    Injectable: () => (target: unknown) => target,
  };
});

describe('Angular Adapter', () => {
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
});
