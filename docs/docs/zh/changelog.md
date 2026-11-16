# 更新日志

本项目的所有重要变更都会记录在此页，版本号遵循[语义化版本](https://semver.org/lang/zh-CN/)。

## [0.0.5] - 2026-11-16

以修复子入口导出和生命周期回收为主的补丁版本。

### 修复

- **子入口缺少 `useStorage`**：React、Vue、Preact、Solid、Svelte、Angular 六个入口此前只导出 `useXxxStorage`，按文档 `import { useStorage } from 'ew-responsive-store/react'` 会拿到 `undefined`。现在两个名字同时可用，旧别名不受影响。
- **`getSnapshot` 在渲染阶段写存储**：版本迁移此前在 `getSnapshot` 内直接回写，违反 `useSyncExternalStore` 的纯函数要求。现在迁移结果延迟到订阅、外部变更、`setValue` 等非渲染路径落盘。
- **配置 `onError` 后仍输出 `console.error`**：现在只调用回调，不再重复打印。
- **`exports` 补充 `"./package.json"`**：兼容会读取包清单的工具链。

### 新增

- **管理器回收**：新增 `retainStorageManager` / `releaseStorageManager`。注册表按引用计数与订阅者数量判断是否回收，回收延迟到微任务执行，避免 React StrictMode 的「挂载 → 卸载 → 再挂载」误删仍在使用的实例。
- **适配器自动释放**：7 个框架适配器都会在卸载时释放管理器。Angular 即使 `StorageService` 是 `providedIn: 'root'`，也会使用调用方组件的 `DestroyRef`；Svelte 在实例被回收后重新订阅会自动重新获取。

### 文档

- 体积描述由「不到 1 KB」更正为实际约 4 KB（gzip）。
- 补充 React 18+ 要求、重复安装时需 `dedupe`、动态 key 回收，以及 Vue 在 setup 外使用 `effectScope` 的完整示例。
- 修正中文文档导航与页内链接。

### 已知限制

- `parse: 'auto'` 下数字与布尔仍以 JSON 写入，读取时可能回落为字符串；需要严格类型请使用默认的 `json` 模式。

## [0.0.4] - 2026-11-16

这是一次以稳定性、可预测性和工程化为主的重构版本。

### 破坏性变更

- **Vue `immediate` 默认值改为 `false`**：组件创建时直接使用存储中的值初始化，不再额外写一次存储。需要把默认值立即持久化时显式传入 `immediate: true`。
- **`ParseStrType.EVAL` 标记为废弃**：内部使用 `new Function`，在严格 CSP 环境（如 Tauri、Electron 加固）会直接抛错，请改用 `JSON` 或新增的 `AUTO`。
- **UMD 产物扩展名改为 `.cjs`**：`main` 与各个 `exports.require` 已同步更新。通过包名或子路径导入不受影响，仅直接按旧文件名引用 UMD 产物的场景需要调整。

### 新增

- **同 key 共享实例**：同一标签页内，相同 `key` + 存储区域的所有组件共享同一个管理器，`setValue` 后立即互相同步。
- **函数式更新**：`setValue(prev => next)`，与 React `useState` 的 updater 用法一致。
- **`parse` 解析模式**：`'json'`（默认，严格 JSON）与 `'auto'`（兼容 `'dark'`、`'1'` 这类历史裸字符串）。
- **`remove()` / `clear()`**：`remove()` 删除当前 key 并回落初始值；`clear()` 只清理本库管理的 key，不会误删业务方的其它数据。
- **数据版本迁移**：`version` + `migrate(oldValue, oldVersion)`，读取旧数据时自动升级并回写。
- **自定义序列化**：`serializer` / `deserializer`，支持 `Date`、`Map`、`Set` 等类型；`serializer` 返回 `null` / `undefined` 时拒绝写入。
- **相等判断**：`equals(a, b)`，默认按引用或 JSON 字符串比较，相等时跳过写入与通知。
- **存储降级与错误回调**：`memoryFallback`（默认 `true`）在存储不可用或写入失败时降级到内存；`onError({ key, storage, operation, error })` 便于接入日志与上报。
- **框架适配器返回值扩展**：React / Preact / Solid 返回 `[value, setValue, { key, remove, clear, manager }]`；Svelte store 增加 `remove` / `clear` / `destroy`；Angular 与 Vanilla 提供 `setValue` / `updateValue` / `reset` / `remove` / `clear`。
- **SSR 支持**：React 适配器改用 `useSyncExternalStore`，服务端渲染使用 `getInitialSnapshot()` 返回初始值。
- **底层能力导出**：`StorageManager`、`getStorageManager`、`getRegisteredManagers`、`clearManagedStorage`、`clearStorageManagerRegistry` 以及相关类型。

### 修复

- 修复同一标签页内多个组件使用相同 key 时状态不同步的问题。
- 修复存储配额写满、Safari 隐私模式下 `setItem` 抛错导致状态直接失效的问题。
- 修复 Vue 深度监听下就地修改对象（引用不变）时数据未落盘的问题。
- 修复 SSR 环境访问 `window` 导致的报错。
- 修复删除 key 时版本标记残留的问题。
- 修复跨标签页 `storage` 事件在 `clear()` 或版本标记变化时未正确同步的问题。

### 工程与打包

- `package.json` 增加 `files` 白名单，仅发布 `dist` 与 README。
- `sideEffects: false`，`exports` 中 `types` 前置，改善 tree-shaking 与类型解析。
- `peerDependencies.react` 调整为 `>=18.0.0`，移除自依赖，零运行时依赖。
- 扩充行为级测试矩阵，覆盖同标签页多实例、跨标签页、SSR、key 切换、函数式更新、裸字符串、配额异常、`clear`、版本迁移等场景。

## [0.0.3] - 2025-09-15

### 新增

- **多框架支持**：新增 React、Preact、Solid、Svelte、Angular 与原生 JavaScript 适配器。
- **框架专用入口**：`ew-responsive-store/react`、`/vue`、`/preact`、`/solid`、`/svelte`、`/angular`、`/vanilla`。
- **统一 API**：所有框架统一使用 `useStorage` 函数名。

### 变更

- 框架依赖改为 `peerDependencies` 并从产物中外部化，保持包体积最小。
- 旧入口的 `useReactStorage` 迁移为从 React 入口导入的 `useStorage`。

## [0.0.2] - 2025-02-17

### 变更

- 依赖与构建配置更新，稳定 0.0.1 系列的能力。

## [0.0.1] - 2024-12-24

### 新增

- 首个正式版本：基于 Vue 响应式系统的 `useStorage`，让 `localStorage` / `sessionStorage` 数据响应式化。
- 支持基本值、对象与数组，支持 `storage`、`deep`、`immediate` 配置。
- 提供 `parseStr`、`isValidJSON`、`isStorageEnabled` 实用函数与完整 TypeScript 类型。

> 更早的 `0.0.1-beta.0` ～ `0.0.1-beta.9` 为预发布迭代，主要引入了 React `useReactStorage`、跨标签页同步与类型定义，未单独列出。
