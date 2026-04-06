import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fmtTime, fmtNum, computeTotals } from '../data/calculations';

// ── Cyrillic key constants (Unicode escapes – encoding-safe) ──────────────────
const K_ITOG    = '\u0438\u0442\u043e\u0433';             // итог
const K_NARUKI  = '\u043d\u0430\u0420\u0443\u043a\u0438';  // наРуки
const K_NAKARTU = '\u043d\u0430\u041a\u0430\u0440\u0442\u0443'; // наКарту
const K_NALOG   = '\u043d\u0430\u043b\u043e\u0433';       // налог

// ── Column group header definitions ──────────────────────────────────────────
const COL_GROUPS = [
  { label: 'BASIC INFO',         span: 3, color: '#3730a3', bg: '#fffffa' },
  { label: 'CALL METRICS',       span: 5, color: '#1e40af', bg: '#fffffa' },
  { label: 'EFFICIENCY',         span: 3, color: '#4c1d95', bg: '#fffffa' },
  { label: 'ATTENDANCE & BONUS', span: 4, color: '#14532d', bg: '#fffffa' },
  { label: 'LIMITS & GRADES',    span: 2, color: '#0f766e', bg: '#fffffa' },
  { label: 'TOTALS (BI-BK)',     span: 7, color: '#78350f', bg: '#fffffa' },
  { label: 'ALLOWANCES',         span: 6, color: '#5b21b6', bg: '#fffffa' },
];

