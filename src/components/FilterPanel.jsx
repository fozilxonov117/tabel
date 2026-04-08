import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLang } from '../i18n/LangContext';
import { translations } from '../i18n/translations';

// Numeric columns available for number filtering
const NUM_COLS = [
  { key: 'planCalls',       labelKey: 'col.planCalls' },
  { key: 'factCalls',       labelKey: 'col.factCalls' },
  { key: 'perfPct',         labelKey: 'col.perfPct' },
  { key: 'factScore',       labelKey: 'col.factScore' },
  { key: 'b2',              labelKey: 'col.b2' },
  { key: 'surcharge',       labelKey: 'col.surcharge' },
  { key: 'limit',           labelKey: 'col.limit' },
  { key: 'razryad',         labelKey: 'col.razryad' },
  { key: 'tabel_worked',    labelKey: 'col.tabel_worked' },
  { key: 'tabel_prazdHrs',  labelKey: 'col.tabel_prazdHrs' },
  { key: 'tabel_vecherHrs', labelKey: 'col.tabel_vecherHrs' },
  { key: 'tabel_nochHrs',   labelKey: 'col.tabel_nochHrs' },
  { key: 'profitFromOp',    labelKey: 'col.profitFromOp' },
  { key: 'итог',            labelKey: 'col.итог' },
  { key: 'наРуки',          labelKey: 'col.наРуки' },
  { key: 'наКарту',         labelKey: 'col.наКарту' },
  { key: 'налог',           labelKey: 'col.налог' },
  { key: 'advance',         labelKey: 'col.advance' },
  { key: 'baseSalary',      labelKey: 'col.baseSalary' },
  { key: 'nadbavka',        labelKey: 'col.nadbavka' },
  { key: 'noch',            labelKey: 'col.noch' },
  { key: 'vecher',          labelKey: 'col.vecher' },
  { key: 'prazdnichny',     labelKey: 'col.prazdnichny' },
  { key: 'stoimostBiletov', labelKey: 'col.stoimostBiletov' },
  { key: 'vyslugaLet',      labelKey: 'col.vyslugaLet' },
];

// Time columns — planTime/factTime stored in minutes; others in seconds
const TIME_COLS = [
  { key: 'planTime',    labelKey: 'col.planTime',    unit: 'min' },
  { key: 'factTime',    labelKey: 'col.factTime',    unit: 'min' },
  { key: 'debtTime',    labelKey: 'col.debtTime',    unit: 'sec' },
  { key: 'workTime',    labelKey: 'col.workTime',    unit: 'sec' },
  { key: 'systemError', labelKey: 'col.systemError', unit: 'sec' },
];

const TYPE_OPTS = [
  { value: 'gt',      label: '> Greater than' },
  { value: 'lt',      label: '< Less than' },
  { value: 'between', label: '↔ Between' },
];

const selStyle = {
  height: 30, fontSize: 11, padding: '0 8px',
  border: '1.5px solid #e2e8f0', borderRadius: 8,
  background: '#f8fafc', color: '#334155',
  cursor: 'pointer', outline: 'none',
};

const inputStyle = {
  height: 30, fontSize: 11, padding: '0 8px',
  border: '1.5px solid #e2e8f0', borderRadius: 8,
  background: '#f8fafc', color: '#334155',
  outline: 'none', width: 82,
  transition: 'border-color 0.15s',
};

const labelStyle = {
  fontSize: 9, fontWeight: 800, color: '#94a3b8',
  letterSpacing: '0.06em', marginBottom: 5, display: 'block',
};

const sectionStyle = {
  background: '#f8fafc',
  border: '1.5px solid #e8eaf0',
  borderRadius: 10,
  padding: '9px 14px 11px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  flexShrink: 0,
};

function ClearBtn({ onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        height: 30, padding: '0 10px', fontSize: 11, fontWeight: 600,
        background: '#fee2e2', border: '1.5px solid #fca5a5', borderRadius: 8,
        color: '#dc2626', cursor: 'pointer', alignSelf: 'flex-end',
      }}
      onClick={onClick}
      whileHover={{ background: '#fecaca' }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.12 }}
    >
      ✕ Clear
    </motion.button>
  );
}

