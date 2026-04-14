import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GROUP_NAMES, HEADER_SECTIONS } from '../data/mockData';
import { useLang } from '../i18n/LangContext';
import { useTheme } from '../i18n/ThemeContext';
import DarkModeToggle from './DarkModeToggle';

const LANGS = ['EN', 'RU', 'UZ'];

export default function Header({ activeGroup, onGroupChange, onLogout }) {
  const { lang, setLang } = useLang();
  const { dark, toggleDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [openSection, setOpenSection] = useState(null);
  const secRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  useEffect(() => {
    function handler(e) {
      if (secRef.current && !secRef.current.contains(e.target)) setOpenSection(null);
    }
    if (openSection) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openSection]);

  return (
    <header
      className="flex items-center justify-between px-5 gap-4"
      style={{
        height: 52,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        color: 'var(--text-primary)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        zIndex: 50,
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Left: All tab + Section dropdowns */}
      <div className="flex items-center gap-1" ref={secRef}>
        <BranchTab group="All" active={activeGroup === 'All'} onClick={() => { onGroupChange('All'); setOpenSection(null); }} />
        {HEADER_SECTIONS.map(sec => {
          const isActive = sec.groups.includes(activeGroup);
          const isOpen = openSection === sec.label;
          return (
            <div key={sec.label} style={{ position: 'relative' }}>
              <SectionTab
                label={sec.label}
                active={isActive}
                open={isOpen}
                subLabel={isActive && activeGroup !== 'All' ? activeGroup : null}
                onClick={() => setOpenSection(isOpen ? null : sec.label)}
              />
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    key={sec.label + '-dd'}
                    initial={{ opacity: 0, scale: 0.94, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: -6 }}
                    transition={{ duration: 0.14, ease: [0.4, 0, 0.2, 1] }}
                    style={{
                      position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 11,
                      boxShadow: dark
                        ? '0 8px 32px rgba(0,0,0,0.55)'
                        : '0 8px 28px rgba(0,0,0,0.10)',
                      padding: '5px',
                      minWidth: 150,
                      zIndex: 9999,
                      transformOrigin: 'top left',
                    }}
                  >
                    <style>{`
                      .sec-dd-item { transition: background 0.1s; border-radius: 7px; }
                      .sec-dd-item:hover { background: ${dark ? '#1a2a3a' : '#f0f9ff'}; }
                    `}</style>
                    {sec.groups.map(g => (
                      <button
                        key={g}
                        className="sec-dd-item"
                        onClick={() => { onGroupChange(g); setOpenSection(null); }}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '6px 12px',
                          background: activeGroup === g ? (dark ? '#0c2a3a' : '#e0f2fe') : 'transparent',
                          border: 'none', cursor: 'pointer',
                          fontSize: 12, fontWeight: activeGroup === g ? 700 : 500,
                          color: activeGroup === g ? '#0ea5e9' : 'var(--text-primary)',
                          fontFamily: "'Inter', system-ui, sans-serif",
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Right: Dark toggle + Language toggle + Avatar */}
      <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
        <DarkModeToggle dark={dark} onToggle={toggleDark} />
        {/* Language toggle */}
        <div className="flex items-center gap-0.5" style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '2px 3px',
        }}>
          {LANGS.map(l => {
            const active = lang === l.toLowerCase();
            return (
              <motion.button
                key={l}
                onClick={() => setLang(l.toLowerCase())}
                whileTap={{ scale: 0.92 }}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  background: active ? '#0ea5e9' : 'transparent',
                  color: active ? '#ffffff' : '#64748b',
                  boxShadow: active ? '0 1px 4px rgba(14,165,233,0.3)' : 'none',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {l}
              </motion.button>
            );
          })}
        </div>

        {/* Avatar + user dropdown */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <motion.div
            onClick={() => setMenuOpen(v => !v)}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: menuOpen
                ? (dark ? '#0c2a3a' : '#e0f2fe')
                : (dark ? '#1c1c1c' : '#e0f2fe'),
              border: menuOpen
                ? `2px solid #0ea5e9`
                : `2px solid ${dark ? '#2a2a2a' : '#bae6fd'}`,
              cursor: 'pointer',
              boxShadow: menuOpen ? '0 0 0 3px rgba(14,165,233,0.18)' : 'none',
              transition: 'background 0.18s, border-color 0.18s, box-shadow 0.18s',
            }}
            whileHover={{ scale: 1.08, boxShadow: '0 0 10px rgba(14,165,233,0.25)' }}
            transition={{ duration: 0.2 }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="8" r="4" fill={menuOpen ? (dark ? '#38bdf8' : '#0ea5e9') : '#94a3b8'} />
              <ellipse cx="10" cy="17" rx="7" ry="4" fill={menuOpen ? (dark ? '#38bdf8' : '#0ea5e9') : '#94a3b8'} />
            </svg>
          </motion.div>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                key="user-menu"
                initial={{ opacity: 0, scale: 0.93, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: -6 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 200,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 13,
                  boxShadow: dark
                    ? '0 8px 32px rgba(0,0,0,0.55)'
                    : '0 8px 28px rgba(0,0,0,0.10)',
                  overflow: 'hidden',
                  zIndex: 9999,
                  transformOrigin: 'top right',
                }}
              >
                {/* User info */}
                <div style={{
                  padding: '14px 14px 10px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                    background: dark ? '#0c2a3a' : '#e0f2fe',
                    border: `1.5px solid ${dark ? '#1e4a6a' : '#bae6fd'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="8" r="4" fill={dark ? '#38bdf8' : '#0ea5e9'} />
                      <ellipse cx="10" cy="17" rx="7" ry="4" fill={dark ? '#38bdf8' : '#0ea5e9'} />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>admin</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>Администратор</div>
                  </div>
                </div>

                {/* Logout button */}
                <div style={{ padding: '6px 6px' }}>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout?.();
                    }}
                    style={{
                      width: '100%', padding: '8px 10px',
                      display: 'flex', alignItems: 'center', gap: 9,
                      background: 'none', border: 'none', borderRadius: 8,
                      cursor: 'pointer', textAlign: 'left',
                      fontSize: 12, fontWeight: 600,
                      color: dark ? '#f87171' : '#dc2626',
                      transition: 'background 0.12s',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = dark ? '#2a0a0a' : '#fef2f2'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Выйти из системы
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function SectionTab({ label, active, open, subLabel, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      className="relative px-3 py-1.5 text-xs font-bold rounded-full select-none outline-none"
      style={{
        color: active || open ? '#ffffff' : '#64748b',
        cursor: 'pointer',
        border: 'none',
        background: active || open ? '#0ea5e9' : 'transparent',
        boxShadow: active || open ? '0 0 10px rgba(14,165,233,0.35)' : 'none',
        display: 'flex', alignItems: 'center', gap: 4,
        transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
      }}
    >
      {!active && !open && (
        <motion.span
          className="absolute inset-0 rounded-full"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          style={{
            background: 'rgba(14,165,233,0.15)',
            border: '1px solid rgba(14,165,233,0.3)',
          }}
          transition={{ duration: 0.15 }}
        />
      )}
      <span className="relative z-10" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {label}
        {subLabel && (
          <span style={{
            fontSize: 9, fontWeight: 600, opacity: 0.85,
            background: 'rgba(255,255,255,0.2)', borderRadius: 4,
            padding: '1px 4px', lineHeight: 1.2,
          }}>
            {subLabel}
          </span>
        )}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.15s',
        }}>
          <path d="M2.5 3.5L5 6.5L7.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </motion.button>
  );
}

function BranchTab({ group, active, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      className="relative px-4 py-1.5 text-xs font-bold rounded-full select-none outline-none"
      style={{
        color: active ? '#ffffff' : '#64748b',
        minWidth: 44,
        cursor: 'pointer',
        border: 'none',
        background: 'transparent',
      }}
    >
      {active && (
        <motion.span
          layoutId="branch-pill"
          className="absolute inset-0 rounded-full"
          style={{
            background: '#0ea5e9',
            boxShadow: '0 0 10px rgba(14,165,233,0.35)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      {!active && (
        <motion.span
          className="absolute inset-0 rounded-full"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          style={{
            background: 'rgba(14,165,233,0.15)',
            border: '1px solid rgba(14,165,233,0.3)',
          }}
          transition={{ duration: 0.15 }}
        />
      )}
      <span className="relative z-10">{group}</span>
    </motion.button>
  );
}
