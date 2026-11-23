// client/src/pages/Tasks.jsx
import React, { useState } from 'react';
import { Plus, Search, Trash2, Pencil, Check, X, Filter } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDate, isOverdue, todayString } from '../utils/dates';

const PRIORITIES = ['all', 'high', 'medium', 'low'];
const FILTERS = ['all', 'pending', 'completed'];

function TaskForm({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [priority, setPriority] = useState(initial?.priority || 'medium');
  const [dueDate, setDueDate] = useState(initial?.dueDate || '');

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, priority, dueDate });
  }

  return (
    <form onSubmit={handleSubmit} className="card mb-4">
      <div className="form-group">
        <input
          className="form-input"
          placeholder="Task title…"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
          required
        />
      </div>
      <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        <select className="form-select" style={{ flex: 1, minWidth: 120 }} value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="high">🔴 High Priority</option>
          <option value="medium">🟡 Medium Priority</option>
          <option value="low">🟢 Low Priority</option>
        </select>
        <input
          type="date"
          className="form-input"
          style={{ flex: 1, minWidth: 140 }}
          value={dueDate}
          min={todayString()}
          onChange={e => setDueDate(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary btn-sm">
          <Check size={14} /> {initial ? 'Save Changes' : 'Add Task'}
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
          <X size={14} /> Cancel
        </button>
      </div>
    </form>
  );
}

function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const overdue = isOverdue(task.dueDate);

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <button
        className="custom-checkbox"
        style={{ marginTop: 2 }}
        onClick={() => onToggle(task.id)}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        <div className={`custom-checkbox ${task.completed ? 'checked' : ''}`} style={{ margin: 0 }}>
          {task.completed && <Check size={12} color="#fff" />}
        </div>
      </button>

      <div className="task-content">
        <div className="task-title">{task.title}</div>
        <div className="task-meta">
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          {task.dueDate && (
            <span className={`task-due ${overdue && !task.completed ? 'overdue' : ''}`}>
              {overdue && !task.completed ? '⚠️ ' : '📅 '}{formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEdit(task)} title="Edit">
          <Pencil size={14} />
        </button>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onDelete(task.id)} title="Delete" style={{ color: '#dc2626' }}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask, stats } = useTasks();
  const { addToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);

  function handleAdd(data) {
    addTask(data);
    addToast('Task added!', 'success');
    setShowForm(false);
  }

  function handleUpdate(data) {
    updateTask(editingTask.id, data);
    addToast('Task updated!', 'success');
    setEditingTask(null);
  }

  function handleDelete() {
    deleteTask(deleteId);
    addToast('Task deleted', 'info');
    setDeleteId(null);
  }

  function handleToggle(id) {
    const task = tasks.find(t => t.id === id);
    toggleTask(id);
    addToast(task?.completed ? 'Task marked pending' : 'Task completed! ✅', task?.completed ? 'info' : 'success');
  }

  const filtered = tasks.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === 'all' || (filter === 'completed' ? t.completed : !t.completed);
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <h1 className="section-title">Tasks</h1>
          <p className="section-subtitle">{stats.completed}/{stats.total} completed · {stats.pct}% done</p>
        </div>
        {!showForm && !editingTask && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Task
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">Overall Progress</span>
          <span className="text-sm font-bold text-primary-color">{stats.pct}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${stats.pct}%` }} />
        </div>
        <div className="flex gap-4 mt-3">
          <span className="text-xs text-secondary">✅ {stats.completed} completed</span>
          <span className="text-xs text-secondary">⏳ {stats.pending} pending</span>
          <span className="text-xs text-secondary">📋 {stats.total} total</span>
        </div>
      </div>

      {/* Add/Edit form */}
      {showForm && <TaskForm onSave={handleAdd} onCancel={() => setShowForm(false)} />}
      {editingTask && <TaskForm initial={editingTask} onSave={handleUpdate} onCancel={() => setEditingTask(null)} />}

      {/* Filters */}
      <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} /></button>}
        </div>

        <div className="filter-tabs">
          {FILTERS.map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="filter-tabs">
          {PRIORITIES.map(p => (
            <button key={p} className={`filter-tab ${priorityFilter === p ? 'active' : ''}`} onClick={() => setPriorityFilter(p)}>
              {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon"><Filter size={28} /></div>
          <div className="empty-state-title">{search ? 'No matching tasks' : 'No tasks here'}</div>
          <div className="empty-state-text">
            {search ? 'Try a different search term.' : 'Click "Add Task" to create your first task.'}
          </div>
        </div>
      ) : (
        <div>
          {filtered.map(task => (
            editingTask?.id === task.id ? null : (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onEdit={t => { setShowForm(false); setEditingTask(t); }}
                onDelete={id => setDeleteId(id)}
              />
            )
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

