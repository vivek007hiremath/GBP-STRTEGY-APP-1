import { useState, useMemo, useEffect } from 'react';
import { C, SESSIONS, HTF_BIAS, DXY_BIAS, ASIA_SWEEP, DIRECTION, MOMENTUM, DISPLACEMENT, GRADES, RESULTS, EMPTY_FILTERS, BOOL_OPTIONS } from '../lib/constants.js';
import { applyFilters, computeStats } from '../lib/calculations.js';
import { exportCSV, exportJSON } from '../lib/export.js';
import { getScreenshot } from '../lib/db.js';
import { SectionHead, Btn, Input, Select, ResultBadge, GradeBadge, StatCard, Badge, Modal, Empty, PFBadge, H3 } from './ui.jsx';
import TradeDetail from './TradeDetail.jsx';

const ORD = { Strong:2, Medium:1, Weak:0 };
const sortFns = {
  date:         (a,b) => b.date?.localeCompare(a.date)||0,
  result:       (a,b) => (a.result||'').localeCompare(b.result||''),
  grade:        (a,b) => (a.sweepGrade||'').localeCompare(b.sweepGrade||''),
  session:      (a,b) => (a.session||'').localeCompare(b.session||''),
  pips:         (a,b) => (parseFloat(b.pipsResult)||0)-(parseFloat(a.pipsResult)||0),
  rr:           (a,b) => (parseFloat(b.rr)||0)-(parseFloat(a.rr)||0),
  actualR:      (a,b) => (parseFloat(b.actualR)||0)-(parseFloat(a.actualR)||0),
  fvgPresent:   (a,b) => (b.fvgPresent?1:0)-(a.fvgPresent?1:0),
  noWickCandle: (a,b) => (b.noWickCandle?1:0)-(a.noWickCandle?1:0),
  bosAfterMss:  (a,b) => (b.bosAfterMss?1:0)-(a.bosAfterMss?1:0),
  momentum:     (a,b) => (ORD[b.momentumQuality]||0)-(ORD[a.momentumQuality]||0),
  displacement: (a,b) => (ORD[b.displacementStrength]||0)-(ORD[a.displacementStrength]||0),
  htfBias:      (a,b) => (a.htfBias||'').localeCompare(b.htfBias||''),
  dxyBias:      (a,b) => (a.dxyBias||'').localeCompare(b.dxyBias||''),
  tradeTaken:   (a,b) => (a.tradeTaken||'').localeCompare(b.tradeTaken||''),
};

