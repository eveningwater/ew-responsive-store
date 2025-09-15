[English](./README.md) | [简体中文](./README.CN.md)

# `ew-responsive-store` Making Session Storage Data Reactive

If your project requires using session storage (either `localStorage` or `sessionStorage`) to persist data, and you want the data to be retained after a page refresh while also automatically updating the view when the data changes, I highly recommend using the `ew-responsive-store` library. It's under 1 KB in size and extremely easy to use. With just a single function call, you can make session storage data reactive, which can be applied to any framework-based project, even native JavaScript projects. The library also includes comprehensive unit tests and type inference.

## ✨ New in v0.0.3

- **Multi-Framework Support**: Added support for React, Vue, Preact, Solid, Svelte, Angular, and Vanilla JS
- **Framework-Specific Entry Points**: Each framework has its own optimized entry point (e.g., `ew-responsive-store/react`, `ew-responsive-store/vue`)
- **Zero External Dependencies**: Framework dependencies are treated as external, reducing bundle size
- **Improved TypeScript Support**: Enhanced type definitions for all supported frameworks
- **Better Testing Coverage**: Comprehensive unit tests for all framework adapters

## ✨ Previous Features (v0.0.1-beta.8)

- **React Support**: Added `useReactStorage` hook for React applications
- **Cross-tab Synchronization**: Automatic data sync across browser tabs
- **TypeScript Support**: Full type definitions for both Vue and React

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

## Usage

### Framework-Specific Imports

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

### 1. Vue.js Usage

The core of the `ew-responsive-store` package exports `useStorage` for Vue.js applications. The `useStorage` method is used to make session storage data reactive.

#### Basic Values

You can use `useStorage` to create reactive basic values. For example, let's say you have a counter stored in `localStorage`:

```ts
import { useStorage } from 'ew-responsive-store/vue';

// Initialize the count with a default value of 0
const count = useStorage('count', 0);

// Modify the count value
count.value++;  // count value becomes 1
```

**Vue Template Code**:

```vue
<template>
  <p>{{ count }}</p>
  <button @click="count++">Click Me</button>
</template>

<script setup>
import { useStorage } from 'ew-responsive-store/vue';

const count = useStorage('count', 0);
</script>
```

At this point, the value of `count` is stored in the browser's session storage, and it is reactive, meaning it will persist even after the page refreshes and the view will update automatically when the value changes.

#### Object Values

You can also store reactive objects in a similar way:

```ts
import { useStorage } from 'ew-responsive-store/vue';

// Initialize the userInfo object
const userInfo = useStorage('user', { name: 'eveningwater' });

// Modify the userInfo object
userInfo.value.name = 'waterxi';  // userInfo's name property becomes '夕水'
```

**Vue Template Code**:

```vue
<template>
  <p>{{ userInfo.name }}</p>
  <button @click="userInfo.name = 'xiaozhang'">Click Me</button>
</template>

<script setup>
import { useStorage } from 'ew-responsive-store/vue';

const userInfo = useStorage('user', { name: 'eveningwater' });
</script>
```

When you change the `name` property of `userInfo`, the view will automatically update, and the data will be saved in session storage.

#### Array Values

You can also store arrays, and they will be reactive as well:

```ts
import { useStorage } from 'ew-responsive-store/vue';

// Initialize an array
const countList = useStorage('countList', [1, 2, 3]);

// Modify the array
countList.value.push(4);  // The array becomes [1, 2, 3, 4]
```

**Vue Template Code**:

```vue
<template>
  <p v-for="item in countList" :key="item">{{ item }}</p>
  <button @click="countList.pop()">Click Me</button>
</template>

<script setup>
import { useStorage } from 'ew-responsive-store/vue';

const countList = useStorage('countList', [1, 2, 3]);
</script>
```

### 2. Configuration and Optimization

#### Disable Deep Watch

By default, `useStorage` enables deep watching, which is useful for objects and arrays. If you're dealing with basic types and don't need deep watching, you can disable it by passing a third configuration parameter:

```ts
import { useStorage } from 'ew-responsive-store/vue';

// Initialize count with deep watching disabled
const count = useStorage('count', 0, { deep: false });

// Modify count
count.value++;  // count value becomes 1
```

#### Change Session Storage Type

By default, `useStorage` uses `localStorage` for persistent storage. If you want to use `sessionStorage` instead, you can specify it in the configuration:

```ts
import { useStorage } from 'ew-responsive-store/vue';
import { StoreType } from 'ew-responsive-store';

const count = useStorage('count', 0, { deep: false, storage: StoreType.SESSION });

// Modify count
count.value++;  // count value becomes 1, and the data is stored in sessionStorage
```

#### Control Initial Value Watching

By default, `useStorage` listens to changes in the initial value. If you don't want to watch the initial value changes, you can control it by passing the `immediate` parameter:

