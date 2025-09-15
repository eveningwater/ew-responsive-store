# API 参考

## ⚠️ 重要版本说明

### v0.0.3 破坏性变更

**v0.0.3** 版本引入了重大变更，包括：

1. **框架专用入口点**：现在需要从特定的框架入口点导入
2. **统一的API**：所有框架都使用 `useStorage` 函数名
3. **零外部依赖**：框架依赖作为外部依赖处理

### 迁移指南

**旧版本 (v0.0.1-beta.8 及之前)**：
```ts
import { useStorage } from 'ew-responsive-store';
import { useReactStorage } from 'ew-responsive-store';
```

**新版本 (v0.0.3+)**：
```ts
// Vue
import { useStorage } from 'ew-responsive-store/vue';

// React
import { useStorage } from 'ew-responsive-store/react';

// 其他框架...
```

---

## v0.0.3+ 多框架支持

### useStorage (Vue) - v0.0.3+

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
| `deep`      | `boolean`   | `true`            | 是否深度监视状态变化                                   |

此外，所有 Vue 的 watch 选项都受支持，因为 `StoreOptions` 扩展了 Vue 的 `WatchOptions`。

### 返回值

一个与指定存储同步的响应式 `Ref<T>`。

### 示例

```ts
import { useStorage } from "ew-responsive-store/vue";
import { StoreType } from "ew-responsive-store";

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

### useStorage (React) - v0.0.3+

React 版本的 `useStorage` 函数，提供 React 原生的使用体验。

#### 类型定义

```ts
function useStorage<T>(
  key: string,
  initialValue: T,
  options: ReactStoreOptions = {
    storage: StoreType.LOCAL,
  }
): readonly [T, (newValue: T) => void];
```

#### 参数

| 参数           | 类型                | 描述                                 |
| -------------- | ------------------- | ------------------------------------ |
| `key`          | `string`            | 用于在存储中存储值的键               |
| `initialValue` | `T`                 | 如果在存储中找不到值，则使用的初始值 |
| `options`      | `ReactStoreOptions` | 配置选项（可选）                     |

#### 选项

`options` 参数接受以下属性：

| 属性        | 类型        | 默认值            | 描述                                                   |
| ----------- | ----------- | ----------------- | ------------------------------------------------------ |
| `storage`   | `StoreType` | `StoreType.LOCAL` | 要使用的存储类型（`localStorage` 或 `sessionStorage`） |

#### 返回值

一个包含以下内容的元组：
- `[0]`: 当前值，类型为 `T`
- `[1]`: 用于更新值的设置函数

#### 示例

```tsx
import React from 'react';
import { useStorage, StoreType } from "ew-responsive-store/react";

function Counter() {
  // 基本用法，使用 localStorage
  const [count, setCount] = useStorage("count", 0);
  
  // 使用 sessionStorage
  const [user, setUser] = useStorage(
    "user",
    { name: "张三", age: 25 },
    { storage: StoreType.SESSION }
  );

  const increment = () => setCount(count + 1);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={increment}>增加</button>
      
      <p>用户: {user.name} ({user.age}岁)</p>
      <button onClick={() => setUser({ ...user, age: user.age + 1 })}>
        增加年龄
      </button>
    </div>
  );
}
```

### useStorage (Preact) - v0.0.3+

Preact 版本的 `useStorage` 函数，与 React API 相同但针对 Preact 优化。

```tsx
import { useStorage } from "ew-responsive-store/preact";

function Counter() {
  const [count, setCount] = useStorage("count", 0);
  return <div>Count: {count}</div>;
}
```

### useStorage (Solid) - v0.0.3+

Solid 版本的 `useStorage` 函数，返回 Solid 的 signal。

```tsx
import { useStorage } from "ew-responsive-store/solid";

function Counter() {
  const [count, setCount] = useStorage("count", 0);
  return <div>Count: {count()}</div>;
}
```

### useStorage (Svelte) - v0.0.3+

Svelte 版本的 `useStorage` 函数，返回 Svelte store。

```svelte
<script>
  import { useStorage } from "ew-responsive-store/svelte";
  
  const store = useStorage("count", 0);
  let count = $store;
</script>

<div>Count: {count}</div>
```

### useStorage (Angular) - v0.0.3+

Angular 版本的 `useStorage` 函数，返回 Angular signal。

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

原生 JavaScript 版本的 `useStorage` 函数，返回存储管理器对象。

```js
import { useStorage } from "ew-responsive-store/vanilla";

const storage = useStorage("count", 0);

// 获取当前值
console.log(storage.value); // 0

// 更新值
storage.setValue(1);
console.log(storage.value); // 1

