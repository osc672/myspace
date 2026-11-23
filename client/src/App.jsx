// client/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

import Login    from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks    from './pages/Tasks';
import Notes    from './pages/Notes';
import Goals    from './pages/Goals';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import Profile  from './pages/Profile';
import AppLayout from './components/AppLayout';

// Protected route wrapper
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" style={{ width: 40, height: 40 }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading MySpace…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={
                <PublicRoute><Login /></PublicRoute>
              } />
              <Route element={
                <PrivateRoute><AppLayout /></PrivateRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks"     element={<Tasks />} />
                <Route path="/notes"     element={<Notes />} />
                <Route path="/goals"     element={<Goals />} />
                <Route path="/calendar"  element={<Calendar />} />
                <Route path="/settings"  element={<Settings />} />
                <Route path="/profile"   element={<Profile />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

