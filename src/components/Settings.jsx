import { useState, useRef } from 'react';
import { C } from '../lib/constants.js';
import { exportCSV, exportJSON, importJSON, importCSV } from '../lib/export.js';
import { getFullBackup, restoreFromBackup, clearAllData } from '../lib/db.js';
import { SectionHead, Card, H3, Btn, Bul } from './ui.jsx';

const SG = ({ title, color, children }) => (
  <Card style={{ borderLeft:`3px solid ${color}`, marginBottom:14 }}>
    <H3 color={color}>{title}</H3>
    {children}
  </Card>
);

const Msg = ({ msg, type }) => {
  if (!msg) return null;
  const color = type==='success' ? C.green : type==='error' ? C.red : C.amber;
  return (
    <div style={{ padding:'8px 12px', background:color+'18', border:`1px solid ${color}44`,
      borderRadius:4, fontSize:12, color, marginTop:10 }}>{msg}</div>
  );
};

export default function Settings({ trades, hypotheses, presets, onImportTrades, onRestoreBackup }) {
  const [msg,      setMsg]      = useState({ text:'', type:'' });
  const [clearing, setClearing] = useState(false);
  const jsonRef = useRef();
  const csvRef  = useRef();

  const show = (text, type='success', ms=4000) => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text:'', type:'' }), ms);
  };

  // ── EXPORT ────────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    try { exportCSV(trades); show(`Exported ${trades.length} trades to CSV.`); }
    catch(e) { show('Export failed: '+e.message, 'error'); }
  };

  const handleExportJSON = () => {
    try { exportJSON({ trades }); show(`Exported ${trades.length} trades to JSON.`); }
    catch(e) { show('Export failed: '+e.message, 'error'); }
  };

  const handleFullBackup = async () => {
    try {
      const backup = await getFullBackup();
      exportJSON(backup);
      show(`Full backup exported: ${backup.trades.length} trades, ${backup.hypotheses.length} hypotheses, ${backup.presets.length} presets.`);
    } catch(e) { show('Backup failed: '+e.message, 'error'); }
  };

  // ── IMPORT ────────────────────────────────────────────────────────────────
  const handleImportJSON = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const data = await importJSON(file);
      // Check if it's a full backup or trades-only
      if (data.trades && Array.isArray(data.trades)) {
        if (data.hypotheses || data.presets) {
          // Full backup restore
          if (!window.confirm(`This will REPLACE all current data with the backup (${data.trades.length} trades, ${(data.hypotheses||[]).length} hypotheses). Continue?`)) return;
          await onRestoreBackup(data);
          show(`Full backup restored: ${data.trades.length} trades imported.`);
        } else {
          // Trades-only JSON
          if (!window.confirm(`Import ${data.trades.length} trades? They will be ADDED to your existing ${trades.length} trades.`)) return;
          await onImportTrades(data.trades);
          show(`Imported ${data.trades.length} trades successfully.`);
        }
      } else if (Array.isArray(data)) {
        if (!window.confirm(`Import ${data.length} trades? They will be ADDED to your existing ${trades.length} trades.`)) return;
        await onImportTrades(data);
        show(`Imported ${data.length} trades successfully.`);
      } else {
        show('Could not parse file — expected { trades: [...] } or an array of trades.', 'error');
      }
    } catch(e) { show('Import failed: '+e.message, 'error'); }
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const imported = await importCSV(file);
      if (!imported.length) { show('No valid trades found in CSV.', 'error'); return; }
      if (!window.confirm(`Import ${imported.length} trades from CSV? They will be ADDED to your existing ${trades.length} trades.`)) return;
      await onImportTrades(imported);
      show(`Imported ${imported.length} trades from CSV.`);
    } catch(e) { show('CSV import failed: '+e.message, 'error'); }
  };

  // ── CLEAR ─────────────────────────────────────────────────────────────────
  const handleClearAll = async () => {
    if (!window.confirm('⚠️ This will DELETE ALL trades, hypotheses, presets, and reports. This cannot be undone.\n\nType "DELETE" and press OK to confirm.')) return;
    const confirm2 = window.prompt('Type DELETE to confirm clearing all data:');
    if (confirm2 !== 'DELETE') { show('Cancelled — data not cleared.', 'error'); return; }
    setClearing(true);
    try {
      await clearAllData();
      await onRestoreBackup({ trades:[], screenshots:[], presets:[], hypotheses:[], dailyReports:[] });
      show('All data cleared. Database is now empty.', 'success');
    } catch(e) { show('Clear failed: '+e.message, 'error'); }
    setClearing(false);
  };

  return (
    <div style={{ maxWidth:800, margin:'0 auto' }}>
      <SectionHead sub="Import, export, backup, and manage your backtest data.">
        Settings & Backup
      </SectionHead>

      {/* STATUS */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:20 }}>
        {[
          { l:'Trades in DB', v:trades.length, c:C.blue },
          { l:'Hypotheses',   v:hypotheses.length, c:C.purple },
          { l:'Filter Presets', v:presets.length, c:C.amber },
        ].map(s => (
          <div key={s.l} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 16px' }}>
            <div style={{ fontSize:10, color:C.textDim, textTransform:'uppercase', marginBottom:2 }}>{s.l}</div>
            <div style={{ fontSize:24, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* GLOBAL MSG */}
      <Msg msg={msg.text} type={msg.type} />

      {/* EXPORT */}
      <SG title="Export Trades" color={C.green}>
        <p style={{ fontSize:12, color:C.textDim, marginBottom:12 }}>
          Export your trade data for spreadsheets, backup, or analysis in other tools.
        </p>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <Btn color={C.green} onClick={handleExportCSV} disabled={!trades.length}>
            📊 Export {trades.length} Trades — CSV
          </Btn>
          <Btn variant="outline" color={C.green} onClick={handleExportJSON} disabled={!trades.length}>
            📄 Export Trades — JSON
          </Btn>
        </div>
        {!trades.length && <div style={{ fontSize:11, color:C.textDim, marginTop:8 }}>No trades to export.</div>}
      </SG>

      {/* FULL BACKUP */}
      <SG title="Full Backup (Recommended)" color={C.gold}>
        <p style={{ fontSize:12, color:C.textDim, marginBottom:12 }}>
          Exports everything: trades, screenshots, filter presets, hypotheses, and daily reports in a single JSON file. Use this before clearing data or switching devices.
        </p>
        <Btn color={C.gold} onClick={handleFullBackup}>
          💾 Export Full Backup — JSON
        </Btn>
      </SG>

      {/* IMPORT */}
      <SG title="Import / Restore" color={C.blue}>
        <p style={{ fontSize:12, color:C.textDim, marginBottom:12 }}>
          Import from a previous backup or a CSV export. Imported trades are ADDED to existing data (not replaced) unless you import a full backup.
        </p>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:12 }}>
          <Btn color={C.blue} onClick={() => jsonRef.current?.click()}>
            📂 Import from JSON Backup
          </Btn>
          <Btn variant="outline" color={C.blue} onClick={() => csvRef.current?.click()}>
            📋 Import from CSV
          </Btn>
        </div>
        <input ref={jsonRef} type="file" accept=".json" onChange={handleImportJSON} style={{ display:'none' }} />
        <input ref={csvRef}  type="file" accept=".csv"  onChange={handleImportCSV}  style={{ display:'none' }} />
        <div style={{ background:C.surface2, borderRadius:6, padding:'10px 12px', fontSize:11, color:C.textDim, lineHeight:1.6 }}>
          <b style={{ color:C.amber }}>CSV format:</b> Must match the export format (columns: ID, Date, Day, Session, HTF Bias, DXY Bias, Major News, Asia Sweep, MSS Occurred, Direction, BOS After MSS, FVG Present, No-Wick Candle, Liquidity Void, Inverse FVG, Momentum, Displacement, Sweep Grade, Entry Price, SL Price, TP Price, SL Pips, TP Pips, R:R, Result, Pips Result, Actual R, False MSS, Liq Already Taken, MSS Against HTF, Loss Reason, Notes).
          <br /><br />
          <b style={{ color:C.amber }}>Full backup JSON:</b> Created by the "Export Full Backup" button above. Restoring a full backup will replace ALL current data.
        </div>
      </SG>

      {/* DEPLOYMENT INFO */}
      <SG title="GitHub Pages Deployment" color={C.purple}>
        <div style={{ fontSize:12, color:C.text, lineHeight:1.8 }}>
          <div style={{ marginBottom:8 }}>
            <b style={{ color:C.purple }}>1. Create a GitHub repository</b> named <code style={{ background:C.surface2, padding:'1px 5px', borderRadius:3, color:C.gold }}>gbpusd-backtest</code>
          </div>
          <div style={{ marginBottom:8 }}>
            <b style={{ color:C.purple }}>2. Push your code</b>
            <div style={{ background:C.surface2, borderRadius:4, padding:'8px 12px', marginTop:4, fontFamily:'monospace', fontSize:11, color:C.green }}>
              git init && git add . && git commit -m "Initial commit"<br/>
              git remote add origin https://github.com/YOUR_USERNAME/gbpusd-backtest.git<br/>
              git push -u origin main
            </div>
          </div>
          <div style={{ marginBottom:8 }}>
            <b style={{ color:C.purple }}>3. Enable GitHub Actions</b> — The <code style={{ background:C.surface2, padding:'1px 5px', borderRadius:3, color:C.gold }}>.github/workflows/deploy.yml</code> file is already included. Go to: Repo Settings → Pages → Source: GitHub Actions.
          </div>
          <div style={{ marginBottom:8 }}>
            <b style={{ color:C.purple }}>4. Auto-deploy</b> — Every push to <code style={{ background:C.surface2, padding:'1px 5px', borderRadius:3, color:C.gold }}>main</code> branch auto-builds and deploys.
          </div>
          <div>
            <b style={{ color:C.purple }}>5. Your app URL:</b> <code style={{ color:C.gold }}>https://YOUR_USERNAME.github.io/gbpusd-backtest/</code>
          </div>
          <div style={{ marginTop:12, padding:'8px 12px', background:C.amberBg, borderRadius:4,
            border:`1px solid ${C.amberDim}`, color:C.amber, fontSize:11 }}>
            ⚠️ All data is stored in YOUR BROWSER's IndexedDB — it does not sync across devices. Use the Full Backup export regularly and import on each device you use.
          </div>
        </div>
      </SG>

      {/* CLEAR ALL */}
      <SG title="Danger Zone" color={C.red}>
        <p style={{ fontSize:12, color:C.textDim, marginBottom:12 }}>
          Permanently deletes all trades, daily reports, presets, and hypotheses. Export a full backup first.
        </p>
        <Btn color={C.red} onClick={handleClearAll} disabled={clearing}>
          {clearing ? 'Clearing…' : '🗑️ Clear All Data'}
        </Btn>
      </SG>
    </div>
  );
}