const BoolSel = ({ value, onChange }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{ background:C.surface2, border:`1px solid ${C.border}`, color:C.text, padding:'5px 8px',
      borderRadius:4, fontSize:11, cursor:'pointer' }}>
    {BOOL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const StrSel = ({ value, onChange, opts, placeholder='Any' }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{ background:C.surface2, border:`1px solid ${C.border}`, color:C.text, padding:'5px 8px',
      borderRadius:4, fontSize:11, cursor:'pointer' }}>
    <option value="">{placeholder}</option>
    {opts.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

function FilteredReviewModal({ trades, index, onIndexChange, onClose, onEdit }) {
  const [screenshot, setScreenshot] = useState(null);
  const t = trades[index];

  useEffect(() => {
    setScreenshot(null);
    if (t?.id) getScreenshot(t.id).then(url => setScreenshot(url));
  }, [t?.id]);

  useEffect(() => {
    const handle = (e) => {
      if (e.key === 'ArrowLeft')  onIndexChange(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') onIndexChange(i => Math.min(trades.length - 1, i + 1));
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [trades.length, onIndexChange]);

  if (!t) return null;

  const rColor   = (parseFloat(t.actualR)||0) > 0 ? C.green : C.red;
  const pipColor = (parseFloat(t.pipsResult)||0) > 0 ? C.green : C.red;
  const Bool = ({ val }) => <span style={{ fontWeight:700, color:val?C.green:C.muted }}>{val?'✓ Yes':'– No'}</span>;
  const Row  = ({ label, value, color }) => (
    <div style={{ display:'flex', padding:'5px 0', borderBottom:`1px solid ${C.border}`, gap:8 }}>
      <span style={{ fontSize:11, color:C.textDim, minWidth:148, flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:12, color:color||C.text, lineHeight:1.4 }}>{value}</span>
    </div>
  );

  return (
    <Modal title={`Review Mode · Trade #${t.id} · ${t.date}`} onClose={onClose} width={840}>
      {/* NAVIGATION */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'8px 0', marginBottom:14, borderBottom:`1px solid ${C.border}` }}>
        <Btn variant="outline" color={C.blue} onClick={() => onIndexChange(i => Math.max(0,i-1))} disabled={index===0}>← Prev</Btn>
        <div style={{ textAlign:'center' }}>
          <span style={{ color:C.gold, fontWeight:800, fontSize:16 }}>{index+1}</span>
          <span style={{ color:C.textDim, fontSize:13 }}> / {trades.length}</span>
          <div style={{ fontSize:10, color:C.textDim, marginTop:2 }}>← → arrow keys to navigate</div>
        </div>
        <Btn variant="outline" color={C.blue} onClick={() => onIndexChange(i => Math.min(trades.length-1,i+1))} disabled={index===trades.length-1}>Next →</Btn>
      </div>

      {/* RESULT BANNER */}
      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:14,
        padding:'8px 12px', background:C.surface2, borderRadius:6, flexWrap:'wrap' }}>
        <ResultBadge result={t.result||'—'} />
        <GradeBadge grade={t.sweepGrade} />
        <span style={{ fontSize:13, fontWeight:700, color:rColor }}>
          {t.actualR!=null&&t.actualR!==''?((parseFloat(t.actualR)>0?'+':'')+parseFloat(t.actualR).toFixed(2)+' R'):''}
        </span>
        <span style={{ fontSize:13, fontWeight:700, color:pipColor }}>
          {t.pipsResult!=null&&t.pipsResult!==''?((parseFloat(t.pipsResult)>0?'+':'')+parseFloat(t.pipsResult).toFixed(1)+' pips'):''}
        </span>
        {t.tradeTaken && (
          <span style={{ fontSize:11, fontWeight:700, marginLeft:'auto',
            color:t.tradeTaken==='Yes'?C.green:C.amber }}>
            Trade Taken: {t.tradeTaken}
          </span>
        )}
        <span style={{ fontSize:11, color:C.textDim }}>{t.dayOfWeek}</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* DETAILS */}
        <div>
          <H3 color={C.blue}>Trade Identity</H3>
          <Row label="Session" value={t.session} />
          <Row label="HTF Bias (1H)" value={t.htfBias} color={t.htfBias==='Bullish'?C.green:t.htfBias==='Bearish'?C.red:C.amber} />
          <Row label="DXY Bias" value={t.dxyBias} />
          <Row label="Asia Sweep" value={t.asiaSweepType} />
          <Row label="Trade Direction" value={t.tradeDirection} color={t.tradeDirection==='Long'?C.green:C.red} />
          <Row label="Sweep Grade" value={t.sweepGrade} />
          <Row label="R:R" value={t.rr||'—'} color={C.gold} />
          <H3 color={C.purple}>Quality Checklist</H3>
          <Row label="BOS After MSS" value={<Bool val={t.bosAfterMss}/>} />
          <Row label="FVG Present" value={<Bool val={t.fvgPresent}/>} />
          <Row label="No-Wick Candle" value={<Bool val={t.noWickCandle}/>} />
          <Row label="Liquidity Void" value={<Bool val={t.liquidityVoid}/>} />
          <Row label="Inverse FVG" value={<Bool val={t.inverseFvg}/>} />
          <Row label="Momentum Quality" value={t.momentumQuality||'—'} />
          <Row label="Displacement Strength" value={t.displacementStrength||'—'} />
          <H3 color={C.red}>False Setup Flags</H3>
          <Row label="False MSS?" value={<Bool val={t.falseMss}/>} />
          <Row label="Liq. Already Taken?" value={<Bool val={t.liquidityAlreadyTaken}/>} />
          <Row label="MSS Against HTF?" value={<Bool val={t.mssAgainstHtf}/>} />
          {t.primaryLossReason && <Row label="Loss Reason" value={t.primaryLossReason} color={C.red} />}
          {t.notes && (
            <div style={{ marginTop:10, padding:'8px 10px', background:C.surface2,
              borderRadius:4, fontSize:11, color:C.text, lineHeight:1.55 }}>{t.notes}</div>
          )}
        </div>
        {/* SCREENSHOT */}
        <div>
          <H3 color={C.muted}>Screenshot</H3>
          {screenshot ? (
            <img src={screenshot} alt="chart" style={{ width:'100%', borderRadius:6,
              border:`1px solid ${C.border}`, maxHeight:380, objectFit:'contain',
              background:C.surface2 }} />
          ) : (
            <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center',
              color:C.textDim, fontSize:12, background:C.surface2, borderRadius:6,
              border:`1px dashed ${C.border}` }}>
              No screenshot saved for this trade
            </div>
          )}
        </div>
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:14,
        paddingTop:12, borderTop:`1px solid ${C.border}` }}>
        <Btn variant="outline" color={C.gold} onClick={() => onEdit(t)}>✏️ Edit</Btn>
        <Btn variant="outline" color={C.muted} onClick={onClose}>Close</Btn>
      </div>
    </Modal>
  );
}