// ── Individual column definitions ─────────────────────────────────────────────
// All columns are center-aligned. Width values are in pixels.
const COLUMNS = [
  // BASIC INFO
  { key: 'vetka',           label: '\u0412\u0435\u0442\u043a\u0430',                                                          group: 'BASIC INFO',         width: 60,  allGroupOnly: true },
  { key: 'shtat',           label: '\u0428\u0422\u0410\u0422',                                                                 group: 'BASIC INFO',         width: 44  },
  { key: 'name',            label: '\u0424\u0418\u041e (AGENT NAME)',                                                          group: 'BASIC INFO',         width: 240 },
  // CALL METRICS
  { key: 'planCalls',       label: '\u041f\u041b\u0410\u041d \u0417\u0412\u041e\u041d\u041a\u041e\u0412',                  group: 'CALL METRICS',       width: 78  },
  { key: 'factCalls',       label: '\u0424\u0410\u041a\u0422 \u0417\u0412\u041e\u041d\u041a\u041e\u0412',                  group: 'CALL METRICS',       width: 78  },
  { key: 'planTime',        label: '\u041f\u041b\u0410\u041d \u0421\u0412\u041e',                                           group: 'CALL METRICS',       width: 66  },
  { key: 'factTime',        label: '\u0424\u0410\u041a\u0422 \u0421\u0412\u041e',                                           group: 'CALL METRICS',       width: 66  },
  { key: 'perfPct',         label: '% \u0412\u042b\u041f.',                                                                   group: 'CALL METRICS',       width: 62  },
  // EFFICIENCY
  { key: 'factScore',       label: '\u0424\u0410\u041a\u0422 \u0411\u0410\u041b\u041b',                                     group: 'EFFICIENCY',         width: 66  },
  { key: 'explanation',     label: '\u041e\u0411\u042a\u042f\u0421\u041d\u0418\u0422.',                                     group: 'EFFICIENCY',         width: 44  },
  { key: 'vacation',        label: 'VACATION',                                                                               group: 'EFFICIENCY',         width: 290 },
  // ATTENDANCE & BONUS
  { key: 'b1',              label: '%(B1)',                                                                                    group: 'ATTENDANCE & BONUS', width: 54  },
  { key: 'b2',              label: '%(B2)',                                                                                    group: 'ATTENDANCE & BONUS', width: 72  },
  { key: 'surcharge',       label: '\u0421\u0422. \u041d\u0410\u0414.',                                                      group: 'ATTENDANCE & BONUS', width: 60  },
  { key: 'limit',           label: '\u041b\u0418\u041c\u0418\u0422',                                                         group: 'ATTENDANCE & BONUS', width: 60  },
  // LIMITS & GRADES
  { key: 'profitFromOp',    label: '\u041f\u0440\u0438\u0431\u044b\u043b\u044c \u043e\u0442 \u043e\u043f\u0435\u0440\u0430\u0442\u043e\u0440\u0430', group: 'LIMITS & GRADES', width: 100 },
  { key: 'razryad',         label: '\u0420\u0430\u0437\u0440\u044f\u0434',                                                   group: 'LIMITS & GRADES',    width: 62  },
  // TOTALS (BI-BK) — includes former deductions + nadbavka
  { key: K_ITOG,            label: '\u0418\u0422\u041e\u0413',                                                               group: 'TOTALS (BI-BK)',     width: 96  },
  { key: K_NARUKI,          label: '\u041d\u0410 \u0420\u0423\u041a\u0418',                                                  group: 'TOTALS (BI-BK)',     width: 92  },
  { key: K_NAKARTU,         label: '\u041d\u0410 \u041a\u0410\u0420\u0422\u0423',                                           group: 'TOTALS (BI-BK)',     width: 92  },
  { key: K_NALOG,           label: '\u041d\u0410\u041b\u041e\u0413+',                                                       group: 'TOTALS (BI-BK)',     width: 88  },
  { key: 'advance',         label: '\u0410\u0412\u0410\u041d\u0421',                                                        group: 'TOTALS (BI-BK)',     width: 88  },
  { key: 'baseSalary',      label: '\u041e\u041a\u041b\u0410\u0414',                                                        group: 'TOTALS (BI-BK)',     width: 92  },
  { key: 'nadbavka',        label: '\u041d\u0430\u0434\u0431\u0430\u0432\u043a\u0430',                                     group: 'TOTALS (BI-BK)',     width: 92  },
  // ALLOWANCES
  { key: 'noch',            label: '\u041d\u043e\u0447\u044c',                                                              group: 'ALLOWANCES',         width: 72  },
  { key: 'vecher',          label: '\u0412\u0435\u0447\u0435\u0440',                                                        group: 'ALLOWANCES',         width: 72  },
  { key: 'prazdnichny',     label: '\u041f\u0440\u0430\u0437\u0434\u043d\u0438\u0447\u043d\u044b\u0439',                   group: 'ALLOWANCES',         width: 90  },
  { key: 'stoimostBiletov', label: '\u0421\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c \u0431\u0438\u043b\u0435\u0442\u043e\u0432', group: 'ALLOWANCES',  width: 100 },
  { key: 'addBonus',        label: '\u0410\u0414\u0414',                                                                     group: 'ALLOWANCES',         width: 64  },
  { key: 'vyslugaLet',      label: '\u0412\u044b\u0441\u043b\u0443\u0433\u0430 \u043b\u0435\u0442',                       group: 'ALLOWANCES',         width: 90  },
];

// Keys whose zero value displays as '–' in cells
const DASH_IF_ZERO = new Set(['profitFromOp', 'noch', 'vecher', 'prazdnichny', 'stoimostBiletov', 'addBonus']);

