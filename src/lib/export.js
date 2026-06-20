function download(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const dateStr = () => new Date().toISOString().split('T')[0];
const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;

const CSV_HEADERS = [
  'ID','Date','Day','Session','HTF Bias','DXY Bias','Major News',
  'Asia Sweep','MSS Occurred','Direction','BOS After MSS','FVG Present',
  'No-Wick Candle','Liquidity Void','Inverse FVG','Momentum','Displacement',
  'Sweep Grade','Entry Price','SL Price','TP Price','SL Pips','TP Pips',
  'R:R','Result','Pips Result','Actual R',
  'False MSS','Liq Already Taken','MSS Against HTF','Loss Reason','Notes','Trade Taken',
];

function tradeToRow(t) {
  const b = v => v ? 'Yes' : 'No';
  return [
    t.id, t.date, t.dayOfWeek, t.session, t.htfBias, t.dxyBias, b(t.majorNews),
    t.asiaSweepType, b(t.mssOccurred), t.tradeDirection, b(t.bosAfterMss),
    b(t.fvgPresent), b(t.noWickCandle), b(t.liquidityVoid), b(t.inverseFvg),
    t.momentumQuality, t.displacementStrength, t.sweepGrade,
    t.entryPrice, t.stopLossPrice, t.takeProfitPrice, t.slPips, t.tpPips,
    t.rr, t.result, t.pipsResult, t.actualR,
    b(t.falseMss), b(t.liquidityAlreadyTaken), b(t.mssAgainstHtf),
    t.primaryLossReason || '', t.notes || '', t.tradeTaken || '',
  ];
}

export function exportCSV(trades) {
  if (!trades.length) return alert('No trades to export.');
  const rows = [CSV_HEADERS, ...trades.map(tradeToRow)];
  const csv  = rows.map(r => r.map(q).join(',')).join('\n');
  download(csv, `gbpusd_backtest_${dateStr()}.csv`, 'text/csv;charset=utf-8;');
}

export function exportJSON(data) {
  download(JSON.stringify(data, null, 2), `gbpusd_backup_${dateStr()}.json`, 'application/json');
}

export async function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try { resolve(JSON.parse(e.target.result)); }
      catch { reject(new Error('Invalid JSON file — please check the file and try again.')); }
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsText(file);
  });
}

// Parse CSV line respecting quoted values
function parseCSVLine(line) {
  const cells = []; let cur = ''; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      if (inQ && line[i+1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (line[i] === ',' && !inQ) {
      cells.push(cur); cur = '';
    } else cur += line[i];
  }
  cells.push(cur);
  return cells.map(c => c.trim());
}

function parseBool(v) {
  return v === 'Yes' || v === 'true' || v === '1' || v === 'yes';
}

export async function importCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const lines = e.target.result.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) { reject(new Error('CSV has no data rows.')); return; }
        const trades = lines.slice(1).map(line => {
          const [id, date, dayOfWeek, session, htfBias, dxyBias, majorNews,
            asiaSweepType, mssOccurred, tradeDirection, bosAfterMss, fvgPresent,
            noWickCandle, liquidityVoid, inverseFvg, momentumQuality, displacementStrength,
            sweepGrade, entryPrice, stopLossPrice, takeProfitPrice, slPips, tpPips,
            rr, result, pipsResult, actualR,
            falseMss, liquidityAlreadyTaken, mssAgainstHtf, primaryLossReason, notes, tradeTaken
          ] = parseCSVLine(line);
          return {
            date, dayOfWeek, session, htfBias, dxyBias,
            majorNews: parseBool(majorNews), asiaSweepType,
            mssOccurred: parseBool(mssOccurred), tradeDirection,
            bosAfterMss: parseBool(bosAfterMss), fvgPresent: parseBool(fvgPresent),
            noWickCandle: parseBool(noWickCandle), liquidityVoid: parseBool(liquidityVoid),
            inverseFvg: parseBool(inverseFvg), momentumQuality, displacementStrength,
            sweepGrade, entryPrice: parseFloat(entryPrice) || '',
            stopLossPrice: parseFloat(stopLossPrice) || '', takeProfitPrice: parseFloat(takeProfitPrice) || '',
            slPips: parseFloat(slPips) || '', tpPips: parseFloat(tpPips) || '',
            rr: parseFloat(rr) || '', result, pipsResult: parseFloat(pipsResult) || '',
            actualR: parseFloat(actualR) || 0, falseMss: parseBool(falseMss),
            liquidityAlreadyTaken: parseBool(liquidityAlreadyTaken),
            mssAgainstHtf: parseBool(mssAgainstHtf), primaryLossReason, notes,
            tradeTaken: tradeTaken || '',
          };
        }).filter(t => t.date);
        resolve(trades);
      } catch(err) { reject(new Error('Could not parse CSV: ' + err.message)); }
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsText(file);
  });
}
