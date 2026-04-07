import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import PayrollTable from './components/PayrollTable';
import StatusBar from './components/StatusBar';
import { mockAgents, TOTAL_AGENTS, GROUP_NAMES, B2_COMMENTS } from './data/mockData';
import { processGroup, generateCSV } from './data/calculations';
import { LangProvider } from './i18n/LangContext';

const PER_PAGE = 23;

const DEFAULT_VISIBLE_COLUMNS = {
  'BASIC INFO': true,
  'CALL METRICS': true,
  'EFFICIENCY': true,
  'ATTENDANCE & BONUS': true,
  'LIMITS & GRADES': true,
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
  const loadingTimer = useRef(null);

  // Clean up timer on unmount
  useEffect(() => () => clearTimeout(loadingTimer.current), []);

  const computedAgents = useMemo(() => {
    if (activeGroup === 'All') {
      return GROUP_NAMES.flatMap(g => processGroup(mockAgents[g] || []));
    }
    return processGroup(mockAgents[activeGroup] || []);
  }, [activeGroup]);

  const filteredAgents = useMemo(() => {
    let list = computedAgents;
    if (deletedIds.size > 0) list = list.filter(a => !deletedIds.has(a.id));
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(a => a.name.toLowerCase().includes(q));
  }, [computedAgents, searchQuery, deletedIds]);

  const totalPages = Math.max(1, Math.ceil(filteredAgents.length / PER_PAGE));

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

  const handleRefresh = useCallback(() => {
    setSearchQuery('');
    setPage(1);
  }, []);

  return (
    <LangProvider>
    <div className="h-screen flex flex-col overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#eef0f7' }}>
      <Header activeGroup={activeGroup} onGroupChange={handleGroupChange} />
      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onExport={handleExport}
        visibleColumns={visibleColumns}
        onColumnToggle={handleColumnToggle}
        onRefresh={handleRefresh}
      />
      <div className="flex-1 overflow-auto relative" style={{ background: '#ffffff', boxShadow: '0 1px 10px rgba(0,0,0,0.07)' }}>
        <PayrollTable
          agents={filteredAgents}
          activeGroup={activeGroup}
          visibleColumns={visibleColumns}
          totalAll={TOTAL_AGENTS}
          isLoading={isLoading}
          onDeleteAgents={handleDeleteAgents}
          b2Comments={B2_COMMENTS}
        />
      </div>
      <StatusBar
        totalFiltered={filteredAgents.length}
        totalAll={TOTAL_AGENTS}
      />
    </div>
    </LangProvider>
  );
}
