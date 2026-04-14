import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../i18n/ThemeContext';

const CREDENTIALS = { username: 'admin', password: '#123' };

export default function LoginPage({ onLogin }) {
  const { dark, toggleDark } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
        try { sessionStorage.setItem('auth', '1'); sessionStorage.setItem('loggedInUser', username); } catch {}
        onLogin();
      } else {
        setError('Неверный логин или пароль');
        setLoading(false);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }, 380);
  };

  const fieldStyle = (hasError) => ({
    width: '100%',
    paddingTop: 9, paddingBottom: 9, paddingRight: 12,
    fontSize: 13, fontWeight: 500,
    background: 'var(--input-bg)',
    border: `1.5px solid ${hasError ? '#fca5a5' : 'var(--border)'}`,
    borderRadius: 9,
    color: 'var(--text-primary)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    fontFamily: "'Inter', system-ui, sans-serif",
  });

  const onFocus = (e) => {
    e.target.style.borderColor = '#0ea5e9';
    e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.12)';
  };
  const onBlur = (e) => {
    e.target.style.borderColor = error ? '#fca5a5' : 'var(--border)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--app-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Dark/light mode toggle */}
      <button
        onClick={toggleDark}
        className="theme-toggle-btn"
        title={dark ? 'Светлая тема' : 'Тёмная тема'}
        style={{
          position: 'fixed', top: 14, right: 14,
          width: 34, height: 34, borderRadius: 9,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 100,
          transition: 'background 0.15s, color 0.15s',
        }}
      >
        {dark ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </button>

      {/* Subtle grid background pattern */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: dark
          ? 'radial-gradient(circle at 1px 1px, #ffffff08 1px, transparent 0)'
          : 'radial-gradient(circle at 1px 1px, #00000008 1px, transparent 0)',
        backgroundSize: '28px 28px',
      }} />

      {/* Glow blobs */}
      <div style={{
        position: 'fixed', top: '-10%', left: '30%',
        width: 500, height: 500, borderRadius: '50%',
        background: dark
          ? 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(14,165,233,0.09) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '-10%', right: '20%',
        width: 400, height: 400, borderRadius: '50%',
        background: dark
          ? 'radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Card */}
      <motion.div
        animate={shake ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.45 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          style={{
            width: 360,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 18,
            padding: '32px 28px 28px',
            boxShadow: dark
              ? '0 8px 48px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.04) inset'
              : '0 8px 40px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          {/* Logo + title */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3, ease: 'backOut' }}
              style={{
                width: 50, height: 50, borderRadius: 14,
                background: dark ? '#0c2a3a' : '#e0f2fe',
                border: `1.5px solid ${dark ? '#1e4a6a' : '#bae6fd'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
                boxShadow: dark ? '0 4px 20px rgba(14,165,233,0.15)' : '0 4px 16px rgba(14,165,233,0.18)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={dark ? '#38bdf8' : '#0ea5e9'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2.5"/>
                <path d="M16 2v4M8 2v4M3 10h18"/>
                <path d="M8 14h2M8 17.5h5"/>
              </svg>
            </motion.div>
            <h1 style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 5px', letterSpacing: '-0.02em' }}>
              Табель
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
              Система учёта заработной платы
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Username */}
            <div>
              <label style={{
                fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                display: 'block', marginBottom: 6,
                textTransform: 'uppercase', letterSpacing: '0.07em',
              }}>
                Логин
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="admin"
                  autoComplete="username"
                  style={{ ...fieldStyle(!!error), paddingLeft: 32 }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{
                fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                display: 'block', marginBottom: 6,
                textTransform: 'uppercase', letterSpacing: '0.07em',
              }}>
                Пароль
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="••••••"
                  autoComplete="current-password"
                  style={{ ...fieldStyle(!!error), paddingLeft: 32, paddingRight: 38 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', display: 'flex', padding: 4,
                    lineHeight: 0,
                  }}
                  title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="err"
                  initial={{ opacity: 0, height: 0, marginTop: -8 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                  exit={{ opacity: 0, height: 0, marginTop: -8 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    background: dark ? '#1f0808' : '#fef2f2',
                    border: `1px solid ${dark ? '#4c1010' : '#fca5a5'}`,
                    borderRadius: 8, padding: '7px 11px',
                    fontSize: 12, fontWeight: 600,
                    color: dark ? '#f87171' : '#dc2626',
                    display: 'flex', alignItems: 'center', gap: 7,
                    overflow: 'hidden',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4M12 16h.01"/>
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 2,
                width: '100%', padding: '10px 0',
                background: '#0ea5e9',
                color: '#fff',
                border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: 700,
                cursor: loading ? 'default' : 'pointer',
                letterSpacing: '0.02em',
                boxShadow: '0 2px 10px rgba(14,165,233,0.30)',
                opacity: loading ? 0.75 : 1,
                transition: 'opacity 0.15s, box-shadow 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              {loading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.7s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Вход...
                </>
              ) : (
                <>
                  Войти
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6"/>
                  </svg>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
