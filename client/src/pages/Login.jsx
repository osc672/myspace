// client/src/pages/Login.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Zap, CheckCircle, Shield, Database, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const FEATURES = [
  { icon: Shield,     text: 'Secure OAuth 2.0' },
  { icon: Database,   text: 'Private local data' },
  { icon: CheckCircle, text: 'Task management' },
  { icon: Smartphone, text: 'Responsive design' },
];

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [gisReady, setGisReady] = useState(false);
  const btnRef = useRef(null);

  // Initialize Google Identity Services
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    let intervalId = null;

    function initGis() {
      if (window.google?.accounts?.id) {
        clearInterval(intervalId);
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (btnRef.current) {
            btnRef.current.innerHTML = ''; // clear any previous button
            window.google.accounts.id.renderButton(btnRef.current, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: 340,
            });
          }
          setGisReady(true);
        } catch (err) {
          console.error('[GIS] Error initializing:', err);
        }
      }
    }

    if (window.google?.accounts?.id) {
      initGis();
    } else {
      intervalId = setInterval(initGis, 200);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  async function handleGoogleResponse(response) {
    if (!response?.credential) {
      addToast('No credential received from Google', 'error');
      return;
    }
    setLoading(true);
    try {
      await login(response.credential);
      addToast('Welcome to MySpace! 🎉', 'success');
    } catch (err) {
      addToast(err.message || 'Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleManualGoogleClick() {
    if (!GOOGLE_CLIENT_ID) {
      addToast('Google Client ID is missing. Restart Vite after setting .env.local.', 'error');
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      addToast('Loading Google Sign-In... Please wait a moment.', 'warning');
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <Zap size={32} color="#fff" />
        </div>

        <h1 className="login-title">MySpace</h1>
        <p className="login-subtitle">Your personal productivity dashboard</p>

        {/* Google Identity Services Button */}
        <div style={{ minHeight: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div ref={btnRef} style={{ display: gisReady ? 'flex' : 'none', justifyContent: 'center', width: '100%' }} />
          {!gisReady && (
            <button
              className="google-btn"
              onClick={handleManualGoogleClick}
              disabled={loading}
            >
              {loading ? (
                <div className="spinner" style={{ width: 20, height: 20 }} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              )}
              {loading ? 'Signing in…' : 'Connecting to Google…'}
            </button>
          )}
        </div>

        <div className="login-divider">
          <div className="login-divider-line" />
          <span className="login-divider-text">Everything is private</span>
          <div className="login-divider-line" />
        </div>

        <div className="login-features">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="login-feature">
              <Icon size={14} style={{ color: 'rgba(255,255,255,0.7)', flexShrink: 0 }} />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {!GOOGLE_CLIENT_ID && (
          <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '0.5rem', fontSize: '0.8125rem', color: '#fca5a5', textAlign: 'center' }}>
            ⚠️ <strong>Setup required:</strong> Add <code>VITE_GOOGLE_CLIENT_ID</code> to your <code>.env</code> file. See README for instructions.
          </div>
        )}
      </div>
    </div>
  );
}

