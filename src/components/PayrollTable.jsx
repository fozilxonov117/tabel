import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fmtTime, fmtNum, computeTotals } from '../data/calculations';
import { useLang } from '../i18n/LangContext';
import { translations } from '../i18n/translations';

// ── Cyrillic key constants (must match mockData.js property names exactly) ────
const K_ITOG    = 'итог';
const K_NARUKI  = 'наРуки';
const K_NAKARTU = 'наКарту';
const K_NALOG   = 'налог';

// ── Column group header definitions ──────────────────────────────────────────
const COL_GROUPS = [
  { label: 'BASIC INFO',         labelKey: 'group.BASIC INFO',         span: 3, color: '#3730a3', bg: '#fffffa' },
  { label: 'CALL METRICS',       labelKey: 'group.CALL METRICS',       span: 5, color: '#1e40af', bg: '#fffffa' },
  { label: 'EFFICIENCY',         labelKey: 'group.EFFICIENCY',         span: 3, color: '#4c1d95', bg: '#fffffa' },
  { label: 'ATTENDANCE & BONUS', labelKey: 'group.ATTENDANCE & BONUS', span: 3, color: '#14532d', bg: '#fffffa' },
  { label: 'LIMITS & GRADES',    labelKey: 'group.LIMITS & GRADES',    span: 2, color: '#0f766e', bg: '#fffffa' },
  { label: 'TOTALS (BI-BK)',     labelKey: 'group.TOTALS (BI-BK)',     span: 7, color: '#78350f', bg: '#fffffa' },
  { label: 'ALLOWANCES',         labelKey: 'group.ALLOWANCES',         span: 6, color: '#5b21b6', bg: '#fffffa' },
];

// ── Individual column definitions ─────────────────────────────────────────────
// All columns are center-aligned. Width values are in pixels.
const COLUMNS = [
  // BASIC INFO
  { key: 'vetka',           labelKey: 'col.vetka',            group: 'BASIC INFO',         width: 60,  allGroupOnly: true },
  { key: 'shtat',           labelKey: 'col.shtat',            group: 'BASIC INFO',         width: 44  },
  { key: 'name',            labelKey: 'col.name',             group: 'BASIC INFO',         width: 240 },
  // CALL METRICS
  { key: 'planCalls',       labelKey: 'col.planCalls',        group: 'CALL METRICS',       width: 78  },
  { key: 'factCalls',       labelKey: 'col.factCalls',        group: 'CALL METRICS',       width: 78  },
  { key: 'planTime',        labelKey: 'col.planTime',         group: 'CALL METRICS',       width: 66  },
  { key: 'factTime',        labelKey: 'col.factTime',         group: 'CALL METRICS',       width: 66  },
  { key: 'perfPct',         labelKey: 'col.perfPct',          group: 'CALL METRICS',       width: 62  },
  // EFFICIENCY
  { key: 'factScore',       labelKey: 'col.factScore',        group: 'EFFICIENCY',         width: 66  },
  { key: 'explanation',     labelKey: 'col.explanation',      group: 'EFFICIENCY',         width: 150 },
  { key: 'vacation',        labelKey: 'col.vacation',         group: 'EFFICIENCY',         width: 150 },
  // ATTENDANCE & BONUS
  { key: 'b2',              labelKey: 'col.b2',               group: 'ATTENDANCE & BONUS', width: 90  },
  { key: 'surcharge',       labelKey: 'col.surcharge',        group: 'ATTENDANCE & BONUS', width: 60  },
  { key: 'limit',           labelKey: 'col.limit',            group: 'ATTENDANCE & BONUS', width: 60  },
  // LIMITS & GRADES
  { key: 'profitFromOp',    labelKey: 'col.profitFromOp',     group: 'LIMITS & GRADES',    width: 100 },
  { key: 'razryad',         labelKey: 'col.razryad',          group: 'LIMITS & GRADES',    width: 62  },
  // TOTALS (BI-BK) — includes former deductions + nadbavka
  { key: K_ITOG,            labelKey: 'col.итог',             group: 'TOTALS (BI-BK)',     width: 96  },
  { key: K_NARUKI,          labelKey: 'col.наРуки',           group: 'TOTALS (BI-BK)',     width: 92  },
  { key: K_NAKARTU,         labelKey: 'col.наКарту',          group: 'TOTALS (BI-BK)',     width: 92  },
  { key: K_NALOG,           labelKey: 'col.налог',            group: 'TOTALS (BI-BK)',     width: 88  },
  { key: 'advance',         labelKey: 'col.advance',          group: 'TOTALS (BI-BK)',     width: 88  },
  { key: 'baseSalary',      labelKey: 'col.baseSalary',       group: 'TOTALS (BI-BK)',     width: 92  },
  { key: 'nadbavka',        labelKey: 'col.nadbavka',         group: 'TOTALS (BI-BK)',     width: 92  },
  // ALLOWANCES
  { key: 'noch',            labelKey: 'col.noch',             group: 'ALLOWANCES',         width: 72  },
  { key: 'vecher',          labelKey: 'col.vecher',           group: 'ALLOWANCES',         width: 72  },
  { key: 'prazdnichny',     labelKey: 'col.prazdnichny',      group: 'ALLOWANCES',         width: 90  },
  { key: 'stoimostBiletov', labelKey: 'col.stoimostBiletov',  group: 'ALLOWANCES',         width: 100 },
  { key: 'addBonus',        labelKey: 'col.addBonus',         group: 'ALLOWANCES',         width: 64  },
  { key: 'vyslugaLet',      labelKey: 'col.vyslugaLet',       group: 'ALLOWANCES',         width: 90  },
];

