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
  'KPI': true,
  'BONUS': true,
  'LIMITS & GRADES': true,
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
  );
}