```ts
// (v0.0.3+)
import { useStorage, StoreType } from 'ew-responsive-store/vue';

// Don't listen to changes in the initial value
const count = useStorage('count', 0, { deep: false, immediate: false });

// Only the next change will be watched
count.value++;  // count value becomes 1
```

### 3. `parseStr` Method

The `parseStr` method is used to parse string values. It provides two parsing modes:

- `EVAL`: Similar to the `eval` method, which executes JavaScript code within the string.
- `JSON`: Similar to `JSON.parse`, useful for parsing JSON-formatted strings.

#### Example Code:

```ts
import { parseStr, ParseStrType } from 'ew-responsive-store';

// Parse a JSON string
const testJSONData = parseStr('{"name":"eveningwater"}'); 
console.log(testJSONData);  // { name: "eveningwater" }

// Execute JavaScript code from a string
const testEvalData = parseStr('console.log("hello, eveningwater")', ParseStrType.EVAL); 
// The console will log: hello, eveningwater
```

### 2. React Usage (v0.0.3+)

For React applications, use the `useStorage` hook from the React entry point:

#### Basic React Example

```tsx
import React from 'react';
import { useStorage, StoreType } from 'ew-responsive-store/react';

function Counter() {
  const [count, setCount] = useStorage('count', 0);
  const [theme, setTheme] = useStorage('theme', 'light');

  return (
    <div className={`app ${theme}`}>
      <h2>Counter: {count}</h2>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
      
      <h2>Theme: {theme}</h2>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
}

export default Counter;
```

#### Todo List with React

```tsx
import React, { useState } from 'react';
import { useStorage } from 'ew-responsive-store/react';

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
      <h1>Todo List</h1>
      <div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
        />
        <button onClick={addTodo}>Add</button>
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
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoApp;
```

#### Cross-tab Synchronization

`useReactStorage` automatically synchronizes data across browser tabs:

```tsx
import React from 'react';
import { useStorage } from 'ew-responsive-store/react';

function MultiTabCounter() {
  const [count, setCount] = useStorage('sharedCounter', 0);

  return (
    <div>
      <h2>Shared Counter</h2>
      <p>This counter syncs across all browser tabs!</p>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

export default MultiTabCounter;
```

### 3. Other Framework Support (v0.0.3+)

#### Preact Usage

```tsx
import { useStorage } from 'ew-responsive-store/preact';

function Counter() {
  const [count, setCount] = useStorage('count', 0);
  
  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

#### Solid Usage

```tsx
import { useStorage } from 'ew-responsive-store/solid';

function Counter() {
  const [count, setCount] = useStorage('count', 0);
  
  return (
    <div>
      <h2>Count: {count()}</h2>
      <button onClick={() => setCount(count() + 1)}>Increment</button>
    </div>
  );
}
```

#### Svelte Usage

```svelte
<script>
  import { useStorage } from 'ew-responsive-store/svelte';
  
  const store = useStorage('count', 0);
  let count = $store;
  
  function increment() {
    store.set(count + 1);
  }
</script>

<div>
  <h2>Count: {count}</h2>
  <button on:click={increment}>Increment</button>
</div>
```

#### Angular Usage

```ts
import { Component } from '@angular/core';
import { useStorage } from 'ew-responsive-store/angular';

@Component({
  selector: 'app-counter',
  template: `
    <div>
      <h2>Count: {{ count() }}</h2>
      <button (click)="increment()">Increment</button>
    </div>
  `
})
export class CounterComponent {
  private storage = useStorage('count', 0);
  count = this.storage.value;
  
  increment() {
    this.storage.setValue(this.count() + 1);
  }
}
```

#### Vanilla JavaScript Usage

```js
import { useStorage } from 'ew-responsive-store/vanilla';

const storage = useStorage('count', 0);

// Get current value
console.log(storage.value); // 0

// Update value
storage.setValue(1);
console.log(storage.value); // 1

// Subscribe to changes
storage.subscribe((newValue) => {
  console.log('Value changed:', newValue);
});

// Update with function
storage.updateValue(current => current + 1);
console.log(storage.value); // 2
```


### 4. More Configuration and Usage

Since `ew-responsive-store` supports multiple frameworks, each framework has its own optimized implementation:

- **Vue**: Built on Vue's reactive system with `ref`, `watch`, and `onUnmounted`
- **React**: Uses `useState` and `useEffect` hooks for state management
- **Preact**: Similar to React but optimized for Preact's smaller bundle size
- **Solid**: Uses Solid's `createSignal` and `createEffect` for fine-grained reactivity
- **Svelte**: Integrates with Svelte's store system using `writable`
- **Angular**: Uses Angular's `signal` and `effect` for reactive state management
- **Vanilla**: Pure JavaScript implementation with manual subscription management

For advanced configuration, refer to the specific framework's documentation and the library's TypeScript definitions.