// Keys whose zero value displays as '–' in cells
const DASH_IF_ZERO = new Set(['profitFromOp', 'noch', 'vecher', 'prazdnichny', 'stoimostBiletov', 'addBonus']);

// ── Explanation badge metadata ─────────────────────────────────────────────
const EXPL_META = {
  'Опоздание': {
    color: '#92400e', bg: '#fef3c7', border: '#fcd34d',
    icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/></svg>),
  },
  'Отпрашивание': {
    color: '#1e40af', bg: '#dbeafe', border: '#93c5fd',
    icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17 4l4 4-4 4V9H3V7h14V4zM7 17h14v-2H7v-3l-4 4 4 4v-3z"/></svg>),
  },
  'Превышение блока': {
    color: '#6d28d9', bg: '#ede9fe', border: '#c4b5fd',
    icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>),
  },
  'Нарушение внутреннего порядка': {
    color: '#dc2626', bg: '#fef2f2', border: '#fca5a5',
    icon: (<svg width="20" height="20" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 5.5h6M5 8h4M5 10.5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>),
  },
  'Телефон': {
    color: '#0891b2', bg: '#ecfeff', border: '#67e8f9',
    icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H8C6.34 1 5 2.34 5 4v16c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V4c0-1.66-1.34-3-3-3zm-2 20h-4v-1h4v1zm3.25-3H6.75V4h10.5v14z"/></svg>),
  },
  'Другое': {
    color: '#475569', bg: '#f1f5f9', border: '#cbd5e1',
    icon: (<svg width="20" height="20" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M6.5 6.5C6.5 5.67 7.17 5 8 5s1.5.67 1.5 1.5C9.5 8 8 8 8 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="8" cy="11.25" r="0.75" fill="currentColor"/></svg>),
  },
};

