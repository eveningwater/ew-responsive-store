import { TodoProvider } from './context/todo-context';
import { TodoList } from './components/todo-list';
import 'antd/dist/reset.css';
import './App.css';

function App() {
  return (
    <TodoProvider>
      <div className="container">
        <TodoList />
      </div>
    </TodoProvider>
  );
}

export default App
