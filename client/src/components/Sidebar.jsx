// client/src/components/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, FileText, Target,
  Calendar, Settings, User, LogOut, Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks',     icon: CheckSquare,     label: 'Tasks' },
  { to: '/notes',     icon: FileText,        label: 'Notes' },
  { to: '/goals',     icon: Target,          label: 'Daily Goals' },
  { to: '/calendar',  icon: Calendar,        label: 'Calendar' },
];

const BOTTOM_ITEMS = [
  { to: '/profile',  icon: User,     label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    addToast('Logged out successfully', 'info');
    navigate('/login');
  }

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Zap size={22} color="#fff" />
        </div>
        <span className="sidebar-brand-text">MySpace</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <Icon size={18} className="nav-link-icon" />
            {label}
          </NavLink>
        ))}

        <div className="nav-section-label" style={{ marginTop: '1.5rem' }}>Account</div>
        {BOTTOM_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <Icon size={18} className="nav-link-icon" />
            {label}
          </NavLink>
        ))}

        <button className="nav-link" style={{ width: '100%', textAlign: 'left' }} onClick={handleLogout}>
          <LogOut size={18} className="nav-link-icon" />
          Logout
        </button>
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <NavLink to="/profile" className="sidebar-user" onClick={onClose}>
          {user?.picture ? (
            <img src={user.picture} alt={user.name} className="sidebar-avatar" />
          ) : (
            <div className="sidebar-avatar" style={{ background: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'User'}</div>
            <div className="sidebar-user-email">{user?.email || ''}</div>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}

