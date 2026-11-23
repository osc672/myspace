// client/src/hooks/useGoals.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getItem, setItem } from '../utils/storage';
import { todayString } from '../utils/dates';

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    if (!user?.sub) { setGoals([]); return; }
    const stored = getItem(user.sub, 'goals') || [];
    // Auto-reset daily completions if last reset was not today
    const lastReset = getItem(user.sub, 'goals_last_reset');
    const today = todayString();
    if (lastReset !== today && stored.some(g => g.completedToday)) {
      const reset = stored.map(g => ({ ...g, completedToday: false }));
      setGoals(reset);
      setItem(user.sub, 'goals_last_reset', today);
    } else {
      setGoals(stored);
    }
    if (!lastReset || lastReset !== today) {
      setItem(user.sub, 'goals_last_reset', today);
    }
  }, [user?.sub]);

  useEffect(() => {
    if (!user?.sub) return;
    setItem(user.sub, 'goals', goals);
  }, [goals, user?.sub]);

  const addGoal = useCallback((text) => {
    const goal = {
      id: newId(),
      text: text.trim(),
      completedToday: false,
      createdAt: new Date().toISOString(),
    };
    setGoals(prev => [...prev, goal]);
    return goal;
  }, []);

  const toggleGoal = useCallback((id) => {
    setGoals(prev => prev.map(g =>
      g.id === id ? { ...g, completedToday: !g.completedToday } : g
    ));
  }, []);

  const deleteGoal = useCallback((id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  const resetDaily = useCallback(() => {
    setGoals(prev => prev.map(g => ({ ...g, completedToday: false })));
    if (user?.sub) setItem(user.sub, 'goals_last_reset', todayString());
  }, [user?.sub]);

  const stats = {
    total: goals.length,
    completed: goals.filter(g => g.completedToday).length,
    pct: goals.length ? Math.round((goals.filter(g => g.completedToday).length / goals.length) * 100) : 0,
  };

  return { goals, addGoal, toggleGoal, deleteGoal, resetDaily, stats };
}