export default function FilterPanel({ open, numberFilter, setNumberFilter, timeFilter, setTimeFilter, onReset }) {
  const { lang } = useLang();
  const t = k => translations[lang]?.[k] ?? k;

  const timeCol = TIME_COLS.find(c => c.key === timeFilter.column);

  const numActive   = !!(numberFilter.column && numberFilter.value !== '');
  const timeActive  = !!(timeFilter.column && (timeFilter.from !== '' || timeFilter.to !== ''));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="filter-panel"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          style={{
            overflow: 'hidden',
            background: '#ffffff',
            borderBottom: '1.5px solid #e2e8f0',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: '10px 16px 12px',
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'flex-end',
            }}
          >
            {/* ── NUMBER FILTER ───────────────────────────────────── */}
            <div style={sectionStyle}>
              <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.07em', color: '#0ea5e9', margin: 0 }}>
                NUMBER FILTER
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                {/* Column select */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={labelStyle}>COLUMN</span>
                  <select
                    style={{ ...selStyle, minWidth: 140 }}
                    value={numberFilter.column}
                    onChange={e => setNumberFilter(f => ({ ...f, column: e.target.value }))}
                  >
                    <option value="">— select column —</option>
                    {NUM_COLS.map(c => (
                      <option key={c.key} value={c.key}>{t(c.labelKey)}</option>
                    ))}
                  </select>
                </div>

                {/* Type select */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={labelStyle}>TYPE</span>
                  <select
                    style={{ ...selStyle, minWidth: 130 }}
                    value={numberFilter.type}
                    onChange={e => setNumberFilter(f => ({ ...f, type: e.target.value, value2: '' }))}
                  >
                    {TYPE_OPTS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Value input */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={labelStyle}>{numberFilter.type === 'between' ? 'FROM' : 'VALUE'}</span>
                  <input
                    type="number"
                    style={inputStyle}
                    placeholder="0"
                    value={numberFilter.value}
                    onChange={e => setNumberFilter(f => ({ ...f, value: e.target.value }))}
                  />
                </div>

                {/* Between: second value */}
                {numberFilter.type === 'between' && (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={labelStyle}>TO</span>
                    <input
                      type="number"
                      style={inputStyle}
                      placeholder="100"
                      value={numberFilter.value2}
                      onChange={e => setNumberFilter(f => ({ ...f, value2: e.target.value }))}
                    />
                  </div>
                )}

                {numActive && (
                  <ClearBtn onClick={() => setNumberFilter({ column: '', type: 'gt', value: '', value2: '' })} />
                )}
              </div>
            </div>

            {/* ── TIME FILTER ─────────────────────────────────────── */}
            <div style={sectionStyle}>
              <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.07em', color: '#0ea5e9', margin: 0 }}>
                TIME FILTER
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                {/* Column select */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={labelStyle}>COLUMN</span>
                  <select
                    style={{ ...selStyle, minWidth: 140 }}
                    value={timeFilter.column}
                    onChange={e => setTimeFilter(f => ({ ...f, column: e.target.value }))}
                  >
                    <option value="">— select column —</option>
                    {TIME_COLS.map(c => (
                      <option key={c.key} value={c.key}>{t(c.labelKey)}</option>
                    ))}
                  </select>
                </div>

                {/* From input */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={labelStyle}>
                    FROM {timeCol ? `(${timeCol.unit})` : ''}
                  </span>
                  <input
                    type="number"
                    style={inputStyle}
                    placeholder="0"
                    value={timeFilter.from}
                    onChange={e => setTimeFilter(f => ({ ...f, from: e.target.value }))}
                  />
                </div>

                {/* To input */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={labelStyle}>
                    TO {timeCol ? `(${timeCol.unit})` : ''}
                  </span>
                  <input
                    type="number"
                    style={inputStyle}
                    placeholder="9999"
                    value={timeFilter.to}
                    onChange={e => setTimeFilter(f => ({ ...f, to: e.target.value }))}
                  />
                </div>

                {timeActive && (
                  <ClearBtn onClick={() => setTimeFilter({ column: '', from: '', to: '' })} />
                )}
              </div>
            </div>

            {/* ── Reset All ──────────────────────────────────────── */}
            {(numActive || timeActive) && (
              <motion.button
                onClick={onReset}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  height: 30, padding: '0 14px', fontSize: 11, fontWeight: 700,
                  background: '#f1f5f9', border: '1.5px solid #cbd5e1', borderRadius: 8,
                  color: '#64748b', cursor: 'pointer', alignSelf: 'flex-end',
                }}
                whileHover={{ background: '#e0f2fe', borderColor: '#0ea5e9', color: '#0284c7', y: -1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.12 }}
              >
                Reset All
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
