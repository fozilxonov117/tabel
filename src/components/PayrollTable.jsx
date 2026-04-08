import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fmtTime, fmtNum, computeTotals } from '../data/calculations';
import { mockAgents } from '../data/mockData';
import { useLang } from '../i18n/LangContext';
import { translations } from '../i18n/translations';

// ── Cyrillic key constants (must match mockData.js property names exactly) ────
const K_ITOG    = 'итог';
const K_NARUKI  = 'наРуки';
const K_NAKARTU = 'наКарту';
const K_NALOG   = 'налог';

// ── Dynamic column widths computed from all agent data ─────────────────────
const _allAgentsFlat = Object.values(mockAgents).flat();
// Count unique explanation types per agent (duplicates become a ×N badge on one icon)
const _maxExplUniqueTypes = Math.max(1, ..._allAgentsFlat.map(a => {
  const v = a.explanation;
  const arr = Array.isArray(v) ? v.filter(Boolean) : (v ? [v] : []);
  return new Set(arr).size;
}));
const _maxVacTypeLen = Math.max(1, ..._allAgentsFlat.map(a => (a.vacation?.type?.length ?? 0)));
// Icon button: 26 px wide + 3 px gap. N unique types: N×26 + (N−1)×3 = 29N−3. Cell padding 10 px.
const DYN_EXPL_WIDTH = Math.max(36, _maxExplUniqueTypes * 29 - 3 + 10);
// badge: ~9px per Cyrillic char + 28px (padding + borders + cell)
const DYN_VAC_WIDTH  = Math.max(44, _maxVacTypeLen * 9 + 28);

// ── Column group header definitions ──────────────────────────────────────────
const COL_GROUPS = [
  { label: 'BASIC INFO',         labelKey: 'group.BASIC INFO',         color: '#60a5fa', bg: '#fffffa' },
  { label: 'CALL METRICS',       labelKey: 'group.CALL METRICS',       color: '#38bdf8', bg: '#fffffa' },
  { label: 'EFFICIENCY',         labelKey: 'group.EFFICIENCY',         color: '#34d399', bg: '#fffffa' },
  { label: 'INFO',               labelKey: 'group.INFO',               color: '#38bdf8', bg: '#fffffa' },
  { label: 'BONUS',              labelKey: 'group.BONUS',              color: '#4ade80', bg: '#fffffa' },
  { label: 'TABEL',              labelKey: 'group.TABEL',              color: '#22d3ee', bg: '#ecfeff' },
  { label: 'TOTALS (BI-BK)',     labelKey: 'group.TOTALS (BI-BK)',     color: '#fbbf24', bg: '#fffffa' },
  { label: 'ALLOWANCES',         labelKey: 'group.ALLOWANCES',         color: '#7dd3fc', bg: '#fffffa' },
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
  { key: 'explanation',     labelKey: 'col.explanation',      group: 'EFFICIENCY',         width: DYN_EXPL_WIDTH },
  { key: 'vacation',        labelKey: 'col.vacation',         group: 'EFFICIENCY',         width: DYN_VAC_WIDTH  },
  { key: 'factScore',       labelKey: 'col.factScore',        group: 'EFFICIENCY',         width: 66  },
  // INFO
  { key: 'debtTime',        labelKey: 'col.debtTime',         group: 'INFO',               width: 80  },
  { key: 'workTime',        labelKey: 'col.workTime',         group: 'INFO',               width: 80  },
  { key: 'systemError',     labelKey: 'col.systemError',      group: 'INFO',               width: 80  },
  // BONUS (merged with former LIMITS & GRADES)
  { key: 'b2',              labelKey: 'col.b2',               group: 'BONUS',              width: 90  },
  { key: 'surcharge',       labelKey: 'col.surcharge',        group: 'BONUS',              width: 66  },
  { key: 'limit',           labelKey: 'col.limit',            group: 'BONUS',              width: 60  },
  { key: 'razryad',         labelKey: 'col.razryad',          group: 'BONUS',              width: 62  },
  // TABEL — 4 summary cols (always visible) + 31 calendar day cols
  { key: 'tabel_worked',    labelKey: 'col.tabel_worked',     group: 'TABEL',              width: 48  },
  { key: 'tabel_prazdHrs',  labelKey: 'col.tabel_prazdHrs',  group: 'TABEL',              width: 54  },
  { key: 'tabel_vecherHrs', labelKey: 'col.tabel_vecherHrs', group: 'TABEL',              width: 54  },
  { key: 'tabel_nochHrs',   labelKey: 'col.tabel_nochHrs',   group: 'TABEL',              width: 54  },
  ...Array.from({ length: 31 }, (_, i) => ({
    key: `day_${String(i + 1).padStart(2, '0')}`,
    labelKey: String(i + 1),
    group: 'TABEL',
    width: 26,
    day: i + 1,
  })),
  // TOTALS (BI-BK) — profitFromOp + deductions + nadbavka
  { key: 'profitFromOp',    labelKey: 'col.profitFromOp',     group: 'TOTALS (BI-BK)',     width: 100 },
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
  { key: 'vyslugaLet',      labelKey: 'col.vyslugaLet',       group: 'ALLOWANCES',         width: 90  },
];

// Keys whose zero value displays as '–' in cells
const DASH_IF_ZERO = new Set(['profitFromOp', 'noch', 'vecher', 'prazdnichny', 'stoimostBiletov']);

// ── Anchor columns that stay visible when a section is collapsed ─────────────
const SECTION_ANCHORS = {
  'BASIC INFO':         new Set(['name']),
  'CALL METRICS':       new Set(['perfPct']),
  'EFFICIENCY':         new Set(['factScore']),    // explanation+vacation hidden when collapsed; shown via hover panel
  'INFO':               new Set(['debtTime']),
  'BONUS':              new Set(['b2', 'limit', 'razryad']),
  'TABEL':              new Set(['tabel_worked', 'tabel_prazdHrs', 'tabel_vecherHrs', 'tabel_nochHrs']),
  'TOTALS (BI-BK)':     new Set([K_ITOG]),
  'ALLOWANCES':         new Set(['vyslugaLet']),
};

// Precompute which groups actually have collapsible (non-anchor) columns
const COLLAPSIBLE_GROUPS = new Set(
  Object.keys(SECTION_ANCHORS).filter(g =>
    COLUMNS.some(c => c.group === g && !SECTION_ANCHORS[g].has(c.key))
  )
);

// ── TABEL: March 2026 schedule helpers ──────────────────────────────────────────
const TABEL_WEEKENDS  = new Set([1, 7, 8, 14, 15, 21, 22, 28, 29]); // Sun 1,8,15,22,29 | Sat 7,14,21,28
const TABEL_WORK_DAYS = Array.from({ length: 31 }, (_, i) => i + 1).filter(d => !TABEL_WEEKENDS.has(d));
const _schedCache = new Map();

// Agents on 11-hour 2-day-work / 2-day-rest rotating shift (no fixed weekends)
const ELEVEN_HOUR_AGENTS = new Set([
  '1242-8', '1242-16', '1242-27', '1242-35', '1242-43', '1242-57',
  '1000-6', '1009-6', '1170-6', '1170-8',
]);

