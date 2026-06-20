import { openDB } from 'idb';

const DB_NAME = 'gbpusd-backtest-db';
const DB_VERSION = 1;
let _db = null;

async function db() {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('trades')) {
        const ts = database.createObjectStore('trades', { keyPath: 'id', autoIncrement: true });
        ts.createIndex('byDate', 'date');
        ts.createIndex('byResult', 'result');
        ts.createIndex('byGrade', 'sweepGrade');
        ts.createIndex('bySession', 'session');
      }
      if (!database.objectStoreNames.contains('screenshots')) {
        database.createObjectStore('screenshots', { keyPath: 'tradeId' });
      }
      if (!database.objectStoreNames.contains('presets')) {
        database.createObjectStore('presets', { keyPath: 'id', autoIncrement: true });
      }
      if (!database.objectStoreNames.contains('hypotheses')) {
        database.createObjectStore('hypotheses', { keyPath: 'id', autoIncrement: true });
      }
      if (!database.objectStoreNames.contains('dailyReports')) {
        database.createObjectStore('dailyReports', { keyPath: 'date' });
      }
    },
  });
  return _db;
}

// ── TRADES ────────────────────────────────────────────────────────────────────
export async function addTrade(trade) {
  const d = await db();
  return d.add('trades', { ...trade, createdAt: Date.now() });
}

export async function updateTrade(trade) {
  const d = await db();
  return d.put('trades', { ...trade, updatedAt: Date.now() });
}

export async function deleteTrade(id) {
  const d = await db();
  await d.delete('trades', id);
  await d.delete('screenshots', id).catch(() => {});
}

export async function getAllTrades() {
  const d = await db();
  const trades = await d.getAll('trades');
  return trades.sort((a, b) => new Date(b.date) - new Date(a.date) || b.createdAt - a.createdAt);
}

export async function getTrade(id) {
  const d = await db();
  return d.get('trades', id);
}

export async function bulkAddTrades(trades) {
  const d = await db();
  const tx = d.transaction('trades', 'readwrite');
  for (const t of trades) {
    await tx.store.add({ ...t, id: undefined, createdAt: Date.now() });
  }
  await tx.done;
}

// ── SCREENSHOTS ───────────────────────────────────────────────────────────────
export async function saveScreenshot(tradeId, dataUrl) {
  const d = await db();
  return d.put('screenshots', { tradeId, dataUrl });
}

export async function getScreenshot(tradeId) {
  const d = await db();
  const r = await d.get('screenshots', tradeId);
  return r?.dataUrl ?? null;
}

export async function deleteScreenshot(tradeId) {
  const d = await db();
  return d.delete('screenshots', tradeId).catch(() => {});
}

// ── PRESETS ───────────────────────────────────────────────────────────────────
export async function addPreset(preset) {
  const d = await db();
  return d.add('presets', { ...preset, createdAt: Date.now() });
}

export async function getAllPresets() {
  const d = await db();
  return d.getAll('presets');
}

export async function deletePreset(id) {
  const d = await db();
  return d.delete('presets', id);
}

// ── HYPOTHESES ────────────────────────────────────────────────────────────────
export async function addHypothesis(hyp) {
  const d = await db();
  return d.add('hypotheses', { ...hyp, createdAt: Date.now() });
}

export async function updateHypothesis(hyp) {
  const d = await db();
  return d.put('hypotheses', { ...hyp, updatedAt: Date.now() });
}

export async function deleteHypothesis(id) {
  const d = await db();
  return d.delete('hypotheses', id);
}

export async function getAllHypotheses() {
  const d = await db();
  return d.getAll('hypotheses');
}

// ── DAILY REPORTS ─────────────────────────────────────────────────────────────
export async function saveDailyReport(report) {
  const d = await db();
  return d.put('dailyReports', { ...report, savedAt: Date.now() });
}

export async function getDailyReport(date) {
  const d = await db();
  return d.get('dailyReports', date);
}

export async function getAllDailyReports() {
  const d = await db();
  return d.getAll('dailyReports');
}

// ── BACKUP ────────────────────────────────────────────────────────────────────
export async function clearAllData() {
  const d = await db();
  const stores = ['trades','screenshots','presets','hypotheses','dailyReports'];
  const tx = d.transaction(stores, 'readwrite');
  await Promise.all(stores.map(s => tx.objectStore(s).clear()));
  await tx.done;
}

export async function getFullBackup() {
  const d = await db();
  const [trades, screenshots, presets, hypotheses, dailyReports] = await Promise.all([
    d.getAll('trades'),
    d.getAll('screenshots'),
    d.getAll('presets'),
    d.getAll('hypotheses'),
    d.getAll('dailyReports'),
  ]);
  return { trades, screenshots, presets, hypotheses, dailyReports, exportedAt: new Date().toISOString() };
}

export async function restoreFromBackup(backup) {
  await clearAllData();
  const d = await db();
  const stores = ['trades','screenshots','presets','hypotheses','dailyReports'];
  for (const store of stores) {
    if (!backup[store]?.length) continue;
    const tx = d.transaction(store, 'readwrite');
    for (const item of backup[store]) await tx.store.put(item);
    await tx.done;
  }
}
