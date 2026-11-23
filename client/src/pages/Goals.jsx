// client/src/pages/Goals.jsx
import React, { useState } from 'react';
import { Plus, Trash2, RefreshCw, Target, Check } from 'lucide-react';
import { useGoals } from '../hooks/useGoals';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Goals() {
  const { goals, addGoal, toggleGoal, deleteGoal, resetDaily, stats } = useGoals();
  const { addToast } = useToast();
  const [input, setInput] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [showReset, setShowReset] = useState(false);

  function handleAdd(e) {
    e.preventDefault();
    if (!input.trim()) return;
    addGoal(input);
    setInput('');
    addToast('Goal added!', 'success');
  }

  function handleToggle(id) {
    const goal = goals.find(g => g.id === id);
    toggleGoal(id);
    addToast(goal?.completedToday ? 'Goal marked incomplete' : 'Goal completed! 🎯', goal?.completedToday ? 'info' : 'success');
  }

  function handleDelete() {
    deleteGoal(deleteId);
    addToast('Goal removed', 'info');
    setDeleteId(null);
  }

  function handleReset() {
    resetDaily();
    addToast('Daily progress reset!', 'info');
    setShowReset(false);
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="section-title">Daily Goals</h1>
          <p className="section-subtitle">Track your daily intentions. Resets each day automatically.</p>
        </div>
        {goals.length > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={() => setShowReset(true)}>
            <RefreshCw size={14} /> Reset Today
          </button>
        )}
      </div>

      {/* Progress card */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="card-title">Today's Progress</div>
            <div className="card-subtitle">{stats.completed} of {stats.total} goals completed</div>
          </div>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: `conic-gradient(var(--color-primary-500) ${stats.pct * 3.6}deg, var(--bg-input) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 10px var(--bg-card)' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary-500)' }}>{stats.pct}%</span>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${stats.pct}%` }} />
        </div>
        {stats.pct === 100 && stats.total > 0 && (
          <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '1.125rem', fontWeight: 600, color: '#16a34a' }}>
            🎉 All goals completed! Excellent work!
          </div>
        )}
      </div>

      {/* Add goal form */}
      <form onSubmit={handleAdd} className="flex gap-3 mb-6" style={{ flexWrap: 'wrap' }}>
        <input
          className="form-input"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="Add a daily goal…"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={!input.trim()}>
          <Plus size={16} /> Add Goal
        </button>
      </form>

      {/* Goals list */}
      {goals.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon"><Target size={28} /></div>
          <div className="empty-state-title">No goals yet</div>
          <div className="empty-state-text">Set daily goals to track your intentions and stay focused.</div>
        </div>
      ) : (
        <div>
          {goals.map(goal => (
            <div key={goal.id} className={`goal-item ${goal.completedToday ? 'completed' : ''}`}>
              <button
                onClick={() => handleToggle(goal.id)}
                className="custom-checkbox"
                style={{ background: goal.completedToday ? undefined : 'var(--bg-secondary)' }}
                aria-label={goal.completedToday ? 'Mark incomplete' : 'Mark complete'}
              >
                <div className={`custom-checkbox ${goal.completedToday ? 'checked' : ''}`} style={{ margin: 0 }}>
                  {goal.completedToday && <Check size={12} color="#fff" />}
                </div>
              </button>

              <span className="goal-title">{goal.text}</span>

              {goal.completedToday && (
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>✅ Done</span>
              )}

              <button
                className="btn btn-ghost btn-icon btn-sm"
                style={{ color: '#dc2626', marginLeft: 'auto', opacity: 0.6 }}
                onClick={() => setDeleteId(goal.id)}
                title="Remove goal"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Remove Goal"
        message="Remove this goal? It won't count towards your progress anymore."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        isOpen={showReset}
        title="Reset Daily Progress"
        message="This will mark all goals as incomplete for today. Your goals won't be deleted — only today's completion status is reset."
        confirmText="Reset"
        danger={false}
        onConfirm={handleReset}
        onCancel={() => setShowReset(false)}
      />
    </div>
  );
}

