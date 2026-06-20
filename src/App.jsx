import { useState, useEffect, useCallback } from 'react';
import { C, DEFAULT_HYPOTHESES, DEFAULT_PRESETS } from './lib/constants.js';
import * as DB from './lib/db.js';
import TradeEntry    from './components/TradeEntry.jsx';
import TradeLog      from './components/TradeLog.jsx';
import Analytics     from './components/Analytics.jsx';
import EdgeDiscovery from './components/EdgeDiscovery.jsx';
import StrategyBlueprint    from './components/StrategyBlueprint.jsx';
import DailyAccountability  from './components/DailyAccountability.jsx';
import HypothesisParkingLot from './components/HypothesisParkingLot.jsx';
import Settings      from './components/Settings.jsx';

const TABS = [
  { id:'strategy',    label:'Strategy Blueprint', icon:'📋' },
  { id:'entry',       label:'Trade Entry',        icon:'✏️' },
  { id:'log',         label:'Trade Log',          icon:'📊' },
  { id:'analytics',   label:'Analytics',          icon:'📈' },
  { id:'edge',        label:'Edge Discovery',     icon:'🔬' },
  { id:'daily',       label:'Daily Report',       icon:'📝' },
  { id:'hypotheses',  label:'Parking Lot',        icon:'💡' },
  { id:'settings',    label:'Settings',           icon:'⚙️' },
];

