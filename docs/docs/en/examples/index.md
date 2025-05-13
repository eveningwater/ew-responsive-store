# Examples

This section provides practical examples of using `ew-responsive-store` in different scenarios.

## Basic Counter Example

A simple counter that persists its value in localStorage:

```ts
import { useStorage } from "ew-responsive-store";

// Initialize a counter with a default value of 0
const counter = useStorage("counter", 0);

// Increment the counter
function increment() {
  counter.value++;
}

// Decrement the counter
function decrement() {
  counter.value--;
}

// Reset the counter
function reset() {
  counter.value = 0;
}
```

## User Preferences

Managing user preferences that persist across sessions:

```ts
import { useStorage } from "ew-responsive-store";
import { StoreType } from "ew-responsive-store/typings/core/enum";

// Initialize user preferences with default values
const preferences = useStorage("userPreferences", {
  theme: "light",
  fontSize: "medium",
  notifications: true,
});

// Toggle theme between light and dark
function toggleTheme() {
  preferences.value.theme =
    preferences.value.theme === "light" ? "dark" : "light";
}

// Change font size
function setFontSize(size) {
  preferences.value.fontSize = size; // 'small', 'medium', or 'large'
}

// Toggle notifications
function toggleNotifications() {
  preferences.value.notifications = !preferences.value.notifications;
}
```

## Shopping Cart

Implementing a shopping cart that persists items between page refreshes:

```ts
import { useStorage } from "ew-responsive-store";

// Initialize an empty shopping cart
const cart = useStorage("shoppingCart", []);

// Add an item to the cart
function addToCart(product) {
  const existingItem = cart.value.find((item) => item.id === product.id);

  if (existingItem) {
    // If the item already exists, increase its quantity
    existingItem.quantity += 1;
  } else {
    // Otherwise, add the new item with quantity 1
    cart.value.push({
      ...product,
      quantity: 1,
    });
  }
}

// Remove an item from the cart
function removeFromCart(productId) {
  const index = cart.value.findIndex((item) => item.id === productId);

  if (index !== -1) {
    cart.value.splice(index, 1);
  }
}

// Update the quantity of an item
function updateQuantity(productId, quantity) {
  const item = cart.value.find((item) => item.id === productId);

  if (item) {
    item.quantity = quantity;
  }
}

// Clear the entire cart
function clearCart() {
  cart.value = [];
}

// Calculate the total price of items in the cart
function getCartTotal() {
  return cart.value.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}
```

## Form State Persistence

Saving form state to prevent data loss when navigating away:

```ts
import { useStorage } from "ew-responsive-store";
import { StoreType } from "ew-responsive-store/typings/core/enum";

// Use sessionStorage for temporary form data
const formData = useStorage(
  "contactForm",
  {
    name: "",
    email: "",
    message: "",
  },
  { storage: StoreType.SESSION }
);

// Update form fields
function updateField(field, value) {
  formData.value[field] = value;
}

// Submit the form
function submitForm() {
  // Send the data to your API
  sendToApi(formData.value);

  // Clear the form after successful submission
  formData.value = {
    name: "",
    email: "",
    message: "",
  };
}

// Check if the form has any data
function hasFormData() {
  return (
    formData.value.name !== "" ||
    formData.value.email !== "" ||
    formData.value.message !== ""
  );
}
```

## Using with Vue.js

Integrating with Vue.js components:

```vue
<template>
  <div>
    <h2>Theme Switcher</h2>
    <div class="theme-controls">
      <button @click="toggleTheme">Toggle Theme</button>
      <p>Current theme: {{ theme }}</p>
    </div>

    <h2>Counter</h2>
    <div class="counter-controls">
      <button @click="decrement">-</button>
      <span>{{ count }}</span>
      <button @click="increment">+</button>
      <button @click="reset">Reset</button>
    </div>
  </div>
</template>

<script setup>
import { useStorage } from "ew-responsive-store";
import { computed } from "vue";

// Theme preference
const preferences = useStorage("preferences", { theme: "light" });
const theme = computed(() => preferences.value.theme);

function toggleTheme() {
  preferences.value.theme =
    preferences.value.theme === "light" ? "dark" : "light";
}

// Counter
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

## Using with React

Integrating with React components:

```jsx
import React, { useEffect, useState } from "react";
import { useStorage } from "ew-responsive-store";

function ThemeSwitcher() {
  // Initialize the storage
  const preferences = useStorage("preferences", { theme: "light" });

  // Local state to trigger re-renders
  const [theme, setTheme] = useState(preferences.value.theme);

  // Update local state when storage changes
  useEffect(() => {
    const updateTheme = () => {
      setTheme(preferences.value.theme);
    };

    // Initial update
    updateTheme();

    // Subscribe to changes
    const unsubscribe = preferences.subscribe(updateTheme);

    // Cleanup
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
      <h2>Theme Switcher</h2>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <p>Current theme: {theme}</p>
    </div>
  );
}

export default ThemeSwitcher;
```

## Advanced Usage: Custom Serialization

Using custom serialization for complex data structures:

```ts
import { useStorage, parseStr } from "ew-responsive-store";
import { parseStrType } from "ew-responsive-store/typings/core/enum";

// Custom serialization for a Date object
const lastVisit = useStorage("lastVisit", new Date(), {
  serializer: (date) => date.toISOString(),
  deserializer: (dateStr) => new Date(dateStr),
});

// Update the last visit time to now
function updateLastVisit() {
  lastVisit.value = new Date();
}

// Get a formatted string of the last visit time
function getFormattedLastVisit() {
  return lastVisit.value.toLocaleString();
}
```
