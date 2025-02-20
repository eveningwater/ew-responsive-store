export interface Todo {
    id: string;
    title: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
  }
  
  export type TodoPriority = Todo['priority'];
  
  export interface TodoContextType {
    todos: Todo[];
    addTodo: (title: string, priority: TodoPriority) => void;
    toggleTodo: (id: string) => void;
    deleteTodo: (id: string) => void;
    updateTodoPriority: (id: string, priority: TodoPriority) => void;
  }