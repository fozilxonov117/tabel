import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fmtTime, fmtNum, computeTotals } from '../data/calculations';

// Column group header definitions
const COL_GROUPS = [
  { label: 'BASIC INFO',           span: 3,  color: '#3730a3', bg: 'linear-gradient(90deg,#eef2ff,#e0e7ff)' },
  { label: 'CALL METRICS',         span: 4,  color: '#1e40af', bg: 'linear-gradient(90deg,#dbeafe,#bfdbfe)' },
  { label: 'EFFICIENCY',           span: 2,  color: '#4c1d95', bg: 'linear-gradient(90deg,#ede9fe,#ddd6fe)' },
  { label: 'ATTENDANCE & BONUS',   span: 5,  color: '#14532d', bg: 'linear-gradient(90deg,#dcfce7,#bbf7d0)' },
  { label: 'TOTALS (BI-BK)',       span: 3,  color: '#78350f', bg: 'linear-gradient(90deg,#fef3c7,#fde68a)' },
  { label: 'DEDUCTIONS (BL-BM)',   span: 3,  color: '#7f1d1d', bg: 'linear-gradient(90deg,#fee2e2,#fecaca)' },
];

// Cyrillic column keys (Unicode escapes to avoid encoding issues)
const K_ITOG    = '\u0438\u0442\u043e\u0433';            // итог
const K_NARUKI  = '\u043d\u0430\u0420\u0443\u043a\u0438'; // наРуки
const K_NAKARTU = '\u043d\u0430\u041a\u0430\u0440\u0442\u0443'; // наКарту
const K_NALOG   = '\u043d\u0430\u043b\u043e\u0433';      // налог

// Individual column definitions  (labels use Unicode escapes for Cyrillic)
const COLUMNS = [
  // BASIC INFO
  { key: 'shtat',       label: '\u0428\u0422\u0410\u0422',                       group: 'BASIC INFO',         align: 'center', width: 40  },
  { key: 'vetka',       label: '\u0412\u0415\u0422\u041a\u0410',                  group: 'BASIC INFO',         align: 'center', width: 56  },
  { key: 'name',        label: '\u0424\u0418\u041e (AGENT NAME)',                 group: 'BASIC INFO',         align: 'left',   width: 210 },
  // CALL METRICS
  { key: 'planCalls',   label: '\u041f\u041b\u0410\u041d \u0417\u0412\u041e\u041d\u041a\u041e\u0412', group: 'CALL METRICS',       align: 'center', width: 80  },
  { key: 'factCalls',   label: '\u0424\u0410\u041a\u0422 \u0417\u0412\u041e\u041d\u041a\u041e\u0412', group: 'CALL METRICS',       align: 'center', width: 80  },
  { key: 'planTime',    label: '\u041f\u041b\u0410\u041d \u0421\u0412\u041e',     group: 'CALL METRICS',       align: 'center', width: 70  },
  { key: 'factTime',    label: '\u0424\u0410\u041a\u0422 \u0421\u0412\u041e',     group: 'CALL METRICS',       align: 'center', width: 70  },
  // EFFICIENCY
  { key: 'perfPct',     label: '% \u0412\u042b\u041f.',                           group: 'EFFICIENCY',         align: 'center', width: 70  },
  { key: 'factScore',   label: '\u0424\u0410\u041a\u0422 \u0411\u0410\u041b\u041b', group: 'EFFICIENCY',       align: 'center', width: 70  },
  // ATTENDANCE & BONUS
  { key: 'worked',      label: '\u041e\u0422\u0420\u0410\u0411.',                 group: 'ATTENDANCE & BONUS', align: 'center', width: 60  },
  { key: 'explanation', label: '\u041e\u0411\u042a\u042f\u0421\u041d\u0418\u0422.', group: 'ATTENDANCE & BONUS', align: 'center', width: 90 },
  { key: 'b1',          label: '%(B1)',                                           group: 'ATTENDANCE & BONUS', align: 'center', width: 60  },
  { key: 'b2',          label: '%(B2)',                                           group: 'ATTENDANCE & BONUS', align: 'center', width: 60  },
  { key: 'surcharge',   label: '\u0421\u0422. \u041d\u0410\u0414.',               group: 'ATTENDANCE & BONUS', align: 'center', width: 65  },
  // TOTALS
  { key: K_ITOG,        label: '\u0418\u0422\u041e\u0413',                        group: 'TOTALS (BI-BK)',     align: 'center', width: 100 },
  { key: K_NARUKI,      label: '\u041d\u0410 \u0420\u0423\u041a\u0418',           group: 'TOTALS (BI-BK)',     align: 'center', width: 95  },
  { key: K_NAKARTU,     label: '\u041d\u0410 \u041a\u0410\u0420\u0422\u0423',     group: 'TOTALS (BI-BK)',     align: 'center', width: 95  },
  // DEDUCTIONS
  { key: K_NALOG,       label: '\u041d\u0410\u041b\u041e\u0413+',                 group: 'DEDUCTIONS (BL-BM)', align: 'center', width: 90  },
  { key: 'advance',     label: '\u0410\u0412\u0410\u041d\u0421',                  group: 'DEDUCTIONS (BL-BM)', align: 'center', width: 90  },
  { key: 'baseSalary',  label: '\u041e\u041a\u041b\u0410\u0414',                  group: 'DEDUCTIONS (BL-BM)', align: 'center', width: 95  },
];

