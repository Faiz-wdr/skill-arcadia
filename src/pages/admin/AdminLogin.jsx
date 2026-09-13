import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signIn, getSession } from '../../services/authService';
import { IconLock, IconArrowRight, IconArrowLeft, IconAlertCircle } from '../../components/admin/AdminIcons';
import '../../styles/admin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  // If already logged in, redirect directly to admin
  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        navigate(from, { replace: true });
      }
    });
  }, [navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Invalid login credentials.');
      return;
    }

    navigate(from, { replace: true });
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div
            style={{
              display: 'inline-flex',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(22, 136, 255, 0.08)',
              color: '#1688FF',
              marginBottom: '8px'
            }}
          >
            <IconLock size={22} />
          </div>
          <h1 className="admin-login-title">Admin Login</h1>
        </div>

        {errorMsg && (
          <div className="admin-alert admin-alert-error">
            <IconAlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              htmlFor="adminEmail"
              style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}
            >
              Email Address
            </label>
            <input
              type="email"
              id="adminEmail"
              className="admin-input"
              placeholder="admin@skillarcadia.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              htmlFor="adminPassword"
              style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text-secondary)' }}
            >
              Password
            </label>
            <input
              type="password"
              id="adminPassword"
              className="admin-input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={loading}
            style={{ width: '100%', height: 46, marginTop: 8 }}
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <IconArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <a
            href="/"
            style={{
              fontSize: '0.8125rem',
              color: 'var(--admin-text-secondary)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <IconArrowLeft size={14} />
            <span>Back to Public Website</span>
          </a>
        </div>
      </div>
    </div>
  );
}
