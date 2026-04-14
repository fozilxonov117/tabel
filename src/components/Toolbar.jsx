import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLang } from '../i18n/LangContext';
import { translations } from '../i18n/translations';

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
  { key: '\u0438\u0442\u043e\u0433',   labelKey: 'col.\u0438\u0442\u043e\u0433' },
  { key: '\u043d\u0430\u0420\u0443\u043a\u0438',  labelKey: 'col.\u043d\u0430\u0420\u0443\u043a\u0438' },
  { key: '\u043d\u0430\u041a\u0430\u0440\u0442\u0443', labelKey: 'col.\u043d\u0430\u041a\u0430\u0440\u0442\u0443' },
  { key: '\u043d\u0430\u043b\u043e\u0433',  labelKey: 'col.\u043d\u0430\u043b\u043e\u0433' },
  { key: 'advance',         labelKey: 'col.advance' },
  { key: 'baseSalary',      labelKey: 'col.baseSalary' },
  { key: 'nadbavka',        labelKey: 'col.nadbavka' },
  { key: 'noch',            labelKey: 'col.noch' },
  { key: 'vecher',          labelKey: 'col.vecher' },
  { key: 'prazdnichny',     labelKey: 'col.prazdnichny' },
  { key: 'stoimostBiletov', labelKey: 'col.stoimostBiletov' },
  { key: 'vyslugaLet',      labelKey: 'col.vyslugaLet' },
];

const TIME_COLS = [
  { key: 'planTime',    labelKey: 'col.planTime',    unit: 'min' },
  { key: 'factTime',    labelKey: 'col.factTime',    unit: 'min' },
  { key: 'debtTime',    labelKey: 'col.debtTime',    unit: 'sec' },
  { key: 'workTime',    labelKey: 'col.workTime',    unit: 'sec' },
  { key: 'systemError', labelKey: 'col.systemError', unit: 'sec' },
];

const CMP_OPTS = [
  { value: 'gt',      labelKey: 'filter.cmp.gt' },
  { value: 'lt',      labelKey: 'filter.cmp.lt' },
  { value: 'between', labelKey: 'filter.cmp.between' },
];

/* -- Styled select ------------------------------------------ */
function Sel({ value, onChange, options, placeholder, width = 120, disabled }) {
  return (
    <div style={{ position: 'relative', width, flexShrink: 0 }}>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: '100%',
          height: 28,
          fontSize: 11,
          fontWeight: 600,
          paddingLeft: 9,
          paddingRight: 22,
          appearance: 'none',
          WebkitAppearance: 'none',
          border: value ? '1.5px solid #7dd3fc' : '1.5px solid var(--border)',
          borderRadius: 8,
          background: value ? 'var(--input-bg-active)' : 'var(--input-bg)',
          color: value ? '#0284c7' : 'var(--text-muted)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          transition: 'border-color 0.15s, background 0.15s',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value ?? o.key} value={o.value ?? o.key}>{o.label}</option>
        ))}
      </select>
      {/* chevron */}
      <svg
        style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        width="9" height="9" viewBox="0 0 9 9" fill="none"
      >
        <path d="M1.5 3L4.5 6L7.5 3" stroke={value ? '#0284c7' : '#94a3b8'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* -- Compact number input -------------------------------------- */
function NumIn({ value: externalValue, onChange, placeholder, label, type = 'number', width = 68 }) {
  const [focused, setFocused] = useState(false);
  const [localValue, setLocalValue] = useState(externalValue);
  const timerRef = useRef(null);

  // Sync when parent resets the value (e.g. clear button)
  useEffect(() => { setLocalValue(externalValue); }, [externalValue]);

  const handleChange = e => {
    const v = e.target.value;
    setLocalValue(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange({ target: { value: v } }), 180);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexShrink: 0 }}>
      {label && (
        <span style={{ fontSize: 8.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', paddingLeft: 1 }}>
          {label}
        </span>
      )}
      <input
        type={type}
        step={type === 'time' ? 1 : undefined}
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width,
          height: 28,
          fontSize: 11,
          fontWeight: 600,
          padding: '0 8px',
          border: focused ? '1.5px solid #38bdf8' : localValue !== '' ? '1.5px solid #7dd3fc' : '1.5px solid var(--border)',
          borderRadius: 8,
          background: localValue !== '' ? 'var(--input-bg-active)' : 'var(--input-bg)',
          color: '#0284c7',
          outline: 'none',
          transition: 'border-color 0.15s, background 0.15s',
        }}
      />
    </div>
  );
}

