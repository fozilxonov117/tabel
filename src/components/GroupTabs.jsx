import React from 'react';
import { motion } from 'framer-motion';
import { GROUP_NAMES } from '../data/mockData';

export default function GroupTabs({ activeGroup, onGroupChange }) {
  return (
    <div
      className="px-5 flex items-center gap-1"
      style={{
        height: 44,
        background: 'linear-gradient(135deg, #1e293b 0%, #1e3a5f 100%)',
        borderBottom: '1px solid rgba(99,102,241,0.2)',
        boxShadow: '0 3px 12px rgba(0,0,0,0.25)',
      }}
    >
      <span
        style={{
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: '0.13em',
          textTransform: 'uppercase',
          color: 'rgba(148,163,184,0.5)',
          marginRight: 8,
          userSelect: 'none',
        }}
      >
        Branch
      </span>

      {GROUP_NAMES.map(group => (
        <GroupTab
          key={group}
          group={group}
          active={activeGroup === group}
          onClick={() => onGroupChange(group)}
        />
      ))}
    </div>
  );
}

function GroupTab({ group, active, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      className="relative px-4 py-1.5 text-xs font-bold rounded-full select-none outline-none"
      style={{
        color: active ? '#ffffff' : 'rgba(203,213,225,0.65)',
        minWidth: 52,
        cursor: 'pointer',
        border: 'none',
        background: 'transparent',
      }}
    >
      {/* Animated active background */}
      {active && (
        <motion.span
          layoutId="branch-pill"
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #3b82f6 100%)',
            boxShadow: '0 0 18px rgba(99,102,241,0.65), 0 2px 8px rgba(0,0,0,0.3)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      {/* Hover background for inactive */}
      {!active && (
        <motion.span
          className="absolute inset-0 rounded-full"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          style={{
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
          }}
          transition={{ duration: 0.15 }}
        />
      )}

      <span className="relative z-10">{group}</span>
    </motion.button>
  );
}