// Parse 'DD.MM.YYYY' → March day (1-31), 0 = before March, 32 = after March
function getMarchDay(dateStr) {
  if (!dateStr) return null;
  const [d, m, y] = dateStr.split('.').map(Number);
  if (y !== 2026) return null;
  if (m < 3) return 0;
  if (m === 3) return d;
  return 32;
}

function getAgentSchedule(agent) {
  if (_schedCache.has(agent.id)) return _schedCache.get(agent.id);

  // Vacation date range clamped to March days 1-31
  let vacFrom = null, vacTo = null;
  if (agent.vacation?.from && agent.vacation?.to) {
    const f = getMarchDay(agent.vacation.from);
    const t = getMarchDay(agent.vacation.to);
    if (f !== null && t !== null) {
      vacFrom = Math.max(1, f);
      vacTo   = Math.min(31, t === 32 ? 31 : t);
    }
  }
  const vacType = agent.vacation?.type ?? null;

  // Hash agent id for deterministic RNG
  let h = 0;
  for (let i = 0; i < agent.id.length; i++) h = (Math.imul(31, h) + agent.id.charCodeAt(i)) | 0;

  const sched = {};

  if (ELEVEN_HOUR_AGENTS.has(agent.id)) {
    // ── 11-hour shift: 2 work days, 2 rest days, rotating (no fixed weekends) ──
    const phase = (h >>> 0) % 4; // per-agent rotation offset so shifts stagger
    for (let d = 1; d <= 31; d++) {
      if (vacFrom !== null && d >= vacFrom && d <= vacTo) {
        sched[d] = vacType; // vacation covers all days including non-work days
      } else {
        const pos = ((d - 1) + phase) % 4;
        sched[d] = pos < 2 ? 11 : null; // 11h worked or rest
      }
    }
  } else {
    // ── 8-hour shift: Mon-Fri schedule ──
    const targetWorked = Math.min(agent.worked ?? 22, TABEL_WORK_DAYS.length);
    const missCount    = TABEL_WORK_DAYS.length - targetWorked;
    const missedDays   = new Set();
    const pool = [...TABEL_WORK_DAYS];
    let rng = (h >>> 0) + 1;
    for (let i = 0; i < missCount; i++) {
      rng = ((rng * 1664525) + 1013904223) >>> 0;
      const idx = rng % pool.length;
      missedDays.add(pool[idx]);
      pool.splice(idx, 1);
    }
    const nochDayCount = Math.round((agent.noch || 0) / 8000);
    const nochDays = new Set();
    if (nochDayCount > 0) {
      const wp = TABEL_WORK_DAYS.filter(d => !missedDays.has(d));
      let rng2 = ((h ^ 0x5A5A5A5A) >>> 0) + 1;
      for (let i = 0; i < Math.min(nochDayCount, wp.length); i++) {
        rng2 = ((rng2 * 1664525) + 1013904223) >>> 0;
        nochDays.add(wp[rng2 % wp.length]);
      }
    }
    for (let d = 1; d <= 31; d++) {
      if (vacFrom !== null && d >= vacFrom && d <= vacTo) {
        sched[d] = vacType;                      // vacation covers all days including weekends
      } else if (TABEL_WEEKENDS.has(d)) {
        sched[d] = null;                         // weekend
      } else if (missedDays.has(d)) {
        sched[d] = agent.vacation?.type ?? 'Н'; // absent
      } else {
        sched[d] = nochDays.has(d) ? 11 : 8;   // worked
      }
    }
  }

  _schedCache.set(agent.id, sched);
  return sched;
}

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
    color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc',
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

// ── Vacation icon SVGs (inline) ───────────────────────────────────────────
const VAC_ICONS = {
  // Pregnant woman — paths from /public/pregnant.svg (text nodes removed, viewBox cropped)
  PregnantWoman: (
    <svg width="26" height="26" viewBox="-5 -10 110 110" fill="currentColor">
      <circle cx="51.289" cy="18.77" r="6.6914"/>
      <path fillRule="evenodd" d="m44.789 24.09-6.9688 9.3594c-2.6094 3.4883-4.0898 5.0508-3.8906 7.9414 0.17187 2.5117 2.9492 4.6016 7.6211 7.8516l4.8086 3.0781c0.39062 0.26172 0.51172 0.78125 0.26953 1.1797-0.23828 0.39062-0.73828 0.53125-1.1484 0.32031l-1.8906-1.0781c-1.0508 8.0312-1.6602 14.551-3.1602 20.719 0.12109 0.69141 0.73828 1.1914 1.4414 1.1914h3.1406 7.6992 9.0195c0.30078 0 0.51953-0.26953 0.46875-0.55859-1.4219-9.0117 4.9297-16.551 3.7617-24.25-1-6.5312-4.3086-10.27-8.1016-12.422-0.32031-0.17969-0.30078-0.33984 0-0.51953 4.2305-2.5 0.82031-5.6211-1.9609-9.0312-2.0508-2.5195-3.1797-4.0781-5.5586-5.1289-1.9609-0.80078-4.3984-0.19922-5.5508 1.3594zm-0.37891 20.18c0 0.19141-0.23828 0.28125-0.37109 0.14062l-2.2383-2.3984c-1.2383-1.0586-0.53125-1.7891 0.5-3.1406 0 0 0.96094-1.1797 0.96094-1.1914l0.80078-1.0195c0.19922-0.25 0.60156-0.12109 0.60938 0.19922l-0.25 7.3906z"/>
      <path fillRule="evenodd" d="m47.398 76.641 0.60156 14.18c0 5.0508 6.6406 5.0508 6.6406 0 0 0 0.60156-10.609 0.60156-14.18z"/>
    </svg>
  ),
  // Thermometer — glass tube + bulb (Material thermostat path)
  Thermometer: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-3 7c-1.65 0-3-1.35-3-3 0-1.3.84-2.4 2-2.82V5c0-.55.45-1 1-1s1 .45 1 1v9.18A2.99 2.99 0 0 1 15 17c0 1.65-1.35 3-3 3z"/>
    </svg>
  ),
  // Work — exit door icon (operator is out / off duty)
  Work: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      {/* door frame */}
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
      {/* door panel (right half) */}
      <rect x="12" y="5" width="7" height="14" rx="0"/>
      {/* arrow pointing left (exit direction) */}
      <path d="M10.5 15.5L7 12l3.5-3.5 1.06 1.06L9.12 11.5H16v1.5H9.12l2.44 1.94z" fill="#ffffff"/>
      {/* door knob */}
      <circle cx="11.2" cy="12" r="0.9" fill="#ffffff"/>
    </svg>
  ),
  // Baby stroller — side view with canopy, seat, handle and two wheels
  ChildFriendly: (
    <svg width="16" height="16" viewBox="0 0 100 100" fill="currentColor">
      {/* canopy arc */}
      <path d="M20 52 Q20 18 60 18 Q80 18 85 32 L20 52Z"/>
      {/* seat / body of stroller */}
      <rect x="20" y="52" width="60" height="14" rx="4"/>
      {/* handle — tall bar on left */}
      <rect x="15" y="26" width="6" height="28" rx="3"/>
      {/* front wheel */}
      <circle cx="74" cy="78" r="9" fill="none" stroke="currentColor" strokeWidth="5"/>
      {/* back wheel */}
      <circle cx="30" cy="78" r="9" fill="none" stroke="currentColor" strokeWidth="5"/>
      {/* leg struts */}
      <line x1="26" y1="66" x2="30" y2="69" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
      <line x1="74" y1="66" x2="74" y2="69" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
    </svg>
  ),
  // Umbrella — paths from /public/vacation.svg (text nodes removed, viewBox cropped)
  BeachAccess: (
    <svg width="16" height="16" viewBox="-5 -10 110 110" fill="currentColor">
      <path d="m93.184 65.191h-36.426l7.3555-27.344 30.434 8.125c0.99609 0.27344 2.082-0.32422 2.3516-1.3594 5.3359-18.332-6.6133-38.867-25.148-43.402-18.941-5.0547-38.477 6.1836-43.555 25.055-0.28906 0.99219 0.35547 2.1094 1.3594 2.3594l30.84 8.2305-7.6211 28.336h-27.637l-12.703-30.262c-1.0117-2.4062-3.3477-3.9609-5.957-3.9609-4.4062-0.125-7.7344 4.75-6.0195 8.8086l12.094 31.027c1.9023 4.875 6.5078 8.0273 11.738 8.0273h4.6562l-4.0273 11.953c-1.2422 3.375 1.5938 7.2344 5.1836 7.0703 2.3008 0 4.3438-1.4648 5.0781-3.6484l5.1797-15.375h32.453l5.2539 17.355c0.6875 2.2773 2.75 3.8047 5.1289 3.8047 3.5547 0.21094 6.4375-3.5312 5.3047-6.9102l-4.3125-14.25h8.9922c3.7578 0 6.8164-3.0586 6.8164-6.8203 0.003906-3.7617-3.0547-6.8203-6.8125-6.8203zm-13.898-56.602c11.027 6.6172 17.141 20.562 14.344 33.156l-15.031-4.0117c1.2148-5.2266 4.1406-20.023 0.6875-29.145zm-46.816 16.832c4.2617-12.715 16.059-21.121 29.031-21.555-3.2539 2.7344-5.6484 6.168-8.3203 11.309-2.8633 5.6172-4.7969 11.391-5.6758 14.258zm24.156-8.5469c3.2266-6.3125 8.2969-13.508 14.133-11.949 10.633 4.207 5.1484 25.613 4.1133 31.812l-23.652-6.3125c0.86719-2.793 2.7344-8.3164 5.4062-13.551z"/>
    </svg>
  ),
  // Military helmet icon
  Soldier: (
    <svg width="20" height="20" viewBox="0 0 100 100" fill="currentColor">
      {/* helmet dome */}
      <path d="M50 8 C28 8 16 24 16 40 L84 40 C84 24 72 8 50 8 Z"/>
      {/* helmet rim / brim — wide flat band */}
      <rect x="10" y="38" width="80" height="10" rx="5"/>
      {/* chin strap left */}
      <path d="M18 48 Q14 62 18 72 Q22 76 26 74 Q22 62 22 48 Z"/>
      {/* chin strap right */}
      <path d="M82 48 Q86 62 82 72 Q78 76 74 74 Q78 62 78 48 Z"/>
      {/* centre ridge on dome */}
      <rect x="46" y="10" width="8" height="28" rx="4"/>
    </svg>
  ),
};

