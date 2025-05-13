# API 参考

## useStorage

`useStorage` 函数是 `ew-responsive-store` 库的核心 API。它允许你创建与浏览器存储（localStorage 或 sessionStorage）同步的响应式状态。

### 类型定义

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

### 参数

| 参数           | 类型           | 描述                                 |
| -------------- | -------------- | ------------------------------------ |
| `key`          | `string`       | 用于在存储中存储值的键               |
| `initialValue` | `T`            | 如果在存储中找不到值，则使用的初始值 |
| `options`      | `StoreOptions` | 配置选项（可选）                     |

### 选项

`options` 参数接受以下属性：

| 属性        | 类型        | 默认值            | 描述                                                   |
| ----------- | ----------- | ----------------- | ------------------------------------------------------ |
| `storage`   | `StoreType` | `StoreType.LOCAL` | 要使用的存储类型（`localStorage` 或 `sessionStorage`） |
| `immediate` | `boolean`   | `true`            | 是否立即触发效果                                       |
| `deep`      | `boolean`   | `true`            | 是否深度监视状态变化                                   |

此外，所有 Vue 的 watch 选项都受支持，因为 `StoreOptions` 扩展了 Vue 的 `WatchOptions`。

### 返回值

一个与指定存储同步的响应式 `Ref<T>`。

### 示例

```ts
import { useStorage } from "ew-responsive-store";
import { StoreType } from "ew-responsive-store/typings/core/enum";

// 基本用法，使用 localStorage
const count = useStorage("count", 0);

// 使用 sessionStorage
const user = useStorage(
  "user",
  { name: "张三" },
  { storage: StoreType.SESSION }
);

// 禁用深度监视
const list = useStorage("list", [1, 2, 3], { deep: false });

// 禁用立即效果
const settings = useStorage(
  "settings",
  { theme: "dark" },
  { immediate: false }
);
```

## parseStr

`parseStr` 函数是一个用于解析字符串值的实用工具。它提供了两种解析模式：`EVAL` 和 `JSON`。

### 类型定义

```ts
function parseStr<T>(
  str: string,
  type: parseStrType = parseStrType.JSON
): T | null;
```

### 参数

| 参数   | 类型           | 描述                                 |
| ------ | -------------- | ------------------------------------ |
| `str`  | `string`       | 要解析的字符串                       |
| `type` | `parseStrType` | 要使用的解析方法（`JSON` 或 `EVAL`） |

### 返回值

类型为 `T` 的解析值，如果解析失败则为 `null`。

### 示例

```ts
import { parseStr } from "ew-responsive-store";
import { parseStrType } from "ew-responsive-store/typings/core/enum";

// 解析 JSON
const data = parseStr<{ name: string }>('{ "name": "张三" }');
// 结果: { name: '张三' }

// 执行 JavaScript 代码
const result = parseStr<number>("1 + 2", parseStrType.EVAL);
// 结果: 3
```

## 实用函数

### isValidJSON

检查字符串是否为有效的 JSON。

```ts
function isValidJSON(val: string): boolean;
```

### isStorageEnabled

检查当前环境中是否启用了存储类型。

```ts
function isStorageEnabled(storage: Storage): boolean;
```

## 枚举

### StoreType

定义可用的存储类型。

```ts
enum StoreType {
  LOCAL = "localStorage",
  SESSION = "sessionStorage",
}
```

### parseStrType

定义 `parseStr` 的可用解析方法。

```ts
enum parseStrType {
  EVAL = "eval",
  JSON = "json",
}
```