// 订阅变化
storage.subscribe((newValue) => {
  console.log("Value changed:", newValue);
});
```

---

## 历史版本 API (v0.0.1-beta.8 及之前)

### useStorage (Vue) - v0.0.1-beta.8

`useStorage` 函数是 `ew-responsive-store` 库的核心 API。它允许你创建与浏览器存储（localStorage 或 sessionStorage）同步的响应式状态。

#### 类型定义

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

#### 参数

| 参数           | 类型           | 描述                                 |
| -------------- | -------------- | ------------------------------------ |
| `key`          | `string`       | 用于在存储中存储值的键               |
| `initialValue` | `T`            | 如果在存储中找不到值，则使用的初始值 |
| `options`      | `StoreOptions` | 配置选项（可选）                     |

#### 选项

`options` 参数接受以下属性：

| 属性        | 类型        | 默认值            | 描述                                                   |
| ----------- | ----------- | ----------------- | ------------------------------------------------------ |
| `storage`   | `StoreType` | `StoreType.LOCAL` | 要使用的存储类型（`localStorage` 或 `sessionStorage`） |
| `deep`      | `boolean`   | `true`            | 是否深度监视状态变化                                   |

此外，所有 Vue 的 watch 选项都受支持，因为 `StoreOptions` 扩展了 Vue 的 `WatchOptions`。

#### 返回值

一个与指定存储同步的响应式 `Ref<T>`。

#### 示例

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

## useReactStorage (React) - v0.0.1-beta.7

`useReactStorage` 函数专为 React 应用程序设计。它提供了一种 React 原生的方式来管理与浏览器存储同步的状态。

### 类型定义

```ts
function useReactStorage<T>(
  key: string,
  initialValue: T,
  options: ReactStoreOptions = {
    storage: StoreType.LOCAL,
  }
): readonly [T, (newValue: T) => void];
```

### 参数

| 参数           | 类型                | 描述                                 |
| -------------- | ------------------- | ------------------------------------ |
| `key`          | `string`            | 用于在存储中存储值的键               |
| `initialValue` | `T`                 | 如果在存储中找不到值，则使用的初始值 |
| `options`      | `ReactStoreOptions` | 配置选项（可选）                     |

### 选项

`options` 参数接受以下属性：

| 属性        | 类型        | 默认值            | 描述                                                   |
| ----------- | ----------- | ----------------- | ------------------------------------------------------ |
| `storage`   | `StoreType` | `StoreType.LOCAL` | 要使用的存储类型（`localStorage` 或 `sessionStorage`） |

### 返回值

一个包含以下内容的元组：
- `[0]`: 当前值，类型为 `T`
- `[1]`: 用于更新值的设置函数

### 示例

```tsx
import React from 'react';
import { useReactStorage, StoreType } from "ew-responsive-store";

function Counter() {
  // 基本用法，使用 localStorage
  const [count, setCount] = useReactStorage("count", 0);
  
  // 使用 sessionStorage
  const [user, setUser] = useReactStorage(
    "user",
    { name: "张三", age: 25 },
    { storage: StoreType.SESSION }
  );

  // 复杂数据类型
  const [todos, setTodos] = useReactStorage("todos", [
    { id: 1, text: "学习 React", completed: false },
    { id: 2, text: "学习 TypeScript", completed: true }
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
      <p>计数: {count}</p>
      <button onClick={increment}>增加</button>
      
      <p>用户: {user.name} ({user.age}岁)</p>
      <button onClick={() => setUser({ ...user, age: user.age + 1 })}>
        增加年龄
      </button>
      
      <div>
        <h3>待办事项:</h3>
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

### 跨标签页同步

`useReactStorage` 使用 `storage` 事件自动同步不同浏览器标签页之间的数据：

```tsx
import { useReactStorage } from "ew-responsive-store";

function App() {
  const [theme, setTheme] = useReactStorage("theme", "light");
  
  // 当改变时，这会在其他标签页中自动更新
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className={`app ${theme}`}>
      <button onClick={toggleTheme}>
        切换到 {theme === "light" ? "深色" : "浅色"} 主题
      </button>
    </div>
  );
}
```

### 错误处理

如果存储不可用，该钩子会抛出错误：

```tsx
import { useReactStorage } from "ew-responsive-store";

function SafeStorage() {
  try {
    const [data, setData] = useReactStorage("data", {});
    return <div>存储可用</div>;
  } catch (error) {
    return <div>存储不可用: {error.message}</div>;
  }
}
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
import { parseStr, ParseStrType } from "ew-responsive-store";

// 解析 JSON
const data = parseStr<{ name: string }>('{ "name": "张三" }');
// 结果: { name: '张三' }

// 执行 JavaScript 代码
const result = parseStr<number>("1 + 2", ParseStrType.EVAL);
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
