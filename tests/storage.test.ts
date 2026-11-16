import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  StorageManager,
  clearManagedStorage,
  clearStorageManagerRegistry,
  getStorageManager,
} from '../src/core/storage';
import { StoreType } from '../src/core/types';
import {
  createMockStorage,
  dispatchStorageEvent,
  installMockStorage,
  restoreStorage,
  silenceConsoleError,
} from './helpers';

describe('StorageManager', () => {
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

  it('存储为空时返回初始值', () => {
    const manager = new StorageManager('profile', { name: 'John' });
    expect(manager.getSnapshot()).toEqual({ name: 'John' });
  });

  it('读取已存在的 JSON 数据', () => {
    mocked.local.storage.setItem('profile', JSON.stringify({ name: 'Jane' }));
    const manager = new StorageManager('profile', { name: 'John' });
    expect(manager.getSnapshot()).toEqual({ name: 'Jane' });
  });

  it('json 模式下非法 JSON 回落到初始值', () => {
    mocked.local.storage.setItem('profile', 'invalid-json');
    const manager = new StorageManager('profile', { name: 'John' });
    expect(manager.getSnapshot()).toEqual({ name: 'John' });
  });

  it('auto 模式兼容裸字符串', () => {
    mocked.local.storage.setItem('theme', 'dark');
    const manager = new StorageManager('theme', 'light', { parse: 'auto' });
    expect(manager.getSnapshot()).toBe('dark');
  });

  it('auto 模式下裸数字保持字符串形态（兼容 "1" 标记）', () => {
    mocked.local.storage.setItem('guided', '1');
    const manager = new StorageManager('guided', '0', { parse: 'auto' });
    expect(manager.getSnapshot()).toBe('1');
  });

  it('auto 模式写入字符串时原样存储', () => {
    const manager = new StorageManager('theme', 'light', { parse: 'auto' });
    manager.setValue('dark');
    expect(mocked.local.storage.getItem('theme')).toBe('dark');
  });

  it('auto 模式仍可读写对象', () => {
    const manager = new StorageManager('config', { a: 1 }, { parse: 'auto' });
    manager.setValue({ a: 2 });
    expect(manager.getSnapshot()).toEqual({ a: 2 });
    expect(mocked.local.storage.getItem('config')).toBe('{"a":2}');
  });

  it('写入并通知订阅者', () => {
    const manager = new StorageManager('profile', { name: 'John' });
    const subscriber = vi.fn();
    manager.subscribe(subscriber);

    manager.setValue({ name: 'Jane' });

    expect(subscriber).toHaveBeenLastCalledWith({ name: 'Jane' });
    expect(mocked.local.store.get('profile')).toBe(JSON.stringify({ name: 'Jane' }));
  });

  it('支持函数式更新', () => {
    const manager = new StorageManager('count', 0);
    manager.setValue((prev) => prev + 1);
    expect(manager.getSnapshot()).toBe(1);
  });

  it('值相等时跳过写入与通知', () => {
    const manager = new StorageManager('profile', { name: 'John' });
    manager.setValue({ name: 'Jane' });
    mocked.local.state.setCalls = 0;

    const subscriber = vi.fn();
    manager.subscribe(subscriber);
    manager.setValue({ name: 'Jane' });

    expect(subscriber).not.toHaveBeenCalled();
    expect(mocked.local.state.setCalls).toBe(0);
  });

  it('同 key 复用同一个管理器（同标签页多组件同步）', () => {
    const first = getStorageManager('count', 0);
    const second = getStorageManager('count', 0);
    expect(first).toBe(second);

    const secondSubscriber = vi.fn();
    second.subscribe(secondSubscriber);
    first.setValue(1);

    expect(secondSubscriber).toHaveBeenCalledWith(1);
    expect(second.getSnapshot()).toBe(1);
  });

  it('不同存储区域使用不同的管理器', () => {
    const local = getStorageManager('count', 0);
    const session = getStorageManager('count', 0, { storage: StoreType.SESSION });
    expect(local).not.toBe(session);
  });

  it('响应跨标签页的 storage 事件', () => {
    const manager = new StorageManager('profile', { name: 'John' });
    const subscriber = vi.fn();
    manager.subscribe(subscriber);

    mocked.local.storage.setItem('profile', JSON.stringify({ name: 'Jane' }));
    dispatchStorageEvent('profile', JSON.stringify({ name: 'Jane' }));

    expect(subscriber).toHaveBeenLastCalledWith({ name: 'Jane' });
    expect(manager.getSnapshot()).toEqual({ name: 'Jane' });
  });

  it('忽略其它 key / 其它存储区域的 storage 事件', () => {
    const manager = new StorageManager('profile', { name: 'John' });
    const subscriber = vi.fn();
    manager.subscribe(subscriber);

    dispatchStorageEvent('other', JSON.stringify({ name: 'Jane' }));
    dispatchStorageEvent('profile', JSON.stringify({ name: 'Jane' }), mocked.session.storage);

    expect(subscriber).not.toHaveBeenCalled();
    expect(manager.getSnapshot()).toEqual({ name: 'John' });
  });

  it('外部执行 storage.clear() 时回落初始值', () => {
    const manager = new StorageManager('profile', { name: 'John' });
    manager.setValue({ name: 'Jane' });

    const subscriber = vi.fn();
    manager.subscribe(subscriber);
    dispatchStorageEvent(null, null);

    expect(subscriber).toHaveBeenLastCalledWith({ name: 'John' });
  });

  it('remove() 删除 key 并回落初始值', () => {
    const manager = new StorageManager('profile', { name: 'John' });
    manager.setValue({ name: 'Jane' });
    const subscriber = vi.fn();
    manager.subscribe(subscriber);

    manager.remove();

    expect(mocked.local.storage.getItem('profile')).toBeNull();
    expect(manager.getSnapshot()).toEqual({ name: 'John' });
    expect(subscriber).toHaveBeenLastCalledWith({ name: 'John' });
  });

  it('clear() 只清理本库管理的 key', () => {
    const profile = getStorageManager('profile', 'default');
    const settings = getStorageManager('settings', 'default');
    profile.setValue('jane');
    settings.setValue('dark');
    mocked.local.storage.setItem('legacy-business-key', 'keep');

    clearManagedStorage();

    expect(profile.getSnapshot()).toBe('default');
    expect(settings.getSnapshot()).toBe('default');
    expect(mocked.local.storage.getItem('legacy-business-key')).toBe('keep');
  });

  it('写入抛错时降级到内存并触发 onError', () => {
    const onError = vi.fn();
    const manager = new StorageManager('profile', { name: 'John' }, { onError });

    mocked.local.state.failSet = true;
    manager.setValue({ name: 'Jane' });

    expect(manager.getSnapshot()).toEqual({ name: 'Jane' });
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ operation: 'write', key: 'profile' }),
    );
    // 降级后仍能读回内存中的值
    expect(manager.getSnapshot()).toEqual({ name: 'Jane' });
  });

  it('序列化结果为 undefined 时拒绝写入', () => {
    const onError = vi.fn();
    const manager = new StorageManager<undefined>('broken', 0 as any, { onError });
    manager.setValue(undefined);

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ operation: 'write' }),
    );
    expect(mocked.local.store.has('broken')).toBe(false);
  });

  it('支持自定义序列化 / 反序列化', () => {
    const manager = new StorageManager<Date>('date', new Date('2020-01-01'), {
      serializer: (value) => String(value.getTime()),
      deserializer: (raw) => new Date(Number(raw)),
    });

    manager.setValue(new Date('2021-02-03'));
    expect(mocked.local.storage.getItem('date')).toBe(String(new Date('2021-02-03').getTime()));

    const next = new StorageManager<Date>('date', new Date('2020-01-01'), {
      serializer: (value) => String(value.getTime()),
      deserializer: (raw) => new Date(Number(raw)),
    });
    expect(next.getSnapshot().getTime()).toBe(new Date('2021-02-03').getTime());
  });

  it('按 version + migrate 平滑升级数据', () => {
    mocked.local.storage.setItem('profile', JSON.stringify({ name: 'John' }));
    const migrate = vi.fn((oldValue: any) => ({ ...oldValue, role: 'admin' }));

    const manager = new StorageManager('profile', {}, { version: 2, migrate });

    expect(manager.getSnapshot()).toEqual({ name: 'John', role: 'admin' });
    expect(migrate).toHaveBeenCalledWith({ name: 'John' }, 0);
    // getSnapshot 只读：迁移结果在 subscribe 等非渲染阶段才落盘
    expect(mocked.local.storage.getItem('profile')).toBe(JSON.stringify({ name: 'John' }));
    const unsubscribe = manager.subscribe(() => {});
    expect(mocked.local.storage.getItem('profile')).toBe(
      JSON.stringify({ name: 'John', role: 'admin' }),
    );
    expect(mocked.local.storage.getItem('profile::__rds_version__')).toBe('2');
    unsubscribe();

    // 再次创建不会重复迁移
    const again = new StorageManager('profile', {}, { version: 2, migrate });
    expect(again.getSnapshot()).toEqual({ name: 'John', role: 'admin' });
    expect(migrate).toHaveBeenCalledTimes(1);
  });

  it('惰性初始值只在需要时执行一次', () => {
    const factory = vi.fn(() => ({ list: [] as number[] }));
    const manager = new StorageManager('lazy', factory);
    expect(factory).not.toHaveBeenCalled();

    expect(manager.getSnapshot()).toEqual({ list: [] });
    expect(manager.getSnapshot()).toBe(manager.getSnapshot());
    expect(manager.getInitialSnapshot()).toBe(manager.getSnapshot());
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('destroy() 后不再响应 storage 事件', () => {
    const manager = new StorageManager('profile', { name: 'John' });
    const subscriber = vi.fn();
    manager.subscribe(subscriber);
    manager.destroy();

    dispatchStorageEvent('profile', JSON.stringify({ name: 'Jane' }));

    expect(subscriber).not.toHaveBeenCalled();
  });
});

describe('SSR 无关的降级', () => {
  afterEach(() => {
    clearStorageManagerRegistry();
    restoreStorage();
    vi.restoreAllMocks();
  });

  it('存储不可用时降级到内存而不是抛错', () => {
    silenceConsoleError();
    const broken = createMockStorage();
    broken.state.failSet = true;
    Object.defineProperty(window, 'localStorage', {
      value: broken.storage,
      configurable: true,
      writable: true,
    });

    const manager = new StorageManager('profile', { name: 'John' });
    manager.setValue({ name: 'Jane' });

    expect(manager.getSnapshot()).toEqual({ name: 'Jane' });
  });
});
