# 示例

本节提供了在不同场景中使用 `ew-responsive-store` 的实用示例。

## 基础计数器示例

一个简单的计数器，其值在 localStorage 中持久化：

```ts
import { useStorage } from "ew-responsive-store";

// 初始化一个计数器，默认值为 0
const counter = useStorage("counter", 0);

// 增加计数器
function increment() {
  counter.value++;
}

// 减少计数器
function decrement() {
  counter.value--;
}

// 重置计数器
function reset() {
  counter.value = 0;
}
```

## 用户偏好设置

管理在会话之间持久化的用户偏好设置：

```ts
import { useStorage } from "ew-responsive-store";
import { StoreType } from "ew-responsive-store/typings/core/enum";

// 初始化用户偏好设置，设置默认值
const preferences = useStorage("userPreferences", {
  theme: "light",
  fontSize: "medium",
  notifications: true,
});

// 在亮色和暗色主题之间切换
function toggleTheme() {
  preferences.value.theme =
    preferences.value.theme === "light" ? "dark" : "light";
}

// 更改字体大小
function setFontSize(size) {
  preferences.value.fontSize = size; // 'small', 'medium', 或 'large'
}

// 切换通知
function toggleNotifications() {
  preferences.value.notifications = !preferences.value.notifications;
}
```

## 购物车

实现在页面刷新之间持久化商品的购物车：

```ts
import { useStorage } from "ew-responsive-store";

// 初始化一个空购物车
const cart = useStorage("shoppingCart", []);

// 向购物车添加商品
function addToCart(product) {
  const existingItem = cart.value.find((item) => item.id === product.id);

  if (existingItem) {
    // 如果商品已存在，增加其数量
    existingItem.quantity += 1;
  } else {
    // 否则，添加新商品，数量为 1
    cart.value.push({
      ...product,
      quantity: 1,
    });
  }
}

// 从购物车移除商品
function removeFromCart(productId) {
  const index = cart.value.findIndex((item) => item.id === productId);

  if (index !== -1) {
    cart.value.splice(index, 1);
  }
}

// 更新商品数量
function updateQuantity(productId, quantity) {
  const item = cart.value.find((item) => item.id === productId);

  if (item) {
    item.quantity = quantity;
  }
}

// 清空整个购物车
function clearCart() {
  cart.value = [];
}

// 计算购物车中商品的总价
function getCartTotal() {
  return cart.value.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}
```

## 表单状态持久化

保存表单状态，防止在导航离开时数据丢失：

```ts
import { useStorage } from "ew-responsive-store";
import { StoreType } from "ew-responsive-store/typings/core/enum";

// 使用 sessionStorage 存储临时表单数据
const formData = useStorage(
  "contactForm",
  {
    name: "",
    email: "",
    message: "",
  },
  { storage: StoreType.SESSION }
);

// 更新表单字段
function updateField(field, value) {
  formData.value[field] = value;
}

// 提交表单
function submitForm() {
  // 将数据发送到 API
  sendToApi(formData.value);

  // 成功提交后清空表单
  formData.value = {
    name: "",
    email: "",
    message: "",
  };
}

// 检查表单是否有数据
function hasFormData() {
  return (
    formData.value.name !== "" ||
    formData.value.email !== "" ||
    formData.value.message !== ""
  );
}
```

## 与 Vue.js 一起使用

与 Vue.js 组件集成：

```vue
<template>
  <div>
    <h2>主题切换器</h2>
    <div class="theme-controls">
      <button @click="toggleTheme">切换主题</button>
      <p>当前主题: {{ theme }}</p>
    </div>

    <h2>计数器</h2>
    <div class="counter-controls">
      <button @click="decrement">-</button>
      <span>{{ count }}</span>
      <button @click="increment">+</button>
      <button @click="reset">重置</button>
    </div>
  </div>
</template>

<script setup>
import { useStorage } from "ew-responsive-store";
import { computed } from "vue";

// 主题偏好
const preferences = useStorage("preferences", { theme: "light" });
const theme = computed(() => preferences.value.theme);

function toggleTheme() {
  preferences.value.theme =
    preferences.value.theme === "light" ? "dark" : "light";
}

// 计数器
const count = useStorage("count", 0);

function increment() {
  count.value++;
}

function decrement() {
  count.value--;
}

function reset() {
  count.value = 0;
}
</script>
```

## 与 React 一起使用

与 React 组件集成：

```jsx
import React, { useEffect, useState } from "react";
import { useStorage } from "ew-responsive-store";

function ThemeSwitcher() {
  // 初始化存储
  const preferences = useStorage("preferences", { theme: "light" });

  // 本地状态触发重新渲染
  const [theme, setTheme] = useState(preferences.value.theme);

  // 当存储变化时更新本地状态
  useEffect(() => {
    const updateTheme = () => {
      setTheme(preferences.value.theme);
    };

    // 初始更新
    updateTheme();

    // 订阅变化
    const unsubscribe = preferences.subscribe(updateTheme);

    // 清理
    return () => {
      unsubscribe();
    };
  }, []);

  const toggleTheme = () => {
    preferences.value.theme =
      preferences.value.theme === "light" ? "dark" : "light";
  };

  return (
    <div>
      <h2>主题切换器</h2>
      <button onClick={toggleTheme}>切换主题</button>
      <p>当前主题: {theme}</p>
    </div>
  );
}

export default ThemeSwitcher;
```

## 高级用法：自定义序列化

为复杂数据结构使用自定义序列化：

```ts
import { useStorage, parseStr } from "ew-responsive-store";
import { parseStrType } from "ew-responsive-store/typings/core/enum";

// 为 Date 对象自定义序列化
const lastVisit = useStorage("lastVisit", new Date(), {
  serializer: (date) => date.toISOString(),
  deserializer: (dateStr) => new Date(dateStr),
});

// 将最后访问时间更新为现在
function updateLastVisit() {
  lastVisit.value = new Date();
}

// 获取最后访问时间的格式化字符串
function getFormattedLastVisit() {
  return lastVisit.value.toLocaleString();
}
```