// ── Vacation type metadata ─────────────────────────────────────────────────
const VACATION_META = {
  'ДДО 2':   { color: '#1d4ed8', bg: '#dbeafe',  border: '#93c5fd' },
  'ДДО 3':   { color: '#4338ca', bg: '#e0e7ff',  border: '#a5b4fc' },
  'Уволен':  { color: '#dc2626', bg: '#fef2f2',  border: '#fca5a5' },
  'Б':       { color: '#d97706', bg: '#fef3c7',  border: '#fcd34d' },
  'О':       { color: '#15803d', bg: '#dcfce7',  border: '#86efac' },
  'У':       { color: '#7c3aed', bg: '#ede9fe',  border: '#c4b5fd' },
  'ДДО Б':   { color: '#0f766e', bg: '#ccfbf1',  border: '#5eead4' },
  'Н':       { color: '#9f1239', bg: '#fff1f2',  border: '#fecdd3' },
  'БС':      { color: '#b45309', bg: '#fffbeb',  border: '#fde68a' },
  '7.0':     { color: '#475569', bg: '#f1f5f9',  border: '#cbd5e1' },
  'БО':      { color: '#0e7490', bg: '#ecfeff',  border: '#a5f3fc' },
  'ГС':      { color: '#be185d', bg: '#fdf2f8',  border: '#f9a8d4' },
};

function ExplanationIconItem({ type, count, rowHovered }) {
  const [hovered, setHovered] = React.useState(false);
  const meta = EXPL_META[type] || EXPL_META['Другое'];
  const showTooltip = hovered || rowHovered;
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <span
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 26, height: 26, borderRadius: 7,
          background: meta.bg, color: meta.color,
          border: `1.5px solid ${meta.border}`,
          cursor: 'default', boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
          position: 'relative',
        }}
      >
        {meta.icon}
        {count > 1 && (
          <span style={{
            position: 'absolute', top: -5, right: -5,
            background: '#3b82f6', color: '#fff',
            fontSize: 9, fontWeight: 800,
            minWidth: 14, height: 14, borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid #fff', lineHeight: 1,
            paddingLeft: 1, paddingRight: 1, zIndex: 1,
          }}>
            {count}
          </span>
        )}
      </span>
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 6px)',
              left: '0',
              background: '#ffffff', color: '#1e293b',
              fontSize: 11, fontWeight: 600,
              whiteSpace: 'nowrap', padding: '4px 9px',
              borderRadius: 7, boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              zIndex: 9999, pointerEvents: 'none',
            }}
          >
            {count > 1 ? `${type} ×${count}` : type}
            <span style={{
              position: 'absolute', top: '100%', left: '10px',
              borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
              borderTop: '4px solid #e2e8f0',
            }} />
            <span style={{
              position: 'absolute', top: 'calc(100% - 1px)', left: '10px',
              borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
              borderTop: '4px solid #ffffff',
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

function ExplanationIcons({ types, rowHovered }) {
  const counts = {};
  types.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 3, alignItems: 'center', justifyContent: 'center' }}>
      {Object.entries(counts).map(([type, count]) => (
        <ExplanationIconItem key={type} type={type} count={count} rowHovered={rowHovered} />
      ))}
    </span>
  );
}

