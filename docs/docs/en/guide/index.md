# Getting Started

## Introduction

If your project requires using session storage (either `localStorage` or `sessionStorage`) to persist data, and you want the data to be retained after a page refresh while also automatically updating the view when the data changes, `ew-responsive-store` is the perfect solution.

It's under 1 KB in size and extremely easy to use. With just a single function call, you can make session storage data reactive, which can be applied to any framework-based project, even native JavaScript projects. The library also includes comprehensive unit tests and type inference.

## Installation

First, you need to install the `ew-responsive-store` package. You can install it using the following command:

```bash
npm install ew-responsive-store --save-dev
# Or using pnpm
pnpm add ew-responsive-store
# Or using yarn
yarn add ew-responsive-store
```

## Basic Usage

The core of the `ew-responsive-store` package exports two methods: `parseStr` and `useStorage`. The `useStorage` method is used to make session storage data reactive.

### Basic Values

You can use `useStorage` to create reactive basic values. For example, let's say you have a counter stored in `localStorage`:

```ts
import { useStorage } from "ew-responsive-store";

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
import { useStorage } from "ew-responsive-store";

const count = useStorage("count", 0);
</script>
```

At this point, the value of `count` is stored in the browser's session storage, and it is reactive, meaning it will persist even after the page refreshes and the view will update automatically when the value changes.

### Object Values

You can also store reactive objects in a similar way:

```ts
import { useStorage } from "ew-responsive-store";

// Initialize the userInfo object
const userInfo = useStorage("user", { name: "eveningwater" });

// Modify the userInfo object
userInfo.value.name = "夕水"; // userInfo's name property becomes '夕水'
```

When you change the `name` property of `userInfo`, the view will automatically update, and the data will be saved in session storage.

### Array Values

You can also store arrays, and they will be reactive as well:

```ts
import { useStorage } from "ew-responsive-store";

// Initialize an array
const countList = useStorage("countList", [1, 2, 3]);

// Modify the array
countList.value.push(4); // The array becomes [1, 2, 3, 4]
```

For more advanced usage and configuration options, check out the [API Reference](/api/) section.
