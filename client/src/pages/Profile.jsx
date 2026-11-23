// client/src/pages/Profile.jsx
import React from 'react';
import { Mail, Shield, Calendar, Layers, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTasks } from '../hooks/useTasks';
import { useNotes } from '../hooks/useNotes';
import { useGoals } from '../hooks/useGoals';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const { tasks, stats: taskStats } = useTasks();
  const { notes } = useNotes();
  const { goals, stats: goalStats } = useGoals();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    addToast('See you later! 👋', 'info');
    navigate('/login');
  }

  const joinedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <div className="section-header mb-6">
        <h1 className="section-title">Profile</h1>
        <p className="section-subtitle">Your verified Google account information</p>
      </div>

      {/* Profile card */}
      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-accent-purple))', border: 'none' }}>
        <div className="flex items-center gap-6" style={{ flexWrap: 'wrap' }}>
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              style={{ width: 90, height: 90, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.4)', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: 90, height: 90, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em' }}>{user?.name}</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Mail size={14} /> {user?.email}
            </p>
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Shield size={13} style={{ color: 'rgba(255,255,255,0.6)' }} />
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem' }}>Verified via Google OAuth 2.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-cols-3 mb-6">
        {[
          { label: 'Tasks', value: taskStats.total, sub: `${taskStats.completed} done`, color: '#6366f1', bg: 'var(--color-primary-50)' },
          { label: 'Notes', value: notes.length, sub: 'personal notes', color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Goals', value: goalStats.total, sub: `${goalStats.completed} today`, color: '#16a34a', bg: '#f0fdf4' },
        ].map(({ label, value, sub, color, bg }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color }}>{value}</div>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{label}</div>
            <div className="text-xs text-muted">{sub}</div>
          </div>
        ))}
      </div>

      {/* Account details */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="card-title">Account Details</div>
        </div>
        <div>
          {[
            { icon: Mail,     label: 'Email address',   value: user?.email },
            { icon: Shield,   label: 'Auth provider',   value: 'Google Identity Services' },
            { icon: Layers,   label: 'Account ID (sub)', value: user?.sub ? `${user.sub.slice(0, 12)}…` : '—' },
            { icon: Calendar, label: 'Using MySpace since', value: joinedDate },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4" style={{ padding: '0.875rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} style={{ color: 'var(--color-primary-500)' }} />
              </div>
              <div>
                <div className="text-xs text-muted">{label}</div>
                <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{value || '—'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="card" style={{ border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="card-title">Sign Out</div>
          <div className="card-subtitle">Your local data will be preserved</div>
        </div>
        <button className="btn btn-danger" onClick={handleLogout}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  );
}

