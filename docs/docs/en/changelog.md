# Changelog

All notable changes to this project are documented on this page. This project adheres to [Semantic Versioning](https://semver.org/).

## [0.0.5] - 2026-11-16

A patch release focused on subpath exports and lifecycle cleanup.

### Fixed

- **Missing `useStorage` in subpath entries**: the React, Vue, Preact, Solid, Svelte, and Angular entries only exported `useXxxStorage`, so the documented `import { useStorage } from 'ew-responsive-store/react'` returned `undefined`. Both names are now available, and the old aliases still work.
- **`getSnapshot` wrote to storage during render**: version migration used to write back inside `getSnapshot`, violating the purity requirement of `useSyncExternalStore`. Migration results are now persisted on non-render paths such as subscribe, external changes, and `setValue`.
- **`console.error` was still emitted when `onError` was configured**: now only the callback runs.
- **Added `"./package.json"` to `exports`** for tooling that reads the package manifest.

### Added

- **Manager recycling**: `retainStorageManager` / `releaseStorageManager`. The registry decides whether to recycle based on the reference count and subscriber count, and defers removal to a microtask so React StrictMode's mount → unmount → remount does not drop an instance that is still in use.
- **Automatic release in adapters**: all 7 framework adapters release the manager on unmount. In Angular, even when `StorageService` is `providedIn: 'root'`, the caller component's `DestroyRef` is used; in Svelte, a recycled instance is re-acquired automatically on the next subscription.

### Docs

- Corrected the bundle size claim from "under 1 KB" to about 4 KB gzipped.
- Documented the React 18+ requirement, `dedupe` for duplicate installs, dynamic key cleanup, and a complete `effectScope` example for Vue usage outside setup.
- Fixed Chinese navigation and in-page links.

### Known Limitations

- With `parse: 'auto'`, numbers and booleans are still written as JSON and may come back as strings; use the default `json` mode when strict types matter.

## [0.0.4] - 2026-11-16

A refactoring release focused on stability, predictability, and packaging.

### Breaking Changes

- **Vue `immediate` now defaults to `false`**: the value is initialized from storage without an extra write on creation. Pass `immediate: true` explicitly if you want the initial value persisted immediately.
- **`ParseStrType.EVAL` is deprecated**: it relies on `new Function`, which throws under strict CSP (e.g. hardened Tauri / Electron). Use `JSON` or the new `AUTO` instead.
- **UMD artifacts now use the `.cjs` extension**: `main` and every `exports.require` entry have been updated. Importing by package name or subpath is unaffected; only direct references to the old UMD filenames need updating.

### Added

- **Shared instance per key**: every component using the same `key` and storage area shares one manager within a tab, so `setValue` syncs immediately.
- **Functional updates**: `setValue(prev => next)`, matching the React `useState` updater pattern.
- **`parse` mode**: `'json'` (default, strict JSON) and `'auto'` (keeps legacy raw strings such as `'dark'` and `'1'` readable).
- **`remove()` / `clear()`**: `remove()` deletes the current key and falls back to the initial value; `clear()` removes only keys owned by this library.
- **Versioned migration**: `version` + `migrate(oldValue, oldVersion)` upgrades stored data on read and writes it back.
- **Custom serialization**: `serializer` / `deserializer` for `Date`, `Map`, `Set`, etc. Returning `null` / `undefined` from `serializer` skips the write.
- **Equality check**: `equals(a, b)` defaults to reference or JSON string comparison and skips writes and notifications when values are equal.
- **Storage fallback and error hook**: `memoryFallback` (default `true`) switches to in-memory storage when storage is unavailable or a write fails; `onError({ key, storage, operation, error })` makes logging and reporting easy.
- **Richer adapter return values**: React / Preact / Solid return `[value, setValue, { key, remove, clear, manager }]`; the Svelte store adds `remove` / `clear` / `destroy`; Angular and Vanilla expose `setValue` / `updateValue` / `reset` / `remove` / `clear`.
- **SSR support**: the React adapter now uses `useSyncExternalStore`, and `getInitialSnapshot()` returns the initial value during server rendering.
- **Core exports**: `StorageManager`, `getStorageManager`, `getRegisteredManagers`, `clearManagedStorage`, `clearStorageManagerRegistry`, and related types.

### Fixed

- Multiple components using the same key in one tab no longer drift out of sync.
- Storage quota errors and `setItem` failures in Safari private mode no longer break state updates.
- Vue deep-watch in-place mutations (same reference) are now persisted.
- Accessing `window` during SSR no longer throws.
- Removing a key now also cleans up its version marker.
- Cross-tab `storage` events now handle `clear()` and version marker changes correctly.

### Tooling and Packaging

- Added a `files` whitelist so only `dist` and the READMEs are published.
- `sideEffects: false`; `types` is listed first in `exports` for better tree-shaking and type resolution.
- `peerDependencies.react` is now `>=18.0.0`, the self-dependency was removed, and the package has zero runtime dependencies.
- Expanded the behavior-level test matrix to cover same-tab multiple instances, cross-tab sync, SSR, key switching, functional updates, raw strings, quota errors, `clear`, and version migration.

## [0.0.3] - 2025-09-15

### Added

- **Multi-framework support**: adapters for React, Preact, Solid, Svelte, Angular, and Vanilla JavaScript.
- **Framework-specific entry points**: `ew-responsive-store/react`, `/vue`, `/preact`, `/solid`, `/svelte`, `/angular`, and `/vanilla`.
- **Unified API**: every framework exposes the same `useStorage` function name.

### Changed

- Framework dependencies moved to `peerDependencies` and are externalized from the bundle to keep the package small.
- `useReactStorage` from the legacy entry is replaced by `useStorage` imported from the React entry.

## [0.0.2] - 2025-02-17

### Changed

- Dependency and build configuration updates; stabilizes the 0.0.1 line.

## [0.0.1] - 2024-12-24

### Added

- First stable release: `useStorage` built on Vue's reactivity system, making `localStorage` / `sessionStorage` data reactive.
- Supports primitives, objects, and arrays, with `storage`, `deep`, and `immediate` options.
- Ships `parseStr`, `isValidJSON`, `isStorageEnabled`, and complete TypeScript types.

> Earlier `0.0.1-beta.0` through `0.0.1-beta.9` were pre-release iterations that mainly introduced the React `useReactStorage` hook, cross-tab synchronization, and type definitions, and are not listed individually.
