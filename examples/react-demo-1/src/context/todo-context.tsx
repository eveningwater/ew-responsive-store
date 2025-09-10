import React, { createContext, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { Todo, TodoContextType, TodoPriority } from "../types/todo";
import { useReactStorage } from "ew-responsive-store";

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

  const [todos, setTodos] = useReactStorage<Todo[]>("todos", []);

  const addTodo = (title: string, priority: TodoPriority) => {
    const newTodo: Todo = {
      id: uuidv4(),
      title,
      completed: false,
      priority,
      createdAt: new Date(),
    };
    setTodos([...todos, newTodo]);
    
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
    
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
    
  };

  const updateTodoPriority = (id: string, priority: TodoPriority) => {
    setTodos(todos.map((todo) =>
      todo.id === id ? { ...todo, priority } : todo
    ));
    
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
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
