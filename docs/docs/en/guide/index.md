# Getting Started

## Introduction

If your project requires using session storage (either `localStorage` or `sessionStorage`) to persist data, and you want the data to be retained after a page refresh while also automatically updating the view when the data changes, `ew-responsive-store` is the perfect solution.

It's about 4 KB gzipped and extremely easy to use. With just a single function call, you can make session storage data reactive, which can be applied to any framework-based project, even native JavaScript projects. The library also includes comprehensive unit tests and type inference.

## Installation

First, you need to install the `ew-responsive-store` package. You can install it using the following command:

```bash
npm install ew-responsive-store
# Or using pnpm
pnpm add ew-responsive-store
# Or using yarn
yarn add ew-responsive-store
```

### Framework Dependencies

Since v0.0.3, `ew-responsive-store` supports multiple frameworks. You only need to install the framework you're using:

```bash
# For React
npm install react

# For Vue
npm install @vue/reactivity @vue/shared

# For Preact
npm install preact

# For Solid
npm install solid-js

# For Svelte
npm install svelte

# For Angular
npm install @angular/core
```

**Note**: Framework dependencies are treated as external, so they won't be bundled with your application, keeping the library size minimal.

### Environment and Dependency Notes

- **React 18+**: The React adapter is built on `useSyncExternalStore`, and `peerDependencies` requires `react >= 18`. React 17 and earlier are not supported.
- **Avoid duplicate installs**: Same-tab sync relies on a module-level registry. If multiple copies of `ew-responsive-store` are installed (multiple versions, a monorepo without hoisting, or a package manager that did not dedupe), the registry is split and components sharing the same key will not sync. Run `npm dedupe` / `pnpm dedupe` / `yarn dedupe`, or configure `resolve.dedupe: ['ew-responsive-store']` in Vite.
- **Dynamic key cleanup**: Framework adapters release the manager automatically on unmount. For manually created instances or non-component scenarios, call `releaseStorageManager(key, storage)`; the instance is removed from the registry and destroyed in a microtask. When using Vue outside setup, wrap the call in `effectScope()` and call `scope.stop()` to release automatically. In Angular, call it within an injection context (component/service), otherwise release manually.

## Framework-Specific Imports

Since v0.0.3, you should import from framework-specific entry points:

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

// Vanilla JS
import { useStorage } from 'ew-responsive-store/vanilla';
// or
import { useStorage } from 'ew-responsive-store';
```

## Basic Usage

The core of the `ew-responsive-store` package exports two methods: `parseStr` and `useStorage`. The `useStorage` method is used to make session storage data reactive.

### Basic Values

You can use `useStorage` to create reactive basic values. For example, let's say you have a counter stored in `localStorage`:

```ts
import { useStorage } from "ew-responsive-store/vue";

// Initialize the count with a default value of 0
const count = useStorage("count", 0);

// Modify the count value
count.value++; // count value becomes 1
```

**Vue Template Code**:

```vue
<template>
  <p>{{ count }}</p>
  <button @click="count++">Click Me</button>
</template>

<script setup>
import { useStorage } from "ew-responsive-store/vue";

const count = useStorage("count", 0);
</script>
```

At this point, the value of `count` is stored in the browser's session storage, and it is reactive, meaning it will persist even after the page refreshes and the view will update automatically when the value changes.

### Object Values

You can also store reactive objects in a similar way:

```ts
import { useStorage } from "ew-responsive-store/vue";

// Initialize the userInfo object
const userInfo = useStorage("user", { name: "eveningwater" });

// Modify the userInfo object
userInfo.value.name = "夕水"; // userInfo's name property becomes '夕水'
```

When you change the `name` property of `userInfo`, the view will automatically update, and the data will be saved in session storage.

### Array Values

You can also store arrays, and they will be reactive as well:

```ts
import { useStorage } from "ew-responsive-store/vue";

// Initialize an array
const countList = useStorage("countList", [1, 2, 3]);

// Modify the array
countList.value.push(4); // The array becomes [1, 2, 3, 4]
```

### Using Outside setup (effectScope)

The Vue adapter releases the storage manager on unmount via `onScopeDispose`. When you call it outside `setup` or an `effectScope` (e.g. a module-level singleton, Pinia store initialization, or a utility function), there is no lifecycle to hook into, so create an explicit scope:

```ts
import { effectScope } from 'vue'
import { useStorage } from 'ew-responsive-store/vue'

const scope = effectScope()

// Called inside the scope, useStorage binds to it automatically
const settings = scope.run(() => useStorage('settings', { theme: 'light' }))!

settings.value.theme = 'dark'

// Stop the scope when it is no longer needed; the manager is released automatically
scope.stop()
```

Notes:

- `scope.stop()` also stops watchers and reactive effects inside the scope; afterwards `settings` is no longer synced with storage.
- If `effectScope` is not an option, release manually. The key and storage area must match the ones used at creation:

```ts
import { releaseStorageManager, StoreType } from 'ew-responsive-store'

releaseStorageManager('settings', StoreType.LOCAL)
```

- Calling `useStorage` directly inside a component's `setup` needs no extra handling; unmount releases it automatically.

For more advanced usage and configuration options, check out the [API Reference](/api/) section.