// ── Explanation badge metadata ─────────────────────────────────────────────
const EXPL_META = {
  '\u041e\u043f\u043e\u0437\u0434\u0430\u043d\u0438\u0435': {
    color: '#92400e', bg: '#fef3c7', border: '#fcd34d',
    icon: (<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  },
  '\u041e\u0442\u043f\u0440\u0430\u0448\u0438\u0432\u0430\u043d\u0438\u0435': {
    color: '#1e40af', bg: '#dbeafe', border: '#93c5fd',
    icon: (<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M9 3H4a1 1 0 00-1 1v8a1 1 0 001 1h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M11 10l3-2-3-2M14 8H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  },
  '\u041f\u0440\u0435\u0432\u044b\u0448\u0435\u043d\u0438\u0435 \u0431\u043b\u043e\u043a\u0430': {
    color: '#6d28d9', bg: '#ede9fe', border: '#c4b5fd',
    icon: (<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2L14 13H2L8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 6.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="11.25" r="0.75" fill="currentColor"/></svg>),
  },
  '\u041d\u0430\u0440\u0443\u0448\u0435\u043d\u0438\u0435 \u0432\u043d\u0443\u0442\u0440\u0435\u043d\u043d\u0435\u0433\u043e \u043f\u043e\u0440\u044f\u0434\u043a\u0430': {
    color: '#dc2626', bg: '#fef2f2', border: '#fca5a5',
    icon: (<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 5.5h6M5 8h4M5 10.5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>),
  },
  '\u0422\u0435\u043b\u0435\u0444\u043e\u043d': {
    color: '#0891b2', bg: '#ecfeff', border: '#67e8f9',
    icon: (<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3.5 3.5a.5.5 0 01.5-.5h1.5l1 2.5L5 6.5C5.8 8.2 7.8 10.2 9.5 11l1.5-1.5 2.5 1V13a.5.5 0 01-.5.5C6 13.5 3.5 8.5 3.5 3.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>),
  },
  '\u0414\u0440\u0443\u0433\u043e\u0435': {
    color: '#475569', bg: '#f1f5f9', border: '#cbd5e1',
    icon: (<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M6.5 6.5C6.5 5.67 7.17 5 8 5s1.5.67 1.5 1.5C9.5 8 8 8 8 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="8" cy="11.25" r="0.75" fill="currentColor"/></svg>),
  },
};

// ── Vacation type metadata ─────────────────────────────────────────────────
const VACATION_META = {
  '\u0414\u0414\u041e 2':                 { color: '#1d4ed8', bg: '#dbeafe',  border: '#93c5fd' },
  '\u0414\u0414\u041e 3':                 { color: '#4338ca', bg: '#e0e7ff',  border: '#a5b4fc' },
  '\u0423\u0432\u043e\u043b\u0435\u043d': { color: '#dc2626', bg: '#fef2f2',  border: '#fca5a5' },
  '\u0411':                               { color: '#d97706', bg: '#fef3c7',  border: '#fcd34d' },
  '\u041e':                               { color: '#15803d', bg: '#dcfce7',  border: '#86efac' },
  '\u0423':                               { color: '#7c3aed', bg: '#ede9fe',  border: '#c4b5fd' },
  '\u0414\u0414\u041e \u0411':            { color: '#0f766e', bg: '#ccfbf1',  border: '#5eead4' },
  '\u041d':                               { color: '#9f1239', bg: '#fff1f2',  border: '#fecdd3' },
  '\u0411\u0421':                         { color: '#b45309', bg: '#fffbeb',  border: '#fde68a' },
  '7.0':                                  { color: '#475569', bg: '#f1f5f9',  border: '#cbd5e1' },
  '\u0411\u041e':                         { color: '#0e7490', bg: '#ecfeff',  border: '#a5f3fc' },
  '\u0413\u0421':                         { color: '#be185d', bg: '#fdf2f8',  border: '#f9a8d4' },
};

function ExplanationBadge({ value }) {
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef(null);
  const meta = EXPL_META[value] || EXPL_META['\u0414\u0440\u0443\u0433\u043e\u0435'];
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);
  return (
    <span ref={wrapRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 26, height: 26, borderRadius: 7,
          background: meta.bg, color: meta.color,
          border: `1.5px solid ${meta.border}`,
          cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
          padding: 0, outline: 'none',
        }}
      >
        {meta.icon}
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.88 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1e293b',
              color: '#f1f5f9',
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              padding: '5px 10px',
              borderRadius: 8,
              boxShadow: '0 6px 20px rgba(0,0,0,0.30)',
              zIndex: 9999,
              pointerEvents: 'none',
              letterSpacing: '0.02em',
            }}
          >
            {value}
            <span style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid #1e293b',
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ── Cell value renderer ──────────────────────────────────────────────────── */
function CellValue({ colKey, agent }) {
  switch (colKey) {
    case 'planTime':
    case 'factTime':
      return <span>{fmtTime(agent[colKey])}</span>;

    case 'perfPct':
      return <span className="font-semibold">{agent[colKey]}%</span>;

    case 'explanation':
      return agent[colKey] ? <ExplanationBadge value={agent[colKey]} /> : null;

    case 'vacation': {
      const v = agent[colKey];
      if (!v) return null;
      const vm = VACATION_META[v.type] || { color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' };
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            background: vm.bg, color: vm.color,
            border: `1.5px solid ${vm.border}`,
            padding: '2px 8px', borderRadius: 5,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
          }}>
            {v.type}
          </span>
          {v.from && v.to && (
            <span style={{ color: '#64748b', fontSize: 10, fontWeight: 500, whiteSpace: 'nowrap' }}>
              (\u0441: {v.from} \u0434\u043e: {v.to})
            </span>
          )}
        </span>
      );
    }

    case 'vetka':
      return (
        <span style={{
          display: 'inline-block',
          background: '#e0f2fe',
          color: '#0369a1',
          fontSize: 10,
          fontWeight: 700,
          padding: '1px 6px',
          borderRadius: 5,
          border: '1px solid #bae6fd',
          letterSpacing: '0.03em',
        }}>
          {agent[colKey]}
        </span>
      );

    case 'b2': {
      const given = agent.b2;
      const standard = agent.surcharge;
      if (given == null) return <span>&#x2013;</span>;
      const diff = given - standard;
      const isUp = diff > 0;
      const isDown = diff < 0;
      const pct = standard ? Math.abs(Math.round((diff / standard) * 100)) : 0;
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 4 }}>
          <span style={{ fontWeight: 600 }}>{given}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 36 }}>
            {diff !== 0 ? (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 1,
                fontSize: 10, fontWeight: 700,
                color: isUp ? '#15803d' : '#dc2626',
              }}>
                {isUp
                  ? <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M5 8V2M2 5l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M5 2v6M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                }
                {pct}%
              </span>
            ) : (
              <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>&#x2014;</span>
            )}
          </span>
        </span>
      );
    }

    case 'limit':
    case 'b1':
    case 'surcharge':
    case 'razryad':
      return <span>{agent[colKey] ?? '\u2013'}</span>;

    default: {
      const v = agent[colKey];
      if (DASH_IF_ZERO.has(colKey)) {
        return <span>{(!v || v === 0) ? '\u2013' : fmtNum(v)}</span>;
      }
      // Money columns
      if (colKey === K_ITOG || colKey === K_NARUKI || colKey === K_NAKARTU ||
          colKey === K_NALOG || colKey === 'advance' || colKey === 'baseSalary' ||
          colKey === 'nadbavka' || colKey === 'vyslugaLet') {
        return <span>{fmtNum(v)}</span>;
      }
      return <span>{v ?? '\u2013'}</span>;
    }
  }
}

