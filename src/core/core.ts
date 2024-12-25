import { WatchOptions, ref, watch } from '@vue/reactivity';
import { StoreType } from './enum';
import { isStorageEnabled, isValidJSON, parseStr } from './utils';
export interface StoreOptions extends WatchOptions {
  storage?: StoreType;
}
export function useStorage<T>(
  key: string,
  initialValue: T,
  options: StoreOptions = {
    storage: StoreType.LOCAL,
    immediate: true,
    deep: true
  }
) {
  const { storage = StoreType.LOCAL, immediate = true, deep = true, ...rest } = options;
  const currentStorage =
    storage === StoreType.LOCAL ? localStorage : sessionStorage;
  if (!isStorageEnabled(currentStorage)) {
    throw new Error(`[rds error]:${currentStorage} is not enabled!`)
  }
  const storedValue = currentStorage.getItem(key);
  const data = storedValue && isValidJSON(storedValue) ? parseStr<T>(storedValue)! : initialValue;  
  const value = ref(data);
  value.value = data;
  watch(value, (newValue) => {
    currentStorage.setItem(key, JSON.stringify(newValue));
  }, { immediate, deep, ...rest });

  return value;
}
export { parseStr, isStorageEnabled, isValidJSON }