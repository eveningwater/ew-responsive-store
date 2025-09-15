# 开始使用

## 介绍

如果你的项目中需要使用会话存储（`localStorage` 或 `sessionStorage`）来保存数据，且希望这些数据在页面刷新后依然能保留，并且能够在数据变化时自动更新界面，那么 `ew-responsive-store` 是完美的解决方案。

它的体积不到 1 KB，简单易用，只需要调用一个方法就能将会话存储的数据变成响应式数据，可以广泛应用于各种框架的项目中，甚至是原生 JavaScript 项目，该库还具备完善的单元测试和类型推导。

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

## 框架专用导入

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
import { useStorage } from 'ew-responsive-store';
```

## 基本使用

`ew-responsive-store` 包的核心导出了两个方法：`parseStr` 和 `useStorage`。其中，`useStorage` 用于将会话存储的数据变为响应式数据。

### 基本值

你可以使用 `useStorage` 来实现基本值的响应式。例如，假设你有一个计数器，存储在 `localStorage` 中：

```ts
import { useStorage } from "ew-responsive-store/vue";

// 初始化 count，默认值为 0
const count = useStorage("count", 0);

// 修改 count
count.value++; // count 值变为 1
```

**Vue 模板代码**：

```vue
<template>
  <p>{{ count }}</p>
  <button @click="count++">点击我</button>
</template>

<script setup>
import { useStorage } from "ew-responsive-store/vue";

const count = useStorage("count", 0);
</script>
```

此时，`count` 的值会保存在浏览器的会话存储中，并且它是响应式的，即页面刷新后 `count` 依然保留并且视图会自动更新。

### 对象值

同样地，你可以将对象存储为响应式数据：

```ts
import { useStorage } from "ew-responsive-store/vue";

// 初始化 userInfo 对象
const userInfo = useStorage("user", { name: "eveningwater" });

// 修改 userInfo 对象
userInfo.value.name = "夕水"; // userInfo 的 name 属性变为 '夕水'
```

当修改 `userInfo` 的 `name` 属性时，视图会自动更新，并且数据会保存在会话存储中。

### 数组值

你还可以存储数组，并且它也是响应式的：

```ts
import { useStorage } from "ew-responsive-store/vue";

// 初始化一个数组
const countList = useStorage("countList", [1, 2, 3]);

// 修改数组
countList.value.push(4); // 数组变为 [1, 2, 3, 4]
```

有关更高级的用法和配置选项，请查看 [API 参考](/zh/api/) 部分。
