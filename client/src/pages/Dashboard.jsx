// client/src/pages/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, FileText, Target, Calendar, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { useGoals } from '../hooks/useGoals';
import { useNotes } from '../hooks/useNotes';
import { getDailyQuote } from '../utils/quotes';
import { greeting, formatDate, isOverdue } from '../utils/dates';

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}>
        <Icon size={22} color={color} />
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, stats: taskStats } = useTasks();
  const { goals, stats: goalStats } = useGoals();
  const { notes } = useNotes();
  const quote = getDailyQuote();

  const upcomingTasks = tasks
    .filter(t => !t.completed && t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const overdueTasks = tasks.filter(t => !t.completed && isOverdue(t.dueDate));

  return (
    <div className="page-container">
      {/* Welcome banner */}
      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-accent-purple))', border: 'none', color: '#fff' }}>
        <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
              {greeting()}, {user?.givenName || user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p style={{ marginTop: '0.25rem', opacity: 0.85, fontSize: '0.9375rem' }}>
              {taskStats.pending > 0
                ? `You have ${taskStats.pending} pending task${taskStats.pending > 1 ? 's' : ''} today.`
                : 'All tasks done! Great work! 🎉'
              }
            </p>
          </div>
          {user?.picture && (
            <img src={user.picture} alt={user.name} style={{ width: 60, height: 60, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.4)', objectFit: 'cover' }} />
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid-cols-4 mb-6">
        <StatCard icon={CheckSquare} label="Total Tasks" value={taskStats.total} color="#6366f1" bg="var(--color-primary-50)" />
        <StatCard icon={TrendingUp}  label="Completed" value={taskStats.completed} color="#16a34a" bg="#f0fdf4" />
        <StatCard icon={Clock}       label="Pending" value={taskStats.pending} color="#d97706" bg="#fffbeb" />
        <StatCard icon={Target}      label="Goals Done" value={`${goalStats.completed}/${goalStats.total}`} color="#7c3aed" bg="#f5f3ff" />
      </div>

      {/* Main grid */}
      <div className="dashboard-main-grid">

        {/* Daily Productivity */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Daily Productivity</div>
              <div className="card-subtitle">{taskStats.pct}% of tasks completed</div>
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-500)' }}>{taskStats.pct}%</span>
          </div>
          <div className="progress-bar mb-4">
            <div className="progress-bar-fill" style={{ width: `${taskStats.pct}%` }} />
          </div>
          <div className="card-header" style={{ marginBottom: '0.5rem' }}>
            <div>
              <div className="card-title" style={{ fontSize: '0.9375rem' }}>Daily Goals</div>
              <div className="card-subtitle">{goalStats.completed} of {goalStats.total} done</div>
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#7c3aed' }}>{goalStats.pct}%</span>
          </div>
          <div className="progress-bar" style={{ height: 6 }}>
            <div className="progress-bar-fill" style={{ width: `${goalStats.pct}%`, background: 'linear-gradient(90deg, #7c3aed, #db2777)' }} />
          </div>
        </div>

        {/* Quote of the day */}
        <div>
          <div className="quote-card mb-4">
            <div className="quote-text">"{quote.text}"</div>
            <div className="quote-author">— {quote.author}</div>
          </div>

          {overdueTasks.length > 0 && (
            <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--border-radius)', borderLeft: '3px solid #dc2626' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#dc2626', marginBottom: '0.25rem' }}>
                ⚠️ {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#991b1b' }}>
                {overdueTasks[0]?.title}{overdueTasks.length > 1 ? ` +${overdueTasks.length - 1} more` : ''}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming tasks */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Upcoming Tasks</div>
            <Link to="/tasks" className="btn btn-ghost btn-sm flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {upcomingTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem' }}>
              <CheckSquare size={28} style={{ color: 'var(--text-muted)' }} />
              <div className="empty-state-text">No upcoming tasks with due dates</div>
            </div>
          ) : (
            <div>
              {upcomingTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 mb-3">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#d97706' : '#16a34a', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="truncate" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{task.title}</div>
                    <div style={{ fontSize: '0.75rem', color: isOverdue(task.dueDate) ? '#dc2626' : 'var(--text-muted)' }}>
                      {formatDate(task.dueDate)}{isOverdue(task.dueDate) ? ' — overdue' : ''}
                    </div>
                  </div>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick nav */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Quick Navigation</div>
          </div>
          <div className="dashboard-quick-nav">
            {[
              { to: '/tasks',    icon: CheckSquare, label: 'Tasks',      count: taskStats.pending, color: '#6366f1', bg: 'var(--color-primary-50)' },
              { to: '/notes',    icon: FileText,    label: 'Notes',      count: notes.length,      color: '#7c3aed', bg: '#f5f3ff' },
              { to: '/goals',    icon: Target,      label: 'Goals',      count: goalStats.total,   color: '#16a34a', bg: '#f0fdf4' },
              { to: '/calendar', icon: Calendar,    label: 'Calendar',   count: null,              color: '#2563eb', bg: '#eff6ff' },
            ].map(({ to, icon: Icon, label, count, color, bg }) => (
              <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                <div className="stat-card" style={{ cursor: 'pointer' }}>
                  <div className="stat-icon" style={{ background: bg, width: 40, height: 40 }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{label}</div>
                    {count != null && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{count} item{count !== 1 ? 's' : ''}</div>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

