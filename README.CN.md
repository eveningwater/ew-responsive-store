[English](./README.md) | [简体中文](./README.CN.md)

# `ew-responsive-store` 使用指南：让会话存储数据响应式化

如果你的项目中需要使用会话存储（`localStorage` 或 `sessionStorage`）来保存数据，且希望这些数据在页面刷新后依然能保留，并且能够在数据变化时自动更新界面，那么我强烈推荐你使用 `ew-responsive-store` 这个库。它的体积不到 1 KB，简单易用，只需要调用一个方法就能将会话存储的数据变成响应式数据，可以广泛应用于各种框架的项目中，甚至是原生 JavaScript 项目，该库还具备完善的单元测试和类型推导。

## ✨ v0.0.1-beta.8 新特性

- **React 支持**：新增 `useReactStorage` 钩子，专为 React 应用设计
- **跨标签页同步**：自动在不同浏览器标签页间同步数据
- **TypeScript 支持**：为 Vue 和 React 提供完整的类型定义

## 安装

首先，你需要安装 `ew-responsive-store` 包。可以通过以下命令安装：

```bash
npm install ew-responsive-store --save-dev
# 或者使用 pnpm
pnpm add ew-responsive-store
# 或者使用 yarn
yarn add ew-responsive-store
```

## 使用

### 1. Vue.js 使用

`ew-responsive-store` 包的核心导出了 `useStorage` 方法用于 Vue.js 应用。其中，`useStorage` 用于将会话存储的数据变为响应式数据。

#### 基本值

你可以使用 `useStorage` 来实现基本值的响应式。例如，假设你有一个计数器，存储在 `localStorage` 中：

```ts
import { useStorage } from 'ew-responsive-store';

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
import { useStorage } from 'ew-responsive-store';

const count = useStorage('count', 0);
</script>
```

此时，`count` 的值会保存在浏览器的会话存储中，并且它是响应式的，即页面刷新后 `count` 依然保留并且视图会自动更新。

#### 对象值

同样地，你可以将对象存储为响应式数据：

```ts
import { useStorage } from 'ew-responsive-store';

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
import { useStorage } from 'ew-responsive-store';

const userInfo = useStorage('user', { name: 'eveningwater' });
</script>
```

当修改 `userInfo` 的 `name` 属性时，视图会自动更新，并且数据会保存在会话存储中。

#### 数组值

你还可以存储数组，并且它也是响应式的：

```ts
import { useStorage } from 'ew-responsive-store';

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
import { useStorage } from 'ew-responsive-store';

const countList = useStorage('countList', [1, 2, 3]);
</script>
```

### 2. 配置与优化

#### 关闭深度监听

默认情况下，`useStorage` 会开启深度监听，适用于对象或数组类型。如果你只希望对基本类型值进行监听，并关闭深度监听，可以通过第三个参数配置：

```ts
import { useStorage } from 'ew-responsive-store';

// 初始化 count，并关闭深度监听
const count = useStorage('count', 0, { deep: false });

// 修改 count
count.value++;  // count 值变为 1
```

#### 更改会话存储类型

默认情况下，`useStorage` 使用 `localStorage`，即永久会话存储。如果你想使用 `sessionStorage`，可以在第三个参数中指定 `storage` 配置项：

```ts
import { useStorage } from 'ew-responsive-store';
import { StoreType } from 'ew-responsive-store/typings/core/enum';

const count = useStorage('count', 0, { deep: false, storage: StoreType.SESSION });

// 修改 count
count.value++;  // count 值变为 1，并且数据保存在 sessionStorage 中
```

#### 控制初始值监听

默认情况下，`useStorage` 会监听到初始值的变化。如果你不希望监听初始值的变动，可以通过传递 `immediate` 参数来控制：

```ts
import { useStorage } from 'ew-responsive-store';
import { StoreType } from 'ew-responsive-store/typings/core/enum';

// 初始化值变动时不立即被监听
const count = useStorage('count', 0, { deep: false, immediate: false });

// 本次改动才会被监听到
count.value++;  // count 值变为 1
```

### 3. `parseStr` 方法

`parseStr` 方法用于解析字符串值，它提供了两种解析方式，分别是：

- `EVAL`：类似于 `eval` 方法，可以执行字符串中的 JavaScript 代码。
- `JSON`：类似于 `JSON.parse`，适用于解析 JSON 格式的字符串。

#### 示例代码：

```ts
import { parseStr } from 'ew-responsive-store';
import { parseStrType } from 'ew-responsive-store/typings/core/enum';

// 解析 JSON 字符串
const testJSONData = parseStr('{"name":"eveningwater"}'); 
console.log(testJSONData);  // { name: "eveningwater" }

// 执行 JavaScript 字符串
const testEvalData = parseStr('console.log("hello, eveningwater")', parseStrType.EVAL); 
// 控制台会打印: hello, eveningwater
```

### 2. React 使用 (v0.0.1-beta.8+)

对于 React 应用，使用 `useReactStorage` 钩子，它提供了 React 原生的使用体验：

#### 基本 React 示例

```tsx
import React from 'react';
import { useReactStorage, StoreType } from 'ew-responsive-store';

function Counter() {
  const [count, setCount] = useReactStorage('count', 0);
  const [theme, setTheme] = useReactStorage('theme', 'light');

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
import { useReactStorage } from 'ew-responsive-store';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

function TodoApp() {
  const [todos, setTodos] = useReactStorage<Todo[]>('todos', []);
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

`useReactStorage` 自动在不同浏览器标签页间同步数据：

```tsx
import React from 'react';
import { useReactStorage } from 'ew-responsive-store';

function MultiTabCounter() {
  const [count, setCount] = useReactStorage('sharedCounter', 0);

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

### 3. 更多配置与使用

由于 `ew-responsive-store` 底层是基于 Vue 的响应式系统来实现数据监听的，因此你可以通过提供的配置对象来定制更复杂的数据监听逻辑。具体可以参考 [Vue 响应式 API 文档](https://cn.vuejs.org/api/reactivity-core.html#watch) 来了解更多参数和用法。