function VacationBadge({ v, rowHovered }) {
  const [hovered, setHovered] = React.useState(false);
  const { lang } = useLang();
  const t = k => translations[lang]?.[k] ?? k;
  const vm = VACATION_META[v.type] || { color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' };
  const showTooltip = hovered || rowHovered;
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <span
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: vm.bg, color: vm.color,
          border: `1.5px solid ${vm.border}`,
          padding: '2px 8px', borderRadius: 5,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.03em',
          whiteSpace: 'nowrap', cursor: 'default',
        }}
      >
        {v.type}
      </span>
      <AnimatePresence>
        {showTooltip && v.from && v.to && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 6px)',
              left: '0',
              background: '#ffffff', color: '#1e293b',
              fontSize: 11, fontWeight: 600,
              whiteSpace: 'nowrap', padding: '5px 10px',
              borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              zIndex: 9999, pointerEvents: 'none',
            }}
          >
            {v.type} · {t('vac.from')}: {v.from} — {t('vac.to')}: {v.to}
            <span style={{
              position: 'absolute', top: '100%', left: '10px',
              borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
              borderTop: '5px solid #e2e8f0',
            }} />
            <span style={{
              position: 'absolute', top: 'calc(100% - 1px)', left: '10px',
              borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
              borderTop: '5px solid #ffffff',
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ── Cell value renderer ──────────────────────────────────────────────────── */
function CellValue({ colKey, agent, rowHovered }) {
  const { lang } = useLang();
  const t = k => translations[lang]?.[k] ?? k;
  switch (colKey) {
    case 'planTime':
    case 'factTime':
      return <span>{fmtTime(agent[colKey])}</span>;

    case 'perfPct':
      return <span className="font-semibold">{agent[colKey]}%</span>;

    case 'explanation': {
      const val = agent[colKey];
      const arr = Array.isArray(val) ? val.filter(Boolean) : (val ? [val] : []);
      return arr.length > 0 ? <ExplanationIcons types={arr} rowHovered={rowHovered} /> : null;
    }

    case 'vacation': {
      const v = agent[colKey];
      if (!v) return null;
      return <VacationBadge v={v} rowHovered={rowHovered} />;
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

    case 'limit':
    case 'surcharge':
    case 'razryad':
      return <span>{agent[colKey] ?? '–'}</span>;

    default: {
      const v = agent[colKey];
      if (DASH_IF_ZERO.has(colKey)) {
        return <span>{(!v || v === 0) ? '–' : fmtNum(v)}</span>;
      }
      // Money columns
      if (colKey === K_ITOG || colKey === K_NARUKI || colKey === K_NAKARTU ||
          colKey === K_NALOG || colKey === 'advance' || colKey === 'baseSalary' ||
          colKey === 'nadbavka' || colKey === 'vyslugaLet') {
        return <span>{fmtNum(v)}</span>;
      }
      return <span>{v ?? '–'}</span>;
    }
  }
}

/* ── Editable B2 cell ────────────────────────────────────────────────────── */
function B2Cell({ agentId, b1Val, override, onSave, onActivate }) {
  const [editing, setEditing] = React.useState(false);
  const [inputVal, setInputVal] = React.useState('');
  const inputRef = React.useRef(null);
  const currentVal = override !== undefined ? override : b1Val;

  React.useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEdit = () => {
    setInputVal(String(currentVal ?? ''));
    setEditing(true);
    onActivate(agentId);
  };

  const commit = () => {
    const num = parseFloat(inputVal);
    if (!isNaN(num)) onSave(agentId, num);
    setEditing(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
        style={{
          width: 56, background: 'transparent', border: 'none',
          borderBottom: '1.5px solid #6366f1', outline: 'none',
          fontSize: 11, fontWeight: 700, textAlign: 'center', color: 'inherit',
        }}
      />
    );
  }
  return (
    <span
      onClick={startEdit}
      title="Click to edit"
      style={{ fontWeight: 700, cursor: 'pointer', userSelect: 'none' }}
    >
      {currentVal ?? '–'}
    </span>
  );
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
  const { lang } = useLang();
  const t = k => translations[lang]?.[k] ?? k;
  const visibleCols = COLUMNS.filter(c => visibleColumns[c.group] !== false && (!c.allGroupOnly || activeGroup === 'All'));
  const totalWidth  = visibleCols.reduce((sum, c) => sum + c.width, 0);

  const [ctxMenu, setCtxMenu] = React.useState({ visible: false, x: 0, y: 0, agentId: null });
  const [b2Overrides, setB2Overrides] = React.useState({});
  const [hoveredRowId, setHoveredRowId] = React.useState(null);

  const handleContextMenu = (e, agentId = null) => {
    if (e.shiftKey) return; // Shift+right-click → browser default
    e.preventDefault();
    e.stopPropagation();
    const x = Math.min(e.clientX, window.innerWidth - 210);
    const y = Math.min(e.clientY, window.innerHeight - 80);
    setCtxMenu({ visible: true, x, y, agentId });
  };

  const handleTableContextMenu = (e) => {
    if (e.shiftKey) return;
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - 210);
    const y = Math.min(e.clientY, window.innerHeight - 80);
    setCtxMenu({ visible: true, x, y, agentId: null });
  };

  React.useEffect(() => {
    const close = () => setCtxMenu(m => m.visible ? { ...m, visible: false } : m);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

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
    <div className="relative overflow-x-auto" onContextMenu={handleTableContextMenu}>
      {/* Custom context menu */}
      <AnimatePresence>
        {ctxMenu.visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: ctxMenu.y,
              left: ctxMenu.x,
              zIndex: 99999,
              background: '#ffffff',
              borderRadius: 10,
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              padding: '4px',
              minWidth: 200,
            }}
          >
            {/* Header label */}
            <div style={{ padding: '6px 12px 4px', fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9', marginBottom: 3 }}>
              {ctxMenu.agentId && b2Overrides[ctxMenu.agentId] !== undefined ? t('ctx.b2cell') : t('ctx.actions')}
            </div>
            <button
              onClick={() => {
                if (ctxMenu.agentId && b2Overrides[ctxMenu.agentId] !== undefined) {
                  setB2Overrides(prev => { const n = { ...prev }; delete n[ctxMenu.agentId]; return n; });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                setCtxMenu(m => ({ ...m, visible: false }));
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '7px 12px',
                background: 'none', border: 'none', borderRadius: 7,
                color: '#1e293b', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#6366f1', flexShrink: 0 }}>
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              {ctxMenu.agentId && b2Overrides[ctxMenu.agentId] !== undefined ? t('ctx.resetCell') : t('ctx.return')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
                  {t(g.labelKey)}
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
                  <span>{t(col.labelKey)}</span>
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
                    onMouseEnter={() => setHoveredRowId(agent.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                  >
                    {visibleCols.map((col, i) => {
                      const isRedCell = col.key === 'factScore' && agent[col.key] < 80;
                      const isGroupEnd = i === visibleCols.length - 1 || visibleCols[i + 1].group !== col.group;
                      const borderRight = isGroupEnd ? '3px solid #94a3b8' : '1px solid #f3f4f6';

                      if (col.key === 'b2') {
                        const b2Override = b2Overrides[agent.id];
                        const b2Val = b2Override !== undefined ? b2Override : agent.b1;
                        const b2IsHigher = b2Val > agent.b1;
                        const b2IsLower  = b2Val < agent.b1;
                        return (
                          <td
                            key="b2"
                            onContextMenu={e => handleContextMenu(e, agent.id)}
                            style={{
                            textAlign: 'center', padding: '5px 5px', fontSize: 11,
                            borderBottom: '1px solid #e5e7eb', borderRight, whiteSpace: 'nowrap',
                            background: b2IsHigher ? '#dcfce7' : b2IsLower ? '#fee2e2' : undefined,
                            color: b2IsHigher ? '#15803d' : b2IsLower ? '#dc2626' : '#374151',
                          }}>
                            <B2Cell
                              agentId={agent.id}
                              b1Val={agent.b1}
                              override={b2Override}
                              onSave={(id, val) => {
                                setB2Overrides(prev => ({ ...prev, [id]: val }));
                              }}
                              onActivate={() => {}}
                            />
                          </td>
                        );
                      }

                      return (
                        <td
                          key={col.key}
                          style={{
                            textAlign: 'center',
                            padding: '5px 5px',
                            fontSize: 11,
                            borderBottom: '1px solid #e5e7eb',
                            borderRight,
                            whiteSpace: 'nowrap',
                            
                            background: isRedCell ? '#fee2e2' : undefined,
                            color: isRedCell ? '#dc2626' : col.key === 'name' ? '#4338ca' : '#374151',
                            fontWeight: isRedCell ? 700 : col.key === 'name' ? 600 : 600,
                          }}
                        >
                          <CellValue colKey={col.key} agent={agent} rowHovered={hoveredRowId === agent.id} />
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
                      {t('footer.totals')}{' '}
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











