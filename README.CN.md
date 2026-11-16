[English](./README.md) | [简体中文](./README.CN.md)

# `ew-responsive-store` 使用指南：让会话存储数据响应式化

如果你的项目中需要使用会话存储（`localStorage` 或 `sessionStorage`）来保存数据，且希望这些数据在页面刷新后依然能保留，并且能够在数据变化时自动更新界面，那么我强烈推荐你使用 `ew-responsive-store` 这个库。它 gzip 后约 3.5 KB，简单易用，只需要调用一个方法就能将会话存储的数据变成响应式数据，可以广泛应用于各种框架的项目中，甚至是原生 JavaScript 项目，该库还具备完善的单元测试和类型推导。

## 📖 官方文档

- **中文文档**：<https://ew-responsive-store.eveningwater.com/>（阿里云 ESA 加速，国内访问更快）
- **English Docs**：<https://eveningwater.github.io/ew-responsive-store/en/>

文档涵盖安装、各框架快速上手、完整 API 参考、更新日志与在线示例。

## ✨ v0.0.4 新特性

- **多框架支持**：新增对 React、Vue、Preact、Solid、Svelte、Angular 和原生 JavaScript 的支持
- **框架专用入口**：每个框架都有独立的优化入口点（如 `ew-responsive-store/react`、`ew-responsive-store/vue`）
- **同标签页同步**：同一 `key` 的所有组件共享一个管理器实例，`setValue` 后会立即互相同步
- **兼容历史裸字符串**：新增 `parse: 'auto'`，`'dark'`、`'1'` 这类旧数据读取后仍然是字符串
- **SSR / 隐私模式安全**：无 `window` 或写入抛错（配额满、Safari 隐私模式）时自动降级到内存存储
- **函数式更新**：`setValue(prev => next)`，与 React `useState` 用法一致
- **数据版本迁移**：`version` + `migrate(oldValue, oldVersion)` 平滑升级数据结构
- **可删除 / 可清空**：新增 `remove()`、`clear()`，`clear()` 只清理本库管理的 `key`
- **自定义序列化**：`serializer` / `deserializer` 支持 `Date`、`Map`、`Set` 等类型
- **React 18+**：React 适配器改用 `useSyncExternalStore`，天然支持并发渲染与 SSR
- **零运行时依赖**：构建时已内联所需的工具函数，使用方无需额外安装

## ✨ 历史特性 (v0.0.1-beta.8)

- **React 支持**：新增 `useStorage` 钩子，专为 React 应用设计
- **跨标签页同步**：自动在不同浏览器标签页间同步数据
- **TypeScript 支持**：为 Vue 和 React 提供完整的类型定义

## 安装

首先，你需要安装 `ew-responsive-store` 包。可以通过以下命令安装：

```bash
npm install ew-responsive-store
# 或者使用 pnpm
pnpm add ew-responsive-store
# 或者使用 yarn
yarn add ew-responsive-store
```

### 框架依赖

自 v0.0.3 起，`ew-responsive-store` 支持多个框架。你只需要安装你正在使用的框架：

```bash
# React
npm install react

# Vue
npm install @vue/reactivity @vue/shared

# Preact
npm install preact

# Solid
npm install solid-js

# Svelte
npm install svelte

# Angular
npm install @angular/core
```

**注意**：框架依赖作为外部依赖处理，因此不会打包到你的应用中，保持库的体积最小。

## 使用

### 框架专用导入

自 v0.0.3 起，你应该从框架专用入口点导入：

```ts
// Vue
import { useStorage } from 'ew-responsive-store/vue';

// React
import { useStorage } from 'ew-responsive-store/react';

// Preact
import { useStorage } from 'ew-responsive-store/preact';

// Solid
import { useStorage } from 'ew-responsive-store/solid';

// Svelte
import { useStorage } from 'ew-responsive-store/svelte';

// Angular
import { useStorage } from 'ew-responsive-store/angular';

// 原生 JavaScript
import { useStorage } from 'ew-responsive-store/vanilla';
// 或者
import { useStorage } from 'ew-responsive-store/vue';
```

### 1. Vue.js 使用

`ew-responsive-store` 包的核心导出了 `useStorage` 方法用于 Vue.js 应用。其中，`useStorage` 用于将会话存储的数据变为响应式数据。

#### 基本值

