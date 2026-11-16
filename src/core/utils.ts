import { isBrowser, isFunction, isObject, isString } from '@ew-color-picker/utils';
import { ParseMode, ParseStrType, StoreType } from './types';

/** 默认反序列化失败标记 */
export const PARSE_FAILED = Symbol('ew-responsive-store:parse-failed');

const warn = (message: string, error: unknown) => {
    if (typeof console !== 'undefined') {
        console.error(`[rds error]: ${message}`, error);
    }
};

/**
 * 解析字符串。
 * @deprecated 第二个参数传 `ParseStrType.EVAL` 的方式已废弃，请使用 `JSON` / `AUTO`。
 */
export const parseStr = <T>(
    str: string,
    type: ParseStrType = ParseStrType.JSON,
) => {
    try {
        if (type === ParseStrType.EVAL) {
            return new Function(`return ${str}`)() as T;
        }
        if (type === ParseStrType.AUTO) {
            const result = defaultDeserialize(str, 'auto');
            return (result === PARSE_FAILED ? null : result) as T;
        }
        return JSON.parse(str) as T;
    } catch (error) {
        warn(`parse data error, that is ${error}!`, error);
        return null;
    }
};

export const isValidJSON = (val: string) => {
    try {
        JSON.parse(val);
        return true;
    } catch (error) {
        return false;
    }
};

const storageStatus = new WeakMap<Storage, boolean>();

/**
 * 检测存储是否可用。
 * 结果按 Storage 实例缓存，避免每次写入测试 key。
 */
export const isStorageEnabled = (storage: Storage | null | undefined) => {
    if (!storage) return false;
    const cached = storageStatus.get(storage);
    if (cached !== undefined) return cached;

    let enabled = false;
    try {
        const key = `__rds_test__`;
        storage.setItem(key, '');
        storage.removeItem(key);
        enabled = true;
    } catch (error) {
        enabled = false;
    }
    storageStatus.set(storage, enabled);
    return enabled;
};

/** 获取浏览器存储区域，SSR 或访问被拒绝时返回 null */
export const getStorageArea = (type: StoreType): Storage | null => {
    if (!isBrowser) return null;
    try {
        return type === StoreType.SESSION ? window.sessionStorage : window.localStorage;
    } catch (error) {
        return null;
    }
};

/** 内存版 Storage，用于 SSR / 隐私模式 / 配额写满时的降级 */
export const createMemoryStorage = (): Storage => {
    const store = new Map<string, string>();
    const storage: Storage = {
        get length() {
            return store.size;
        },
        clear() {
            store.clear();
        },
        getItem(key: string) {
            return store.has(key) ? store.get(key)! : null;
        },
        key(index: number) {
            return Array.from(store.keys())[index] ?? null;
        },
        removeItem(key: string) {
            store.delete(key);
        },
        setItem(key: string, value: string) {
            store.set(key, String(value));
        },
    };
    return storage;
};

/** 默认相等判断：引用相同或 JSON 字符串相同则视为相等 */
export const defaultEquals = (a: unknown, b: unknown) => {
    if (Object.is(a, b)) return true;
    if (isFunction(a) || isFunction(b)) return false;
    const comparable = (value: unknown) => isObject(value) || Array.isArray(value);
    if (!comparable(a) || !comparable(b)) return false;
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch (error) {
        return false;
    }
};

/**
 * 默认序列化。
 * auto 模式下字符串原样存储，保证历史裸字符串读写一致。
 */
export const defaultSerialize = (
    value: unknown,
    parseMode: ParseMode = 'json',
): string | null => {
    if (parseMode === 'auto' && isString(value)) return value;
    try {
        const result = JSON.stringify(value);
        return result === undefined ? null : result;
    } catch (error) {
        return null;
    }
};

/**
 * 默认反序列化。
 * auto 模式下只对容器 / 带引号字符串尝试 JSON.parse，其余原样返回，
 * 避免 `'1'`、`'dark'` 这类历史数据被转成数字或丢失。
 */
export const defaultDeserialize = (
    raw: string,
    parseMode: ParseMode = 'json',
): unknown | typeof PARSE_FAILED => {
    if (parseMode === 'auto') {
        const trimmed = raw.trim();
        if (
            trimmed.startsWith('{') ||
            trimmed.startsWith('[') ||
            trimmed.startsWith('"')
        ) {
            try {
                return JSON.parse(trimmed);
            } catch (error) {
                return raw;
            }
        }
        return raw;
    }

    try {
        return JSON.parse(raw);
    } catch (error) {
        return PARSE_FAILED;
    }
};
