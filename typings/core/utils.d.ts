import { parseStrType } from "./enum";
export declare const parseStr: <T>(str: string, type?: parseStrType) => T | null;
export declare const isValidJSON: (val: string) => boolean;
export declare const isStorageEnabled: (storage: Storage) => boolean;