export default function TradeLog({ trades, presets, onEdit, onDelete, onAddPreset, onDeletePreset, onNewTrade }) {
  const [search,      setSearch]      = useState('');
  const [filters,     setFilters]     = useState({ ...EMPTY_FILTERS });
  const [sortBy,      setSortBy]      = useState('date');
  const [sortDir,     setSortDir]     = useState(-1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewTrade,   setViewTrade]   = useState(null);
  const [reviewMode,  setReviewMode]  = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [presetName,  setPresetName]  = useState('');
  const [savingPreset,setSavingPreset]= useState(false);

  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const filtered = useMemo(() => {
    let t = applyFilters(trades, filters);
    if (search.trim()) {
      const q = search.toLowerCase();
      t = t.filter(tr =>
        (tr.notes||'').toLowerCase().includes(q) ||
        String(tr.id).includes(q) ||
        (tr.date||'').includes(q) ||
        (tr.primaryLossReason||'').toLowerCase().includes(q) ||
        (tr.session||'').toLowerCase().includes(q)
      );
    }
    const fn = sortFns[sortBy] || sortFns.date;
    return [...t].sort((a,b) => fn(a,b) * sortDir);
  }, [trades, filters, search, sortBy, sortDir]);

  const stats   = useMemo(() => computeStats(filtered), [filtered]);
  const gradeA  = useMemo(() => computeStats(filtered.filter(t => t.sweepGrade==='A')), [filtered]);
  const gradeB  = useMemo(() => computeStats(filtered.filter(t => t.sweepGrade==='B')), [filtered]);
  const gradeC  = useMemo(() => computeStats(filtered.filter(t => t.sweepGrade==='C')), [filtered]);

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;
  const isFiltered = activeFilterCount > 0 || search.trim();

  const clearFilters = () => { setFilters({ ...EMPTY_FILTERS }); setSearch(''); };

  const applyPreset = (preset) => {
    clearFilters();
    setFilters(f => ({ ...f, ...preset.filters }));
    setShowFilters(true);
  };

  const savePreset = async () => {
    if (!presetName.trim()) return;
    setSavingPreset(true);
    await onAddPreset({ name: presetName, icon: '⚙️', filters: { ...filters } });
    setPresetName('');
    setSavingPreset(false);
  };

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d * -1);
    else { setSortBy(field); setSortDir(-1); }
  };

  const SortBtn = ({ field, label }) => (
    <button onClick={() => toggleSort(field)} style={{
      background:'none', border:'none', color: sortBy===field ? C.gold : C.textDim,
      cursor:'pointer', fontSize:11, fontWeight:sortBy===field?700:400, padding:'2px 4px',
    }}>
      {label}{sortBy===field ? (sortDir<0?'↓':'↑') : ''}
    </button>
  );

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <SectionHead sub={`${filtered.length} of ${trades.length} trades${isFiltered?' (filtered)':''}`}>
          Trade Log
        </SectionHead>
        <Btn color={C.gold} onClick={onNewTrade}>+ New Trade</Btn>
      </div>

      {/* PRESET BUTTONS */}
      {presets.length > 0 && (
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
          <span style={{ fontSize:11, color:C.textDim, alignSelf:'center' }}>Quick filters:</span>
          {presets.map(p => (
            <div key={p.id} style={{ display:'flex', gap:2 }}>
              <button onClick={() => applyPreset(p)} style={{
                padding:'3px 10px', borderRadius:'4px 0 0 4px', fontSize:11, fontWeight:600,
                background:C.surface2, border:`1px solid ${C.border}`, color:C.text, cursor:'pointer',
              }}>{p.icon} {p.name}</button>
              <button onClick={() => onDeletePreset(p.id)} style={{
                padding:'3px 7px', borderRadius:'0 4px 4px 0', fontSize:11,
                background:C.surface2, border:`1px solid ${C.border}`, borderLeft:'none',
                color:C.textDim, cursor:'pointer',
              }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* SEARCH + FILTER TOGGLE */}
      <div style={{ display:'flex', gap:10, marginBottom:12, flexWrap:'wrap' }}>
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by date, notes, session, loss reason…"
          style={{ flex:1, minWidth:200 }} />
        <Btn variant="outline" color={showFilters ? C.gold : C.blue}
          onClick={() => setShowFilters(f => !f)}>
          🔍 Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </Btn>
        {isFiltered && <Btn variant="ghost" color={C.red} onClick={clearFilters}>✕ Clear</Btn>}
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:8,
          padding:'14px 16px', marginBottom:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'10px 12px' }}>
            <div><div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>SESSION</div>
              <StrSel value={filters.session} onChange={v=>setF('session',v)} opts={SESSIONS} /></div>
            <div><div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>HTF BIAS</div>
              <StrSel value={filters.htfBias} onChange={v=>setF('htfBias',v)} opts={HTF_BIAS} /></div>
            <div><div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>DXY BIAS</div>
              <StrSel value={filters.dxyBias} onChange={v=>setF('dxyBias',v)} opts={DXY_BIAS} /></div>
            <div><div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>ASIA SWEEP</div>
              <StrSel value={filters.asiaSweepType} onChange={v=>setF('asiaSweepType',v)} opts={ASIA_SWEEP} /></div>
            <div><div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>DIRECTION</div>
              <StrSel value={filters.tradeDirection} onChange={v=>setF('tradeDirection',v)} opts={DIRECTION} /></div>
            <div><div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>GRADE</div>
              <StrSel value={filters.sweepGrade} onChange={v=>setF('sweepGrade',v)} opts={GRADES} /></div>
            <div><div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>RESULT</div>
              <StrSel value={filters.result} onChange={v=>setF('result',v)} opts={RESULTS} /></div>
            <div><div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>MOMENTUM</div>
              <StrSel value={filters.momentumQuality} onChange={v=>setF('momentumQuality',v)} opts={['Weak','Medium','Strong']} /></div>
            <div><div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>DISPLACEMENT</div>
              <StrSel value={filters.displacementStrength} onChange={v=>setF('displacementStrength',v)} opts={['Weak','Medium','Strong']} /></div>
            <div><div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>FVG PRESENT</div>
              <BoolSel value={filters.fvgPresent} onChange={v=>setF('fvgPresent',v)} /></div>
            <div><div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>NO-WICK CANDLE</div>
              <BoolSel value={filters.noWickCandle} onChange={v=>setF('noWickCandle',v)} /></div>
            <div><div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>BOS AFTER MSS</div>
              <BoolSel value={filters.bosAfterMss} onChange={v=>setF('bosAfterMss',v)} /></div>
            <div><div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>LIQUIDITY VOID</div>
              <BoolSel value={filters.liquidityVoid} onChange={v=>setF('liquidityVoid',v)} /></div>
            <div><div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>MSS OCCURRED</div>
              <BoolSel value={filters.mssOccurred} onChange={v=>setF('mssOccurred',v)} /></div>
            <div><div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>FALSE MSS</div>
              <BoolSel value={filters.falseMss} onChange={v=>setF('falseMss',v)} /></div>
            <div><div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>LIQ TAKEN</div>
              <BoolSel value={filters.liquidityAlreadyTaken} onChange={v=>setF('liquidityAlreadyTaken',v)} /></div>
            <div><div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>COUNTER-HTF</div>
              <BoolSel value={filters.mssAgainstHtf} onChange={v=>setF('mssAgainstHtf',v)} /></div>
            <div><div style={{ fontSize:10, color:C.textDim, marginBottom:4 }}>TRADE TAKEN</div>
              <StrSel value={filters.tradeTaken||''} onChange={v=>setF('tradeTaken',v)} opts={['Yes','No']} /></div>
          </div>

          {/* SAVE AS PRESET */}
          <div style={{ marginTop:12, display:'flex', gap:8, alignItems:'center' }}>
            <input value={presetName} onChange={e=>setPresetName(e.target.value)}
              placeholder="Save current filter as preset…"
              style={{ padding:'5px 10px', borderRadius:4, background:C.surface, border:`1px solid ${C.border}`,
                color:C.text, fontSize:11, flex:1, fontFamily:'inherit' }} />
            <Btn variant="outline" color={C.green} size="sm" onClick={savePreset} disabled={!presetName.trim()||savingPreset}>
              {savingPreset ? 'Saving…' : 'Save Preset'}
            </Btn>
          </div>
        </div>
      )}

      {/* FILTERED STATS */}
      {(isFiltered && filtered.length > 0) && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:8, marginBottom:10 }}>
          <StatCard label="Filtered Trades" value={stats.total} color={C.blue} />
          <StatCard label="Win Rate" value={stats.winRate+'%'} color={stats.winRate>=50?C.green:C.red} />
          <StatCard label="Profit Factor" value={<PFBadge pf={stats.profitFactor}/>} />
          <StatCard label="Net R" value={(stats.netR>0?'+':'')+stats.netR} color={stats.netR>0?C.green:C.red} />
          <StatCard label="Total Pips" value={(stats.totalPips>0?'+':'')+stats.totalPips} color={stats.totalPips>0?C.green:C.red} />
          <StatCard label="Grade A WR" value={gradeA.total?gradeA.winRate+'%':'—'} color={C.green} />
          <StatCard label="Grade B WR" value={gradeB.total?gradeB.winRate+'%':'—'} color={C.gold} />
          <StatCard label="Grade C WR" value={gradeC.total?gradeC.winRate+'%':'—'} color={C.red} />
        </div>
      )}

      {/* FILTERED ACTIONS */}
      {(isFiltered && filtered.length > 0) && (
        <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center',
          padding:'8px 12px', background:C.surface2, borderRadius:6, border:`1px solid ${C.border}` }}>
          <span style={{ fontSize:11, color:C.textDim, marginRight:4 }}>Filtered actions:</span>
          <Btn variant="outline" color={C.green} size="sm" onClick={() => exportCSV(filtered)}>
            📊 Export Filtered ({filtered.length})
          </Btn>
          <Btn variant="ghost" color={C.muted} size="sm" onClick={() => exportCSV(trades)}>
            Export All ({trades.length})
          </Btn>
          <Btn variant="outline" color={C.blue} size="sm"
            onClick={() => { setReviewIndex(0); setReviewMode(true); }}>
            🔍 Review Mode ({filtered.length} trades)
          </Btn>
        </div>
      )}

      {/* SORT BAR */}
      <div style={{ display:'flex', gap:4, alignItems:'center', marginBottom:8, flexWrap:'wrap' }}>
        <span style={{ fontSize:11, color:C.textDim }}>Sort:</span>
        {[['date','Date'],['result','Result'],['grade','Grade'],['session','Session'],
          ['pips','Pips'],['rr','RR'],['actualR','ActR'],
          ['fvgPresent','FVG'],['noWickCandle','NW'],['bosAfterMss','BOS'],
          ['momentum','Mom'],['displacement','Disp'],
          ['htfBias','HTF'],['dxyBias','DXY'],['tradeTaken','Taken'],
        ].map(([f,l]) => (
          <SortBtn key={f} field={f} label={l} />
        ))}
      </div>

      {/* TRADE TABLE */}
      {filtered.length === 0 ? (
        <Empty icon="📋" message={trades.length ? 'No trades match the current filters.' : 'No trades logged yet. Use Trade Entry to add your first backtest trade.'} />
      ) : (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ background:C.surface2, position:'sticky', top:58 }}>
                {['#','Date','Day','Session','HTF','DXY','Sweep','Dir','Grade','FVG','NW','BOS','Momentum','Disp','R:R','Result','Pips','ActualR','Taken','Actions'].map(h => (
                  <th key={h} style={{ padding:'8px 10px', color:C.textDim, fontWeight:600, textAlign:'left',
                    borderBottom:`2px solid ${C.gold}44`, whiteSpace:'nowrap', fontSize:11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t,i) => (
                <tr key={t.id} style={{ background:i%2===0?C.surface:C.surface2,
                  borderBottom:`1px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background=C.borderHi}
                  onMouseLeave={e => e.currentTarget.style.background=i%2===0?C.surface:C.surface2}>
                  <td style={{ padding:'7px 10px', color:C.textDim }}>{t.id}</td>
                  <td style={{ padding:'7px 10px', color:C.textBr, whiteSpace:'nowrap' }}>{t.date}</td>
                  <td style={{ padding:'7px 10px', color:C.textDim }}>{(t.dayOfWeek||'').slice(0,3)}</td>
                  <td style={{ padding:'7px 10px', color:C.text, whiteSpace:'nowrap' }}>{t.session==='London Only'?'London':'Lon+NY'}</td>
                  <td style={{ padding:'7px 10px' }}>
                    <span style={{ color:t.htfBias==='Bullish'?C.green:t.htfBias==='Bearish'?C.red:C.amber, fontWeight:600 }}>
                      {(t.htfBias||'—').slice(0,4)}
                    </span>
                  </td>
                  <td style={{ padding:'7px 10px', color:C.textDim }}>{(t.dxyBias||'—').slice(0,3)}</td>
                  <td style={{ padding:'7px 10px', color:C.textDim, whiteSpace:'nowrap' }}>{t.asiaSweepType==='Asia High Swept'?'High↑':'Low↓'}</td>
                  <td style={{ padding:'7px 10px' }}>
                    <span style={{ color:t.tradeDirection==='Long'?C.green:C.red, fontWeight:600 }}>
                      {t.tradeDirection||'—'}
                    </span>
                  </td>
                  <td style={{ padding:'7px 10px' }}><GradeBadge grade={t.sweepGrade} /></td>
                  <td style={{ padding:'7px 10px', textAlign:'center' }}>
                    {t.fvgPresent ? <span style={{ color:C.green }}>✓</span> : <span style={{ color:C.border }}>–</span>}
                  </td>
                  <td style={{ padding:'7px 10px', textAlign:'center' }}>
                    {t.noWickCandle ? <span style={{ color:C.green }}>✓</span> : <span style={{ color:C.border }}>–</span>}
                  </td>
                  <td style={{ padding:'7px 10px', textAlign:'center' }}>
                    {t.bosAfterMss ? <span style={{ color:C.green }}>✓</span> : <span style={{ color:C.border }}>–</span>}
                  </td>
                  <td style={{ padding:'7px 10px', color:C.textDim }}>{t.momentumQuality?.slice(0,4)||'—'}</td>
                  <td style={{ padding:'7px 10px', color:C.textDim }}>{t.displacementStrength?.slice(0,4)||'—'}</td>
                  <td style={{ padding:'7px 10px', color:C.gold, fontWeight:600 }}>{t.rr||'—'}</td>
                  <td style={{ padding:'7px 10px' }}><ResultBadge result={t.result||'—'} /></td>
                  <td style={{ padding:'7px 10px', fontWeight:600,
                    color:(parseFloat(t.pipsResult)||0)>0?C.green:C.red }}>
                    {t.pipsResult!=null&&t.pipsResult!==''?((parseFloat(t.pipsResult)>0?'+':'')+parseFloat(t.pipsResult).toFixed(1)):'—'}
                  </td>
                  <td style={{ padding:'7px 10px', fontWeight:600,
                    color:(parseFloat(t.actualR)||0)>0?C.green:C.red }}>
                    {t.actualR!=null&&t.actualR!==''?((parseFloat(t.actualR)>0?'+':'')+parseFloat(t.actualR).toFixed(2)):'—'}
                  </td>
                  <td style={{ padding:'7px 10px', fontSize:11,
                    color:t.tradeTaken==='Yes'?C.green:t.tradeTaken==='No'?C.amber:C.muted }}>
                    {t.tradeTaken||'—'}
                  </td>
                  <td style={{ padding:'7px 10px', whiteSpace:'nowrap' }}>
                    <div style={{ display:'flex', gap:4 }}>
                      <button onClick={() => setViewTrade(t)} style={{ padding:'3px 8px', borderRadius:4,
                        background:C.blueBg, border:`1px solid ${C.blueDim}`, color:C.blue, cursor:'pointer', fontSize:11 }}>View</button>
                      <button onClick={() => onEdit(t)} style={{ padding:'3px 8px', borderRadius:4,
                        background:C.goldBg, border:`1px solid ${C.goldDim}`, color:C.gold, cursor:'pointer', fontSize:11 }}>Edit</button>
                      <button onClick={() => onDelete(t.id)} style={{ padding:'3px 8px', borderRadius:4,
                        background:C.redBg, border:`1px solid ${C.redDim}`, color:C.red, cursor:'pointer', fontSize:11 }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding:'8px 10px', color:C.textDim, fontSize:11 }}>
            Showing {filtered.length} trade{filtered.length!==1?'s':''}
            {filtered.length !== trades.length ? ` of ${trades.length} total` : ''}
          </div>
        </div>
      )}

      {viewTrade && (
        <TradeDetail trade={viewTrade} onClose={() => setViewTrade(null)} onEdit={() => { onEdit(viewTrade); setViewTrade(null); }} />
      )}
      {reviewMode && filtered.length > 0 && (
        <FilteredReviewModal
          trades={filtered}
          index={reviewIndex}
          onIndexChange={setReviewIndex}
          onClose={() => setReviewMode(false)}
          onEdit={(t) => { onEdit(t); setReviewMode(false); }}
        />
      )}
    </div>
  );
}
