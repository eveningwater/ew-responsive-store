import { effectScope } from '@vue/reactivity';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useVueStorage } from '../src/export/vue';
import { clearStorageManagerRegistry, getStorageManager } from '../src/core/storage';
import { StoreType } from '../src/core/types';
import { installMockStorage, restoreStorage, silenceConsoleError } from './helpers';

describe('Vue Adapter', () => {
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

  it('使用初始值并同步写入存储', () => {
    const scope = effectScope();
    const value = scope.run(() => useVueStorage('count', 0, { flush: 'sync' }))!;

    expect(value.value).toBe(0);

    value.value = 1;
    expect(mocked.local.storage.getItem('count')).toBe('1');

    scope.stop();
  });

  it('读取已有数据', () => {
    mocked.local.storage.setItem('profile', JSON.stringify({ name: 'Jane' }));
    const scope = effectScope();
    const value = scope.run(() => useVueStorage('profile', { name: 'John' }))!;
    expect(value.value).toEqual({ name: 'Jane' });
    scope.stop();
  });

  it('外部管理器更新时同步 ref', () => {
    const scope = effectScope();
    const value = scope.run(() => useVueStorage('count', 0, { flush: 'sync' }))!;
    const manager = getStorageManager('count', 0);

    manager.setValue(7);
    expect(value.value).toBe(7);

    scope.stop();
  });

  it('deep 监听嵌套变更', () => {
    const scope = effectScope();
    const value = scope.run(() =>
      useVueStorage('profile', { name: 'John', tags: [] as string[] }, { flush: 'sync' }),
    )!;

    value.value.tags.push('admin');

    expect(mocked.local.storage.getItem('profile')).toBe(
      JSON.stringify({ name: 'John', tags: ['admin'] }),
    );

    scope.stop();
  });

  it('deep 为 false 时不监听嵌套变更', () => {
    const scope = effectScope();
    const value = scope.run(() =>
      useVueStorage('profile', { name: 'John', tags: [] as string[] }, { deep: false, flush: 'sync' }),
    )!;

    value.value.tags.push('admin');

    expect(mocked.local.storage.getItem('profile')).toBeNull();

    scope.stop();
  });

  it('作用域销毁后不再同步', () => {
    const scope = effectScope();
    const value = scope.run(() => useVueStorage('count', 0, { flush: 'sync' }))!;
    scope.stop();

    const manager = getStorageManager('count', 0);
    manager.setValue(3);

    expect(value.value).toBe(0);
  });

  it('使用 sessionStorage', () => {
    const scope = effectScope();
    const value = scope.run(() =>
      useVueStorage('count', 0, { storage: StoreType.SESSION, flush: 'sync' }),
    )!;

    value.value = 2;

    expect(mocked.session.storage.getItem('count')).toBe('2');
    expect(mocked.local.storage.getItem('count')).toBeNull();

    scope.stop();
  });
});