/* ── Cell value renderer ─────────────────────────────────────────── */
function CellValue({ colKey, agent }) {
  switch (colKey) {
    case 'planTime':
    case 'factTime':
      return <span>{fmtTime(agent[colKey])}</span>;
    case 'perfPct':
      return (
        <span className={agent.flags?.requiresCardCheck ? 'perf-underline font-semibold' : 'font-semibold'}>
          {agent[colKey]}%
        </span>
      );
    case 'factScore':
      return <span>{agent[colKey]}</span>;
    case 'explanation':
      return agent[colKey]
        ? (
          <span style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg,#fff7ed,#ffedd5)',
            color: '#c2410c',
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: 6,
            border: '1px solid #fed7aa',
            boxShadow: '0 1px 5px rgba(194,65,12,0.14)',
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
          }}>
            {agent[colKey]}
          </span>
        )
        : null;
    case 'b1':
    case 'b2':
    case 'surcharge':
      return <span>{agent[colKey]}</span>;
    default:
      if (colKey === K_ITOG || colKey === K_NARUKI || colKey === K_NAKARTU ||
          colKey === K_NALOG || colKey === 'advance' || colKey === 'baseSalary') {
        return <span>{fmtNum(agent[colKey])}</span>;
      }
      return <span>{agent[colKey]}</span>;
  }
}

/* ── Skeleton row for loading state ─────────────────────────────── */
function SkeletonRow({ colCount }) {
  return (
    <tr>
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} style={{ padding: '7px 6px' }}>
          <div
            className="skeleton-pulse"
            style={{ height: 11, width: i === 2 ? '78%' : i < 2 ? '55%' : '65%' }}
          />
        </td>
      ))}
    </tr>
  );
}