// ── Vacation type metadata ─────────────────────────────────────────────────
const VACATION_META = {
  'ДДО 2':   { color: '#1d4ed8', bg: '#dbeafe',  border: '#93c5fd', icon: VAC_ICONS.ChildFriendly },
  'ДДО 3':   { color: '#1d4ed8', bg: '#dbeafe',  border: '#93c5fd', icon: VAC_ICONS.ChildFriendly },
  'Уволен':  { color: '#dc2626', bg: '#fef2f2',  border: '#fca5a5' },
  'Б':       { color: '#1e40af', bg: '#dbeafe',  border: '#93c5fd', icon: VAC_ICONS.Thermometer },
  'О':       { color: '#d97706', bg: '#fef3c7',  border: '#fcd34d', icon: VAC_ICONS.BeachAccess },
  'У':       { color: '#0369a1', bg: '#e0f2fe',  border: '#7dd3fc', icon: VAC_ICONS.Work },
  'ДДО Б':   { color: '#0f766e', bg: '#ccfbf1',  border: '#5eead4', icon: VAC_ICONS.PregnantWoman },
  'Н':       { color: '#9f1239', bg: '#fff1f2',  border: '#fecdd3' },
  'БС':      { color: '#b45309', bg: '#fffbeb',  border: '#fde68a' },
  '7.0':     { color: '#475569', bg: '#f1f5f9',  border: '#cbd5e1' },
  'БО':      { color: '#0e7490', bg: '#ecfeff',  border: '#a5f3fc' },
  'ГС':      { color: '#166534', bg: '#dcfce7',  border: '#86efac', icon: VAC_ICONS.Soldier },
};

// Quadrant positions based on icon index (fans outward to avoid overlap)
// Index 0 (left icon):  tooltip top-left  (extends leftward)
// Index 1 (right icon): tooltip top-right (extends rightward)
// Index 2: bottom-left, Index 3: bottom-right
const EXPL_QUADRANTS = [
  { above: true,  leftAnchor: false }, // index 0: above, right:0 → extends LEFT
  { above: true,  leftAnchor: true  }, // index 1: above, left:0  → extends RIGHT
  { above: false, leftAnchor: false }, // index 2: below, right:0 → extends LEFT
  { above: false, leftAnchor: true  }, // index 3: below, left:0  → extends RIGHT
];

