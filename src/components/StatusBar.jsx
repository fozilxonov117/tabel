import React from 'react';
import { motion } from 'framer-motion';

const LAST_SYNC = 'OCT 25, 14:22:01';
const SOURCE = 'PBX INTERNAL API V2.4';

export default function StatusBar({ totalFiltered, totalAll }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-4 py-2 flex items-center justify-between gap-4"
      style={{
        height: 46,
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        flexShrink: 0,
      }}
    >
      {/* Left: legend chips */}
      <div className="flex items-center gap-4">
        <LegendChip color="#fee2e2" dot="#dc2626" label="Requires Card Check" />
      </div>

      {/* Center: source info */}
      <div className="flex items-center gap-2" style={{ fontSize: 10, color: '#94a3b8' }}>
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: '#4ade80', boxShadow: '0 0 6px #4ade80' }}
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        />
        <span style={{ fontWeight: 500 }}>SOURCE:</span>
        <span style={{ color: '#64748b', fontWeight: 700 }}>{SOURCE}</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span style={{ fontWeight: 500 }}>LAST SYNC:</span>
        <span style={{ color: '#64748b', fontWeight: 700 }}>{LAST_SYNC}</span>
      </div>

      {/* Right: total agent count */}
      <div className="flex items-center gap-3">
        <span style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>
          <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{totalFiltered}</strong>
          {totalFiltered !== totalAll && (
            <span> of <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{totalAll}</strong></span>
          )}
          {' '}Agents
        </span>
      </div>
    </motion.div>
  );
}

function LegendChip({ color, dot, label }) {
  return (
    <motion.div
      className="flex items-center gap-1.5"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.15 }}
    >
      <span
        className="inline-flex items-center justify-center w-[18px] h-[18px] rounded"
        style={{
          background: color,
          boxShadow: `0 0 0 1.5px ${dot}66`,
        }}
      >
        <span className="w-2 h-2 rounded-full" style={{ background: dot }} />
      </span>
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#64748b',
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}

