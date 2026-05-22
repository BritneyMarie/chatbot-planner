import { useState } from 'react';
import './TodoList.css';

const DEFAULT_TODOS = [
  { id: 1, text: 'Review weekly schedule', done: false, category: 'work' },
  { id: 2, text: 'Grocery shopping', done: true, category: 'personal' },
  { id: 3, text: 'Email follow-ups', done: false, category: 'work' },
  { id: 4, text: 'Prepare presentation', done: false, category: 'work' },
  { id: 5, text: 'Call dentist', done: false, category: 'personal' },
];

const CATEGORIES = ['all', 'work', 'personal'];

const TodoList = () => {
  const [todos, setTodos] = useState(DEFAULT_TODOS);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos(prev => [...prev, {
      id: Date.now(),
      text: newTodo.trim(),
      done: false,
      category: 'personal',
    }]);
    setNewTodo('');
  };

  const removeTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const filteredTodos = filter === 'all'
    ? todos
    : todos.filter(t => t.category === filter);

  const pendingCount = todos.filter(t => !t.done).length;

  return (
    <div className="todo-list-widget">
      <div className="todo-header">
        <h3>To-Do List</h3>
        <span className="todo-pending">{pendingCount} pending</span>
      </div>

      <div className="todo-filters">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`todo-filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
        <button className="todo-add-toggle" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? '✕' : '+ New'}
        </button>
      </div>

      {showAdd && (
        <div className="todo-add-form">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="What needs to be done?"
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          />
          <button onClick={addTodo}>Add</button>
        </div>
      )}

      <div className="todo-items">
        {filteredTodos.map(todo => (
          <div key={todo.id} className={`todo-item ${todo.done ? 'completed' : ''}`}>
            <button
              className={`todo-checkbox ${todo.done ? 'checked' : ''}`}
              onClick={() => toggleTodo(todo.id)}
            >
              {todo.done && '✓'}
            </button>
            <span className="todo-text">{todo.text}</span>
            <span className={`todo-category ${todo.category}`}>{todo.category}</span>
            <button className="todo-remove" onClick={() => removeTodo(todo.id)}>&#215;</button>
          </div>
        ))}
        {filteredTodos.length === 0 && (
          <div className="todo-empty">No tasks in this category</div>
        )}
      </div>
    </div>
  );
};

export default TodoList;
