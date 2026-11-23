// client/src/hooks/useTasks.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getItem, setItem } from '../utils/storage';

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);

  // Load tasks on user change
  useEffect(() => {
    if (!user?.sub) { setTasks([]); return; }
    setTasks(getItem(user.sub, 'tasks') || []);
  }, [user?.sub]);

  // Persist whenever tasks change
  useEffect(() => {
    if (!user?.sub) return;
    setItem(user.sub, 'tasks', tasks);
  }, [tasks, user?.sub]);

  const addTask = useCallback((taskData) => {
    const task = {
      id: newId(),
      title: taskData.title.trim(),
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [task, ...prev]);
    return task;
  }, []);

  const updateTask = useCallback((id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTask = useCallback((id) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null } : t
    ));
  }, []);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    pct: tasks.length ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0,
  };

  return { tasks, addTask, updateTask, deleteTask, toggleTask, stats };
}

