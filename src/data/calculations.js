// ─────────────────────────────────────────────────────────────────────────────
// Salary & Bonus Calculation Engine
// Each group can have its own bonus tiers — update GROUP_CONFIG to change rules.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GROUP_CONFIG defines per-group bonus multipliers.
 * bonusTiers: array of { minPct, maxPct, multiplier }
 *   — if perfPct falls in [minPct, maxPct), multiply baseSalary by that value
 * taxRate: income tax fraction
 */
export const GROUP_CONFIG = {
  '1242': {
    taxRate: 0.12,
    bonusTiers: [
      { minPct: 0,   maxPct: 80,  multiplier: 0.00 },
      { minPct: 80,  maxPct: 90,  multiplier: 0.20 },
      { minPct: 90,  maxPct: 100, multiplier: 0.40 },
      { minPct: 100, maxPct: 110, multiplier: 0.60 },
      { minPct: 110, maxPct: Infinity, multiplier: 0.80 },
    ],
  },
  '1000': {
    taxRate: 0.12,
    bonusTiers: [
      { minPct: 0,   maxPct: 80,  multiplier: 0.00 },
      { minPct: 80,  maxPct: 90,  multiplier: 0.15 },
      { minPct: 90,  maxPct: 100, multiplier: 0.35 },
      { minPct: 100, maxPct: 110, multiplier: 0.55 },
      { minPct: 110, maxPct: Infinity, multiplier: 0.75 },
    ],
  },
  '1009': {
    taxRate: 0.12,
    bonusTiers: [
      { minPct: 0,   maxPct: 80,  multiplier: 0.00 },
      { minPct: 80,  maxPct: 90,  multiplier: 0.18 },
      { minPct: 90,  maxPct: 100, multiplier: 0.38 },
      { minPct: 100, maxPct: 110, multiplier: 0.58 },
      { minPct: 110, maxPct: Infinity, multiplier: 0.85 },
    ],
  },
  '1170': {
    taxRate: 0.12,
    bonusTiers: [
      { minPct: 0,   maxPct: 80,  multiplier: 0.00 },
      { minPct: 80,  maxPct: 90,  multiplier: 0.16 },
      { minPct: 90,  maxPct: 100, multiplier: 0.36 },
      { minPct: 100, maxPct: 110, multiplier: 0.56 },
      { minPct: 110, maxPct: Infinity, multiplier: 0.78 },
    ],
  },
};

/** Format minutes → "HH:MM" */
export function fmtTime(minutes) {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/** Format large numbers with space thousands separator */
export function fmtNum(n) {
  return Math.round(n).toLocaleString('ru-RU');
}

/** Get bonus multiplier for a given perfPct and group */
function getBonusMultiplier(perfPct, group) {
  const config = GROUP_CONFIG[group];
  if (!config) return 0;
  for (const tier of config.bonusTiers) {
    if (perfPct >= tier.minPct && perfPct < tier.maxPct) {
      return tier.multiplier;
    }
  }
  return 0;
}

/**
 * Derives all computed fields for a single agent record.
 * Returns the agent object extended with computed fields:
 *   perfPct, factScore, итог, налог, наРуки, наКарту
 */
export function computeAgent(agent) {
  const perfPct = Math.round((agent.factCalls / agent.planCalls) * 100);
  const bonusMultiplier = getBonusMultiplier(perfPct, agent.vetka);
  const baseSalary = agent.baseSalary;

  // Attendance & quality adjustments
  const attendanceFactor = agent.b1 / 100;
  const qualityFactor = (agent.b2 / 100);

  // factScore: weighted average of attendance and quality
  const factScore = parseFloat(((attendanceFactor * 50 + qualityFactor * 50)).toFixed(1));

  // Actual bonus = baseSalary * bonusMultiplier, adjusted by surcharge coefficient
  const surchargeAdj = agent.surcharge / 100;
  const bonus = Math.round(baseSalary * bonusMultiplier * surchargeAdj);

  const итог = baseSalary + bonus;
  const config = GROUP_CONFIG[agent.vetka] || { taxRate: 0.12 };
  const налог = Math.round(итог * config.taxRate);
  const наРуки = итог - налог;
  const наКарту = наРуки - agent.advance;

  return {
    ...agent,
    perfPct,
    factScore,
    итог,
    налог,
    наРуки,
    наКарту,
  };
}

/**
 * Process all agents in a group — returns array of computed agents + totals row.
 */
export function processGroup(agents) {
  return agents.map(computeAgent);
}

/**
 * Compute the totals row from an array of computed agents.
 */
export function computeTotals(computedAgents) {
  const sum = (key) => computedAgents.reduce((acc, a) => acc + (a[key] || 0), 0);
  const avg = (key) => Math.round(sum(key) / computedAgents.length);

  return {
    planCalls: sum('planCalls'),
    factCalls: sum('factCalls'),
    planTime: sum('planTime'),
    factTime: sum('factTime'),
    perfPct: avg('perfPct'),
    factScore: parseFloat((computedAgents.reduce((a, b) => a + b.factScore, 0) / computedAgents.length).toFixed(1)),
    итог: sum('итог'),
    наРуки: sum('наРуки'),
    наКарту: sum('наКарту'),
    налог: sum('налог'),
    advance: sum('advance'),
    baseSalary: sum('baseSalary'),
    count: computedAgents.length,
  };
}

/**
 * Export computed agents + totals to CSV string.
 */
export function generateCSV(computedAgents, group) {
  const headers = [
    'ШТАТ','ВЕТКА','ФИО','ПЛАН ЗВОНКОВ','ФАКТ ЗВОНКОВ',
    'ПЛАН СВО','ФАКТ СВО','% ВЫП.','ФАКТ БАЛЛ',
    'ОТРАБ.','ОБЪЯСНИТ.','%(B1)','%(B2)','СТ.НАД.',
    'ИТОГ','НА РУКИ','НА КАРТУ','НАЛОГ','АВАНС','ОКЛАД',
  ];

  const rows = computedAgents.map(a => [
    a.shtat, a.vetka, a.name,
    a.planCalls, a.factCalls,
    fmtTime(a.planTime), fmtTime(a.factTime),
    `${a.perfPct}%`, a.factScore,
    a.worked, a.explanation,
    a.b1, a.b2, a.surcharge,
    a.итог, a.наРуки, a.наКарту, a.налог, a.advance, a.baseSalary,
  ]);

  const csvContent = [headers, ...rows]
    .map(r => r.map(v => `"${v}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `payroll_group_${group}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
