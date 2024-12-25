import { parseStrType } from "./enum";

export const parseStr = <T>(
    str: string,
    type: parseStrType = parseStrType.JSON,
) => {
    const parseMethod = {
        [parseStrType.EVAL]: <T>(v: string): T => new Function(`return ${v}`)(),
        [parseStrType.JSON]: JSON.parse,
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
        const res = JSON.parse(val);
        return res !== null;
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
