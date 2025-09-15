# API Reference

## ⚠️ Important Version Notice

### v0.0.3 Breaking Changes

**v0.0.3** introduces major changes including:

1. **Framework-specific entry points**: Now requires importing from specific framework entry points
2. **Unified API**: All frameworks use the `useStorage` function name
3. **Zero external dependencies**: Framework dependencies are treated as external

### Migration Guide

**Old version (v0.0.1-beta.8 and earlier)**:
```ts
import { useStorage } from 'ew-responsive-store';
import { useReactStorage } from 'ew-responsive-store';
```

**New version (v0.0.3+)**:
```ts
// Vue
import { useStorage } from 'ew-responsive-store/vue';

// React
import { useStorage } from 'ew-responsive-store/react';

// Other frameworks...
```

---

## v0.0.3+ Multi-Framework Support

### useStorage (Vue) - v0.0.3+

The `useStorage` function is the core API of the `ew-responsive-store` library. It allows you to create reactive state that is synchronized with browser storage (localStorage or sessionStorage).

### Type Definition

```ts
function useStorage<T>(
  key: string,
  initialValue: T,
  options: StoreOptions = {
    storage: StoreType.LOCAL,
    immediate: true,
    deep: true,
  }
): Ref<T>;
```

### Parameters

| Parameter      | Type           | Description                                              |
| -------------- | -------------- | -------------------------------------------------------- |
| `key`          | `string`       | The key to use for storing the value in storage          |
| `initialValue` | `T`            | The initial value to use if no value is found in storage |
| `options`      | `StoreOptions` | Configuration options (optional)                         |

### Options

The `options` parameter accepts the following properties:

| Property    | Type        | Default           | Description                                                  |
| ----------- | ----------- | ----------------- | ------------------------------------------------------------ |
| `storage`   | `StoreType` | `StoreType.LOCAL` | The storage type to use (`localStorage` or `sessionStorage`) |
| `deep`      | `boolean`   | `true`            | Whether to deeply watch the state for changes                |

Additionally, all Vue watch options are supported, as `StoreOptions` extends `WatchOptions` from Vue.

### Returns

A reactive `Ref<T>` that is synchronized with the specified storage.

### Example

```ts
import { useStorage } from "ew-responsive-store/vue";
import { StoreType } from "ew-responsive-store";

// Basic usage with localStorage
const count = useStorage("count", 0);

// Using sessionStorage
const user = useStorage(
  "user",
  { name: "John" },
  { storage: StoreType.SESSION }
);

// Disabling deep watching
const list = useStorage("list", [1, 2, 3], { deep: false });

// Disabling immediate effect
const settings = useStorage(
  "settings",
  { theme: "dark" },
  { immediate: false }
);
```

### useStorage (React) - v0.0.3+

React version of the `useStorage` function, providing a React-native experience.

#### Type Definition

```ts
function useStorage<T>(
  key: string,
  initialValue: T,
  options: ReactStoreOptions = {
    storage: StoreType.LOCAL,
  }
): readonly [T, (newValue: T) => void];
```

#### Parameters

| Parameter      | Type               | Description                                              |
| -------------- | ------------------ | -------------------------------------------------------- |
| `key`          | `string`           | The key to use for storing the value in storage          |
| `initialValue` | `T`                | The initial value to use if no value is found in storage |
| `options`      | `ReactStoreOptions`| Configuration options (optional)                         |

#### Options

The `options` parameter accepts the following properties:

| Property    | Type        | Default           | Description                                                  |
| ----------- | ----------- | ----------------- | ------------------------------------------------------------ |
| `storage`   | `StoreType` | `StoreType.LOCAL` | The storage type to use (`localStorage` or `sessionStorage`) |

#### Returns

A tuple containing:
- `[0]`: The current value of type `T`
- `[1]`: A setter function to update the value

#### Example

```tsx
import React from 'react';
import { useStorage, StoreType } from "ew-responsive-store/react";

function Counter() {
  // Basic usage with localStorage
  const [count, setCount] = useStorage("count", 0);
  
  // Using sessionStorage
  const [user, setUser] = useStorage(
    "user",
    { name: "John", age: 25 },
    { storage: StoreType.SESSION }
  );

  const increment = () => setCount(count + 1);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
      
      <p>User: {user.name} ({user.age})</p>
      <button onClick={() => setUser({ ...user, age: user.age + 1 })}>
        Increase Age
      </button>
    </div>
  );
}
```

