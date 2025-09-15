import { StoreType } from './types';
import { isStorageEnabled, isValidJSON, parseStr } from './utils';

export class StorageManager<T> {
  private key: string;
  private storage: Storage;
  private initialValue: T;
  private listeners: Set<(value: T) => void> = new Set();
  private storageListener?: (e: StorageEvent) => void;

  constructor(key: string, initialValue: T, storageType: StoreType = StoreType.LOCAL) {
    this.key = key;
    this.initialValue = initialValue;
    this.storage = storageType === StoreType.LOCAL ? localStorage : sessionStorage;
    
    if (!isStorageEnabled(this.storage)) {
      throw new Error(`[rds error]: ${this.storage} is not enabled!`);
    }
    
    this.setupStorageListener();
  }

  getValue(): T {
    const storedValue = this.storage.getItem(this.key);
    return storedValue && isValidJSON(storedValue) 
      ? parseStr<T>(storedValue)! 
      : this.initialValue;
  }

  setValue(value: T): void {
    this.storage.setItem(this.key, JSON.stringify(value));
    this.notifyListeners(value);
  }

  subscribe(listener: (value: T) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(value: T): void {
    this.listeners.forEach(listener => listener(value));
  }

  private setupStorageListener(): void {
    this.storageListener = (e: StorageEvent) => {
      if (e.key === this.key && e.storageArea === this.storage) {
        const newValue = e.newValue && isValidJSON(e.newValue) 
          ? parseStr<T>(e.newValue)! 
          : this.initialValue;
        this.notifyListeners(newValue);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.storageListener);
    }
  }

  destroy(): void {
    if (this.storageListener && typeof window !== 'undefined') {
      window.removeEventListener('storage', this.storageListener);
    }
    this.listeners.clear();
  }
}
