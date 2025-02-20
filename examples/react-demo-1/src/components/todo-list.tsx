import React, { useState } from 'react';
import { Input, Button, Select, List, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { AnimatePresence } from 'framer-motion';
import { TodoItem } from './todo-item';
import { useTodo } from '../context/todo-context';
import { TodoPriority } from '../types/todo';

export const TodoList: React.FC = () => {
  const { todos, addTodo, toggleTodo, deleteTodo, updateTodoPriority } = useTodo();
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<TodoPriority>('medium');

  const handleAddTodo = () => {
    if (newTodoTitle.trim()) {
      addTodo(newTodoTitle.trim(), newTodoPriority);
      setNewTodoTitle('');
      setNewTodoPriority('medium');
    }else{
         message.warning("请输入待办事项!")
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
        Todo List
      </Typography.Title>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <Input
          placeholder="What needs to be done?"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          onPressEnter={handleAddTodo}
          style={{ flex: 1 }}
        />
        <Select
          value={newTodoPriority}
          onChange={setNewTodoPriority}
          style={{ width: 120 }}
        >
          <Select.Option value="low">Low</Select.Option>
          <Select.Option value="medium">Medium</Select.Option>
          <Select.Option value="high">High</Select.Option>
        </Select>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddTodo}
        >
          Add
        </Button>
      </div>

      <List
        dataSource={todos}
        renderItem={(todo) => (
          <AnimatePresence mode="popLayout" key={todo.id}>
            <TodoItem
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onPriorityChange={updateTodoPriority}
            />
          </AnimatePresence>
        )}
      />
    </div>
  );
};