### useStorage (Preact) - v0.0.3+

Preact version of the `useStorage` function, same API as React but optimized for Preact.

```tsx
import { useStorage } from "ew-responsive-store/preact";

function Counter() {
  const [count, setCount] = useStorage("count", 0);
  return <div>Count: {count}</div>;
}
```

### useStorage (Solid) - v0.0.3+

Solid version of the `useStorage` function, returns Solid signals.

```tsx
import { useStorage } from "ew-responsive-store/solid";

function Counter() {
  const [count, setCount] = useStorage("count", 0);
  return <div>Count: {count()}</div>;
}
```

### useStorage (Svelte) - v0.0.3+

Svelte version of the `useStorage` function, returns Svelte store.

```svelte
<script>
  import { useStorage } from "ew-responsive-store/svelte";
  
  const store = useStorage("count", 0);
  let count = $store;
</script>

<div>Count: {count}</div>
```

### useStorage (Angular) - v0.0.3+

Angular version of the `useStorage` function, returns Angular signals.

```ts
import { Component } from '@angular/core';
import { useStorage } from "ew-responsive-store/angular";

@Component({
  template: `<div>Count: {{ count() }}</div>`
})
export class CounterComponent {
  private storage = useStorage("count", 0);
  count = this.storage.value;
}
```

### useStorage (Vanilla JS) - v0.0.3+

Vanilla JavaScript version of the `useStorage` function, returns a storage manager object.

```js
import { useStorage } from "ew-responsive-store/vanilla";

const storage = useStorage("count", 0);

// Get current value
console.log(storage.value); // 0

// Update value
storage.setValue(1);
console.log(storage.value); // 1

// Subscribe to changes
storage.subscribe((newValue) => {
  console.log("Value changed:", newValue);
});
```

---

## Legacy API (v0.0.1-beta.8 and earlier)

### useStorage (Vue) - v0.0.1-beta.8

The `useStorage` function is the core API of the `ew-responsive-store` library. It allows you to create reactive state that is synchronized with browser storage (localStorage or sessionStorage).

#### Type Definition

```ts
function useStorage<T>(
  key: string,
  initialValue: T,
  options: StoreOptions = {
    storage: StoreType.LOCAL,
    immediate: true,
    deep: true,
  }
): Ref<T>;
```

#### Parameters

| Parameter      | Type           | Description                                              |
| -------------- | -------------- | -------------------------------------------------------- |
| `key`          | `string`       | The key to use for storing the value in storage          |
| `initialValue` | `T`            | The initial value to use if no value is found in storage |
| `options`      | `StoreOptions` | Configuration options (optional)                         |

#### Options

The `options` parameter accepts the following properties:

| Property    | Type        | Default           | Description                                                  |
| ----------- | ----------- | ----------------- | ------------------------------------------------------------ |
| `storage`   | `StoreType` | `StoreType.LOCAL` | The storage type to use (`localStorage` or `sessionStorage`) |
| `deep`      | `boolean`   | `true`            | Whether to deeply watch the state for changes                |

Additionally, all Vue watch options are supported, as `StoreOptions` extends `WatchOptions` from Vue.

#### Returns

A reactive `Ref<T>` that is synchronized with the specified storage.

#### Example

```ts
import { useStorage } from "ew-responsive-store";
import { StoreType } from "ew-responsive-store/typings/core/enum";

// Basic usage with localStorage
const count = useStorage("count", 0);

// Using sessionStorage
const user = useStorage(
  "user",
  { name: "John" },
  { storage: StoreType.SESSION }
);

// Disabling deep watching
const list = useStorage("list", [1, 2, 3], { deep: false });

// Disabling immediate effect
const settings = useStorage(
  "settings",
  { theme: "dark" },
  { immediate: false }
);
```

## useReactStorage (React) - v0.0.1-beta.7

The `useReactStorage` function is designed specifically for React applications. It provides a React-native way to manage state that is synchronized with browser storage.

### Type Definition

```ts
function useReactStorage<T>(
  key: string,
  initialValue: T,
  options: ReactStoreOptions = {
    storage: StoreType.LOCAL,
  }
): readonly [T, (newValue: T) => void];
```

