import { ParseStrType } from "./types";

export const parseStr = <T>(
    str: string,
    type: ParseStrType = ParseStrType.JSON,
) => {
    const parseMethod = {
        [ParseStrType.EVAL]: <T>(v: string): T => new Function(`return ${v}`)(),
        [ParseStrType.JSON]: JSON.parse,
    };
    let res: T | null = null;
    try {
        const method = parseMethod[type];
        if (method) {
            res = method(str);
        }
    } catch (error) {
        console.error(`[rds error]:parse data error,that is ${error}!`);
    }
    return res;
};

export const isValidJSON = (val: string) => {
    try {
        JSON.parse(val);
        return true;
    } catch (error) {
        return false;
    }
};

export const isStorageEnabled = (storage: Storage) => {
    try {
        const key = `__storage__test`;
        storage.setItem(key, '');
        storage.removeItem(key);
        return true;
    } catch (e) {
        return false;
    }
};
