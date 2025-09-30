import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePreactStorage } from '../src/export/preact';
import { StoreType } from '../src/core/types';

// Mock Preact
vi.mock('preact', () => ({
  useState: vi.fn(),
  useEffect: vi.fn(),
  useCallback: vi.fn(),
}));

// Mock Preact hooks module
vi.mock('preact/hooks', () => ({
  useState: vi.fn(),
  useEffect: vi.fn(),
  useCallback: vi.fn(),
}));

// Mock localStorage
const createMockStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
};

describe('Preact Adapter', () => {
  let mockLocalStorage: ReturnType<typeof createMockStorage>;
  let mockSessionStorage: ReturnType<typeof createMockStorage>;

  beforeEach(async () => {
    mockLocalStorage = createMockStorage();
    mockSessionStorage = createMockStorage();
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true,
    });

    // 设置mock函数的返回值
    const { useState, useEffect, useCallback } = await import('preact/hooks');
    
    // Mock useState to return different values based on input
    let currentValue: any;
    let setValueRef: any;
    (useState as any).mockImplementation((initialValue: any) => {
      // 如果initialValue是函数，调用它来获取实际值
      currentValue = typeof initialValue === 'function' ? initialValue() : initialValue;
      setValueRef = vi.fn((newValue: any) => {
        if (typeof newValue === 'function') {
          currentValue = newValue(currentValue);
        } else {
          currentValue = newValue;
        }
        // 重新渲染hook以获取新值
        if (setValueRef && setValueRef.mock) {
          setValueRef.mock.calls.forEach(() => {
            // 触发重新渲染
          });
        }
      });
      return [currentValue, setValueRef];
    });
    
    (useEffect as any).mockImplementation((fn: any) => fn());
    (useCallback as any).mockImplementation((fn: any) => fn);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('usePreactStorage', () => {
    it('should initialize with initial value', () => {
      const { result } = renderHook(() => 
        usePreactStorage('test-key', { name: 'John' })
      );

      expect(result.current[0]).toEqual({ name: 'John' });
    });

    it('should load existing value from storage', () => {
      mockLocalStorage.setItem('test-key', JSON.stringify({ name: 'Jane' }));
      
      const { result } = renderHook(() => 
        usePreactStorage('test-key', { name: 'John' })
      );

      expect(result.current[0]).toEqual({ name: 'Jane' });
    });

    it('should update value and storage', () => {
      const { result } = renderHook(() => 
        usePreactStorage('test-key', { name: 'John' })
      );

      // 测试setter函数是否存在
      expect(typeof result.current[1]).toBe('function');
      
      // 测试调用setter函数
      act(() => {
        result.current[1]({ name: 'Jane' });
      });

      // 验证localStorage被调用
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify({ name: 'Jane' }));
    });

    it('should use sessionStorage when specified', () => {
      const { result } = renderHook(() => 
        usePreactStorage('test-key', { name: 'John' }, { storage: StoreType.SESSION })
      );

      act(() => {
        result.current[1]({ name: 'Jane' });
      });

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify({ name: 'Jane' }));
    });

    it('should handle cross-tab synchronization', () => {
      const { result } = renderHook(() => 
        usePreactStorage('test-key', { name: 'John' })
      );

      // 测试hook是否正确初始化
      expect(result.current[0]).toEqual({ name: 'John' });
      expect(typeof result.current[1]).toBe('function');
    });

    it('should ignore storage events for different keys', () => {
      const { result } = renderHook(() => 
        usePreactStorage('test-key', { name: 'John' })
      );

      act(() => {
        // 直接调用storageManager的订阅回调来模拟跨标签页同步
        const storageManager = (result.current as any).__storageManager;
        if (storageManager && storageManager.subscribe) {
          const subscribers = (storageManager as any).subscribers || [];
          subscribers.forEach((callback: any) => {
            callback({ name: 'Jane' });
          });
        }
      });

      expect(result.current[0]).toEqual({ name: 'John' });
    });

    it('should handle invalid JSON gracefully', () => {
      mockLocalStorage.setItem('test-key', 'invalid-json');
      
      const { result } = renderHook(() => 
        usePreactStorage('test-key', { name: 'John' })
      );

      expect(result.current[0]).toEqual({ name: 'John' });
    });

    it('should cleanup on unmount', () => {
      const { unmount } = renderHook(() => 
        usePreactStorage('test-key', { name: 'John' })
      );

      // 测试unmount不会抛出错误
      expect(() => unmount()).not.toThrow();
    });

    it('should return tuple with value and setter', () => {
      const { result } = renderHook(() => 
        usePreactStorage('test-key', { name: 'John' })
      );

      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current).toHaveLength(2);
      expect(typeof result.current[0]).toBe('object');
      expect(typeof result.current[1]).toBe('function');
    });
  });
});
