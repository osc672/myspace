// client/src/pages/Settings.jsx
import React from 'react';
import { Sun, Moon, Shield, Database } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    addToast('Logged out successfully', 'info');
    navigate('/login');
  }

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <div className="section-header mb-6">
        <h1 className="section-title">Settings</h1>
        <p className="section-subtitle">Customize your MySpace experience</p>
      </div>

      {/* Appearance */}
      <div className="card mb-4">
        <div className="card-header">
          <div>
            <div className="card-title">Appearance</div>
            <div className="card-subtitle">Choose your preferred theme</div>
          </div>
        </div>

        <div className="theme-options-grid">
          {[
            { value: 'light', icon: Sun, label: 'Light Mode', desc: 'Clean and bright' },
            { value: 'dark',  icon: Moon, label: 'Dark Mode',  desc: 'Easy on the eyes' },
          ].map(({ value, icon: Icon, label, desc }) => (
            <div
              key={value}
              onClick={() => { if (theme !== value) toggleTheme(); }}
              className="card"
              style={{
                cursor: 'pointer',
                border: theme === value ? '2px solid var(--color-primary-500)' : '1px solid var(--border-color)',
                boxShadow: theme === value ? '0 0 0 3px rgb(99 102 241 / 0.15)' : undefined,
                padding: '1rem',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div className="flex items-center gap-3">
                <div style={{ width: 36, height: 36, borderRadius: 10, background: value === 'light' ? '#fef9c3' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={value === 'light' ? '#d97706' : '#94a3b8'} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{label}</div>
                  <div className="text-xs text-muted">{desc}</div>
                </div>
                {theme === value && (
                  <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: 'var(--color-primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account & Security */}
      <div className="card mb-4">
        <div className="card-header">
          <div>
            <div className="card-title">Account & Security</div>
            <div className="card-subtitle">Your authentication details</div>
          </div>
          <Shield size={18} style={{ color: 'var(--color-primary-500)' }} />
        </div>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {[
            { label: 'Name', value: user?.name },
            { label: 'Email', value: user?.email },
            { label: 'Google Account ID', value: user?.sub ? `${user.sub.slice(0, 8)}…` : '—' },
            { label: 'Authentication', value: 'Google OAuth 2.0' },
            { label: 'Session', value: 'HTTP-only secure cookie' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between" style={{ padding: '0.625rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-sm text-secondary">{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data & Storage */}
      <div className="card mb-4">
        <div className="card-header">
          <div>
            <div className="card-title">Data & Storage</div>
            <div className="card-subtitle">About your data</div>
          </div>
          <Database size={18} style={{ color: 'var(--color-primary-500)' }} />
        </div>

        <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--border-radius)', padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <p>✅ <strong>All your data</strong> (tasks, notes, goals) is stored locally in your browser using <code>localStorage</code>.</p>
          <p style={{ marginTop: '0.5rem' }}>🔒 Data is namespaced by your Google account ID (<code>myspace_user_{'{sub}'}_*</code>), so each account has private, isolated data.</p>
          <p style={{ marginTop: '0.5rem' }}>💡 Logging out does not delete your data. It will be available again when you sign back in.</p>
          <p style={{ marginTop: '0.5rem' }}>⚠️ LocalStorage is device and browser-specific. Data does not sync between devices.</p>
        </div>
      </div>

      {/* Logout */}
      <div className="card" style={{ border: '1px solid #fecaca' }}>
        <div className="card-header" style={{ marginBottom: '0.5rem' }}>
          <div>
            <div className="card-title">Sign Out</div>
            <div className="card-subtitle">You will be redirected to the login page</div>
          </div>
        </div>
        <button className="btn btn-danger" onClick={handleLogout}>
          Sign Out of MySpace
        </button>
      </div>
    </div>
  );
}

