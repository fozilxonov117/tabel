import React from 'react';
import { motion } from 'framer-motion';
import { GROUP_NAMES } from '../data/mockData';

export default function GroupTabs({ activeGroup, onGroupChange }) {
  return (
    <div
      className="px-5 flex items-center gap-1"
      style={{
        height: 44,
        background: '#f0f9ff',
        borderBottom: '1px solid #bae6fd',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
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
        color: active ? '#ffffff' : '#64748b',
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
            background: '#0ea5e9',
            boxShadow: '0 0 12px rgba(14,165,233,0.4)',
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
            background: 'rgba(14,165,233,0.12)',
            border: '1px solid rgba(14,165,233,0.3)',
          }}
          transition={{ duration: 0.15 }}
        />
      )}

      <span className="relative z-10">{group}</span>
    </motion.button>
  );
}
