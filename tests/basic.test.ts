import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStorage } from '../src/core/core';
import { StoreType } from '../src/core/enum'; 

globalThis.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: () => 'test_local',
  length: 1
};

globalThis.sessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: () => 'test_session',
  length: 1
};

// 模拟 parseStr
vi.mock('./utils', () => ({
  parseStr: vi.fn().mockReturnValue((val: string) => JSON.parse(val)),
}));

describe('useStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should read from localStorage and initialize correctly', () => {
    const mockData = '{"name": "夕水"}';
    (localStorage.getItem as any).mockReturnValue(mockData);

    const result = useStorage('user', { name: 'eveningwater' });

    expect(result.value).toEqual({ name: '夕水' });
    expect(localStorage.getItem).toHaveBeenCalledWith('user');
  });

  it('should use initial value if nothing is stored in localStorage', () => {
    (localStorage.getItem as any).mockReturnValue(null);

    const result = useStorage('user', { name: 'eveningwater' });

    expect(result.value).toEqual({ name: 'eveningwater' });
    expect(localStorage.getItem).toHaveBeenCalledWith('user');
  });

  it('should write to localStorage when value changes', () => {
    const result = useStorage('user', { name: 'eveningwater' });

    result.value = { name: '夕水' };

    expect(localStorage.setItem).toHaveBeenCalledWith('user', '{"name":"夕水"}');
  });

  it('should use sessionStorage if specified in options', () => {
    const mockData = '{"name": "夕水"}';
    (sessionStorage.getItem as any).mockReturnValue(mockData);

    const result = useStorage('user', { name: 'eveningwater' }, { storage: StoreType.SESSION });

    expect(result.value).toEqual({ name: '夕水' });
    expect(sessionStorage.getItem).toHaveBeenCalledWith('user');
  });

  it('should write to sessionStorage when value changes', () => {
    const result = useStorage('user', { name: 'eveningwater' }, { storage: StoreType.SESSION });

    result.value = { name: '夕水' };

    expect(sessionStorage.setItem).toHaveBeenCalledWith('user', '{"name":"夕水"}');
  });

  it('should respect deep option for deep watching', () => {
    const result = useStorage('user', { name: 'eveningwater', details: { age: 25 } }, { deep: true });

    result.value.details.age = 28;

    expect(localStorage.setItem).toHaveBeenCalledWith('user', '{"name":"eveningwater","details":{"age":28}}');
  });

  it('should respect deep option for deep watching', () => {
    const storedValue = '{"name":"eveningwater","details":{"age":25}}';
    (sessionStorage.getItem as any).mockReturnValue(storedValue);
    const result = useStorage('user', { name: 'eveningwater', details: { age: 25 } }, { storage: StoreType.SESSION });    
    result.value.details.age = 28;

    expect(sessionStorage.setItem).toHaveBeenCalledWith('user', '{"name":"eveningwater","details":{"age":28}}');
  });

  it('should trigger immediate effect with immediate: true', () => {
    const result = useStorage('user', { name: 'eveningwater' }, { immediate: true });

    expect(result.value).toEqual({ name: 'eveningwater' });
  });

  it('should trigger immediate effect with immediate: false', () => {
    useStorage('user', { name: 'eveningwater' }, { immediate: false });
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