### Parameters

| Parameter      | Type               | Description                                              |
| -------------- | ------------------ | -------------------------------------------------------- |
| `key`          | `string`           | The key to use for storing the value in storage          |
| `initialValue` | `T`                | The initial value to use if no value is found in storage |
| `options`      | `ReactStoreOptions`| Configuration options (optional)                         |

### Options

The `options` parameter accepts the following properties:

| Property    | Type        | Default           | Description                                                  |
| ----------- | ----------- | ----------------- | ------------------------------------------------------------ |
| `storage`   | `StoreType` | `StoreType.LOCAL` | The storage type to use (`localStorage` or `sessionStorage`) |

### Returns

A tuple containing:
- `[0]`: The current value of type `T`
- `[1]`: A setter function to update the value

### Example

```tsx
import React from 'react';
import { useReactStorage, StoreType } from "ew-responsive-store";

function Counter() {
  // Basic usage with localStorage
  const [count, setCount] = useReactStorage("count", 0);
  
  // Using sessionStorage
  const [user, setUser] = useReactStorage(
    "user",
    { name: "John", age: 25 },
    { storage: StoreType.SESSION }
  );

  // Complex data types
  const [todos, setTodos] = useReactStorage("todos", [
    { id: 1, text: "Learn React", completed: false },
    { id: 2, text: "Learn TypeScript", completed: true }
  ]);

  const increment = () => setCount(count + 1);
  const addTodo = (text: string) => {
    setTodos([...todos, { 
      id: Date.now(), 
      text, 
      completed: false 
    }]);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
      
      <p>User: {user.name} ({user.age})</p>
      <button onClick={() => setUser({ ...user, age: user.age + 1 })}>
        Increase Age
      </button>
      
      <div>
        <h3>Todos:</h3>
        {todos.map(todo => (
          <div key={todo.id}>
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Cross-tab Synchronization

`useReactStorage` automatically synchronizes data across browser tabs using the `storage` event:

```tsx
import { useReactStorage } from "ew-responsive-store";

function App() {
  const [theme, setTheme] = useReactStorage("theme", "light");
  
  // This will automatically update in other tabs when changed
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className={`app ${theme}`}>
      <button onClick={toggleTheme}>
        Switch to {theme === "light" ? "dark" : "light"} theme
      </button>
    </div>
  );
}
```

### Error Handling

The hook will throw an error if storage is not available:

```tsx
import { useReactStorage } from "ew-responsive-store";

function SafeStorage() {
  try {
    const [data, setData] = useReactStorage("data", {});
    return <div>Storage is available</div>;
  } catch (error) {
    return <div>Storage is not available: {error.message}</div>;
  }
}
```

## parseStr

The `parseStr` function is a utility for parsing string values. It provides two parsing modes: `EVAL` and `JSON`.

### Type Definition

```ts
function parseStr<T>(
  str: string,
  type: parseStrType = parseStrType.JSON
): T | null;
```

### Parameters

| Parameter | Type           | Description                                  |
| --------- | -------------- | -------------------------------------------- |
| `str`     | `string`       | The string to parse                          |
| `type`    | `parseStrType` | The parsing method to use (`JSON` or `EVAL`) |

### Returns

The parsed value of type `T`, or `null` if parsing fails.

### Example

```ts
import { parseStr, ParseStrType } from "ew-responsive-store";

// Parse JSON
const data = parseStr<{ name: string }>('{ "name": "John" }');
// Result: { name: 'John' }

// Execute JavaScript code
const result = parseStr<number>("1 + 2", ParseStrType.EVAL);
// Result: 3
```

## Utility Functions

### isValidJSON

Checks if a string is valid JSON.

```ts
function isValidJSON(val: string): boolean;
```

### isStorageEnabled

Checks if a storage type is enabled in the current environment.

```ts
function isStorageEnabled(storage: Storage): boolean;
```

## Enums

### StoreType

Defines the available storage types.

```ts
enum StoreType {
  LOCAL = "localStorage",
  SESSION = "sessionStorage",
}
```

### parseStrType

Defines the available parsing methods for `parseStr`.

```ts
enum parseStrType {
  EVAL = "eval",
  JSON = "json",
}
```