你可以使用 `useStorage` 来实现基本值的响应式。例如，假设你有一个计数器，存储在 `localStorage` 中：

```ts
import { useStorage } from 'ew-responsive-store/vue';

// 初始化 count，默认值为 0
const count = useStorage('count', 0);

// 修改 count
count.value++;  // count 值变为 1
```

**Vue 模板代码**：

```vue
<template>
  <p>{{ count }}</p>
  <button @click="count++">点击我</button>
</template>

<script setup>
import { useStorage } from 'ew-responsive-store/vue';

const count = useStorage('count', 0);
</script>
```

此时，`count` 的值会保存在浏览器的会话存储中，并且它是响应式的，即页面刷新后 `count` 依然保留并且视图会自动更新。

#### 对象值

同样地，你可以将对象存储为响应式数据：

```ts
import { useStorage } from 'ew-responsive-store/vue';

// 初始化 userInfo 对象
const userInfo = useStorage('user', { name: 'eveningwater' });

// 修改 userInfo 对象
userInfo.value.name = '夕水';  // userInfo 的 name 属性变为 '夕水'
```

**Vue 模板代码**：

```vue
<template>
  <p>{{ userInfo.name }}</p>
  <button @click="userInfo.name = '小张'">点击我</button>
</template>

<script setup>
import { useStorage } from 'ew-responsive-store/vue';

const userInfo = useStorage('user', { name: 'eveningwater' });
</script>
```

当修改 `userInfo` 的 `name` 属性时，视图会自动更新，并且数据会保存在会话存储中。

#### 数组值

你还可以存储数组，并且它也是响应式的：

```ts
import { useStorage } from 'ew-responsive-store/vue';

// 初始化一个数组
const countList = useStorage('countList', [1, 2, 3]);

// 修改数组
countList.value.push(4);  // 数组变为 [1, 2, 3, 4]
```

**Vue 模板代码**：

```vue
<template>
  <p v-for="item in countList" :key="item">{{ item }}</p>
  <button @click="countList.pop()">点击我</button>
</template>

<script setup>
import { useStorage } from 'ew-responsive-store/vue';

const countList = useStorage('countList', [1, 2, 3]);
</script>
```

### 2. 配置与优化

#### 关闭深度监听

默认情况下，`useStorage` 会开启深度监听，适用于对象或数组类型。如果你只希望对基本类型值进行监听，并关闭深度监听，可以通过第三个参数配置：

```ts
import { useStorage } from 'ew-responsive-store/vue';

// 初始化 count，并关闭深度监听
const count = useStorage('count', 0, { deep: false });

// 修改 count
count.value++;  // count 值变为 1
```

#### 更改会话存储类型

默认情况下，`useStorage` 使用 `localStorage`，即永久会话存储。如果你想使用 `sessionStorage`，可以在第三个参数中指定 `storage` 配置项：

```ts
// (v0.0.3+)
import { useStorage, StoreType } from 'ew-responsive-store';

const count = useStorage('count', 0, { deep: false, storage: StoreType.SESSION });

// 修改 count
count.value++;  // count 值变为 1，并且数据保存在 sessionStorage 中
```

> 注意：`sessionStorage` 只在同一个标签页内有效，不会跨标签页同步，`storage` 事件也只在同标签页的 iframe 之间触发。需要跨标签页共享请使用 `localStorage`。

#### 控制初始值监听

`immediate` 默认为 `false`：组件创建时直接用存储中的值初始化，不会额外写一次存储。设置为 `true` 时，会在创建时立即把当前值写回存储（例如希望把默认值持久化）。

```ts
// (v0.0.3+)
import { useStorage, StoreType } from 'ew-responsive-store';

// 创建时把默认值写入存储
const count = useStorage('count', 0, { immediate: true, deep: false });

// 本次改动才会被监听到
count.value++;  // count 值变为 1
```

#### 兼容历史裸字符串数据

旧版本可能直接用原生 API 存过 `'dark'`、`'1'` 这类裸字符串。使用 `parse: 'auto'` 可以安全读取：

```ts
import { useStorage } from 'ew-responsive-store/react';

const [theme, setTheme] = useStorage('ew-theme', 'light', { parse: 'auto' });
// localStorage 中是 'dark' => theme === 'dark'（不会被当作非法 JSON 重置）
```

