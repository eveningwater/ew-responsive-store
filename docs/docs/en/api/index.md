# API Reference

## useStorage

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
| `immediate` | `boolean`   | `true`            | Whether to trigger the effect immediately                    |
| `deep`      | `boolean`   | `true`            | Whether to deeply watch the state for changes                |

Additionally, all Vue watch options are supported, as `StoreOptions` extends `WatchOptions` from Vue.

### Returns

A reactive `Ref<T>` that is synchronized with the specified storage.

### Example

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
import { parseStr } from "ew-responsive-store";
import { parseStrType } from "ew-responsive-store/typings/core/enum";

// Parse JSON
const data = parseStr<{ name: string }>('{ "name": "John" }');
// Result: { name: 'John' }

// Execute JavaScript code
const result = parseStr<number>("1 + 2", parseStrType.EVAL);
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
