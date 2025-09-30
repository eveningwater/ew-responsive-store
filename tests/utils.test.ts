import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseStr, isValidJSON, isStorageEnabled } from '../src/core/utils';
import { ParseStrType } from '../src/core/types';

describe('utils', () => {
  beforeEach(() => {
    // 抑制控制台错误输出
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('parseStr', () => {
    it('should parse JSON string by default', () => {
      const result = parseStr<{ name: string }>('{"name":"John"}');
      expect(result).toEqual({ name: 'John' });
    });

    it('should parse JSON with custom type', () => {
      const result = parseStr<{ name: string }>('{"name":"John"}', ParseStrType.JSON);
      expect(result).toEqual({ name: 'John' });
    });

    it('should handle invalid JSON gracefully', () => {
      const result = parseStr<{ name: string }>('invalid-json');
      expect(result).toBeNull();
    });

    it('should handle eval parsing', () => {
      const result = parseStr<number>('42', ParseStrType.EVAL);
      expect(result).toBe(42);
    });

    it('should handle eval parsing with objects', () => {
      const result = parseStr<{ name: string }>('{name:"John"}', ParseStrType.EVAL);
      expect(result).toEqual({ name: 'John' });
    });

    it('should return null for invalid eval', () => {
      const result = parseStr<number>('invalid-eval', ParseStrType.EVAL);
      expect(result).toBeNull();
    });
  });

  describe('isValidJSON', () => {
    it('should return true for valid JSON', () => {
      expect(isValidJSON('{"name":"John"}')).toBe(true);
      expect(isValidJSON('42')).toBe(true);
      expect(isValidJSON('"string"')).toBe(true);
      expect(isValidJSON('true')).toBe(true);
      expect(isValidJSON('null')).toBe(true);
    });

    it('should return false for invalid JSON', () => {
      expect(isValidJSON('invalid-json')).toBe(false);
      expect(isValidJSON('{name:"John"}')).toBe(false);
      expect(isValidJSON('')).toBe(false);
    });
  });

  describe('isStorageEnabled', () => {
    it('should return true for working storage', () => {
      const mockStorage = {
        setItem: () => {},
        removeItem: () => {},
      };
      
      expect(isStorageEnabled(mockStorage as unknown as Storage)).toBe(true);
    });

    it('should return false for broken storage', () => {
      const mockStorage = {
        setItem: () => { throw new Error('Storage disabled'); },
        removeItem: () => {},
      };
      
      expect(isStorageEnabled(mockStorage as unknown as Storage)).toBe(false);
    });
  });
});