`auto` 的规则：读取时只有以 `{`、`[`、`"` 开头的字符串才尝试 JSON 解析，其余原样返回；写入时字符串原样存储，其他类型仍走 `JSON.stringify`。

#### 删除与清空

```ts
const [value, setValue, actions] = useStorage('profile', { name: 'John' });

actions.remove(); // 删除当前 key，值回落初始值
actions.clear();  // 清理本库管理的所有 key（不会误删业务方的其它数据）
```

#### 数据版本迁移

```ts
const [profile] = useStorage('profile', { name: '', role: 'user' }, {
  version: 2,
  migrate: (oldValue: any) => ({ ...oldValue, role: oldValue.role ?? 'user' }),
});
```

#### 自定义序列化 / 出错兜底

```ts
const [date, setDate] = useStorage('last-login', new Date(), {
  serializer: (value) => String(value.getTime()),
  deserializer: (raw) => new Date(Number(raw)),
  onError: (context) => console.warn(context.operation, context.error),
});
```

存储不可用或写入失败（配额满、隐私模式）时默认降级到内存存储；如需关闭可传 `memoryFallback: false`。

### 3. `parseStr` 方法

`parseStr` 方法用于解析字符串值，支持以下方式：

- `JSON`（默认）：类似 `JSON.parse`。
- `AUTO`：兼容裸字符串，`JSON.parse` 失败的容器字符串原样返回。
- `EVAL`：**已废弃**，内部使用 `new Function`，在严格 CSP 环境（如 Tauri / Electron 加固）会直接报错，请勿在新代码中使用。

#### 示例代码：

```ts
// (v0.0.3+)
import { parseStr, ParseStrType } from 'ew-responsive-store';

// 解析 JSON 字符串
const testJSONData = parseStr('{"name":"eveningwater"}');
console.log(testJSONData);  // { name: "eveningwater" }

// 兼容裸字符串
const theme = parseStr('dark', ParseStrType.AUTO); // 'dark'
```

### 2. React 使用 (v0.0.4)

对于 React 应用，从 React 入口点导入 `useStorage`。v0.0.4 起内部基于 `useSyncExternalStore` 实现，同标签页多组件、跨标签页与 SSR 都能自动同步。

#### 基本 React 示例

```tsx
import React from 'react';
import { useStorage, StoreType } from 'ew-responsive-store/react';

function Counter() {
  const [count, setCount] = useStorage('count', 0);
  const [theme, setTheme] = useStorage('theme', 'light');

  return (
    <div className={`app ${theme}`}>
      <h2>计数器: {count}</h2>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(count - 1)}>减少</button>
      <button onClick={() => setCount(0)}>重置</button>
      
      <h2>主题: {theme}</h2>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        切换主题
      </button>
    </div>
  );
}

export default Counter;
```

#### React 待办事项列表

```tsx
import React, { useState } from 'react';
import { useStorage } from 'ew-responsive-store';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

function TodoApp() {
  const [todos, setTodos] = useStorage<Todo[]>('todos', []);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text: inputValue,
        completed: false,
      };
      setTodos([...todos, newTodo]);
      setInputValue('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div>
      <h1>待办事项列表</h1>
      <div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="添加新的待办事项..."
        />
        <button onClick={addTodo}>添加</button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{
              textDecoration: todo.completed ? 'line-through' : 'none'
            }}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoApp;
```

#### 跨标签页同步

`useStorage` 自动在不同浏览器标签页间同步数据：

```tsx
import React from 'react';
import { useStorage } from 'ew-responsive-store';

function MultiTabCounter() {
  const [count, setCount] = useStorage('sharedCounter', 0);

  return (
    <div>
      <h2>共享计数器</h2>
      <p>这个计数器在所有浏览器标签页中同步！</p>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(count - 1)}>减少</button>
      <button onClick={() => setCount(0)}>重置</button>
    </div>
  );
}

export default MultiTabCounter;
```

### 3. 更多配置与使用 (useStorage)

由于 `ew-responsive-store` 底层是基于 Vue 的响应式系统来实现数据监听的，因此你可以通过提供的配置对象来定制更复杂的数据监听逻辑。具体可以参考 [Vue 响应式 API 文档](https://cn.vuejs.org/api/reactivity-core.html#watch) 来了解更多参数和用法。
