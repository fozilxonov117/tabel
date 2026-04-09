import React from 'react';
import { motion } from 'framer-motion';
import { GROUP_NAMES } from '../data/mockData';
import { useLang } from '../i18n/LangContext';
import { useTheme } from '../i18n/ThemeContext';
import DarkModeToggle from './DarkModeToggle';

const ALL_BRANCHES = ['All', ...GROUP_NAMES];
const LANGS = ['EN', 'RU', 'UZ'];

export default function Header({ activeGroup, onGroupChange }) {
  const { lang, setLang } = useLang();
  const { dark, toggleDark } = useTheme();

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
      {/* Left: Branch tabs */}
      <div className="flex items-center gap-1">
        {ALL_BRANCHES.map(group => (
          <BranchTab
            key={group}
            group={group}
            active={activeGroup === group}
            onClick={() => onGroupChange(group)}
          />
        ))}
      </div>

      {/* Right: Dark toggle + Language toggle + Avatar */}
      <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
        <DarkModeToggle dark={dark} onToggle={toggleDark} />
        {/* Language toggle */}
        <div className="flex items-center gap-0.5" style={{
          background: '#f1f5f9',
          border: '1px solid #e2e8f0',
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

        {/* Avatar */}
        <motion.div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: '#e0f2fe',
            border: '2px solid #bae6fd',
            boxShadow: 'none',
          }}
          whileHover={{ scale: 1.08, boxShadow: '0 0 10px rgba(14,165,233,0.25)' }}
          transition={{ duration: 0.2 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="8" r="4" fill="#94a3b8" />
            <ellipse cx="10" cy="17" rx="7" ry="4" fill="#94a3b8" />
          </svg>
        </motion.div>
      </div>
    </header>
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