function ExplanationIconItem({ type, count, rowHovered, index }) {
  const [hovered, setHovered] = React.useState(false);
  const meta = EXPL_META[type] || EXPL_META['Другое'];
  const showTooltip = hovered || rowHovered;
  const q = EXPL_QUADRANTS[(index || 0) % 4];

  const boxStyle = q.above
    ? { bottom: 'calc(100% + 6px)', ...(q.leftAnchor ? { left: 0 } : { right: 0 }) }
    : { top: 'calc(100% + 6px)',    ...(q.leftAnchor ? { left: 0 } : { right: 0 }) };
  const arrowSide = q.leftAnchor ? { left: '10px' } : { right: '10px' };
  const initY = q.above ? 4 : -4;

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
            initial={{ opacity: 0, y: initY, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: initY, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              ...boxStyle,
              background: '#ffffff', color: '#1e293b',
              fontSize: 11, fontWeight: 600,
              whiteSpace: 'nowrap', padding: '4px 9px',
              borderRadius: 7, boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              zIndex: 9999, pointerEvents: 'none',
            }}
          >
            {count > 1 ? `${type} ×${count}` : type}
            {q.above ? (
              <>
                <span style={{ position: 'absolute', top: '100%', ...arrowSide, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid #e2e8f0' }} />
                <span style={{ position: 'absolute', top: 'calc(100% - 1px)', ...arrowSide, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid #ffffff' }} />
              </>
            ) : (
              <>
                <span style={{ position: 'absolute', bottom: '100%', ...arrowSide, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '4px solid #e2e8f0' }} />
                <span style={{ position: 'absolute', bottom: 'calc(100% - 1px)', ...arrowSide, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '4px solid #ffffff' }} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

function ExplanationIcons({ types }) {
  const counts = {};
  types.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
  return (
    <span style={{ display: 'inline-flex', flexWrap: 'nowrap', gap: 3, alignItems: 'center', justifyContent: 'flex-start' }}>
      {Object.entries(counts).map(([type, count], index) => (
        <ExplanationIconItem key={type} type={type} count={count} index={index} />
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
  // Show tooltip: for icon types always (since text is hidden), for text types only when dates exist
  const shouldShowTooltip = showTooltip && (vm.icon || (v.from && v.to));
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {vm.icon ? (
        // Icon-style square badge (matches ExplanationIconItem appearance)
        <span
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 26, height: 26, borderRadius: 7,
            background: vm.bg, color: vm.color,
            border: `1.5px solid ${vm.border}`,
            cursor: 'default', boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
          }}
        >
          {vm.icon}
        </span>
      ) : (
        // Text pill badge (original style)
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
      )}
      <AnimatePresence>
        {shouldShowTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: '0',
              background: '#ffffff', color: '#1e293b',
              fontSize: 11, fontWeight: 600,
              whiteSpace: 'nowrap', padding: '5px 10px',
              borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              zIndex: 9999, pointerEvents: 'none',
            }}
          >
            {v.type}{v.from && v.to ? ` · ${t('vac.from')}: ${v.from} — ${t('vac.to')}: ${v.to}` : ''}
            <span style={{
              position: 'absolute', bottom: '100%', left: '10px',
              borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
              borderBottom: '5px solid #e2e8f0',
            }} />
            <span style={{
              position: 'absolute', bottom: 'calc(100% - 1px)', left: '10px',
              borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
              borderBottom: '5px solid #ffffff',
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ── Efficiency hover info panel (portal, shown when section is collapsed) ── */
function EfficiencyHoverPanel({ agent, anchorEl }) {
  const expl = Array.isArray(agent.explanation)
    ? agent.explanation.filter(Boolean)
    : (agent.explanation ? [agent.explanation] : []);
  const vac = agent.vacation;
  if (!expl.length && !vac) return null;

  const rect = anchorEl?.getBoundingClientRect?.();
  if (!rect) return null;

  const counts = {};
  expl.forEach(type => { counts[type] = (counts[type] || 0) + 1; });

  const panelTop  = rect.bottom + 4;
  const panelLeft = Math.max(8, Math.min(rect.left + 60, window.innerWidth - 440));

  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.13 }}
      style={{
        position: 'fixed',
        top: panelTop,
        left: panelLeft,
        transform: 'none',
        zIndex: 9990,
        background: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: 10,
        boxShadow: '0 6px 24px rgba(0,0,0,0.13)',
        padding: '5px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {Object.entries(counts).map(([type, count]) => {
        const meta = EXPL_META[type] || EXPL_META['Другое'];
        return (
          <span key={type} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: meta.bg, color: meta.color,
            border: `1.5px solid ${meta.border}`,
            padding: '3px 8px', borderRadius: 6,
            fontSize: 11, fontWeight: 700,
          }}>
            {React.cloneElement(meta.icon, { width: 18, height: 18 })}
            <span>{type}{count > 1 ? ` ×${count}` : ''}</span>
          </span>
        );
      })}
      {expl.length > 0 && vac && (
        <span style={{ width: 1, height: 18, background: '#e2e8f0', flexShrink: 0, display: 'inline-block' }} />
      )}
      {vac && (() => {
        const vm = VACATION_META[vac.type] || { color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' };
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: vm.bg, color: vm.color,
            border: `1.5px solid ${vm.border}`,
            padding: '3px 8px', borderRadius: 6,
            fontSize: 11, fontWeight: 700,
          }}>
            <span>{vac.type}</span>
            {vac.from && vac.to && (
              <span style={{ fontSize: 10, opacity: 0.7 }}>{vac.from}–{vac.to}</span>
            )}
          </span>
        );
      })()}
    </motion.div>,
    document.body
  );
}

/* ── hh:mm:ss formatter for INFO time columns ───────────────────────────── */
function fmtHMS(sec) {
  if (!sec && sec !== 0) return '–';
  const s = Math.round(Math.abs(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

/* ── Cell value renderer ──────────────────────────────────────────────────── */
function CellValue({ colKey, agent }) {
  const { lang } = useLang();
  const t = k => translations[lang]?.[k] ?? k;
  switch (colKey) {
    case 'planTime':
    case 'factTime':
      return <span>{fmtTime(agent[colKey])}</span>;

    case 'debtTime':
    case 'workTime':
    case 'systemError':
      return <span>{fmtHMS(agent[colKey])}</span>;

    case 'perfPct':
      return <span className="font-semibold">{agent[colKey]}%</span>;

    case 'explanation': {
      const val = agent[colKey];
      const arr = Array.isArray(val) ? val.filter(Boolean) : (val ? [val] : []);
      return arr.length > 0 ? <ExplanationIcons types={arr} /> : null;
    }

    case 'vacation': {
      const v = agent[colKey];
      if (!v) return null;
      return <VacationBadge v={v} />;
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

    case 'tabel_worked':
      return <span style={{ fontWeight: 800, color: '#0369a1' }}>{agent.worked ?? 0}</span>;
    case 'tabel_prazdHrs': {
      const v = Math.round((agent.prazdnichny || 0) / 15000);
      return <span style={{ color: v > 0 ? '#78350f' : '#cbd5e1' }}>{v > 0 ? v : '–'}</span>;
    }
    case 'tabel_vecherHrs': {
      const v = Math.round((agent.vecher || 0) / 5000);
      return <span style={{ color: v > 0 ? '#0369a1' : '#cbd5e1' }}>{v > 0 ? v : '–'}</span>;
    }
    case 'tabel_nochHrs': {
      const v = Math.round((agent.noch || 0) / 7500);
      return <span style={{ color: v > 0 ? '#1d4ed8' : '#cbd5e1' }}>{v > 0 ? v : '–'}</span>;
    }
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

/* ── B2 cell with comment portal tooltip ─────────────────────────────────── */
function B2CommentCell({ agent, b2Override, b2IsHigher, b2IsLower, borderRight, onContextMenu, onSave, b2Comments }) {
  const tdRef = React.useRef(null);
  const comment = (b2Comments && b2Comments[agent.id]) || null;
  const [tooltipPos, setTooltipPos] = React.useState(null);
  const [cellHovered, setCellHovered] = React.useState(false);

  React.useEffect(() => {
    if (comment && cellHovered && tdRef.current) {
      const rect = tdRef.current.getBoundingClientRect();
      const cellCenterX = rect.left + rect.width / 2;
      const boxWidth = 260;
      const margin = 8;
      let boxLeft = cellCenterX - boxWidth / 2;
      if (boxLeft < margin) boxLeft = margin;
      if (boxLeft + boxWidth > window.innerWidth - margin) boxLeft = window.innerWidth - margin - boxWidth;
      const arrowLeft = Math.max(12, Math.min(boxWidth - 12, cellCenterX - boxLeft));
      setTooltipPos({ bottom: window.innerHeight - rect.top + 8, boxLeft, arrowLeft });
    } else {
      setTooltipPos(null);
    }
  }, [cellHovered, comment]);

  return (
    <td
      ref={tdRef}
      onContextMenu={onContextMenu}
      onMouseEnter={() => setCellHovered(true)}
      onMouseLeave={() => setCellHovered(false)}
      style={{
        position: 'relative',
        textAlign: 'center', padding: '5px 5px', fontSize: 11,
        borderBottom: '1px solid #e5e7eb', borderRight, whiteSpace: 'nowrap',
        background: b2IsHigher ? '#dcfce7' : b2IsLower ? '#fee2e2' : undefined,
        color: b2IsHigher ? '#15803d' : b2IsLower ? '#dc2626' : '#374151',
      }}
    >
      {comment && (
        <span style={{
          position: 'absolute', top: 0, right: 0,
          width: 0, height: 0,
          borderStyle: 'solid',
          borderWidth: '0 7px 7px 0',
          borderColor: 'transparent #4ade80 transparent transparent',
          pointerEvents: 'none',
        }} />
      )}
      <B2Cell
        agentId={agent.id}
        b1Val={agent.b1}
        override={b2Override}
        onSave={onSave}
        onActivate={() => {}}
      />
      {comment && ReactDOM.createPortal(
        <AnimatePresence>
          {tooltipPos && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'fixed',
                bottom: tooltipPos.bottom,
                left: tooltipPos.boxLeft,
                width: 260,
                zIndex: 99999,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                padding: '7px 11px',
                pointerEvents: 'none',
              }}
            >
              <p style={{
                fontSize: 11, color: '#1e293b', fontWeight: 600,
                lineHeight: 1.55, margin: 0,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {comment}
              </p>
              {/* arrow pointing down toward the cell */}
              <span style={{
                position: 'absolute', top: '100%',
                left: tooltipPos.arrowLeft,
                transform: 'translateX(-50%)',
                borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
                borderTop: '4px solid #e2e8f0',
              }} />
              <span style={{
                position: 'absolute', top: 'calc(100% - 1px)',
                left: tooltipPos.arrowLeft,
                transform: 'translateX(-50%)',
                borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
                borderTop: '4px solid #ffffff',
              }} />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </td>
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
export default function PayrollTable({ agents, activeGroup, visibleColumns, totalAll, isLoading, onDeleteAgents, onTransferAgents, groupNames, b2Comments }) {
  const { lang } = useLang();
  const t = k => translations[lang]?.[k] ?? k;

  // ─ Column ordering (drag-to-reorder) ────────────────────────────
  const [colKeyOrder, setColKeyOrder] = React.useState(() => COLUMNS.map(c => c.key));
  const orderedCols = React.useMemo(
    () => colKeyOrder.map(k => COLUMNS.find(c => c.key === k)).filter(Boolean),
    [colKeyOrder]
  );

  // ─ Section collapse state ────────────────────────────────────────
  const [collapsedGroups, setCollapsedGroups] = React.useState(new Set());
  const toggleGroupCollapse = (label) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  };

  const visibleCols = orderedCols.filter(c => {
    if (visibleColumns[c.group] === false) return false;
    if (c.allGroupOnly && activeGroup !== 'All') return false;
    if (collapsedGroups.has(c.group) && !(SECTION_ANCHORS[c.group]?.has(c.key))) return false;
    return true;
  });
  const totalWidth  = visibleCols.reduce((sum, c) => sum + c.width, 0);

  // Derive visible group order from the ordered visibleCols
  const visibleGroups = React.useMemo(() => {
    const seen = new Set();
    return visibleCols.reduce((acc, col) => {
      if (!seen.has(col.group)) {
        seen.add(col.group);
        const g = COL_GROUPS.find(g => g.label === col.group);
        if (g) acc.push(g);
      }
      return acc;
    }, []);
  }, [visibleCols]);

  // ─ Drag-mode state ────────────────────────────────────────
  const [dragMode, setDragMode] = React.useState(false);
  const [dragOverKey, setDragOverKey] = React.useState(null);
  const [dragOverGroup, setDragOverGroup] = React.useState(null);
  const holdTimeoutRef = React.useRef(null);
  const holdElemRef    = React.useRef(null);

  React.useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setDragMode(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // No setInterval / no setState during hold → zero re-renders while holding.
  // CSS @keyframes (injected below) drives the visual progress bar entirely on the GPU.
  const startHold = (elem) => {
    clearHold();
    holdElemRef.current = elem;
    elem.classList.add('is-holding');
    holdTimeoutRef.current = setTimeout(() => {
      elem.classList.remove('is-holding');
      holdElemRef.current = null;
      setDragMode(true);          // single state update, once, after 1 s
    }, 1000);
  };
  const clearHold = () => {
    clearTimeout(holdTimeoutRef.current);
    if (holdElemRef.current) {
      holdElemRef.current.classList.remove('is-holding');
      holdElemRef.current = null;
    }
  };

  const moveCol = (fromKey, toKey) => {
    if (fromKey === toKey) return;
    setColKeyOrder(prev => {
      const from = prev.indexOf(fromKey);
      const to   = prev.indexOf(toKey);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      next.splice(from, 1);
      // After removing `from`, re-compute where toKey now sits
      const newTo = next.indexOf(toKey);
      if (from < to) {
        // Moving right: land AFTER the target
        next.splice(newTo + 1, 0, fromKey);
      } else {
        // Moving left: land BEFORE the target
        next.splice(newTo, 0, fromKey);
      }
      return next;
    });
  };

  const moveGroup = (fromGroup, toGroup) => {
    if (fromGroup === toGroup) return;
    setColKeyOrder(prev => {
      const groupKeys = prev.filter(k => COLUMNS.find(x => x.key === k)?.group === fromGroup);
      if (!groupKeys.length) return prev;
      const rest = prev.filter(k => !groupKeys.includes(k));

      // Determine direction in the original (pre-removal) order
      const fromPos = prev.findIndex(k => groupKeys.includes(k));
      const toPos   = prev.findIndex(k => COLUMNS.find(x => x.key === k)?.group === toGroup);
      if (toPos === -1) return prev;

      const result = [...rest];
      if (fromPos < toPos) {
        // Moving right: insert AFTER the last key of toGroup in rest
        let lastIdx = -1;
        result.forEach((k, i) => { if (COLUMNS.find(x => x.key === k)?.group === toGroup) lastIdx = i; });
        if (lastIdx === -1) return prev;
        result.splice(lastIdx + 1, 0, ...groupKeys);
      } else {
        // Moving left: insert BEFORE the first key of toGroup in rest
        const firstIdx = result.findIndex(k => COLUMNS.find(x => x.key === k)?.group === toGroup);
        if (firstIdx === -1) return prev;
        result.splice(firstIdx, 0, ...groupKeys);
      }
      return result;
    });
  };

  // ─ Existing state ───────────────────────────────────────────
  const [ctxMenu, setCtxMenu] = React.useState({ visible: false, x: 0, y: 0, agentId: null });
  const [b2Overrides, setB2Overrides] = React.useState({});
  const [hoveredRowId, setHoveredRowId] = React.useState(null);
  const hoveredTrRef = React.useRef(null);
  const [selectedForDelete, setSelectedForDelete] = React.useState(new Set());
  const [deleteMode, setDeleteMode] = React.useState(false);
  const [transferMode, setTransferMode] = React.useState(false);
  const [selectedForTransfer, setSelectedForTransfer] = React.useState(new Set());

  const exitDeleteMode = () => { setDeleteMode(false); setSelectedForDelete(new Set()); };
  const exitTransferMode = () => { setTransferMode(false); setSelectedForTransfer(new Set()); };

  // ─ Sort state ───────────────────────────────────────────────
  const [sortKey, setSortKey] = React.useState(null);
  const [sortDir, setSortDir] = React.useState('asc');

  function handleSortClick(key) {
    if (sortKey === key) {
      if (sortDir === 'asc') { setSortDir('desc'); }
      else { setSortKey(null); setSortDir('asc'); }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  // Must be before any early returns (Rules of Hooks)
  const allAgents = React.useMemo(() => {
    const base = agents || [];
    if (!sortKey) return base;
    return [...base].sort((a, b) => {
      if (sortKey === 'name') {
        const cmp = (a.name ?? '').localeCompare(b.name ?? '');
        return sortDir === 'asc' ? cmp : -cmp;
      }
      const av = Number(a[sortKey]) || 0;
      const bv = Number(b[sortKey]) || 0;
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [agents, sortKey, sortDir]);

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

  return (
    <div className="relative overflow-x-auto" onContextMenu={handleTableContextMenu}>
      {/* CSS for hold animation — runs on GPU, zero JS re-renders */}
      <style>{`
        .hold-bar {
          position: absolute; bottom: 0; left: 0;
          height: 2px; width: 0; border-radius: 2px;
          background: #38bdf8; pointer-events: none;
        }
        .is-holding .hold-bar {
          animation: hold-grow 1s linear forwards;
        }
        @keyframes hold-grow { from { width: 0% } to { width: 100% } }
        .row-odd:hover td, .row-even:hover td {
          background: rgba(14, 165, 233, 0.04) !important;
        }
      `}</style>

      {/* Drag-mode banner */}
      {dragMode && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 99997,
          background: '#f0f9ff',
          padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 11, fontWeight: 700, color: '#0284c7',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 9h14M5 15h14" /><path d="M9 5v14M15 5v14" />
          </svg>
          Drag mode — drag sections or columns to reorder · Press <kbd style={{ background: '#e0f2fe', borderRadius: 3, padding: '1px 5px', fontFamily: 'monospace', fontSize: 10 }}>Esc</kbd> to exit
        </div>
      )}

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
              {ctxMenu.agentId && b2Overrides[ctxMenu.agentId] !== undefined ? (
                <>
                  {t('ctx.resetCell')}
                  <span style={{ marginLeft: 5, opacity: 0.55, fontSize: 11, fontWeight: 400 }}>
                    ({(() => { const ag = agents?.find(a => a.id === ctxMenu.agentId); return ag ? ag.b1 : ''; })()})
                  </span>
                </>
              ) : t('ctx.return')}
            </button>
            {/* Delete + Transfer buttons — enter selection mode */}
            {ctxMenu.agentId && (
              <>
                <div style={{ margin: '3px 8px', borderTop: '1px solid #f1f5f9' }} />
                {/* Transfer button — only available when viewing a specific branch */}
                {activeGroup !== 'All' && (
                  <button
                    onClick={() => {
                      exitDeleteMode();
                      setTransferMode(true);
                      setSelectedForTransfer(new Set([ctxMenu.agentId]));
                      setCtxMenu(m => ({ ...m, visible: false }));
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', padding: '7px 12px',
                      background: 'none', border: 'none', borderRadius: 7,
                      color: '#0369a1', fontSize: 13, fontWeight: 500,
                      cursor: 'pointer', textAlign: 'left',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#e0f2fe'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, color: '#0369a1' }}>
                      <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
                    </svg>
                    Перенести
                  </button>
                )}
                <button
                  onClick={() => {
                    exitTransferMode();
                    setDeleteMode(true);
                    setSelectedForDelete(new Set());
                    setCtxMenu(m => ({ ...m, visible: false }));
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '7px 12px',
                    background: 'none', border: 'none', borderRadius: 7,
                    color: '#dc2626', fontSize: 13, fontWeight: 500,
                    cursor: 'pointer', textAlign: 'left',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                  {t('ctx.delete')}
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating transfer action bar */}
      <AnimatePresence>
        {transferMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
              zIndex: 99998,
              background: '#ffffff',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              border: '1px solid #bae6fd',
              padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              minWidth: 380,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0369a1"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>
              <span style={{ color: '#0369a1', fontWeight: 800 }}>{selectedForTransfer.size}</span>
              {' '}выбрано · Перенести в:
            </span>
            {(groupNames || []).filter(g => g !== activeGroup).map(branch => (
              <button
                key={branch}
                disabled={selectedForTransfer.size === 0}
                onClick={() => {
                  if (selectedForTransfer.size === 0) return;
                  onTransferAgents([...selectedForTransfer], branch);
                  exitTransferMode();
                }}
                style={{
                  padding: '5px 14px', borderRadius: 7, border: '1px solid #bae6fd',
                  background: selectedForTransfer.size === 0 ? '#f0f9ff' : '#0369a1',
                  color: selectedForTransfer.size === 0 ? '#94a3b8' : '#ffffff',
                  fontSize: 12, fontWeight: 700,
                  cursor: selectedForTransfer.size === 0 ? 'not-allowed' : 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { if (selectedForTransfer.size > 0) e.currentTarget.style.background = '#075985'; }}
                onMouseLeave={e => { if (selectedForTransfer.size > 0) e.currentTarget.style.background = '#0369a1'; }}
              >
                {branch}
              </button>
            ))}
            <button
              onClick={() => {
                const all = (agents || []).map(a => a.id);
                const allSelected = all.every(id => selectedForTransfer.has(id));
                setSelectedForTransfer(allSelected ? new Set() : new Set(all));
              }}
              style={{
                marginLeft: 'auto', padding: '5px 12px', borderRadius: 7,
                border: '1px solid #e2e8f0', background: '#f8fafc',
                color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {(agents || []).every(a => selectedForTransfer.has(a.id)) ? t('ctx.deselectAll') : t('ctx.selectAll')}
            </button>
            <button
              onClick={exitTransferMode}
              style={{
                padding: '5px 14px', borderRadius: 7, border: '1px solid #e2e8f0',
                background: '#f8fafc', color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {t('ctx.deleteCancel')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating delete action bar */}
      <AnimatePresence>
        {deleteMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
              zIndex: 99998,
              background: '#ffffff',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              border: '1px solid #fecaca',
              padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              minWidth: 360,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#dc2626"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
              <span style={{ color: '#dc2626', fontWeight: 800 }}>{selectedForDelete.size}</span>
              {' '}{t('ctx.deleteBar')}
            </span>
            <button
              onClick={() => {
                const all = (agents || []).map(a => a.id);
                const allSelected = all.every(id => selectedForDelete.has(id));
                setSelectedForDelete(allSelected ? new Set() : new Set(all));
              }}
              style={{
                marginLeft: 'auto', padding: '5px 12px', borderRadius: 7,
                border: '1px solid #e2e8f0', background: '#f8fafc',
                color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {(agents || []).every(a => selectedForDelete.has(a.id)) ? t('ctx.deselectAll') : t('ctx.selectAll')}
            </button>
            <button
              onClick={exitDeleteMode}
              style={{
                padding: '5px 14px', borderRadius: 7, border: '1px solid #e2e8f0',
                background: '#f8fafc', color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {t('ctx.deleteCancel')}
            </button>
            <button
              disabled={selectedForDelete.size === 0}
              onClick={() => {
                onDeleteAgents([...selectedForDelete]);
                exitDeleteMode();
              }}
              style={{
                padding: '5px 16px', borderRadius: 7, border: 'none',
                background: selectedForDelete.size === 0 ? '#fca5a5' : '#dc2626',
                color: '#ffffff', fontSize: 12, fontWeight: 700, cursor: selectedForDelete.size === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {t('ctx.deleteConfirm')}{selectedForDelete.size > 0 ? ` (${selectedForDelete.size})` : ''}
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
            {visibleGroups.map((g) => {
              const groupCols = visibleCols.filter(c => c.group === g.label);
              if (groupCols.length === 0) return null;
              const isOver = dragOverGroup === g.label;
              const isCollapsed = collapsedGroups.has(g.label);
              const isCollapsible = COLLAPSIBLE_GROUPS.has(g.label);
              return (
                <th
                  key={g.label}
                  colSpan={groupCols.length}
                  draggable={dragMode}
                  onMouseDown={dragMode ? undefined : e => { if (e.button === 0) startHold(e.currentTarget); }}
                  onMouseUp={clearHold}
                  onMouseLeave={clearHold}
                  onClick={!dragMode && isCollapsible ? () => toggleGroupCollapse(g.label) : undefined}
                  onDragStart={e => { e.dataTransfer.setData('dtype', 'group'); e.dataTransfer.setData('dkey', g.label); e.dataTransfer.effectAllowed = 'move'; }}
                  onDragOver={e => { e.preventDefault(); setDragOverGroup(g.label); }}
                  onDragLeave={() => setDragOverGroup(null)}
                  onDrop={e => { e.preventDefault(); const from = e.dataTransfer.getData('dkey'); if (e.dataTransfer.getData('dtype') === 'group') moveGroup(from, g.label); setDragOverGroup(null); }}
                  style={{
                    background: isOver ? '#dbeafe' : isCollapsed ? `${g.color}18` : g.bg,
                    color: g.color,
                    borderBottom: `2px solid ${g.color}33`,
                    borderTop: '3px solid #bae6fd',
                    padding: '5px 6px',
                    textAlign: 'center', fontSize: 9,
                    fontWeight: 800, letterSpacing: '0.07em',
                    borderRight: '3px solid #bae6fd',
                    whiteSpace: 'nowrap',
                    cursor: dragMode ? 'grab' : isCollapsible ? 'pointer' : 'default',
                    position: 'relative',
                    outline: isOver ? '2px dashed #3b82f6' : undefined,
                    transition: 'background 0.15s',
                    userSelect: 'none',
                  }}
                >
                  {dragMode && (
                    <span style={{ marginRight: 4, opacity: 0.5, fontSize: 10 }}>&#8597;</span>
                  )}
                  {isCollapsible && !dragMode && (
                    <span style={{ marginRight: 3, fontSize: 8, opacity: 0.65, display: 'inline-block', transition: 'transform 0.15s', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>&#9660;</span>
                  )}
                  {t(g.labelKey)}
                  {isCollapsed && (
                    <span style={{ marginLeft: 4, fontSize: 8, opacity: 0.55, fontWeight: 600 }}>+{COLUMNS.filter(c => c.group === g.label && !SECTION_ANCHORS[g.label]?.has(c.key)).length}</span>
                  )}
                  <span className="hold-bar" />
                </th>
              );
            })}
          </tr>

          {/* Row 2 – individual column headers */}
          <tr style={{ background: '#fffffa' }}>
            {visibleCols.map((col, i) => {
              const isGroupEnd = i === visibleCols.length - 1 || visibleCols[i + 1].group !== col.group;
              const isOver = dragOverKey === col.key;
              return (
              <th
                key={col.key}
                className="sortable-th"
                draggable={dragMode}
                onMouseDown={dragMode ? undefined : e => { if (e.button === 0) startHold(e.currentTarget); }}
                onMouseUp={clearHold}
                onMouseLeave={clearHold}
                onDragStart={e => { e.dataTransfer.setData('dtype', 'col'); e.dataTransfer.setData('dkey', col.key); e.dataTransfer.effectAllowed = 'move'; }}
                onDragOver={e => { e.preventDefault(); setDragOverKey(col.key); }}
                onDragLeave={() => setDragOverKey(null)}
                onDrop={e => { e.preventDefault(); const from = e.dataTransfer.getData('dkey'); if (e.dataTransfer.getData('dtype') === 'col') moveCol(from, col.key); setDragOverKey(null); }}
                onClick={dragMode ? undefined : () => handleSortClick(col.key)}
                style={{
                  textAlign: 'center',
                  verticalAlign: 'bottom',
                  padding: '5px 4px 6px',
                  fontSize: 10, fontWeight: 700,
                  color: isOver ? '#1d4ed8' : sortKey === col.key ? '#0284c7' : col.day && TABEL_WEEKENDS.has(col.day) ? '#dc2626' : '#374151',
                  background: isOver ? '#dbeafe' : sortKey === col.key ? '#e0f2fe' : col.day && TABEL_WEEKENDS.has(col.day) ? '#fee2e2' : undefined,
                  borderBottom: isOver ? '2px solid #3b82f6' : sortKey === col.key ? '2px solid #0284c7' : '2px solid #d1d5db',
                  borderRight: isGroupEnd ? '3px solid #bae6fd' : '1px solid #e5e7eb',
                  whiteSpace: 'normal', wordBreak: 'break-word',
                  userSelect: 'none',
                  cursor: dragMode ? 'grab' : 'pointer',
                  lineHeight: 1.25,
                  position: 'relative',
                  transition: 'background 0.1s, color 0.1s',
                  boxSizing: 'border-box',
                }}
              >
                <span className="inline-flex flex-col items-center gap-0.5">
                  {dragMode && <span style={{ fontSize: 9, opacity: 0.45, letterSpacing: 0 }}>&#9776;</span>}
                  <span>{t(col.labelKey)}</span>
                  {sortKey === col.key && (
                    <span style={{ fontSize: 8, color: '#0284c7', lineHeight: 1 }}>
                      {sortDir === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </span>
                <span className="hold-bar" />
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
                const isSelectedForDelete = selectedForDelete.has(agent.id);
                const isSelectedForTransfer = selectedForTransfer.has(agent.id);

                return (
                  <tr
                    key={agent.id}
                    className={rowClass}
                    onMouseEnter={e => {
                      hoveredTrRef.current = e.currentTarget;
                      if (collapsedGroups.has('EFFICIENCY')) setHoveredRowId(agent.id);
                    }}
                    onMouseLeave={() => {
                      hoveredTrRef.current = null;
                      if (collapsedGroups.has('EFFICIENCY')) setHoveredRowId(null);
                    }}
                    onContextMenu={e => handleContextMenu(e, agent.id)}
                    onClick={(deleteMode || transferMode) ? () => {
                      if (deleteMode) {
                        setSelectedForDelete(prev => {
                          const next = new Set(prev);
                          if (next.has(agent.id)) next.delete(agent.id); else next.add(agent.id);
                          return next;
                        });
                      } else {
                        setSelectedForTransfer(prev => {
                          const next = new Set(prev);
                          if (next.has(agent.id)) next.delete(agent.id); else next.add(agent.id);
                          return next;
                        });
                      }
                    } : undefined}
                    style={{
                      ...(isSelectedForDelete ? { background: '#fff1f2', outline: '2px solid #fca5a5', outlineOffset: '-1px', opacity: 0.75 } : {}),
                      ...(isSelectedForTransfer ? { background: '#e0f2fe', outline: '2px solid #38bdf8', outlineOffset: '-1px', opacity: 0.75 } : {}),
                      ...((deleteMode || transferMode) ? { cursor: 'pointer' } : {}),
                    }}
                  >
                    {visibleCols.map((col, i) => {
                      const isRedCell = col.key === 'factScore' && agent[col.key] < 80;
                      const isGroupEnd = i === visibleCols.length - 1 || visibleCols[i + 1].group !== col.group;
                      const borderRight = isGroupEnd ? '3px solid #bae6fd' : '1px solid #f3f4f6';

                      // Efficiency-collapsed indicator: coloured right stripe on factScore cell
                      const effCollapsed = collapsedGroups.has('EFFICIENCY');
                      let effIndicatorBorder = borderRight;
                      if (col.key === 'factScore' && effCollapsed) {
                        const hasExplData = Array.isArray(agent.explanation)
                          ? agent.explanation.filter(Boolean).length > 0
                          : !!agent.explanation;
                        const hasVacData = !!agent.vacation;
                        if (hasExplData && hasVacData) {
                          effIndicatorBorder = '3px solid #f59e0b'; // amber — both
                        } else if (hasExplData) {
                          effIndicatorBorder = '3px solid #f59e0b'; // amber — expl only
                        } else if (hasVacData) {
                          effIndicatorBorder = '3px solid #22c55e'; // green — vacation only
                        }
                      }

                      if (col.key === 'b2') {
                        const b2Override = b2Overrides[agent.id];
                        const b2Val = b2Override !== undefined ? b2Override : agent.b1;
                        const b2IsHigher = b2Val > agent.b1;
                        const b2IsLower  = b2Val < agent.b1;
                        return (
                          <B2CommentCell
                            key="b2"
                            agent={agent}
                            b2Override={b2Override}
                            b2IsHigher={b2IsHigher}
                            b2IsLower={b2IsLower}
                            borderRight={borderRight}
                            onContextMenu={e => handleContextMenu(e, agent.id)}
                            onSave={(id, val) => setB2Overrides(prev => ({ ...prev, [id]: val }))}
                            b2Comments={b2Comments}
                          />
                        );
                      }

                      // ── TABEL calendar day cell ─────────────────────────────────
                      if (col.day) {
                        const sched = getAgentSchedule(agent);
                        const val = sched[col.day];
                        const is11h    = ELEVEN_HOUR_AGENTS.has(agent.id);
                        const isSatSun = TABEL_WEEKENDS.has(col.day);  // column is Sat or Sun
                        const isEmpty  = val === null;
                        const isSymbol = typeof val === 'string';
                        const vacStyle = isSymbol
                          ? (VACATION_META[val] ?? { color: '#64748b', bg: '#f1f5f9' })
                          : null;
                        const vacIcon = isSymbol ? (vacStyle?.icon ?? null) : null;
                        // background: Sat/Sun always red; 11h rest on weekday → white; else normal
                        const bgColor = isSatSun              ? '#fee2e2'
                                      : (isEmpty && is11h)    ? undefined
                                      : isSymbol              ? vacStyle.bg
                                      : (val === 11 && !is11h)? '#dbeafe'
                                      : '#f0fdf4';
                        const textColor = isEmpty              ? 'transparent'
                                        : isSymbol             ? vacStyle.color
                                        : (val === 11 && !is11h) ? '#1d4ed8'
                                        : '#166534';
                        return (
                          <td
                            key={col.key}
                            style={{
                              textAlign: 'center',
                              padding: '1px 0',
                              fontSize: 10,
                              fontWeight: isSymbol ? 700 : 600,
                              borderBottom: '1px solid #e5e7eb',
                              borderRight,
                              background: bgColor,
                              color: textColor,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {isEmpty ? '' : vacIcon
                              ? <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                  {React.cloneElement(vacIcon, { width: 18, height: 18 })}
                                </span>
                              : val}
                          </td>
                        );
                      }

                      return (
                        <td
                          key={col.key}
                          style={{
                            textAlign: (col.key === 'explanation' || col.key === 'vacation') ? 'left' : 'center',
                            padding: '5px 5px',
                            paddingLeft: (col.key === 'explanation' || col.key === 'vacation') ? 8 : 5,
                            fontSize: 11,
                            borderBottom: '1px solid #e5e7eb',
                            borderRight: effIndicatorBorder,
                            whiteSpace: 'nowrap',
                            
                            background: isRedCell ? '#fee2e2' : undefined,
                            color: isRedCell ? '#dc2626' : col.key === 'name' ? '#0284c7' : '#374151',
                            fontWeight: isRedCell ? 700 : col.key === 'name' ? 600 : 600,
                          }}
                        >
                          <CellValue colKey={col.key} agent={agent} />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
        </tbody>

        {/* Footer: total shtat counts */}
        {!isLoading && (() => {
          const all = agents || [];
          const shtatCounts = {};
          all.forEach(a => { shtatCounts[a.shtat] = (shtatCounts[a.shtat] || 0) + 1; });
          const shtatParts = Object.entries(shtatCounts).sort((a, b) => a[0].localeCompare(b[0]));
          const hasName = visibleCols.some(c => c.key === 'name');
          const totalColSpan = visibleCols.filter(c => c.key !== 'name').length + (hasName ? 1 : 0);

          return (
            <tfoot>
              <tr style={{ background: '#fffffa' }}>
                <td
                  colSpan={totalColSpan}
                  style={{
                    textAlign: 'left',
                    padding: '6px 10px',
                    fontSize: 11,
                    borderTop: '2px solid #bae6fd',
                    borderRight: '3px solid #bae6fd',
                    color: '#1e293b',
                    fontWeight: 700,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {shtatParts.map(([s, n]) => (
                      <span key={s} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        fontSize: 11, fontWeight: 700, color: '#475569',
                      }}>
                        <span style={{ color: '#0369a1' }}>{s}:</span>
                        <span style={{ fontWeight: 900, color: '#1e293b' }}>{n}</span>
                      </span>
                    ))}
                    <span style={{ color: '#94a3b8', fontSize: 10 }}>|</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                      N=<span style={{ fontWeight: 900, color: '#1e293b' }}>{all.length}</span>
                    </span>
                  </span>
                </td>
              </tr>
            </tfoot>
          );
        })()}
      </table>

      {/* Efficiency hover panel — portal to body, shown when section is collapsed + row is hovered */}
      <AnimatePresence>
        {collapsedGroups.has('EFFICIENCY') && hoveredRowId && (() => {
          const ha = allAgents.find(a => a.id === hoveredRowId);
          if (!ha) return null;
          const hasExpl = Array.isArray(ha.explanation)
            ? ha.explanation.filter(Boolean).length > 0
            : !!ha.explanation;
          if (!hasExpl && !ha.vacation) return null;
          return <EfficiencyHoverPanel key={hoveredRowId} agent={ha} anchorEl={hoveredTrRef.current} />;
        })()}
      </AnimatePresence>
    </div>
  );
}