/* ── Main component ──────────────────────────────────────────────── */
export default function PayrollTable({ agents, activeGroup, visibleColumns, page, perPage, totalAll, isLoading }) {
  const visibleCols = COLUMNS.filter(c => visibleColumns[c.group] !== false);
  const totalWidth = visibleCols.reduce((sum, c) => sum + c.width, 0);

  /* Empty state */
  if (!isLoading && (!agents || agents.length === 0)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
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

  const start = (page - 1) * perPage;
  const pageAgents = (agents || []).slice(start, start + perPage);

  return (
    <div className="relative overflow-x-auto">
      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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

      <table
        className="payroll-table w-full border-collapse text-xs"
        style={{ tableLayout: 'fixed' }}
      >
        <colgroup>
          {visibleCols.map(col => (
            <col key={col.key} style={{ width: `${((col.width / totalWidth) * 100).toFixed(3)}%` }} />
          ))}
        </colgroup>
        <thead>
          {/* Row 1: Column group headers */}
          <tr>
            {COL_GROUPS.map(g => {
              const groupCols = visibleCols.filter(c => c.group === g.label);
              if (groupCols.length === 0) return null;
              return (
                <th
                  key={g.label}
                  colSpan={groupCols.length}
                  style={{
                    background: g.bg,
                    color: g.color,
                    borderBottom: `2px solid ${g.color}33`,
                    padding: '6px 8px',
                    textAlign: 'center',
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    borderRight: '2px solid #e5e7eb',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {g.label}
                </th>
              );
            })}
          </tr>

          {/* Row 2: Individual column headers */}
          <tr style={{ background: '#f8fafc' }}>
            {visibleCols.map((col, i) => (
              <th
                key={col.key}
                className="sortable-th"
                style={{
                  width: col.width,
                  minWidth: col.width,
                  textAlign: col.align,
                  padding: '7px 6px',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#374151',
                  borderBottom: '2px solid #d1d5db',
                  borderRight: i < visibleCols.length - 1 ? '1px solid #e5e7eb' : 'none',
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                }}
              >
                <span className="inline-flex items-center gap-1 justify-center">
                  {col.label}
                  <span className="sort-icon" style={{ color: '#94a3b8' }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M4 1v6M1.5 4.5 4 7l2.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading
            ? Array.from({ length: Math.min(perPage, 8) }).map((_, i) => (
                <SkeletonRow key={i} colCount={visibleCols.length} />
              ))
            : pageAgents.map((agent, idx) => {
                const isEven = idx % 2 === 1;
                const rowClass = agent.flags?.thresholdAchieved
                  ? 'row-threshold'
                  : agent.flags?.manualInput
                  ? 'row-manual'
                  : isEven ? 'row-even' : 'row-odd';

                return (
                  <motion.tr
                    key={`${agent.id}-${activeGroup}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: Math.min(idx * 0.018, 0.32),
                      duration: 0.18,
                      ease: 'easeOut',
                    }}
                    className={`${rowClass} ${agent.flags?.thresholdAchieved ? 'threshold-row' : ''}`}
                  >
                    {visibleCols.map((col, i) => (
                      <td
                        key={col.key}
                        style={{
                          textAlign: col.align,
                          padding: '5px 6px',
                          fontSize: 11,
                          borderBottom: '1px solid #e5e7eb',
                          borderRight: i < visibleCols.length - 1 ? '1px solid #f3f4f6' : 'none',
                          whiteSpace: 'nowrap',
                          color: col.key === 'name' ? '#4338ca' : '#374151',
                          fontWeight: col.key === 'name' ? 600 : 400,
                        }}
                      >
                        <CellValue colKey={col.key} agent={agent} />
                      </td>
                    ))}
                  </motion.tr>
                );
              })}
        </tbody>

        {/* Totals footer */}
        {!isLoading && (
          <tfoot>
            <motion.tr
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.2 }}
              style={{ background: 'linear-gradient(90deg,#e0e7ff,#ede9fe,#f0f9ff)' }}
            >
              {visibleCols.map((col, i) => {
                if (col.key === 'vetka' || col.key === 'name') return null;

                let content = null;
                let colSpanVal = 1;

                if (col.key === 'shtat') {
                  const hasVetka = visibleCols.some(c => c.key === 'vetka');
                  const hasName  = visibleCols.some(c => c.key === 'name');
                  colSpanVal = 1 + (hasVetka ? 1 : 0) + (hasName ? 1 : 0);
                  content = (
                    <span className="font-black text-[10px] whitespace-nowrap" style={{ color: '#4338ca', letterSpacing: '0.02em' }}>
                      TOTALS / ALL ACTIVE AGENTS{' '}
                      <span style={{ color: '#818cf8', fontWeight: 700 }}>N={totalAll}</span>
                    </span>
                  );
                } else if (col.key === 'planCalls') {
                  content = <span className="font-bold">{fmtNum(totals.planCalls)}</span>;
                } else if (col.key === 'factCalls') {
                  content = <span className="font-bold">{fmtNum(totals.factCalls)}</span>;
                } else if (col.key === 'planTime') {
                  content = <span className="font-bold">{fmtTime(totals.planTime)}</span>;
                } else if (col.key === 'factTime') {
                  content = <span className="font-bold">{fmtTime(totals.factTime)}</span>;
                } else if (col.key === 'perfPct') {
                  content = <span className="font-bold">{totals.perfPct}% avg</span>;
                } else if (col.key === 'factScore') {
                  content = <span className="font-bold">{totals.factScore}</span>;
                } else if (col.key === K_ITOG) {
                  content = <span className="font-bold">{fmtNum(totals[K_ITOG] / 1e6).replace(',', '.')}M</span>;
                } else if (col.key === K_NARUKI) {
                  content = <span className="font-bold">{fmtNum(totals[K_NARUKI] / 1e6).replace(',', '.')}M</span>;
                } else if (col.key === K_NAKARTU) {
                  content = <span className="font-bold">{fmtNum(totals[K_NAKARTU] / 1e6).replace(',', '.')}M</span>;
                } else if (col.key === K_NALOG) {
                  content = <span className="font-bold">{fmtNum(totals[K_NALOG] / 1e6).replace(',', '.')}M</span>;
                } else if (col.key === 'advance') {
                  content = <span className="font-bold">{fmtNum(totals.advance / 1e6).replace(',', '.')}M</span>;
                } else if (col.key === 'baseSalary') {
                  content = <span className="font-bold">{fmtNum(totals.baseSalary / 1e6).replace(',', '.')}M</span>;
                }

                return (
                  <td
                    key={col.key}
                    colSpan={colSpanVal}
                    style={{
                      textAlign: col.key === 'shtat' ? 'left' : 'center',
                      padding: '7px 8px',
                      fontSize: 11,
                      borderTop: '2px solid #818cf8',
                      borderRight: i < visibleCols.length - 1 ? '1px solid #c7d2fe' : 'none',
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
