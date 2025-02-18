<script setup lang="ts">
import { useStorage } from 'ew-responsive-store';
import Checkbox from './checkbox.vue';
import PopConfirm from './pop-confirm.vue';
import { computed, ref } from 'vue';

const todos = useStorage<{ id?: number; text?: string; completed?: boolean }[]>('todos', []);
const input = ref('');
const filter = ref('all');

const addTodo = (e: Event) => {
  e.preventDefault();
  if (!input.value.trim()) return;
  todos.value = [...todos.value, {
    id: Date.now(),
    text: input.value,
    completed: false
  }]
  input.value = '';
};

const deleteTodo = (id: number) => {
  todos.value = todos.value.filter(todo => todo.id !== id);
};

const filteredTodos = computed(() => todos.value.filter(todo => {
  if (filter.value === 'completed') return todo.completed;
  if (filter.value === 'active') return !todo.completed;
  return true;
}));

</script>

<template>
  <div class="todo-container">
    <h1 class="todo-title">待办事项应用 ✨</h1>

    <form @submit="addTodo" class="todo-form">
      <input type="text" v-model="input" placeholder="添加一个待办事项..." class="todo-input" />
      <button type="submit" class="add-button">
        添加
      </button>
    </form>

    <div class="filter-buttons">
      <button type="button" @click="filter = 'all'" :class="{ 'button': true, 'active': filter === 'all' }">
        所有 ({{ todos.length }})
      </button>
      <button type="button" @click="filter = 'active'" :class="{ button: true, 'active': filter === 'active' }">
        可选 ({{ todos.filter(t => !t.completed).length }})
      </button>
      <button type="button" @click="filter = 'completed'" :class="{ button: true, 'active': filter === 'completed' }">
        已完成 ({{ todos.filter(t => t.completed).length }})
      </button>
    </div>

    <transition-group name="list" class="todo-list" tag="ul">
      <li v-for="todo in filteredTodos" :key="todo.id" :class="{ 'todo-item': true, completed: todo.completed }">
        <Checkbox v-model="todo.completed" />
        <span class="todo-text">{{ todo.text }}</span>
        <pop-confirm buttonText="&times;" message="您确定要删除此项吗？" @confirm="deleteTodo(todo.id!)">
          <button type="button" class="delete-button">&times;</button>
        </pop-confirm>
      </li>
    </transition-group>
  </div>
</template>
