import React from 'react';
import { motion } from 'framer-motion';

const BTN = {
  width: 30,
  height: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 9,
  fontSize: 11,
  fontWeight: 700,
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  userSelect: 'none',
};

function PageBtn({ children, active, disabled, onClick }) {
  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        ...BTN,
        background: active
          ? 'linear-gradient(135deg,#6366f1,#3b82f6)'
          : '#f1f5f9',
        color: active ? '#ffffff' : '#64748b',
        boxShadow: active ? '0 3px 10px rgba(99,102,241,0.45)' : 'none',
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      whileHover={!disabled && !active ? { background: '#e0e7ff', color: '#4f46e5', y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
      transition={{ duration: 0.13 }}
    >
      {children}
    </motion.button>
  );
}

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= Math.min(totalPages, 5); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center gap-1">
      <PageBtn disabled={page === 1} onClick={() => onPageChange(Math.max(1, page - 1))}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <polyline points="8,2 4,6 8,10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </PageBtn>

      {pages.map(p => (
        <PageBtn key={p} active={p === page} onClick={() => onPageChange(p)}>
          {p}
        </PageBtn>
      ))}

      {totalPages > 5 && (
        <>
          <span style={{ color: '#94a3b8', fontSize: 12, padding: '0 2px' }}>…</span>
          <PageBtn active={page === totalPages} onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </PageBtn>
        </>
      )}

      <PageBtn disabled={page === totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <polyline points="4,2 8,6 4,10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </PageBtn>
    </div>
  );
}
