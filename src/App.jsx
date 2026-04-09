import React, { useState, useMemo, useCallback, useRef, useEffect, useDeferredValue, startTransition } from 'react';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import PayrollTable from './components/PayrollTable';
import StatusBar from './components/StatusBar';
import { mockAgents, TOTAL_AGENTS, GROUP_NAMES, B2_COMMENTS } from './data/mockData';
import { processGroup, generateCSV } from './data/calculations';
import { LangProvider } from './i18n/LangContext';
import { ThemeProvider } from './i18n/ThemeContext';

const PER_PAGE = 23;

const DEFAULT_VISIBLE_COLUMNS = {
  'BASIC INFO': true,
  'CALL METRICS': true,
  'EFFICIENCY': true,
  'INFO': true,
  'BONUS': true,
  'TABEL': true,
  'TOTALS (BI-BK)': true,
  'ALLOWANCES': true,
};

export default function App() {
  const [activeGroup, setActiveGroup] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);
  const [isLoading, setIsLoading] = useState(false);
  const [deletedIds, setDeletedIds] = useState(new Set());
  const [agentBranchOverrides, setAgentBranchOverrides] = useState({});
  const loadingTimer = useRef(null);

  // ── Filter panel ──────────────────────────────────────────────────────
  const [filterType,   setFilterType]   = useState('number'); // 'number' | 'time'
  const [numberFilter, setNumberFilter] = useState({ column: '', type: 'gt', value: '', value2: '' });
  const [timeFilter,   setTimeFilter]   = useState({ column: '', from: '', to: '' });

  const handleFilterReset = useCallback(() => {
    setNumberFilter({ column: '', type: 'gt', value: '', value2: '' });
    setTimeFilter({ column: '', from: '', to: '' });
  }, []);

  // Clean up timer on unmount
  useEffect(() => () => clearTimeout(loadingTimer.current), []);

  const computedAgents = useMemo(() => {
    if (activeGroup === 'All') {
      return GROUP_NAMES.flatMap(g => {
        const base = (mockAgents[g] || []).filter(a => !agentBranchOverrides[a.id] || agentBranchOverrides[a.id] === g);
        const incoming = GROUP_NAMES.filter(src => src !== g).flatMap(src =>
          (mockAgents[src] || []).filter(a => agentBranchOverrides[a.id] === g)
        );
        return processGroup([...base, ...incoming].map(a =>
          agentBranchOverrides[a.id] ? { ...a, vetka: agentBranchOverrides[a.id] } : a
        ));
      });
    }
    const base = (mockAgents[activeGroup] || []).filter(a => !agentBranchOverrides[a.id] || agentBranchOverrides[a.id] === activeGroup);
    const incoming = GROUP_NAMES.filter(g => g !== activeGroup).flatMap(g =>
      (mockAgents[g] || []).filter(a => agentBranchOverrides[a.id] === activeGroup)
    );
    return processGroup([...base, ...incoming].map(a =>
      agentBranchOverrides[a.id] ? { ...a, vetka: agentBranchOverrides[a.id] } : a
    ));
  }, [activeGroup, agentBranchOverrides]);

  const filteredAgents = useMemo(() => {
    let list = computedAgents;
    if (deletedIds.size > 0) list = list.filter(a => !deletedIds.has(a.id));

    // Name search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => a.name.toLowerCase().includes(q));
    }

    // Number filter
    // Note: 'b2' displays agent.b1; 'limit' displays (agent.limit - agent.b1) diff
    const COL_FIELD_MAP = { b2: 'b1' };
    if (numberFilter.column && numberFilter.value !== '') {
      const col = numberFilter.column;
      const field = COL_FIELD_MAP[col] ?? col;
      const v = Number(numberFilter.value);
      if (!isNaN(v)) {
        list = list.filter(a => {
          let val;
          if (col === 'limit') {
            // displayed value is the remaining headroom: limit minus fact bonus
            const lim = a.limit;
            const fact = a.b1;
            if (lim == null || fact == null) return false;
            val = lim - fact;
          } else {
            const raw = a[field];
            val = raw !== undefined && raw !== null ? Number(raw) : NaN;
          }
          if (isNaN(val)) return false;
          if (numberFilter.type === 'gt') return val > v;
          if (numberFilter.type === 'lt') return val < v;
          if (numberFilter.type === 'between') {
            if (numberFilter.value2 === '') return val >= v;
            const v2 = Number(numberFilter.value2);
            return !isNaN(v2) ? val >= v && val <= v2 : val >= v;
          }
          return true;
        });
      }
    }

    // Time filter — FROM/TO stored as 'HH:MM:SS' strings
    const TIME_COL_UNITS = { planTime: 'min', factTime: 'min', debtTime: 'sec', workTime: 'sec', systemError: 'sec' };
    const parseHMS = str => {
      if (!str) return null;
      const parts = str.split(':').map(Number);
      if (parts.some(isNaN)) return null;
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 3600 + parts[1] * 60;
      return null;
    };
    if (timeFilter.column && (timeFilter.from !== '' || timeFilter.to !== '')) {
      const unit = TIME_COL_UNITS[timeFilter.column] ?? 'sec';
      const from = parseHMS(timeFilter.from);
      const to   = parseHMS(timeFilter.to);
      list = list.filter(a => {
        const raw = Number(a[timeFilter.column]) || 0;
        const valSec = unit === 'min' ? raw * 60 : raw;
        if (from !== null && to !== null) return valSec >= from && valSec <= to;
        if (from !== null) return valSec >= from;
        if (to   !== null) return valSec <= to;
        return true;
      });
    }

    return list;
  }, [computedAgents, searchQuery, deletedIds, numberFilter, timeFilter]);

  // useDeferredValue lets filter inputs respond immediately;
  // the expensive PayrollTable re-render happens in a deferred pass
  const deferredAgents = useDeferredValue(filteredAgents);

  // Wrap filter setters in startTransition so they are low-priority updates
  const handleNumberFilterChange = useCallback((updater) => {
    startTransition(() => setNumberFilter(updater));
  }, []);
  const handleTimeFilterChange = useCallback((updater) => {
    startTransition(() => setTimeFilter(updater));
  }, []);

  const handleGroupChange = useCallback((group) => {
    setIsLoading(true);
    setActiveGroup(group);
    setPage(1);
    setSearchQuery('');
    clearTimeout(loadingTimer.current);
    loadingTimer.current = setTimeout(() => setIsLoading(false), 380);
  }, []);

  const handleSearchChange = useCallback((q) => {
    setSearchQuery(q);
    setPage(1);
  }, []);

  const handleColumnToggle = useCallback((colGroup) => {
    setVisibleColumns(prev => ({ ...prev, [colGroup]: !prev[colGroup] }));
  }, []);

  const handleExport = useCallback(() => {
    generateCSV(filteredAgents, activeGroup);
  }, [filteredAgents, activeGroup]);

  const handleDeleteAgents = useCallback((ids) => {
    setDeletedIds(prev => new Set([...prev, ...ids]));
  }, []);

  const handleTransferAgents = useCallback((ids, targetBranch) => {
    setAgentBranchOverrides(prev => {
      const next = { ...prev };
      ids.forEach(id => { next[id] = targetBranch; });
      return next;
    });
  }, []);

  const handleRefresh = useCallback(() => {
    setSearchQuery('');
    setPage(1);
  }, []);

  return (
    <ThemeProvider>
    <LangProvider>
    <div className="h-screen flex flex-col overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--app-bg)' }}>
      <Header activeGroup={activeGroup} onGroupChange={handleGroupChange} />
      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onExport={handleExport}
        visibleColumns={visibleColumns}
        onColumnToggle={handleColumnToggle}
        onRefresh={handleRefresh}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        numberFilter={numberFilter}
        onNumberFilterChange={handleNumberFilterChange}
        timeFilter={timeFilter}
        onTimeFilterChange={handleTimeFilterChange}
        onFilterReset={handleFilterReset}
      />
      <div className="flex-1 overflow-auto relative" style={{ background: 'var(--surface-table)', boxShadow: '0 1px 10px rgba(0,0,0,0.07)' }}>
        <PayrollTable
        agents={deferredAgents}
          activeGroup={activeGroup}
          visibleColumns={visibleColumns}
          totalAll={TOTAL_AGENTS}
          isLoading={isLoading}
          onDeleteAgents={handleDeleteAgents}
          onTransferAgents={handleTransferAgents}
          groupNames={GROUP_NAMES}
          b2Comments={B2_COMMENTS}
        />
      </div>
      <StatusBar
        totalFiltered={filteredAgents.length}
        totalAll={TOTAL_AGENTS}
      />
    </div>
    </LangProvider>
    </ThemeProvider>
  );
}
