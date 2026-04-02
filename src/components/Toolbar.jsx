import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Toolbar({ searchQuery, onSearchChange, onExport, visibleColumns, onColumnToggle, onRefresh }) {
  const [columnsOpen, setColumnsOpen] = useState(false);
  const colRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (colRef.current && !colRef.current.contains(e.target)) {
        setColumnsOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      className="px-4 py-2.5 flex items-center justify-between gap-3"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e8eaf0',
        boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
      }}
    >
      {/* в”Ђв”Ђ Search в”Ђв”Ђ */}
      <div className="flex items-center gap-2 flex-1 max-w-sm">
        <SearchInput value={searchQuery} onChange={onSearchChange} />
      </div>

      {/* в”Ђв”Ђ Filter + Refresh в”Ђв”Ђ */}
      <div className="flex items-center gap-2">
        <FiltersBtn />
        <RefreshBtn onClick={onRefresh} />
      </div>

      {/* в”Ђв”Ђ Columns + Export в”Ђв”Ђ */}
      <div className="flex items-center gap-2">
        <div className="relative" ref={colRef}>
          <ToolbarBtn
            active={columnsOpen}
            onClick={() => setColumnsOpen(c => !c)}
            icon={
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1" y="1" width="4" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
                <rect x="8" y="1" width="4" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            }
          >
            Columns
          </ToolbarBtn>

          <AnimatePresence>
            {columnsOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: -8 }}
                transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                className="absolute right-0 top-10 z-50 p-3.5"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 14,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)',
                  minWidth: 196,
                  transformOrigin: 'top right',
                }}
              >
                <p
                  className="mb-2.5 font-black uppercase tracking-widest"
                  style={{ fontSize: 9, color: '#94a3b8' }}
                >
                  Toggle Columns
                </p>
                {Object.keys(visibleColumns).map((col, i) => (
                  <motion.label
                    key={col}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-2.5 py-1 cursor-pointer group"
                  >
                    <span
                      onClick={() => onColumnToggle(col)}
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all duration-150"
                      style={{
                        background: visibleColumns[col]
                          ? 'linear-gradient(135deg,#6366f1,#3b82f6)'
                          : '#f1f5f9',
                        border: visibleColumns[col] ? 'none' : '1.5px solid #cbd5e1',
                        boxShadow: visibleColumns[col] ? '0 0 8px rgba(99,102,241,0.35)' : 'none',
                      }}
                    >
                      {visibleColumns[col] && (
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                          <polyline points="1.5,4.5 3.5,6.5 7.5,2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <input
                      type="checkbox"
                      checked={visibleColumns[col]}
                      onChange={() => onColumnToggle(col)}
                      className="sr-only"
                    />
                    <span
                      className="text-xs font-medium transition-colors duration-150"
                      style={{ color: visibleColumns[col] ? '#4f46e5' : '#64748b' }}
                    >
                      {col}
                    </span>
                  </motion.label>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ExportBtn onClick={onExport} />
      </div>
    </div>
  );
}

/* в”Ђв”Ђ Search Input в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
function SearchInput({ value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative flex-1" style={{ minWidth: 220 }}>
      <motion.svg
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        animate={{ color: focused ? '#6366f1' : '#94a3b8' }}
        transition={{ duration: 0.15 }}
        width="14" height="14" viewBox="0 0 14 14" fill="none"
      >
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
        <line x1="9.5" y1="9.5" x2="12.5" y2="12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </motion.svg>

      <motion.input
        type="text"
        placeholder="Search by Agent Name (Р¤РРћ)..."
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full py-2 pl-9 pr-8 text-xs font-medium"
        animate={{
          boxShadow: focused
            ? '0 0 0 3px rgba(99,102,241,0.15), 0 1px 6px rgba(0,0,0,0.06)'
            : '0 1px 4px rgba(0,0,0,0.04)',
        }}
        style={{
          background: focused ? '#ffffff' : '#f8fafc',
          border: `1.5px solid ${focused ? '#6366f1' : '#e2e8f0'}`,
          borderRadius: 10,
          outline: 'none',
          color: '#1e293b',
          transition: 'border-color 0.15s, background 0.15s',
        }}
      />

      {/* Animated clear button */}
      <AnimatePresence>
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
            onClick={() => onChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: '#94a3b8', border: 'none', cursor: 'pointer' }}
            whileHover={{ background: '#6366f1', scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <line x1="1.5" y1="1.5" x2="6.5" y2="6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="6.5" y1="1.5" x2="1.5" y2="6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* в”Ђв”Ђ Shared ToolbarBtn в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
function ToolbarBtn({ children, onClick, active, icon }) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold"
      style={{
        background: active ? '#eef2ff' : '#f8fafc',
        border: `1.5px solid ${active ? '#6366f1' : '#e2e8f0'}`,
        borderRadius: 9,
        color: active ? '#4f46e5' : '#64748b',
        cursor: 'pointer',
      }}
      whileHover={{
        background: '#eef2ff',
        borderColor: '#6366f1',
        color: '#4f46e5',
        y: -1,
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.13 }}
    >
      {icon}
      {children}
    </motion.button>
  );
}

/* в”Ђв”Ђ Filters Button в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
function FiltersBtn() {
  const [active, setActive] = useState(false);
  return (
    <motion.button
      onClick={() => setActive(a => !a)}
      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold"
      style={{
        background: active ? '#eef2ff' : '#f8fafc',
        border: `1.5px solid ${active ? '#6366f1' : '#e2e8f0'}`,
        borderRadius: 9,
        color: active ? '#4f46e5' : '#64748b',
        cursor: 'pointer',
      }}
      whileHover={{ background: '#eef2ff', borderColor: '#6366f1', color: '#4f46e5', y: -1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.13 }}
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <line x1="1" y1="3" x2="12" y2="3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="3" y1="6.5" x2="10" y2="6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="5" y1="10" x2="8" y2="10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      Filters
      <motion.span
        className="text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-black"
        style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)', color: '#fff' }}
        whileHover={{ scale: 1.2 }}
      >
        3
      </motion.span>
    </motion.button>
  );
}

/* в”Ђв”Ђ Refresh Button в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
function RefreshBtn({ onClick }) {
  const [spinning, setSpinning] = useState(false);
  const handleClick = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 650);
    onClick();
  };
  return (
    <motion.button
      onClick={handleClick}
      className="p-2"
      style={{
        background: '#f8fafc',
        border: '1.5px solid #e2e8f0',
        borderRadius: 9,
        color: '#64748b',
        cursor: 'pointer',
      }}
      whileHover={{ background: '#eef2ff', borderColor: '#6366f1', color: '#4f46e5', y: -1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.13 }}
      title="Refresh"
    >
      <motion.svg
        width="13" height="13" viewBox="0 0 13 13" fill="none"
        animate={{ rotate: spinning ? 360 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <path d="M11 6.5A4.5 4.5 0 1 1 6.5 2a4.5 4.5 0 0 1 3.18 1.32L11 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="11,2 11,4.5 8.5,4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </motion.svg>
    </motion.button>
  );
}

/* в”Ђв”Ђ Export CSV Button в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
function ExportBtn({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white"
      style={{
        background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
        border: 'none',
        borderRadius: 9,
        boxShadow: '0 2px 10px rgba(99,102,241,0.4)',
        cursor: 'pointer',
      }}
      whileHover={{
        y: -2,
        boxShadow: '0 6px 20px rgba(99,102,241,0.55)',
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M6.5 1v7M3.5 5.5 6.5 8.5l3-3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1 10h11" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M1 10v2h11v-2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Export CSV
    </motion.button>
  );
}
