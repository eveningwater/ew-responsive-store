import { vi } from 'vitest';

export interface MockStorageState {
  failSet: boolean;
  failGet: boolean;
  setCalls: number;
  removeCalls: number;
}

export const createMockStorage = () => {
  const store = new Map<string, string>();
  const state: MockStorageState = {
    failSet: false,
    failGet: false,
    setCalls: 0,
    removeCalls: 0,
  };

  const storage: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      if (state.failGet) throw new Error('read denied');
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      state.removeCalls += 1;
      store.delete(key);
    },
    setItem(key: string, value: string) {
      state.setCalls += 1;
      if (state.failSet) throw new Error('QuotaExceededError');
      store.set(key, String(value));
    },
  };

  return { storage, store, state };
};

/** 把 window.localStorage / sessionStorage 替换成可控的 mock */
export const installMockStorage = () => {
  const local = createMockStorage();
  const session = createMockStorage();

  Object.defineProperty(window, 'localStorage', {
    value: local.storage,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(window, 'sessionStorage', {
    value: session.storage,
    configurable: true,
    writable: true,
  });

  return { local, session };
};

/** 删除测试注入的属性，恢复 jsdom 原生存储 */
export const restoreStorage = () => {
  delete (window as any).localStorage;
  delete (window as any).sessionStorage;
};

/** 模拟其它标签页写入后派发的 storage 事件 */
export const dispatchStorageEvent = (
  key: string | null,
  newValue: string | null,
  storageArea?: Storage,
) => {
  // jsdom 的 StorageEvent 只接受真实 Storage 实例，这里用普通事件 + 属性模拟
  const event = new Event('storage') as StorageEvent;
  Object.defineProperty(event, 'key', { value: key });
  Object.defineProperty(event, 'newValue', { value: newValue });
  if (storageArea) {
    Object.defineProperty(event, 'storageArea', { value: storageArea });
  }
  window.dispatchEvent(event);
};

/** 静音库里默认的 console.error 日志 */
export const silenceConsoleError = () => vi.spyOn(console, 'error').mockImplementation(() => {});