/* -- Custom column dropdown (replaces native <select> for Column picker) -- */
function ColDrop({ value, onChange, options, placeholder, width = 128 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const selected = options.find(o => (o.value ?? o.key) === value);

  return (
    <div ref={ref} style={{ position: 'relative', width, flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', height: 28, fontSize: 11, fontWeight: 600,
          paddingLeft: 9, paddingRight: 22,
          border: value ? '1.5px solid #7dd3fc' : `1.5px solid ${open ? '#38bdf8' : 'var(--border)'}`,
          borderRadius: 8, background: value ? 'var(--input-bg-active)' : 'var(--input-bg)',
          color: value ? '#0284c7' : 'var(--text-muted)',
          cursor: 'pointer', outline: 'none', textAlign: 'left',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          transition: 'border-color 0.15s',
        }}
      >
        {selected ? selected.label : placeholder}
      </button>
      <svg
        style={{ position: 'absolute', right: 6, top: '50%', pointerEvents: 'none',
          transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`, transition: 'transform 0.15s' }}
        width="9" height="9" viewBox="0 0 9 9" fill="none"
      >
        <path d="M1.5 3L4.5 6L7.5 3" stroke={value ? '#0284c7' : '#94a3b8'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <AnimatePresence>
        {open && (
          <motion.div
            className="cdr-scroll"
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.13, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute', top: 32, left: 0, zIndex: 9999,
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: 10,
              boxShadow: '0 8px 28px rgba(0,0,0,0.11), 0 1px 4px rgba(0,0,0,0.05)',
              minWidth: Math.max(width, 152), maxHeight: 226,
              overflowY: 'auto', scrollbarWidth: 'none',
              padding: '5px',
            }}
          >
            <style>{`.cdr-scroll::-webkit-scrollbar{display:none}.cdr-opt:hover{background:#f0f9ff !important;color:#0284c7 !important}`}</style>
            {placeholder && (
              <div
                className="cdr-opt"
                onClick={() => { onChange({ target: { value: '' } }); setOpen(false); }}
                style={{ padding: '4px 9px', fontSize: 10.5, borderRadius: 7, cursor: 'pointer', color: '#94a3b8', fontWeight: 500, transition: 'background 0.1s' }}
              >
                {placeholder}
              </div>
            )}
            {options.map(o => {
              const v = o.value ?? o.key;
              const active = v === value;
              return (
                <div
                  key={v}
                  className="cdr-opt"
                  onClick={() => { onChange({ target: { value: v } }); setOpen(false); }}
                  style={{
                    padding: '5px 9px', fontSize: 11, fontWeight: active ? 700 : 500,
                    borderRadius: 7, cursor: 'pointer',
                    color: active ? '#0284c7' : 'var(--cell-text)',
                    background: active ? 'var(--input-bg-active)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'background 0.1s, color 0.1s',
                  }}
                >
                  {o.label}
                  {active && (
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" style={{ flexShrink: 0 }}>
                      <polyline points="1.5,4.5 3.5,6.5 7.5,2.5" stroke="#0284c7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -- Inline compact filter -------------------------------------- */
function InlineFilter({ filterType, onFilterTypeChange, numberFilter, onNumberFilterChange, timeFilter, onTimeFilterChange, onReset, t }) {
  const isNumActive  = !!(numberFilter.column && numberFilter.value !== '');
  const isTimeActive = !!(timeFilter.column && (timeFilter.from !== '' || timeFilter.to !== ''));
  const anyActive    = isNumActive || isTimeActive;

  const colOptions = filterType === 'number'
    ? NUM_COLS.map(c => ({ value: c.key, label: t(c.labelKey) }))
    : TIME_COLS.map(c => ({ value: c.key, label: `${t(c.labelKey)} (${c.unit})` }));

  const activeCol = filterType === 'number' ? numberFilter.column : timeFilter.column;

  const handleColChange = e => {
    if (filterType === 'number') onNumberFilterChange(f => ({ ...f, column: e.target.value }));
    else onTimeFilterChange(f => ({ ...f, column: e.target.value }));
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
      {/* Divider */}
      <div style={{ width: 1, height: 22, background: 'var(--border)', flexShrink: 0, marginRight: 1 }} />

      {/* 1. Filter type segmented toggle */}
      <div style={{
        display: 'flex', background: 'var(--surface-2)', borderRadius: 8, padding: 2,
        border: '1.5px solid var(--border)', gap: 1, flexShrink: 0,
      }}>
        {[{ id: 'number', icon: '#', txtKey: 'filter.number' }, { id: 'time', icon: '⏱', txtKey: 'filter.time' }].map(tab => (
          <button
            key={tab.id}
            onClick={() => onFilterTypeChange(tab.id)}
            style={{
              padding: '2px 9px', fontSize: 10, fontWeight: 700,
              borderRadius: 6, border: 'none', cursor: 'pointer',
              background: filterType === tab.id ? '#0ea5e9' : 'transparent',
              color: filterType === tab.id ? '#ffffff' : '#64748b',
              transition: 'background 0.15s, color 0.15s',
              letterSpacing: '0.01em',
              lineHeight: '20px',
            }}
          >
            <span style={{ marginRight: 3, opacity: 0.85 }}>{tab.icon}</span>{t(tab.txtKey)}
          </button>
        ))}
      </div>

      {/* 2. Column selector */}
      <ColDrop
        value={activeCol}
        onChange={handleColChange}
        options={colOptions}
        placeholder={t('filter.column')}
        width={128}
      />

      {/* 3. Comparison type + value inputs */}
      <AnimatePresence mode="wait">
        {filterType === 'number' ? (
          <motion.div
            key="num"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.14 }}
            style={{ display: 'flex', alignItems: 'flex-end', gap: 5 }}
          >
            <ColDrop
              value={numberFilter.type}
              onChange={e => onNumberFilterChange(f => ({ ...f, type: e.target.value, value2: '' }))}
              options={CMP_OPTS.map(o => ({ value: o.value, label: t(o.labelKey) }))}
              width={108}
            />
            <NumIn
              value={numberFilter.value}
              onChange={e => onNumberFilterChange(f => ({ ...f, value: e.target.value }))}
              placeholder={numberFilter.type === 'between' ? t('filter.from').toLowerCase() : t('filter.value')}
            />
            <AnimatePresence>
              {numberFilter.type === 'between' && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 2 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>{t('filter.to')}</span>
                    <NumIn
                      value={numberFilter.value2}
                      onChange={e => onNumberFilterChange(f => ({ ...f, value2: e.target.value }))}
                      placeholder={t('filter.to').toLowerCase()}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="time"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.14 }}
            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <span style={{ fontSize: 9.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', flexShrink: 0 }}>{t('filter.from')}</span>
            <NumIn
              type="time"
              width={106}
              value={timeFilter.from}
              onChange={e => onTimeFilterChange(f => ({ ...f, from: e.target.value }))}
              placeholder="HH:MM:SS"
            />
            <span style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600, flexShrink: 0 }}>–</span>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', flexShrink: 0 }}>{t('filter.to')}</span>
            <NumIn
              type="time"
              width={106}
              value={timeFilter.to}
              onChange={e => onTimeFilterChange(f => ({ ...f, to: e.target.value }))}
              placeholder="HH:MM:SS"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear all */}
      <AnimatePresence>
        {anyActive && (
          <motion.button
            key="clear"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.14 }}
            onClick={onReset}
            style={{
              height: 26, padding: '0 10px',
              borderRadius: 7, border: '1.5px solid #fca5a5',
              background: 'var(--cell-red-bg)', color: '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              cursor: 'pointer', flexShrink: 0, fontSize: 10.5, fontWeight: 700,
              letterSpacing: '0.01em',
            }}
            whileHover={{ background: '#fee2e2', borderColor: '#f87171' }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
              <line x1="1" y1="1" x2="6" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="6" y1="1" x2="1" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {t('filter.clear')}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -- Main Toolbar -------------------------------------------- */
export default function Toolbar({
  searchQuery, onSearchChange, onExport, visibleColumns, onColumnToggle, onRefresh,
  filterType, onFilterTypeChange,
  numberFilter, onNumberFilterChange,
  timeFilter, onTimeFilterChange,
  onFilterReset,
  showChangeLog, onToggleChangeLog, changeLogCount,
}) {
  const { lang } = useLang();
  const t = k => translations[lang]?.[k] ?? k;
  const [columnsOpen, setColumnsOpen] = useState(false);
  const colRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (colRef.current && !colRef.current.contains(e.target)) setColumnsOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      className="px-4 py-2 flex items-center gap-2 flex-wrap"
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
        minHeight: 46,
      }}
    >
      {/* Search */}
      <SearchInput value={searchQuery} onChange={onSearchChange} placeholder={t('toolbar.searchPlaceholder')} />

      {/* Inline filter chain */}
      <InlineFilter
        filterType={filterType}
        onFilterTypeChange={onFilterTypeChange}
        numberFilter={numberFilter}
        onNumberFilterChange={onNumberFilterChange}
        timeFilter={timeFilter}
        onTimeFilterChange={onTimeFilterChange}
        onReset={onFilterReset}
        t={t}
      />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right: Refresh + Columns + Export */}
      <RefreshBtn onClick={onRefresh} />

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
          {t('toolbar.columns')}
        </ToolbarBtn>

        <AnimatePresence>
          {columnsOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -8 }}
              transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
              className="absolute right-0 top-10 z-50"
              style={{
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                borderRadius: 14,
                boxShadow: '0 16px 48px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.05)',
                minWidth: 210,
                padding: '10px 0 6px',
                transformOrigin: 'top right',
              }}
            >
              <style>{`
                .col-dd-item { transition: background 0.1s; border-radius: 7px; }
                .col-dd-item:hover { background: #f0f9ff; }
                .col-dd-item:hover .col-dd-label { color: #0284c7 !important; }
                .col-dd-scroll::-webkit-scrollbar { display: none; }
              `}</style>
              <p className="font-black uppercase tracking-widest" style={{ fontSize: 9, color: '#94a3b8', padding: '0 14px 8px', letterSpacing: '0.1em' }}>
                {t('toolbar.toggleColumns')}
              </p>
              <div
                className="col-dd-scroll"
                style={{ maxHeight: 268, overflowY: 'auto', scrollbarWidth: 'none', padding: '0 6px' }}
              >
                {Object.keys(visibleColumns).map(col => (
                  <label
                    key={col}
                    className="col-dd-item flex items-center gap-2.5 cursor-pointer"
                    style={{ padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 9 }}
                    onClick={() => onColumnToggle(col)}
                  >
                    <span
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 16, height: 16, borderRadius: 5,
                        background: visibleColumns[col] ? '#0ea5e9' : 'var(--surface-2)',
                        border: visibleColumns[col] ? 'none' : '1.5px solid var(--border)',
                        boxShadow: visibleColumns[col] ? '0 0 0 3px rgba(14,165,233,0.15)' : 'none',
                        transition: 'background 0.12s, border-color 0.12s, box-shadow 0.12s',
                        flexShrink: 0,
                      }}
                    >
                      {visibleColumns[col] && (
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                          <polyline points="1.5,4.5 3.5,6.5 7.5,2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <input type="checkbox" checked={visibleColumns[col]} onChange={() => onColumnToggle(col)} className="sr-only" />
                    <span
                      className="col-dd-label"
                      style={{
                        fontSize: 12, fontWeight: visibleColumns[col] ? 600 : 500,
                        color: visibleColumns[col] ? '#0284c7' : 'var(--cell-text-muted)',
                        transition: 'color 0.1s',
                        userSelect: 'none',
                      }}
                    >
                      {t('group.' + col)}
                    </span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* History / Changelog toggle */}
      <ToolbarBtn
        active={showChangeLog}
        onClick={onToggleChangeLog}
        icon={
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/>
            </svg>
            {changeLogCount > 0 && !showChangeLog && (
              <span style={{
                position: 'absolute', top: -6, right: -8,
                background: '#ef4444', color: '#fff', fontSize: 7, fontWeight: 800,
                minWidth: 12, height: 12, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid var(--surface)',
                lineHeight: 1,
              }}>{changeLogCount > 99 ? '99+' : changeLogCount}</span>
            )}
          </span>
        }
      >
        {t('log.title') || 'History'}
      </ToolbarBtn>

      <ExportBtn onClick={onExport} />
    </div>
  );
}

/* -- Search Input -------------------------------------------------- */
function SearchInput({ value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative" style={{ width: 200, flexShrink: 0 }}>
      <motion.svg
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        animate={{ color: focused ? '#0ea5e9' : '#94a3b8' }}
        transition={{ duration: 0.15 }}
        width="13" height="13" viewBox="0 0 14 14" fill="none"
      >
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
        <line x1="9.5" y1="9.5" x2="12.5" y2="12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </motion.svg>
      <motion.input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full py-1.5 pl-8 pr-7 text-xs font-medium"
        animate={{
          boxShadow: focused
            ? '0 0 0 3px rgba(14,165,233,0.15), 0 1px 6px rgba(0,0,0,0.06)'
            : '0 1px 4px rgba(0,0,0,0.04)',
        }}
        style={{
          background: focused ? 'var(--surface)' : 'var(--surface-2)',
          border: `1.5px solid ${focused ? '#0ea5e9' : 'var(--border)'}`,
          borderRadius: 8,
          outline: 'none',
          color: 'var(--text-primary)',
          height: 28,
          transition: 'border-color 0.15s, background 0.15s',
        }}
      />
      <AnimatePresence>
        {value && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <motion.button
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              onClick={() => onChange('')}
              className="w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: '#94a3b8', border: 'none', cursor: 'pointer' }}
              whileHover={{ background: '#0ea5e9', scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <line x1="1.5" y1="1.5" x2="6.5" y2="6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="6.5" y1="1.5" x2="1.5" y2="6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -- Shared ToolbarBtn -------------------------------------------- */
function ToolbarBtn({ children, onClick, active, icon }) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
      style={{
        background: active ? '#e0f2fe' : 'var(--input-bg)',
        border: `1.5px solid ${active ? '#0ea5e9' : 'var(--border)'}`,
        borderRadius: 8,
        color: active ? '#0284c7' : 'var(--text-muted)',
        cursor: 'pointer',
      }}
      whileHover={{ background: '#e0f2fe', borderColor: '#0ea5e9', color: '#0284c7', y: -1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.13 }}
    >
      {icon}
      {children}
    </motion.button>
  );
}

/* -- Refresh Button ----------------------------------------------- */
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
      className="p-1.5"
      style={{
        background: 'var(--input-bg)',
        border: '1.5px solid var(--border)',
        borderRadius: 8,
        color: 'var(--text-muted)',
        cursor: 'pointer',
      }}
      whileHover={{ background: '#e0f2fe', borderColor: '#0ea5e9', color: '#0284c7', y: -1 }}
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

/* -- Export CSV Button -------------------------------------------- */
function ExportBtn({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white"
      style={{
        background: '#0ea5e9',
        border: 'none',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(14,165,233,0.3)',
        cursor: 'pointer',
      }}
      whileHover={{ y: -2, boxShadow: '0 6px 16px rgba(14,165,233,0.45)' }}
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
