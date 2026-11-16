# API Reference

## ⚠️ Important Version Notes

### v0.0.5 (current)

A patch release that fixes missing `useStorage` exports in subpath entries, writes during render in `getSnapshot`, and adds manager recycling APIs. See the [changelog](/en/changelog).

### v0.0.4 breaking changes

1. **Vue `immediate` now defaults to `false`**: the value is initialized from storage instead of being written back on creation. Pass `immediate: true` when you need the initial value persisted immediately.
2. **`ParseStrType.EVAL` is deprecated**: it uses `new Function` and throws under strict CSP (e.g. hardened Tauri or Electron). Use `JSON` or `AUTO` instead.
3. **UMD output extension changed to `.cjs`**: importing through the package name or subpaths is unaffected.

### Migration guide

**Old versions (v0.0.1-beta.8 and earlier)**:

```ts
import { useStorage, useReactStorage } from 'ew-responsive-store';
```

**v0.0.3+**: import from the framework-specific subpath.

```ts
import { useStorage } from 'ew-responsive-store';          // Vanilla JavaScript
import { useStorage } from 'ew-responsive-store/vue';      // Vue
import { useStorage } from 'ew-responsive-store/react';    // React
import { useStorage } from 'ew-responsive-store/preact';   // Preact
import { useStorage } from 'ew-responsive-store/solid';    // Solid
import { useStorage } from 'ew-responsive-store/svelte';   // Svelte
import { useStorage } from 'ew-responsive-store/angular';  // Angular
import { useStorage } from 'ew-responsive-store/vanilla';  // Vanilla (explicit subpath)
```

Legacy names such as `useReactStorage` are still exported as aliases but are no longer recommended.

---

## Shared Options

All frameworks share `BaseStoreOptions<T>`:

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `storage` | `StoreType` | `StoreType.LOCAL` | Storage area: `LOCAL` or `SESSION` |
| `parse` | `'json' \| 'auto'` | `'json'` | Deserialization mode |
| `serializer` | `(value: T) => string \| null \| undefined` | - | Custom serializer; returning `null` / `undefined` rejects the write |
| `deserializer` | `(raw: string) => T` | - | Custom deserializer |
| `version` | `number` | - | Data version used together with `migrate` |
| `migrate` | `(oldValue: unknown, oldVersion: number) => T` | - | Migrates old data on read and writes the result back |
| `equals` | `(a: T, b: T) => boolean` | Reference / JSON string comparison | Skips writes and notifications when equal |
| `memoryFallback` | `boolean` | `true` | Falls back to memory when storage is unavailable or a write fails |
| `onError` | `(ctx: StorageErrorContext) => void` | - | Error callback; `ctx` contains `key`, `storage`, `operation`, and `error` |

> The same `key` + storage area shares one manager. `options` and `initialValue` only take effect on first creation.

### Parse modes

- `json` (default): strict JSON; parsing failures fall back to the initial value.
- `auto`: compatible with legacy bare strings. On read, only strings starting with `{`, `[`, or `"` are parsed as JSON; everything else is returned as-is. On write, strings are stored as-is and other types still use `JSON.stringify`.

With `auto`, numbers and booleans are written as JSON and may come back as strings; use `json` when strict types matter.

### StorageActions

The third return value in React, Preact, and Solid, and the returned object in Svelte and Vanilla expose:

| Member | Description |
| --- | --- |
| `key` | The current storage key |
| `remove()` | Removes the key and falls back to the initial value |
| `clear()` | Clears only keys managed by this library; it never calls native `storage.clear()` |
| `manager` | The underlying manager instance |

### Low-level manager API

```ts
import {
  getStorageManager,
  retainStorageManager,
  releaseStorageManager,
  getRegisteredManagers,
  clearManagedStorage,
  clearStorageManagerRegistry,
} from 'ew-responsive-store';
```

| API | Description |
| --- | --- |
| `getStorageManager(key, initialValue, options?)` | Gets or creates the shared manager for a key |
| `retainStorageManager(key, storage?)` | Acquires a reference; pair it with `releaseStorageManager` |
| `releaseStorageManager(key, storage?)` | Releases a reference; recycles in a microtask when the count reaches zero and there are no subscribers |
| `getRegisteredManagers(storage?)` | Returns registered managers |
| `clearManagedStorage(storage?)` | Removes all keys managed by this library |
| `clearStorageManagerRegistry()` | Destroys and removes every manager (for tests / HMR) |

Framework adapters automatically retain and release on mount and unmount. Manual instances and non-component scenarios must do it themselves. When using Vue outside `setup`, wrap the call in `effectScope()` and release with `scope.stop()`.

---

## Framework Adapters

### useStorage (Vue)

#### Signature

```ts
function useStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options?: VueStoreOptions<T>,
): Ref<T>;
```

#### Options

