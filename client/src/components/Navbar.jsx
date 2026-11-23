// client/src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { greeting } from '../utils/dates';

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  return (
    <div className="clock-widget">
      <div className="clock-time">{time}</div>
      <div className="clock-date">{date}</div>
    </div>
  );
}

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div>
          <div className="navbar-greeting">
            {greeting()}, {user?.givenName || user?.name?.split(' ')[0] || 'there'} 👋
          </div>
          <div className="navbar-subtext">Here's your productivity overview</div>
        </div>
      </div>

      <div className="navbar-right">
        <LiveClock />
        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        {user?.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--color-primary-500)', objectFit: 'cover', cursor: 'pointer' }}
          />
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
      </div>
    </header>
  );
}