/* ── Skeleton row ─────────────────────────────────────────────────────────── */
function SkeletonRow({ colCount }) {
  return (
    <tr>
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} style={{ padding: '7px 6px' }}>
          <div className="skeleton-pulse" style={{ height: 11, width: i === 1 ? '80%' : '55%' }} />
        </td>
      ))}
    </tr>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
export default function PayrollTable({ agents, activeGroup, visibleColumns, totalAll, isLoading }) {
  const visibleCols = COLUMNS.filter(c => visibleColumns[c.group] !== false && (!c.allGroupOnly || activeGroup === 'All'));
  const totalWidth  = visibleCols.reduce((sum, c) => sum + c.width, 0);

  /* Empty state */
  if (!isLoading && (!agents || agents.length === 0)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center gap-3 py-20"
        style={{ color: '#94a3b8' }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="21" cy="21" r="14" stroke="#cbd5e1" strokeWidth="2.5" />
            <line x1="31" y1="31" x2="42" y2="42" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="16" y1="21" x2="26" y2="21" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
            <line x1="21" y1="16" x2="21" y2="26" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>
        <p className="text-sm font-semibold" style={{ color: '#64748b' }}>No agents found</p>
        <p className="text-xs" style={{ color: '#94a3b8' }}>Try adjusting your search query</p>
      </motion.div>
    );
  }

  const totals = computeTotals(agents || []);
  const allAgents = agents || [];

  return (
    <div className="relative overflow-x-auto">
      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-30 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(3px)' }}
          >
            <div className="flex flex-col items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full border-[3px] border-indigo-500 border-t-transparent"
                style={{ animation: 'spin 0.65s linear infinite' }}
              />
              <span className="text-xs font-semibold tracking-wide" style={{ color: '#6366f1' }}>
                Loading data...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table – width fixed to sum of column widths; outer div scrolls */}
      <table
        className="payroll-table border-collapse text-xs"
        style={{ tableLayout: 'fixed', width: totalWidth, minWidth: totalWidth }}
      >
        <colgroup>
          {visibleCols.map(col => (
            <col key={col.key} style={{ width: col.width }} />
          ))}
        </colgroup>

        <thead>
          {/* Row 1 – group headers */}
          <tr>
            {COL_GROUPS.map((g, gi) => {
              const groupCols = visibleCols.filter(c => c.group === g.label);
              if (groupCols.length === 0) return null;
              return (
                <th
                  key={g.label}
                  colSpan={groupCols.length}
                  style={{
                    background: g.bg, color: g.color,
                    borderBottom: `2px solid ${g.color}33`,
                    padding: '5px 6px',
                    textAlign: 'center', fontSize: 9,
                    fontWeight: 800, letterSpacing: '0.07em',
                    borderRight: '3px solid #94a3b8',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {g.label}
                </th>
              );
            })}
          </tr>

          {/* Row 2 – individual column headers */}
          <tr style={{ background: '#fffffa' }}>
            {visibleCols.map((col, i) => {
              const isGroupStart = i === 0 || visibleCols[i - 1].group !== col.group;
              const isGroupEnd   = i === visibleCols.length - 1 || visibleCols[i + 1].group !== col.group;
              return (
              <th
                key={col.key}
                className="sortable-th"
                style={{
                  textAlign: 'center',
                  verticalAlign: 'bottom',
                  padding: '5px 4px 6px',
                  fontSize: 10, fontWeight: 700, color: '#374151',
                  borderBottom: '2px solid #d1d5db',
                  borderRight: isGroupEnd ? '3px solid #94a3b8' : '1px solid #e5e7eb',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  userSelect: 'none', cursor: 'pointer',
                  lineHeight: 1.25,
                }}
              >
                <span className="inline-flex flex-col items-center gap-0.5">
                  <span>{col.label}</span>
                  <span className="sort-icon" style={{ color: '#94a3b8', opacity: 0 }}>
                    <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                      <path d="M4 1v6M1.5 4.5 4 7l2.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </span>
              </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} colCount={visibleCols.length} />
              ))
            : allAgents.map((agent, idx) => {
                const isEven = idx % 2 === 1;
                const rowClass = isEven ? 'row-even' : 'row-odd';

                return (
                  <motion.tr
                    key={`${agent.id}-${activeGroup}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(idx * 0.018, 0.32), duration: 0.18, ease: 'easeOut' }}
                    className={rowClass}
                  >
                    {visibleCols.map((col, i) => {
                      const isRedCell = col.key === 'factScore' && agent[col.key] < 80;
                      const isGroupStart = i === 0 || visibleCols[i - 1].group !== col.group;
                      const isGroupEnd   = i === visibleCols.length - 1 || visibleCols[i + 1].group !== col.group;
                      return (
                        <td
                          key={col.key}
                          style={{
                            textAlign: 'center',
                            padding: '5px 5px',
                            fontSize: 11,
                            borderBottom: '1px solid #e5e7eb',
                            borderRight: isGroupEnd ? '3px solid #94a3b8' : '1px solid #f3f4f6',
                            whiteSpace: 'nowrap',
                            background: isRedCell ? '#991b1b' : undefined,
                            color: isRedCell ? '#ffffff' : col.key === 'name' ? '#4338ca' : '#374151',
                            fontWeight: col.key === 'name' ? 600 : 400,
                          }}
                        >
                          <CellValue colKey={col.key} agent={agent} />
                        </td>
                      );
                    })}
                  </motion.tr>
                );
              })}
        </tbody>

        {/* Totals footer */}
        {!isLoading && (
          <tfoot>
            <motion.tr
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.2 }}
              style={{ background: '#fffffa' }}
            >
              {visibleCols.map((col, i) => {
                if (col.key === 'name') return null;

                let content = null;
                let colSpanVal = 1;

                if (col.key === 'shtat') {
                  const hasName = visibleCols.some(c => c.key === 'name');
                  colSpanVal = 1 + (hasName ? 1 : 0);
                  content = (
                    <span className="font-black text-[10px] whitespace-nowrap" style={{ color: '#1e293b', letterSpacing: '0.02em' }}>
                      TOTALS / ALL ACTIVE AGENTS{' '}
                      <span style={{ color: '#0369a1', fontWeight: 700 }}>N={totalAll}</span>
                    </span>
                  );
                } else if (col.key === 'planCalls')  { content = <span className="font-bold">{fmtNum(totals.planCalls)}</span>; }
                  else if (col.key === 'factCalls')  { content = <span className="font-bold">{fmtNum(totals.factCalls)}</span>; }
                  else if (col.key === 'planTime')   { content = <span className="font-bold">{fmtTime(totals.planTime)}</span>; }
                  else if (col.key === 'factTime')   { content = <span className="font-bold">{fmtTime(totals.factTime)}</span>; }
                  else if (col.key === 'perfPct')    { content = <span className="font-bold">{totals.perfPct}% avg</span>; }
                  else if (col.key === 'factScore')  { content = <span className="font-bold">{totals.factScore}</span>; }
                  else if (col.key === K_ITOG)       { content = <span className="font-bold">{fmtNum(totals[K_ITOG]  / 1e6).replace(',', '.')}M</span>; }
                  else if (col.key === K_NARUKI)     { content = <span className="font-bold">{fmtNum(totals[K_NARUKI] / 1e6).replace(',', '.')}M</span>; }
                  else if (col.key === K_NAKARTU)    { content = <span className="font-bold">{fmtNum(totals[K_NAKARTU]/ 1e6).replace(',', '.')}M</span>; }
                  else if (col.key === K_NALOG)      { content = <span className="font-bold">{fmtNum(totals[K_NALOG]  / 1e6).replace(',', '.')}M</span>; }
                  else if (col.key === 'advance')    { content = <span className="font-bold">{fmtNum(totals.advance     / 1e6).replace(',', '.')}M</span>; }
                  else if (col.key === 'baseSalary') { content = <span className="font-bold">{fmtNum(totals.baseSalary  / 1e6).replace(',', '.')}M</span>; }
                  else if (col.key === 'nadbavka')   { content = <span className="font-bold">{fmtNum(totals.nadbavka    / 1e6).replace(',', '.')}M</span>; }
                  else if (col.key === 'noch')       { content = totals.noch        ? <span className="font-bold">{fmtNum(totals.noch)}</span>        : null; }
                  else if (col.key === 'vecher')     { content = totals.vecher      ? <span className="font-bold">{fmtNum(totals.vecher)}</span>      : null; }
                  else if (col.key === 'prazdnichny'){ content = totals.prazdnichny ? <span className="font-bold">{fmtNum(totals.prazdnichny)}</span> : null; }
                  else if (col.key === 'stoimostBiletov') { content = totals.stoimostBiletov ? <span className="font-bold">{fmtNum(totals.stoimostBiletov)}</span> : null; }
                  else if (col.key === 'addBonus')   { content = totals.addBonus    ? <span className="font-bold">{fmtNum(totals.addBonus)}</span>    : null; }
                  else if (col.key === 'vyslugaLet') { content = <span className="font-bold">{fmtNum(totals.vyslugaLet  / 1e6).replace(',', '.')}M</span>; }

                return (
                  <td
                    key={col.key}
                    colSpan={colSpanVal}
                    style={{
                      textAlign: col.key === 'shtat' ? 'left' : 'center',
                      padding: '6px 6px',
                      fontSize: 11,
                      borderTop: '2px solid #94a3b8',
                      borderRight: (i === visibleCols.length - 1 || visibleCols[i + 1]?.group !== col.group) ? '3px solid #94a3b8' : '1px solid #e5e7eb',
                      color: '#1e293b',
                      fontWeight: 700,
                    }}
                  >
                    {content}
                  </td>
                );
              })}
            </motion.tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}











