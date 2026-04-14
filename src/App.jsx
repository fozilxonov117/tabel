import React, { useState, useMemo, useCallback, useRef, useEffect, useDeferredValue, startTransition } from 'react';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import PayrollTable from './components/PayrollTable';
import StatusBar from './components/StatusBar';
import { GROUP_NAMES, B2_COMMENTS } from './data/mockData';
import { processGroup, generateCSV } from './data/calculations';
import { fetchAgentReport } from './data/api';
import { LangProvider } from './i18n/LangContext';
import { ThemeProvider } from './i18n/ThemeContext';

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
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try { return sessionStorage.getItem('auth') === '1'; } catch { return false; }
  });
  const [activeGroup, setActiveGroup] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);
  const [isLoading, setIsLoading] = useState(true);
  const [deletedIds, setDeletedIds] = useState(new Set());
  const [agentBranchOverrides, setAgentBranchOverrides] = useState({});
  const loadingTimer = useRef(null);

  // ── API data ─────────────────────────────────────────────────────────────
  const [apiAgents, setApiAgents] = useState({});       // keyed by group name
  const [totalAgents, setTotalAgents] = useState(0);
  const [apiError, setApiError] = useState(null);

  // ── Changelog state (shared between Toolbar button & PayrollTable panel) ──
  const [showChangeLog, setShowChangeLog] = useState(false);
  const [changeLogCount, setChangeLogCount] = useState(0);

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

  // ── Fetch API data on mount ──────────────────────────────────────────────
  useEffect(() => {
    fetchAgentReport()
      .then(({ agentsByGroup, totalAgents: total }) => {
        setApiAgents(agentsByGroup);
        setTotalAgents(total);
      })
      .catch(err => {
        console.error('API fetch failed:', err);
        setApiError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Merge static GROUP_NAMES with any new groups from API
  const groupNames = useMemo(() => {
    const set = new Set(GROUP_NAMES);
    Object.keys(apiAgents).forEach(g => set.add(g));
    return [...set];
  }, [apiAgents]);

  const computedAgents = useMemo(() => {
    if (activeGroup === 'All') {
      return groupNames.flatMap(g => {
        const base = (apiAgents[g] || []).filter(a => !agentBranchOverrides[a.id] || agentBranchOverrides[a.id] === g);
        const incoming = groupNames.filter(src => src !== g).flatMap(src =>
          (apiAgents[src] || []).filter(a => agentBranchOverrides[a.id] === g)
        );
        return processGroup([...base, ...incoming].map(a =>
          agentBranchOverrides[a.id] ? { ...a, vetka: agentBranchOverrides[a.id] } : a
        ));
      });
    }
    const base = (apiAgents[activeGroup] || []).filter(a => !agentBranchOverrides[a.id] || agentBranchOverrides[a.id] === activeGroup);
    const incoming = groupNames.filter(g => g !== activeGroup).flatMap(g =>
      (apiAgents[g] || []).filter(a => agentBranchOverrides[a.id] === activeGroup)
    );
    return processGroup([...base, ...incoming].map(a =>
      agentBranchOverrides[a.id] ? { ...a, vetka: agentBranchOverrides[a.id] } : a
    ));
  }, [activeGroup, agentBranchOverrides, apiAgents, groupNames]);

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
    const TIME_COL_UNITS = { planTime: 'min', factTime: 'min', totalDebt: 'sec', sysBreak: 'sec', netDebt: 'sec', compensated: 'sec', notCompensated: 'sec', remainingDebt: 'sec' };
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
    setSearchQuery('');
    clearTimeout(loadingTimer.current);
    loadingTimer.current = setTimeout(() => setIsLoading(false), 380);
  }, []);

  const handleSearchChange = useCallback((q) => {
    setSearchQuery(q);
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
  }, []);

  const handleLogout = useCallback(() => {
    try { sessionStorage.removeItem('auth'); } catch {}
    setIsLoggedIn(false);
  }, []);

  if (!isLoggedIn) {
    return (
      <ThemeProvider>
        <LoginPage onLogin={() => setIsLoggedIn(true)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
    <LangProvider>
    <div className="h-screen flex flex-col overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: 'var(--app-bg)' }}>
      <Header activeGroup={activeGroup} onGroupChange={handleGroupChange} onLogout={handleLogout} />
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
        showChangeLog={showChangeLog}
        onToggleChangeLog={() => setShowChangeLog(v => !v)}
        changeLogCount={changeLogCount}
      />
      <div className="flex-1 overflow-auto relative" style={{ background: 'var(--surface-table)', boxShadow: '0 1px 10px rgba(0,0,0,0.07)' }}>
        <PayrollTable
        agents={deferredAgents}
          activeGroup={activeGroup}
          visibleColumns={visibleColumns}
          totalAll={totalAgents}
          isLoading={isLoading}
          onDeleteAgents={handleDeleteAgents}
          onTransferAgents={handleTransferAgents}
          groupNames={groupNames}
          b2Comments={B2_COMMENTS}
          showChangeLog={showChangeLog}
          setShowChangeLog={setShowChangeLog}
          onChangeLogCountChange={setChangeLogCount}
        />
      </div>
      <StatusBar
        totalFiltered={filteredAgents.length}
        totalAll={totalAgents}
      />
    </div>
    </LangProvider>
    </ThemeProvider>
  );
}
