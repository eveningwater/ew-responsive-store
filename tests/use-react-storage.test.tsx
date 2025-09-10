import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReactStorage } from '../src/core/use-react-storage';
import { StoreType } from '../src/core/enum';

// Mock localStorage and sessionStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
};

const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
};

// Mock storage utilities
vi.mock('../src/core/utils', () => ({
  isStorageEnabled: vi.fn().mockReturnValue(true),
  isValidJSON: vi.fn().mockImplementation((val: string) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }),
  parseStr: vi.fn().mockImplementation((val: string) => JSON.parse(val))
}));

// Mock window.addEventListener and removeEventListener
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener,
  writable: true
});

Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true
});

describe('useReactStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset storage mocks
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('基本功能测试', () => {
    it('应该从localStorage读取并正确初始化', () => {
      const mockData = '{"name": "夕水", "age": 25}';
      mockLocalStorage.getItem.mockReturnValue(mockData);

      const { result } = renderHook(() => 
        useReactStorage('user', { name: 'eveningwater', age: 20 })
      );

      expect(result.current[0]).toEqual({ name: '夕水', age: 25 });
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('user');
    });

    it('应该使用初始值当localStorage中没有存储数据时', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => 
        useReactStorage('user', { name: 'eveningwater' })
      );

      expect(result.current[0]).toEqual({ name: 'eveningwater' });
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('user');
    });

    it('应该使用初始值当localStorage中的数据无效时', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      const { result } = renderHook(() => 
        useReactStorage('user', { name: 'eveningwater' })
      );

      expect(result.current[0]).toEqual({ name: 'eveningwater' });
    });

    it('应该更新值并写入localStorage', () => {
      const { result } = renderHook(() => 
        useReactStorage('user', { name: 'eveningwater' })
      );

      act(() => {
        result.current[1]({ name: '夕水' });
      });

      expect(result.current[0]).toEqual({ name: '夕水' });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', '{"name":"夕水"}');
    });
  });

  describe('存储类型测试', () => {
    it('应该使用sessionStorage当指定时', () => {
      const mockData = '{"name": "夕水"}';
      mockSessionStorage.getItem.mockReturnValue(mockData);

      const { result } = renderHook(() => 
        useReactStorage('user', { name: 'eveningwater' }, { storage: StoreType.SESSION })
      );

      expect(result.current[0]).toEqual({ name: '夕水' });
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('user');
    });

    it('应该写入sessionStorage当使用sessionStorage时', () => {
      const { result } = renderHook(() => 
        useReactStorage('user', { name: 'eveningwater' }, { storage: StoreType.SESSION })
      );

      act(() => {
        result.current[1]({ name: '夕水' });
      });

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('user', '{"name":"夕水"}');
    });
  });

  describe('跨标签页同步测试', () => {
    it('应该添加storage事件监听器', () => {
      renderHook(() => useReactStorage('user', { name: 'eveningwater' }));

      expect(mockAddEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
    });

    it('应该清理事件监听器', () => {
      const { unmount } = renderHook(() => 
        useReactStorage('user', { name: 'eveningwater' })
      );

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
    });
  });

  describe('复杂数据类型测试', () => {
    it('应该正确处理数组类型', () => {
      const initialTodos = [
        { id: 1, text: '学习React', completed: false },
        { id: 2, text: '学习Vue', completed: true }
      ];

      const { result } = renderHook(() => 
        useReactStorage('todos', initialTodos)
      );

      expect(result.current[0]).toEqual(initialTodos);

      const newTodos = [...initialTodos, { id: 3, text: '学习TypeScript', completed: false }];
      
      act(() => {
        result.current[1](newTodos);
      });

      expect(result.current[0]).toEqual(newTodos);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('todos', JSON.stringify(newTodos));
    });

    it('应该正确处理嵌套对象', () => {
      const initialData = {
        user: {
          name: 'eveningwater',
          profile: {
            age: 25,
            city: 'Beijing'
          }
        },
        settings: {
          theme: 'dark',
          language: 'zh-CN'
        }
      };

      const { result } = renderHook(() => 
        useReactStorage('appData', initialData)
      );

      expect(result.current[0]).toEqual(initialData);

      const updatedData = {
        ...initialData,
        user: {
          ...initialData.user,
          profile: {
            ...initialData.user.profile,
            age: 26
          }
        }
      };

      act(() => {
        result.current[1](updatedData);
      });

      expect(result.current[0]).toEqual(updatedData);
    });
  });

  describe('性能优化测试', () => {
    it('应该使用useCallback优化updateValue函数', () => {
      const { result, rerender } = renderHook(() => 
        useReactStorage('user', { name: 'eveningwater' })
      );

      const firstUpdateValue = result.current[1];
      
      rerender();

      const secondUpdateValue = result.current[1];
      
      // 由于useCallback的依赖没有变化，函数引用应该相同
      expect(firstUpdateValue).toBe(secondUpdateValue);
    });
  });
});
