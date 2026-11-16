# API 参考

## ⚠️ 重要版本说明

### v0.0.5（当前版本）

补丁版本，修复子入口缺失 `useStorage`、`getSnapshot` 渲染期写存储等问题，并新增管理器回收 API。详见[更新日志](/changelog)。

### v0.0.4 破坏性变更

1. **Vue `immediate` 默认值改为 `false`**：创建时直接使用存储中的值，不再额外写一次存储。需要把默认值立即持久化时显式传入 `immediate: true`。
2. **`ParseStrType.EVAL` 标记为废弃**：内部使用 `new Function`，在严格 CSP（如 Tauri、Electron 加固）环境会直接抛错，请改用 `JSON` 或 `AUTO`。
3. **UMD 产物扩展名改为 `.cjs`**：通过包名或子路径导入不受影响。

### 迁移指南

**旧版本（v0.0.1-beta.8 及之前）**：

```ts
import { useStorage, useReactStorage } from 'ew-responsive-store';
```

**v0.0.3+**：按框架从子路径导入。

```ts
import { useStorage } from 'ew-responsive-store';          // 原生 JavaScript
import { useStorage } from 'ew-responsive-store/vue';      // Vue
import { useStorage } from 'ew-responsive-store/react';    // React
import { useStorage } from 'ew-responsive-store/preact';   // Preact
import { useStorage } from 'ew-responsive-store/solid';    // Solid
import { useStorage } from 'ew-responsive-store/svelte';   // Svelte
import { useStorage } from 'ew-responsive-store/angular';  // Angular
import { useStorage } from 'ew-responsive-store/vanilla';  // 原生 JavaScript（显式子路径）
```

`useReactStorage` 等旧名字仍作为别名导出，但不再推荐使用。

---

## 通用配置项

所有框架共享 `BaseStoreOptions<T>`：

| 属性 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `storage` | `StoreType` | `StoreType.LOCAL` | 存储区域：`LOCAL` 或 `SESSION` |
| `parse` | `'json' \| 'auto'` | `'json'` | 反序列化模式 |
| `serializer` | `(value: T) => string \| null \| undefined` | - | 自定义序列化；返回 `null` / `undefined` 时拒绝写入 |
| `deserializer` | `(raw: string) => T` | - | 自定义反序列化 |
| `version` | `number` | - | 数据版本号，配合 `migrate` 使用 |
| `migrate` | `(oldValue: unknown, oldVersion: number) => T` | - | 读取旧版本数据时迁移并回写 |
| `equals` | `(a: T, b: T) => boolean` | 引用 / JSON 字符串比较 | 相等时跳过写入与通知 |
| `memoryFallback` | `boolean` | `true` | 存储不可用或写入失败时降级到内存 |
| `onError` | `(ctx: StorageErrorContext) => void` | - | 错误回调，`ctx` 含 `key`、`storage`、`operation`、`error` |

> 同一个 `key` + 存储区域共享一个管理器，`options` 与 `initialValue` 只在首次创建时生效。

### 解析模式

- `json`（默认）：严格 JSON。解析失败回落到初始值。
- `auto`：兼容历史裸字符串。读取时只有以 `{`、`[`、`"` 开头的字符串才尝试 JSON 解析，其余原样返回；写入时字符串原样存储，其他类型仍走 `JSON.stringify`。

`auto` 下数字与布尔会以 JSON 写入，读取时可能回落为字符串；需要严格类型请使用 `json`。

### 状态操作（StorageActions）

React、Preact、Solid 的第三个返回值，以及 Svelte、Vanilla 的返回对象，都提供：

| 成员 | 描述 |
| --- | --- |
| `key` | 当前存储键 |
| `remove()` | 删除当前 key，值回落初始值 |
| `clear()` | 只清理本库管理的 key，不会调用原生 `storage.clear()` |
| `manager` | 底层管理器实例 |

### 底层管理器 API

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

| API | 描述 |
| --- | --- |
| `getStorageManager(key, initialValue, options?)` | 获取或创建同 key 的共享管理器 |
| `retainStorageManager(key, storage?)` | 持有引用，与 `releaseStorageManager` 成对使用 |
| `releaseStorageManager(key, storage?)` | 释放引用；计数归零且无订阅者时在微任务中回收 |
| `getRegisteredManagers(storage?)` | 获取已注册的管理器 |
| `clearManagedStorage(storage?)` | 删除本库管理的所有 key |
| `clearStorageManagerRegistry()` | 销毁并移除全部管理器（测试 / 热更新用） |

框架适配器会在组件卸载时自动 `retain` / `release`；手动创建或非组件场景需自行调用。Vue 在 `setup` 外使用时，请放入 `effectScope()` 并通过 `scope.stop()` 释放。

---

## 框架适配器

### useStorage (Vue)

#### 类型定义

