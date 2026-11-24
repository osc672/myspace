// client/src/pages/Calendar.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { formatDate, isOverdue } from '../utils/dates';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function Calendar() {
  const { tasks } = useTasks();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Build task map keyed by YYYY-MM-DD
  const tasksByDate = {};
  tasks.forEach(t => {
    if (!t.dueDate) return;
    if (!tasksByDate[t.dueDate]) tasksByDate[t.dueDate] = [];
    tasksByDate[t.dueDate].push(t);
  });

  function dateString(d) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  // Build calendar cells
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Selected date tasks
  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] || []) : [];

  // Upcoming tasks (next 30 days)
  const upcoming = tasks
    .filter(t => !t.completed && t.dueDate && t.dueDate >= today.toISOString().split('T')[0])
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 10);

  return (
    <div className="page-container">
      <div className="section-header mb-6">
        <h1 className="section-title">Calendar</h1>
        <p className="section-subtitle">View and plan tasks by date</p>
      </div>

      <div className="calendar-layout">
        {/* Calendar */}
        <div className="card">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <button className="btn btn-ghost btn-icon" onClick={prevMonth}><ChevronLeft size={18} /></button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{MONTHS[month]} {year}</h2>
            <button className="btn btn-ghost btn-icon" onClick={nextMonth}><ChevronRight size={18} /></button>
          </div>

          {/* Day headers */}
          <div className="calendar-grid mb-1">
            {DAYS.map(d => (
              <div key={d} className="calendar-day-header">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="calendar-grid">
            {cells.map((d, i) => {
              if (!d) return <div key={`empty-${i}`} />;
              const ds = dateString(d);
              const hasTasks = tasksByDate[ds]?.length > 0;
              const isSelected = ds === selectedDate;

              return (
                <div
                  key={ds}
                  className={`calendar-day ${isToday(d) ? 'today' : ''}`}
                  style={{
                    border: isSelected && !isToday(d) ? '2px solid var(--color-primary-500)' : undefined,
                    fontWeight: hasTasks ? 600 : 400,
                  }}
                  onClick={() => setSelectedDate(ds === selectedDate ? null : ds)}
                >
                  <span>{d}</span>
                  {hasTasks && (
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', marginTop: 2 }}>
                      {tasksByDate[ds].slice(0, 3).map((_, idx) => (
                        <div key={idx} className="calendar-day-dot" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected date tasks */}
          {selectedDate && (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>
                📅 {formatDate(selectedDate)}
              </h3>
              {selectedTasks.length === 0 ? (
                <p className="text-sm text-muted">No tasks due on this date.</p>
              ) : (
                selectedTasks.map(t => (
                  <div key={t.id} className="flex items-center gap-3 mb-2">
                    <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                    <span style={{ fontSize: '0.875rem', textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {t.title}
                    </span>
                    {t.completed && <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>✅</span>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Upcoming tasks sidebar */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Upcoming Tasks</div>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem' }}>
              <CalIcon size={28} style={{ color: 'var(--text-muted)' }} />
              <div className="empty-state-text">No upcoming tasks</div>
            </div>
          ) : (
            upcoming.map(task => (
              <div key={task.id} style={{ padding: '0.625rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  {isOverdue(task.dueDate) && <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>OVERDUE</span>}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{task.title}</div>
                <div style={{ fontSize: '0.75rem', color: isOverdue(task.dueDate) ? '#dc2626' : 'var(--text-muted)', marginTop: '0.125rem' }}>
                  {formatDate(task.dueDate)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