export default function App() {
  const [trades,      setTrades]      = useState([]);
  const [hypotheses,  setHypotheses]  = useState([]);
  const [presets,     setPresets]     = useState([]);
  const [activeTab,   setActiveTab]   = useState('strategy');
  const [editTrade,   setEditTrade]   = useState(null);
  const [viewTrade,   setViewTrade]   = useState(null);
  const [loading,     setLoading]     = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [t, h, p] = await Promise.all([
        DB.getAllTrades(),
        DB.getAllHypotheses(),
        DB.getAllPresets(),
      ]);
      setTrades(t);
      // seed hypotheses if empty
      if (!h.length) {
        for (const hyp of DEFAULT_HYPOTHESES) await DB.addHypothesis(hyp);
        setHypotheses(await DB.getAllHypotheses());
      } else {
        setHypotheses(h);
      }
      // seed presets if empty
      if (!p.length) {
        for (const pr of DEFAULT_PRESETS) await DB.addPreset(pr);
        setPresets(await DB.getAllPresets());
      } else {
        setPresets(p);
      }
    } catch(e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── TRADE HANDLERS ─────────────────────────────────────────────────────────
  const handleSaveTrade = async (tradeData, screenshotDataUrl) => {
    if (editTrade?.id) {
      await DB.updateTrade({ ...tradeData, id: editTrade.id });
      if (screenshotDataUrl) await DB.saveScreenshot(editTrade.id, screenshotDataUrl);
    } else {
      const id = await DB.addTrade(tradeData);
      if (screenshotDataUrl) await DB.saveScreenshot(id, screenshotDataUrl);
    }
    setEditTrade(null);
    setTrades(await DB.getAllTrades());
    setActiveTab('log');
  };

  const handleEditTrade = (trade) => {
    setEditTrade(trade);
    setActiveTab('entry');
  };

  const handleDeleteTrade = async (id) => {
    if (!window.confirm('Delete this trade? This cannot be undone.')) return;
    await DB.deleteTrade(id);
    setTrades(await DB.getAllTrades());
  };

  const handleCancelEntry = () => {
    setEditTrade(null);
    setActiveTab('log');
  };

  // ── HYPOTHESIS HANDLERS ────────────────────────────────────────────────────
  const handleUpdateHypothesis = async (hyp) => {
    await DB.updateHypothesis(hyp);
    setHypotheses(await DB.getAllHypotheses());
  };

  const handleAddHypothesis = async (hyp) => {
    await DB.addHypothesis(hyp);
    setHypotheses(await DB.getAllHypotheses());
  };

  const handleDeleteHypothesis = async (id) => {
    await DB.deleteHypothesis(id);
    setHypotheses(await DB.getAllHypotheses());
  };

  // ── PRESET HANDLERS ────────────────────────────────────────────────────────
  const handleAddPreset = async (preset) => {
    await DB.addPreset(preset);
    setPresets(await DB.getAllPresets());
  };

  const handleDeletePreset = async (id) => {
    await DB.deletePreset(id);
    setPresets(await DB.getAllPresets());
  };

  // ── IMPORT/EXPORT ──────────────────────────────────────────────────────────
  const handleImportTrades = async (importedTrades) => {
    await DB.bulkAddTrades(importedTrades);
    setTrades(await DB.getAllTrades());
  };

  const handleRestoreBackup = async (backup) => {
    await DB.restoreFromBackup(backup);
    await loadAll();
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background:C.bg, minHeight:'100vh', fontFamily:"'Inter',system-ui,sans-serif", color:C.text }}>
      {/* HEADER */}
      <header style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, position:'sticky', top:0, zIndex:100 }}>
        <div style={{ maxWidth:1440, margin:'0 auto', padding:'0 20px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0 0' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:32, height:32, borderRadius:6, background:C.gold,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:16, fontWeight:800, color:'#000' }}>G</div>
              <div>
                <div style={{ fontSize:15, fontWeight:800, color:C.textBr }}>GBPUSD Backtest System</div>
                <div style={{ fontSize:10, color:C.textDim }}>London Session · Asia Sweep · MSS Entry</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:20, fontSize:12 }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ color:C.gold, fontWeight:800, fontSize:18 }}>{trades.length}</div>
                <div style={{ color:C.textDim, fontSize:10 }}>TRADES</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ color:C.green, fontWeight:800, fontSize:18 }}>
                  {trades.length ? (trades.filter(t=>t.result==='Win').length / trades.length * 100).toFixed(0)+'%' : '—'}
                </div>
                <div style={{ color:C.textDim, fontSize:10 }}>WIN RATE</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontWeight:800, fontSize:18, color: (() => {
                  const wins = trades.filter(t=>t.result==='Win').reduce((s,t)=>s+(parseFloat(t.pipsResult)||0),0);
                  const loss = Math.abs(trades.filter(t=>t.result==='Loss').reduce((s,t)=>s+(parseFloat(t.pipsResult)||0),0));
                  const pf = loss > 0 ? wins/loss : 0;
                  return pf >= 1.4 ? C.green : pf >= 1.0 ? C.amber : C.red;
                })() }}>
                  {(() => {
                    const wins = trades.filter(t=>t.result==='Win').reduce((s,t)=>s+(parseFloat(t.pipsResult)||0),0);
                    const loss = Math.abs(trades.filter(t=>t.result==='Loss').reduce((s,t)=>s+(parseFloat(t.pipsResult)||0),0));
                    return loss > 0 ? (wins/loss).toFixed(2) : '—';
                  })()}
                </div>
                <div style={{ color:C.textDim, fontSize:10 }}>PROFIT FACTOR</div>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div style={{ display:'flex', gap:0, overflowX:'auto', marginTop:4 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => { setActiveTab(t.id); if(t.id!=='entry') setEditTrade(null); }}
                style={{ padding:'8px 14px', background:'none', border:'none',
                  borderBottom:`2px solid ${activeTab===t.id ? C.gold : 'transparent'}`,
                  color: activeTab===t.id ? C.gold : C.textDim, cursor:'pointer',
                  fontSize:12, fontWeight:activeTab===t.id?700:400, whiteSpace:'nowrap',
                  display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:14 }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      {loading ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
          height:'60vh', color:C.textDim, fontSize:14 }}>
          Loading database…
        </div>
      ) : (
        <main style={{ maxWidth:1440, margin:'0 auto', padding:'24px 20px' }}>
          {activeTab==='strategy'   && <StrategyBlueprint />}
          {activeTab==='entry'      && <TradeEntry onSave={handleSaveTrade} onCancel={handleCancelEntry} editTrade={editTrade} />}
          {activeTab==='log'        && <TradeLog trades={trades} presets={presets} onEdit={handleEditTrade} onDelete={handleDeleteTrade} onAddPreset={handleAddPreset} onDeletePreset={handleDeletePreset} onNewTrade={() => { setEditTrade(null); setActiveTab('entry'); }} />}
          {activeTab==='analytics'  && <Analytics trades={trades} />}
          {activeTab==='edge'       && <EdgeDiscovery trades={trades} />}
          {activeTab==='daily'      && <DailyAccountability trades={trades} />}
          {activeTab==='hypotheses' && <HypothesisParkingLot hypotheses={hypotheses} onUpdate={handleUpdateHypothesis} onAdd={handleAddHypothesis} onDelete={handleDeleteHypothesis} />}
          {activeTab==='settings'   && <Settings trades={trades} hypotheses={hypotheses} presets={presets} onImportTrades={handleImportTrades} onRestoreBackup={handleRestoreBackup} />}
        </main>
      )}
    </div>
  );
}