```ts
function useStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options?: VueStoreOptions<T>,
): Ref<T>;
```

#### 选项

在[通用配置项](#通用配置项)之外，Vue 额外支持：

| 属性 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `immediate` | `boolean` | `false` | 是否在创建时立即把当前值写回存储 |
| `deep` | `boolean` | `true` | 是否深度监听值变化 |

其余 Vue `watch` 选项同样支持。

#### 返回值

`Ref<T>`，与指定存储区域同步。

#### 示例

```ts
import { useStorage } from 'ew-responsive-store/vue';
import { StoreType } from 'ew-responsive-store';

const count = useStorage('count', 0);
count.value += 1;

const user = useStorage('user', { name: '张三' }, {
  storage: StoreType.SESSION,
});

// 默认不会在创建时写回；需要持久化初始值时显式开启
const settings = useStorage('settings', { theme: 'dark' }, {
  immediate: true,
});
```

### useStorage (React)

#### 类型定义

```ts
function useStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options?: ReactStoreOptions<T>,
): readonly [T, (value: StorageUpdater<T>) => void, StorageActions<T>];
```

基于 `useSyncExternalStore`，支持 React 18+ 的并发渲染与 SSR（服务端使用 `getInitialSnapshot()` 返回初始值）。

#### 返回值

- `[0]`：当前值 `T`
- `[1]`：更新函数，支持 `setValue(next)` 与 `setValue(prev => next)`
- `[2]`：`{ key, remove, clear, manager }`

#### 示例

```tsx
import { useStorage } from 'ew-responsive-store/react';

function Todos() {
  const [todos, setTodos, actions] = useStorage<string[]>('todos', []);

  const add = (title: string) =>
    setTodos((prev) => [...prev, title]);

  return (
    <div>
      <button onClick={() => add('新待办')}>添加</button>
      <button onClick={actions.remove}>清空当前 key</button>
    </div>
  );
}
```

### useStorage (Preact)

与 React 相同的三元组返回值：

```tsx
import { useStorage } from 'ew-responsive-store/preact';

const [count, setCount, actions] = useStorage('count', 0);
```

### useStorage (Solid)

返回 `[Accessor<T>, setter, StorageActions<T>]`：

```tsx
import { useStorage } from 'ew-responsive-store/solid';

function Counter() {
  const [count, setCount] = useStorage('count', 0);
  return <button onClick={() => setCount(count() + 1)}>{count()}</button>;
}
```

### useStorage (Svelte)

返回 Svelte store，并附加 `set` / `update` / `remove` / `clear` / `destroy`：

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

需在组件 / 服务的注入上下文中调用。返回值：

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

组件的 `DestroyRef` 触发时会自动释放管理器。

### useStorage (Vanilla JS)

根入口与 `/vanilla` 都指向原生适配器：

```ts
import { useStorage } from 'ew-responsive-store';

const storage = useStorage('count', 0);

storage.value;              // 当前值
storage.setValue(1);        // 直接赋值
storage.updateValue((n) => n + 1);
storage.remove();           // 删除 key，回落初始值
storage.clear();            // 清理本库管理的 key
const unsubscribe = storage.subscribe((value) => console.log(value));
storage.destroy();          // 退订并释放管理器
```

---

## 实用函数

### parseStr

```ts
function parseStr<T>(str: string, type?: ParseStrType): T | null;
```

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `str` | `string` | - | 要解析的字符串 |
| `type` | `ParseStrType` | `ParseStrType.JSON` | 解析模式：`JSON`、`AUTO` 或已废弃的 `EVAL` |

```ts
import { parseStr, ParseStrType } from 'ew-responsive-store';

parseStr<{ name: string }>('{"name":"张三"}');
parseStr('dark', ParseStrType.AUTO); // 'dark'
```

> `ParseStrType.EVAL` 已废弃，严格 CSP 环境下会抛错，不要在新代码中使用。

### isValidJSON

```ts
function isValidJSON(value: string): boolean;
```

### isStorageEnabled

```ts
function isStorageEnabled(storage?: Storage): boolean;
```

检测存储是否可用（Safari 隐私模式、配额受限等场景），结果会被缓存。

---

## 枚举

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
  /** @deprecated 使用 new Function，严格 CSP 下会抛错 */
  EVAL = 'eval',
}
```

---

## 历史版本 API

v0.0.1-beta.8 及之前的 `useStorage` 默认 `immediate: true`，React 使用独立的 `useReactStorage`。这些接口仅出于兼容保留，行为与当前版本不同：

- 旧 Vue `useStorage` 的 `immediate` 默认值已改为 `false`。
- `useReactStorage` 现在是 `useStorage` 的别名，返回值已扩展为三元组。
- 旧文档中的 `parseStr` 仅支持 `JSON` / `EVAL`，当前新增 `AUTO` 并废弃 `EVAL`。

新项目请直接使用上文的统一 API。
