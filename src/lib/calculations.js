// ── CORE STATS ────────────────────────────────────────────────────────────────
const ZERO = { total:0, wins:0, losses:0, be:0, partial:0, winRate:0, profitFactor:0, totalPips:0, netR:0, avgR:0, avgWinPips:0, avgLossPips:0 };

export function computeStats(trades = []) {
  if (!trades.length) return { ...ZERO };
  const wins    = trades.filter(t => t.result === 'Win');
  const losses  = trades.filter(t => t.result === 'Loss');
  const be      = trades.filter(t => t.result === 'Breakeven');
  const partial = trades.filter(t => t.result === 'Partial');

  const sumPips = arr => arr.reduce((s, t) => s + (parseFloat(t.pipsResult) || 0), 0);
  const winPips  = sumPips(wins);
  const lossPips = Math.abs(sumPips(losses));
  const totalPips = sumPips(trades);
  const netR = trades.reduce((s, t) => s + (parseFloat(t.actualR) || 0), 0);

  return {
    total: trades.length,
    wins: wins.length,
    losses: losses.length,
    be: be.length,
    partial: partial.length,
    winRate:       +(wins.length / trades.length * 100).toFixed(1),
    profitFactor:  lossPips > 0 ? +(winPips / lossPips).toFixed(2) : wins.length ? 99.9 : 0,
    totalPips:     +totalPips.toFixed(1),
    netR:          +netR.toFixed(2),
    avgR:          trades.length ? +(netR / trades.length).toFixed(2) : 0,
    avgWinPips:    wins.length ? +(winPips / wins.length).toFixed(1) : 0,
    avgLossPips:   losses.length ? +(lossPips / losses.length).toFixed(1) : 0,
  };
}

// ── FILTER ENGINE ─────────────────────────────────────────────────────────────
// Filter values stored as strings: 'true'/'false' for booleans, '' for "any"
export function applyFilters(trades, filters = {}) {
  return trades.filter(trade =>
    Object.entries(filters).every(([key, value]) => {
      if (value === '' || value === null || value === undefined) return true;
      const tv = trade[key];
      // boolean fields stored as 'true'/'false' string in filter
      if (value === 'true')  return tv === true  || tv === 'true'  || tv === 'Yes';
      if (value === 'false') return tv === false || tv === 'false' || tv === 'No';
      return String(tv ?? '').toLowerCase() === String(value).toLowerCase();
    })
  );
}

// ── EDGE DISCOVERY ────────────────────────────────────────────────────────────
const EDGE_FACTORS = [
  { label:'FVG Present',       field:'fvgPresent',           type:'bool', values:['true','false'],               labels:['FVG Yes','FVG No'] },
  { label:'No-Wick Candle',    field:'noWickCandle',         type:'bool', values:['true','false'],               labels:['No-Wick Yes','No-Wick No'] },
  { label:'BOS After MSS',     field:'bosAfterMss',          type:'bool', values:['true','false'],               labels:['BOS Yes','BOS No'] },
  { label:'Liquidity Void',    field:'liquidityVoid',        type:'bool', values:['true','false'],               labels:['LiqVoid Yes','LiqVoid No'] },
  { label:'Inverse FVG',       field:'inverseFvg',           type:'bool', values:['true','false'],               labels:['IFVG Yes','IFVG No'] },
  { label:'Sweep Grade',       field:'sweepGrade',           type:'str',  values:['A','B','C'],                  labels:['Grade A','Grade B','Grade C'] },
  { label:'Session',           field:'session',              type:'str',  values:['London Only','London + NY Overlap'], labels:['London Only','London+NY'] },
  { label:'HTF Bias',          field:'htfBias',              type:'str',  values:['Bullish','Bearish','Neutral'],labels:['HTF Bullish','HTF Bearish','HTF Neutral'] },
  { label:'Momentum',          field:'momentumQuality',      type:'str',  values:['Strong','Medium','Weak'],     labels:['Momentum Strong','Medium','Weak'] },
  { label:'Displacement',      field:'displacementStrength', type:'str',  values:['Strong','Medium','Weak'],     labels:['Disp Strong','Medium','Weak'] },
  { label:'Asia Sweep',        field:'asiaSweepType',        type:'str',  values:['Asia High Swept','Asia Low Swept'], labels:['Asia High','Asia Low'] },
  { label:'Trade Direction',   field:'tradeDirection',       type:'str',  values:['Long','Short'],               labels:['Long','Short'] },
  { label:'DXY Bias',         field:'dxyBias',              type:'str',  values:['Rising','Falling','Ranging'], labels:['DXY Rising','Falling','Ranging'] },
];

function matchFactor(trade, field, type, val) {
  if (type === 'bool') {
    const bv = val === 'true';
    const tv = trade[field];
    return tv === bv || tv === val || String(tv) === val;
  }
  return trade[field] === val;
}

export function computeEdgeDiscovery(trades = []) {
  return EDGE_FACTORS.map(f => ({
    factor: f.label,
    rows: f.values.map((val, i) => {
      const filtered = trades.filter(t => matchFactor(t, f.field, f.type, val));
      const s = computeStats(filtered);
      return { label: f.labels[i], count: s.total, winRate: s.winRate, pf: s.profitFactor, avgR: s.avgR, totalPips: s.totalPips };
    }),
  }));
}

// ── CHART DATA ────────────────────────────────────────────────────────────────
export function computeCumulativeR(trades) {
  const sorted = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date) || a.id - b.id);
  let cum = 0;
  return sorted.map((t, i) => {
    cum += parseFloat(t.actualR) || 0;
    return { n: i + 1, cumR: +cum.toFixed(2), date: t.date?.slice(5) };
  });
}

export function computeResultPie(trades) {
  const COLORS = { Win:'#3DB87A', Loss:'#D44E4E', Breakeven:'#C9A84C', Partial:'#4C8FD4' };
  return ['Win','Loss','Breakeven','Partial']
    .map(r => ({ name: r, value: trades.filter(t => t.result === r).length, color: COLORS[r] }))
    .filter(d => d.value > 0);
}

export function computeDayStats(trades) {
  return ['Monday','Tuesday','Wednesday','Thursday','Friday'].map(day => {
    const dt = trades.filter(t => t.dayOfWeek === day);
    const s = computeStats(dt);
    return { day: day.slice(0, 3), winRate: s.winRate, count: dt.length, pf: s.profitFactor, netR: s.netR };
  });
}

export function computeWinRateBars(trades, factor) {
  const f = EDGE_FACTORS.find(ef => ef.label === factor);
  if (!f || !trades.length) return [];
  return f.values.map((val, i) => {
    const filtered = trades.filter(t => matchFactor(t, f.field, f.type, val));
    const s = computeStats(filtered);
    return { name: f.labels[i], winRate: s.winRate, count: s.total, pf: s.profitFactor };
  }).filter(r => r.count > 0);
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
export function getDayOfWeek(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()] || '';
}

export function calcRR(slPips, tpPips) {
  const sl = parseFloat(slPips);
  const tp = parseFloat(tpPips);
  if (!sl || sl <= 0) return '';
  return +(tp / sl).toFixed(2);
}

export function calcActualR(result, rr) {
  const r = parseFloat(rr);
  if (result === 'Win')        return r || 0;
  if (result === 'Loss')       return -1;
  if (result === 'Breakeven')  return 0;
  if (result === 'Partial')    return r ? +(r / 2).toFixed(2) : 0;
  return 0;
}

export function fmt(n, dec = 1) {
  if (n === null || n === undefined || n === '') return '—';
  return (+n).toFixed(dec);
}
