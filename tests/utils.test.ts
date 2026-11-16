import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  defaultDeserialize,
  defaultEquals,
  defaultSerialize,
  isStorageEnabled,
  isValidJSON,
  parseStr,
} from '../src/core/utils';
import { ParseStrType } from '../src/core/types';
import { createMockStorage, silenceConsoleError } from './helpers';

describe('utils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('parseStr', () => {
    it('默认按 JSON 解析', () => {
      expect(parseStr<{ name: string }>('{"name":"John"}')).toEqual({ name: 'John' });
    });

    it('非法 JSON 返回 null', () => {
      silenceConsoleError();
      expect(parseStr('invalid-json')).toBeNull();
    });

    it('AUTO 模式兼容裸字符串', () => {
      expect(parseStr<string>('dark', ParseStrType.AUTO)).toBe('dark');
      expect(parseStr<string>('1', ParseStrType.AUTO)).toBe('1');
    });

    it('AUTO 模式解析容器', () => {
      expect(parseStr<{ a: number }>('{"a":1}', ParseStrType.AUTO)).toEqual({ a: 1 });
    });

    it('EVAL 模式仍然可用（已废弃）', () => {
      expect(parseStr<number>('42', ParseStrType.EVAL)).toBe(42);
    });
  });

  describe('isValidJSON', () => {
    it('识别合法 JSON', () => {
      expect(isValidJSON('{"name":"John"}')).toBe(true);
      expect(isValidJSON('42')).toBe(true);
      expect(isValidJSON('"string"')).toBe(true);
    });

    it('识别非法 JSON', () => {
      expect(isValidJSON('invalid-json')).toBe(false);
      expect(isValidJSON('')).toBe(false);
    });
  });

  describe('isStorageEnabled', () => {
    it('可用存储返回 true', () => {
      const { storage } = createMockStorage();
      expect(isStorageEnabled(storage)).toBe(true);
    });

    it('不可用存储返回 false', () => {
      const { storage, state } = createMockStorage();
      state.failSet = true;
      expect(isStorageEnabled(storage)).toBe(false);
    });

    it('检测结果按实例缓存，不重复写测试 key', () => {
      const { storage, state } = createMockStorage();
      isStorageEnabled(storage);
      const calls = state.setCalls;
      isStorageEnabled(storage);
      expect(state.setCalls).toBe(calls);
    });
  });

  describe('序列化与相等判断', () => {
    it('json 模式序列化', () => {
      expect(defaultSerialize({ a: 1 })).toBe('{"a":1}');
      expect(defaultSerialize(undefined)).toBeNull();
    });

    it('auto 模式字符串原样序列化', () => {
      expect(defaultSerialize('dark', 'auto')).toBe('dark');
      expect(defaultSerialize({ a: 1 }, 'auto')).toBe('{"a":1}');
    });

    it('auto 模式反序列化兼容裸字符串', () => {
      expect(defaultDeserialize('dark', 'auto')).toBe('dark');
      expect(defaultDeserialize('"dark"', 'auto')).toBe('dark');
      expect(defaultDeserialize('{"a":1}', 'auto')).toEqual({ a: 1 });
    });

    it('对象按 JSON 内容比较', () => {
      expect(defaultEquals({ a: 1 }, { a: 1 })).toBe(true);
      expect(defaultEquals({ a: 1 }, { a: 2 })).toBe(false);
      expect(defaultEquals([1, 2], [1, 2])).toBe(true);
      expect(defaultEquals(1, 1)).toBe(true);
    });
  });
});
