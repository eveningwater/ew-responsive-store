import React, { createContext, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { Todo, TodoContextType, TodoPriority } from "../types/todo";
import { useStorage } from "ew-responsive-store";
import useForceUpdate from "../hooks/useForceUpdate";

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const forceUpdate = useForceUpdate();
  const todos = useStorage<Todo[]>("todos", []);

  const addTodo = (title: string, priority: TodoPriority) => {
    const newTodo: Todo = {
      id: uuidv4(),
      title,
      completed: false,
      priority,
      createdAt: new Date(),
    };
    todos.value = [...todos.value, newTodo];
    forceUpdate();
  };

  const toggleTodo = (id: string) => {
    todos.value = todos.value.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    forceUpdate();
  };

  const deleteTodo = (id: string) => {
    todos.value = todos.value.filter((todo) => todo.id !== id);
    forceUpdate();
  };

  const updateTodoPriority = (id: string, priority: TodoPriority) => {
    todos.value = todos.value.map((todo) =>
      todo.id === id ? { ...todo, priority } : todo
    );
    forceUpdate();
  };

  return (
    <TodoContext.Provider
      value={{
        todos: todos.value,
        addTodo,
        toggleTodo,
        deleteTodo,
        updateTodoPriority,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error("useTodo must be used within a TodoProvider");
  }
  return context;
};
