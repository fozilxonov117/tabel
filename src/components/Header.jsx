import React from 'react';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <header
      className="flex items-center justify-between px-5"
      style={{
        height: 52,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #1e3a5f 100%)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
        zIndex: 50,
        position: 'relative',
      }}
    >
      {/* Left: logo + title + nav */}
      <div className="flex items-center gap-0">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2.5 pr-5 mr-4"
          style={{ height: 52, borderRight: '1px solid rgba(255,255,255,0.08)' }}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              boxShadow: '0 0 16px rgba(99,102,241,0.65)',
            }}
            whileHover={{ scale: 1.1, boxShadow: '0 0 24px rgba(99,102,241,0.85)' }}
            transition={{ duration: 0.2 }}
          >
            <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.2" fill="white" />
              <rect x="9" y="1" width="6" height="6" rx="1.2" fill="white" opacity="0.7" />
              <rect x="1" y="9" width="6" height="6" rx="1.2" fill="white" opacity="0.7" />
              <rect x="9" y="9" width="6" height="6" rx="1.2" fill="white" opacity="0.45" />
            </svg>
          </motion.div>
          <div>
            <div className="font-bold text-sm whitespace-nowrap" style={{ color: '#e2e8f0', letterSpacing: '-0.01em' }}>
              Agent Payroll Matrix
            </div>
            <div className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: 'rgba(148,163,184,0.5)' }}>
              Management Console
            </div>
          </div>
        </motion.div>

        {/* Nav */}
        <nav className="flex items-center" style={{ height: 52 }}>
          <NavLink active>Master View</NavLink>
          <NavLink>Historical Data</NavLink>
          <NavLink>Reports</NavLink>
        </nav>
      </div>

      {/* Right */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Online indicator */}
        <div className="flex items-center gap-1.5" style={{ color: 'rgba(148,163,184,0.6)', fontSize: 10 }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px #34d399' }} />
          <span className="font-semibold tracking-wide">LIVE</span>
        </div>

        {/* Avatar */}
        <motion.div
          className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #475569, #334155)',
            border: '2px solid rgba(99,102,241,0.5)',
            boxShadow: '0 0 10px rgba(99,102,241,0.3)',
          }}
          whileHover={{ scale: 1.08, boxShadow: '0 0 16px rgba(99,102,241,0.55)' }}
          transition={{ duration: 0.2 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="8" r="4" fill="#94a3b8" />
            <ellipse cx="10" cy="17" rx="7" ry="4" fill="#94a3b8" />
          </svg>
        </motion.div>

        {/* Setup button */}
        <SetupButton />
      </motion.div>
    </header>
  );
}

function SetupButton() {
  return (
    <motion.button
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.13)',
        borderRadius: 8,
        color: '#cbd5e1',
        cursor: 'pointer',
      }}
      whileHover={{
        background: 'rgba(99,102,241,0.2)',
        borderColor: 'rgba(99,102,241,0.5)',
        color: '#e0e7ff',
        y: -1,
      }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15 }}
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.3" />
      </svg>
      Setup
    </motion.button>
  );
}

function NavLink({ children, active }) {
  return (
    <motion.a
      href="#"
      className="px-3 text-sm font-medium flex items-center relative"
      style={{
        height: 52,
        color: active ? '#a5b4fc' : 'rgba(203,213,225,0.65)',
        textDecoration: 'none',
      }}
      whileHover={{ color: active ? '#a5b4fc' : '#e2e8f0' }}
      transition={{ duration: 0.15 }}
      onClick={e => e.preventDefault()}
    >
      {children}
      {/* Active underline */}
      {active && (
        <motion.span
          layoutId="nav-underline"
          className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
          style={{ background: 'linear-gradient(90deg, #6366f1, #818cf8)' }}
        />
      )}
    </motion.a>
  );
}
