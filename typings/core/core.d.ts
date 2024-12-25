import { WatchOptions } from '@vue/reactivity';
import { StoreType } from './enum';
import { isStorageEnabled, isValidJSON, parseStr } from './utils';
export interface StoreOptions extends WatchOptions {
    storage?: StoreType;
}
export declare function useStorage<T>(key: string, initialValue: T, options?: StoreOptions): [T] extends [import("@vue/reactivity").Ref<any, any>] ? import("@vue/shared").IfAny<T, import("@vue/reactivity").Ref<T, T>, T> : import("@vue/reactivity").Ref<import("@vue/reactivity").UnwrapRef<T>, T | import("@vue/reactivity").UnwrapRef<T>>;
export { parseStr, isStorageEnabled, isValidJSON };
