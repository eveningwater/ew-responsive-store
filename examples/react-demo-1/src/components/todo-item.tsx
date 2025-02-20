import React from 'react';
import { Card, Checkbox, Tag, Space, Button, Select, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Todo, TodoPriority } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPriorityChange: (id: string, priority: TodoPriority) => void;
}

const priorityColors = {
  low: 'green',
  medium: 'orange',
  high: 'red',
};

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onPriorityChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        style={{
          marginBottom: 16,
          opacity: todo.completed ? 0.7 : 1,
          backgroundColor: todo.completed ? '#f5f5f5' : 'white',
        }}
        styles={{ body: { padding: '12px 24px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Checkbox
              checked={todo.completed}
              onChange={() => onToggle(todo.id)}
            />
            <span style={{
              textDecoration: todo.completed ? 'line-through' : 'none',
              color: todo.completed ? '#999' : 'inherit',
            }}>
              {todo.title}
            </span>
            <Tag color={priorityColors[todo.priority]}>
              {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
            </Tag>
          </Space>
          <Space>
            <Select
              value={todo.priority}
              onChange={(value: TodoPriority) => onPriorityChange(todo.id, value)}
              style={{ width: 100 }}
            >
              <Select.Option value="low">Low</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="high">High</Select.Option>
            </Select>
            <Popconfirm
              title="确认删除"
              description="确定要删除这个待办事项吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => onDelete(todo.id)}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Space>
        </div>
      </Card>
    </motion.div>
  );
};