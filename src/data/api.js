// ── API service – fetches agent report and maps to frontend model ────────────
const API_URL =
  'https://bonus.kontaktmarkazi.uz/public/api/agent-report?token=supersecretkey123';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/** Parse "HH:MM:SS" string → total seconds */
function parseHMStoSeconds(str) {
  if (!str || typeof str !== 'string') return 0;
  const parts = str.split(':').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return 0;
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

/** Extract grade number from position string, e.g. "Оператор 7 ступени" → 7 */
function parseRazryad(position) {
  if (!position) return 5;
  const m = position.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 5;
}

/** Convert API date "YYYY-MM-DD" → frontend "DD.MM.YYYY" */
function convertDate(d) {
  if (!d) return '';
  const p = d.split('-');
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : d;
}

/* ── Branch normalisation ────────────────────────────────────────────────── */
const BRANCH_MAP = {
  'Нукус 1000': 'Nukus',
  'Нукус':      'Nukus',
};

function normalizeBranch(branch) {
  if (!branch) return 'Unknown';
  return BRANCH_MAP[branch] || branch;
}

/* ── Grade → bonus limit ─────────────────────────────────────────────────── */
const GRADE_LIMIT = { 9: 145, 8: 125, 7: 110, 6: 110, 5: 95, 4: 95, 3: 90 };

/* ── Row → agent mapper ──────────────────────────────────────────────────── */

function mapApiRowToAgent(row) {
  const vetka = normalizeBranch(row.branch);

  // absences → vacation (take first entry)
  let vacation;
  if (Array.isArray(row.absences) && row.absences.length > 0) {
    const a = row.absences[0];
    vacation = { type: a.type || '', from: convertDate(a.from), to: convertDate(a.to) };
  }

  // explanatories – API sends array of {name, link} objects, or 0, or string
  let explanation = '';
  if (Array.isArray(row.explanatories)) {
    explanation = row.explanatories.filter(e => e && e.name);
  } else if (typeof row.explanatories === 'string' && row.explanatories) {
    explanation = row.explanatories;
  }

  return {
    id:           '',                                               // assigned after grouping
    shtat:        row.manager_initials || '',
    vetka,
    name:         row.full_name || '',
    planCalls:    Number(row.call_norm)    || 0,
    factCalls:    Number(row.total_calls)  || 0,
    planTime:     Math.round((Number(row.aht_norm_sec) || 0) / 60), // sec → min (fmtTime expects minutes)
    factTime:     Math.round((Number(row.avg_talk_sec) || 0) / 60), // sec → min
    worked:       Number(row.tabel?.WD) || 0,
    tabelDays:    Array.isArray(row.tabel?.days) ? row.tabel.days : null,
    tabelHD:      Number(row.tabel?.HD) || 0,
    tabelEV:      Number(row.tabel?.EV) || 0,
    tabelNT:      Number(row.tabel?.NT) || 0,
    explanation,
    vacation,
    b1:           Number(row.system_count_bonus) || 0,
    b2:           0,
    surcharge:    Number(row.old_bonus) || 0,
    _apiBonusChanged: Number(row.salary?.bonus_changed_percent) || 0,
    factScore:    Number(row.kpi_percent) || 0,
    razryad:      parseRazryad(row.position),
    limit:        GRADE_LIMIT[parseRazryad(row.position)] ?? 95,
    profitFromOp: 0,
    nadbavka:     0,
    noch:         row.salary?.['Ночь']             ?? 0,
    vecher:       row.salary?.['Вечер']            ?? 0,
    prazdnichny:  row.salary?.['Праздничный']      ?? 0,
    stoimostBiletov: row.salary?.['Стоимость_билетов'] ?? 0,
    addBonus:     0,
    vyslugaLet:   row.salary?.['Выслуга_лет']      ?? 0,
    advance:      row.salary?.['АВАНС']            ?? 0,
    baseSalary:   row.salary?.['Оклад']            ?? 0,
    // Pre-computed totals from API (override formula in computeAgent)
    _apiItog:     row.salary?.['Итог']             ?? null,
    _apiNaRuki:   row.salary?.['На_Руки']          ?? null,
    _apiNaKartu:  row.salary?.['На_Карту']         ?? null,
    _apiNalog:    row.salary?.['Налог+Профсоюз']   ?? null,
    totalDebt:    parseHMStoSeconds(row.debt_total_accumulated),
    sysBreak:     parseHMStoSeconds(row.debt_system_error),
    netDebt:      parseHMStoSeconds(row.debt_after_deduction),
    compensated:  parseHMStoSeconds(row.debt_compensation_total),
    notCompensated: parseHMStoSeconds(row.debt_compensation_declined),
    remainingDebt:  parseHMStoSeconds(row.debt_no_compensation),
    flags: { manualInput: false, thresholdAchieved: false, requiresCardCheck: false },
  };
}

/* ── Public fetch ────────────────────────────────────────────────────────── */

export async function fetchAgentReport() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  if (!data.ok || !Array.isArray(data.rows)) throw new Error('Invalid API response');

  // Group rows by normalised branch
  const agentsByGroup = {};
  data.rows.forEach(row => {
    const agent = mapApiRowToAgent(row);
    if (!agentsByGroup[agent.vetka]) agentsByGroup[agent.vetka] = [];
    agentsByGroup[agent.vetka].push(agent);
  });

  // Assign per-group IDs
  for (const [group, list] of Object.entries(agentsByGroup)) {
    list.forEach((agent, i) => { agent.id = `${group}-${i + 1}`; });
  }

  return {
    agentsByGroup,
    totalAgents: data.row_count || data.rows.length,
  };
}

/* ── Save / reset bonus change ─────────────────────────────────────────────── */
const BONUS_API_URL = 'https://bonus.kontaktmarkazi.uz/public/api/bonus-change';

/**
 * POST bonus change to server.
 * @param {string} fullName  — exact agent name
 * @param {number} bonusValue — new bonus %, or 0 to reset
 */
export async function saveBonusChange(fullName, bonusValue) {
  const res = await fetch(BONUS_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer supersecretkey123',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ full_name: fullName, bonus_changed: bonusValue }),
  });
  if (!res.ok) throw new Error(`Bonus API ${res.status}`);
  return res.json();
}
