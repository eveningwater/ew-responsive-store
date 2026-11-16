# 开始使用

## 介绍

如果你的项目中需要使用本地存储（`localStorage` 或 `sessionStorage`）来保存数据，且希望这些数据在页面刷新后依然能保留，并且能够在数据变化时自动更新界面，那么 `ew-responsive-store` 是完美的解决方案。

它的体积约 4 KB（gzip），简单易用，只需要调用一个方法就能将存储数据变成响应式数据，可以广泛应用于各种框架的项目中，甚至是原生 JavaScript 项目，该库还具备完善的单元测试和类型推导。

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
npm install @vue/reactivity

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

### 环境与依赖注意事项

- **React 18+**：React 适配器基于 `useSyncExternalStore`，`peerDependencies` 要求 `react >= 18`，React 17 及以下版本无法使用。
- **避免重复安装**：同一标签页的同步依赖模块级注册表。如果项目中存在多份 `ew-responsive-store`（多版本共存、monorepo 未提升、包管理器未去重），注册表会被拆成多份，相同 key 的组件将无法同步。可执行 `npm dedupe` / `pnpm dedupe` / `yarn dedupe`，或在 Vite 中配置 `resolve.dedupe: ['ew-responsive-store']`。
- **动态 key 的回收**：框架适配器会在组件卸载时自动释放管理器；手动创建的实例或非组件场景，可调用 `releaseStorageManager(key, storage)` 释放，实例会在微任务中从注册表移除并销毁。Vue 在 setup 外使用时，可放入 `effectScope()` 中，调用 `scope.stop()` 即可自动释放；Angular 请在组件/服务的注入上下文中调用，否则需手动释放。

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

`ew-responsive-store` 根入口导出原生 JavaScript 适配器的 `useStorage`，以及 `StoreType`、`ParseStrType`、`StorageManager` 相关 API 和 `parseStr`、`isValidJSON`、`isStorageEnabled` 等工具函数。根入口的 `useStorage` 用于把 `localStorage` / `sessionStorage` 中的数据变为响应式对象；Vue、React 等框架请使用各自的子路径入口。

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

此时，`count` 的值会保存在浏览器的本地存储中，并且它是响应式的，即页面刷新后 `count` 依然保留并且视图会自动更新。

### 对象值

同样地，你可以将对象存储为响应式数据：

```ts
import { useStorage } from "ew-responsive-store/vue";

// 初始化 userInfo 对象
const userInfo = useStorage("user", { name: "eveningwater" });

// 修改 userInfo 对象
userInfo.value.name = "夕水"; // userInfo 的 name 属性变为 '夕水'
```

当修改 `userInfo` 的 `name` 属性时，视图会自动更新，并且数据会保存在本地存储中。

### 数组值

你还可以存储数组，并且它也是响应式的：

```ts
import { useStorage } from "ew-responsive-store/vue";

// 初始化一个数组
const countList = useStorage("countList", [1, 2, 3]);

// 修改数组
countList.value.push(4); // 数组变为 [1, 2, 3, 4]
```

### 在 setup 之外使用（effectScope）

Vue 适配器通过 `onScopeDispose` 在组件卸载时自动释放存储管理器。如果在 `setup` 或 `effectScope` 之外调用（例如模块级单例、Pinia store 初始化、工具函数中），就没有可挂载的销毁时机，此时请显式创建一个作用域：

```ts
import { effectScope } from 'vue'
import { useStorage } from 'ew-responsive-store/vue'

const scope = effectScope()

// 在作用域内调用，useStorage 会自动绑定到该 scope
const settings = scope.run(() => useStorage('settings', { theme: 'light' }))!

settings.value.theme = 'dark'

// 不再需要时停止作用域，管理器会自动释放
scope.stop()
```

说明：

- `scope.stop()` 会同时停止该作用域内的监听与响应式副作用，之后 `settings` 不再与存储同步。
- 如果无法使用 `effectScope`，也可以手动释放，key 与存储区域需要和创建时一致：

```ts
import { releaseStorageManager, StoreType } from 'ew-responsive-store'

releaseStorageManager('settings', StoreType.LOCAL)
```

- 在组件 `setup` 中直接调用 `useStorage` 时无需任何额外处理，组件卸载会自动释放。

有关更高级的用法和配置选项，请查看 [API 参考](/api/) 部分。
