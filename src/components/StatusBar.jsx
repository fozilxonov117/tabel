import React from 'react';
import { motion } from 'framer-motion';
import Pagination from './Pagination';

const LAST_SYNC = 'OCT 25, 14:22:01';
const SOURCE = 'PBX INTERNAL API V2.4';

export default function StatusBar({ page, perPage, totalFiltered, totalAll, totalPages, onPageChange }) {
  const startRow = totalFiltered === 0 ? 0 : (page - 1) * perPage + 1;
  const endRow = Math.min(page * perPage, totalFiltered);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-4 py-2 flex items-center justify-between gap-4"
      style={{
        height: 46,
        background: '#ffffff',
        borderTop: '1px solid #e8eaf0',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
      }}
    >
      {/* Left: legend chips */}
      <div className="flex items-center gap-4">
        <LegendChip color="#fef9c3" dot="#ca8a04" label="Manual Input" />
        <LegendChip color="#dcfce7" dot="#16a34a" label="Threshold Achieved" />
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
        <span style={{ opacity: 0.4 }}>В·</span>
        <span style={{ fontWeight: 500 }}>LAST SYNC:</span>
        <span style={{ color: '#64748b', fontWeight: 700 }}>{LAST_SYNC}</span>
      </div>

      {/* Right: count + pagination */}
      <div className="flex items-center gap-3">
        <span style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>
          Displaying{' '}
          <strong style={{ color: '#1e293b', fontWeight: 700 }}>{startRow}вЂ“{endRow}</strong>
          {' '}of{' '}
          <strong style={{ color: '#1e293b', fontWeight: 700 }}>{totalAll}</strong>
          {' '}Agents
        </span>
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
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