In addition to the [shared options](#shared-options), Vue supports:

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `immediate` | `boolean` | `false` | Writes the current value back to storage on creation |
| `deep` | `boolean` | `true` | Watches nested mutations |

Other Vue `watch` options are also supported.

#### Return value

A `Ref<T>` kept in sync with the selected storage area.

#### Example

```ts
import { useStorage } from 'ew-responsive-store/vue';
import { StoreType } from 'ew-responsive-store';

const count = useStorage('count', 0);
count.value += 1;

const user = useStorage('user', { name: 'Alice' }, {
  storage: StoreType.SESSION,
});

// Nothing is written on creation by default; opt in when needed
const settings = useStorage('settings', { theme: 'dark' }, {
  immediate: true,
});
```

### useStorage (React)

#### Signature

```ts
function useStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options?: ReactStoreOptions<T>,
): readonly [T, (value: StorageUpdater<T>) => void, StorageActions<T>];
```

Built on `useSyncExternalStore`, with React 18+ concurrent rendering and SSR support (`getInitialSnapshot()` returns the initial value on the server).

#### Return value

- `[0]`: the current value `T`
- `[1]`: updater supporting `setValue(next)` and `setValue(prev => next)`
- `[2]`: `{ key, remove, clear, manager }`

#### Example

```tsx
import { useStorage } from 'ew-responsive-store/react';

function Todos() {
  const [todos, setTodos, actions] = useStorage<string[]>('todos', []);

  const add = (title: string) =>
    setTodos((prev) => [...prev, title]);

  return (
    <div>
      <button onClick={() => add('New todo')}>Add</button>
      <button onClick={actions.remove}>Remove current key</button>
    </div>
  );
}
```

### useStorage (Preact)

Same three-element tuple as React:

```tsx
import { useStorage } from 'ew-responsive-store/preact';

const [count, setCount, actions] = useStorage('count', 0);
```

### useStorage (Solid)

Returns `[Accessor<T>, setter, StorageActions<T>]`:

```tsx
import { useStorage } from 'ew-responsive-store/solid';

function Counter() {
  const [count, setCount] = useStorage('count', 0);
  return <button onClick={() => setCount(count() + 1)}>{count()}</button>;
}
```

### useStorage (Svelte)

Returns a Svelte store with `set` / `update` / `remove` / `clear` / `destroy`:

```svelte
<script>
  import { useStorage } from 'ew-responsive-store/svelte';

  const store = useStorage('count', 0);
  $: count = $store;

  function reset() {
    store.remove();
  }
</script>

<button on:click={reset}>Count: {count}</button>
```

### useStorage (Angular)

Call it inside an injection context (component or service). Return value:

```ts
interface AngularStorageReturn<T> {
  value: () => T;                                  // computed signal
  setValue: (value: StorageUpdater<T>) => void;
  updateValue: (updater: (current: T) => T) => void;
  reset: () => void;
  remove: () => void;
  clear: () => void;
}
```

```ts
import { Component } from '@angular/core';
import { useStorage } from 'ew-responsive-store/angular';

@Component({
  template: `
    <div>Count: {{ storage.value() }}</div>
    <button (click)="storage.setValue(storage.value() + 1)">+1</button>
  `,
})
export class CounterComponent {
  storage = useStorage('count', 0);
}
```

The manager is released when the component's `DestroyRef` fires.

### useStorage (Vanilla JS)

Both the root entry and `/vanilla` resolve to the vanilla adapter:

```ts
import { useStorage } from 'ew-responsive-store';

const storage = useStorage('count', 0);

storage.value;              // current value
storage.setValue(1);
storage.updateValue((n) => n + 1);
storage.remove();           // removes the key and falls back to the initial value
storage.clear();            // clears keys managed by this library
const unsubscribe = storage.subscribe((value) => console.log(value));
storage.destroy();          // unsubscribes and releases the manager
```

---

## Utilities

### parseStr

```ts
function parseStr<T>(str: string, type?: ParseStrType): T | null;
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `str` | `string` | - | String to parse |
| `type` | `ParseStrType` | `ParseStrType.JSON` | `JSON`, `AUTO`, or the deprecated `EVAL` |

```ts
import { parseStr, ParseStrType } from 'ew-responsive-store';

parseStr<{ name: string }>('{"name":"Alice"}');
parseStr('dark', ParseStrType.AUTO); // 'dark'
```

> `ParseStrType.EVAL` is deprecated and throws under strict CSP. Do not use it in new code.

### isValidJSON

```ts
function isValidJSON(value: string): boolean;
```

### isStorageEnabled

```ts
function isStorageEnabled(storage?: Storage): boolean;
```

Checks whether storage is usable (Safari private mode, quota limits, etc.). The result is cached.

---

## Enums

### StoreType

```ts
enum StoreType {
  LOCAL = 'localStorage',
  SESSION = 'sessionStorage',
}
```

### ParseStrType

```ts
enum ParseStrType {
  JSON = 'json',
  AUTO = 'auto',
  /** @deprecated Uses new Function and throws under strict CSP */
  EVAL = 'eval',
}
```

---

## Legacy API

Before v0.0.1-beta.8, `useStorage` defaulted to `immediate: true` and React used a separate `useReactStorage`. Those interfaces are kept for compatibility only and behave differently:

- Vue's old `useStorage` default for `immediate` is now `false`.
- `useReactStorage` is now an alias of `useStorage`, whose return value is a three-element tuple.
- The old `parseStr` only supported `JSON` / `EVAL`; `AUTO` was added and `EVAL` is deprecated.

New projects should use the unified APIs above.
