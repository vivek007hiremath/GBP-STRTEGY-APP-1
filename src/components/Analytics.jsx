import { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { C, RESULT_COLORS } from '../lib/constants.js';
import { computeStats, computeCumulativeR, computeResultPie, computeDayStats, computeWinRateBars } from '../lib/calculations.js';
import { SectionHead, StatCard, Card, H3, Empty, PFBadge } from './ui.jsx';

const TT_STYLE = { background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, fontSize:11 };

const WinRateBar = ({ data, title, color=C.blue }) => {
  if (!data?.length || data.every(d=>d.count===0)) return null;
  return (
    <Card>
      <H3>{title}</H3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top:0, right:8, left:-20, bottom:20 }}>
          <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fill:C.textDim, fontSize:10 }} angle={-20} textAnchor="end" />
          <YAxis tick={{ fill:C.textDim, fontSize:10 }} domain={[0,100]} />
          <Tooltip contentStyle={TT_STYLE} formatter={(v)=>[v.toFixed(1)+'%','Win Rate']} />
          <Bar dataKey="winRate" fill={color} radius={[3,3,0,0]} maxBarSize={48}>
            {data.map((_, i) => <Cell key={i} fill={color} opacity={0.7+i*0.1>1?1:0.7+i*0.1} />)}
          </Bar>
          <ReferenceLine y={50} stroke={C.gold} strokeDasharray="4 4" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default function Analytics({ trades }) {
  const stats  = useMemo(() => computeStats(trades), [trades]);
  const cumR   = useMemo(() => computeCumulativeR(trades), [trades]);
  const pie    = useMemo(() => computeResultPie(trades), [trades]);
  const days   = useMemo(() => computeDayStats(trades), [trades]);

  const gradeWR  = useMemo(() => computeWinRateBars(trades,'Sweep Grade'), [trades]);
  const sessWR   = useMemo(() => computeWinRateBars(trades,'Session'), [trades]);
  const htfWR    = useMemo(() => computeWinRateBars(trades,'HTF Bias'), [trades]);
  const momWR    = useMemo(() => computeWinRateBars(trades,'Momentum'), [trades]);
  const dispWR   = useMemo(() => computeWinRateBars(trades,'Displacement'), [trades]);
  const fvgWR    = useMemo(() => computeWinRateBars(trades,'FVG Present'), [trades]);
  const nwWR     = useMemo(() => computeWinRateBars(trades,'No-Wick Candle'), [trades]);
  const bosWR    = useMemo(() => computeWinRateBars(trades,'BOS After MSS'), [trades]);
  const liqWR    = useMemo(() => computeWinRateBars(trades,'Liquidity Void'), [trades]);
  const sweepWR  = useMemo(() => computeWinRateBars(trades,'Asia Sweep'), [trades]);
  const dirWR    = useMemo(() => computeWinRateBars(trades,'Trade Direction'), [trades]);
  const dxyWR    = useMemo(() => computeWinRateBars(trades,'DXY Bias'), [trades]);

  // Milestone data
  const milestones = useMemo(() => {
    const sorted = [...trades].sort((a,b)=>new Date(a.date)-new Date(b.date)||a.id-b.id);
    const blocks = [50,100,150,200,300,500];
    return blocks.filter(n=>sorted.length>=n).map(n=>{
      const s = computeStats(sorted.slice(0,n));
      return { trades:n, winRate:s.winRate, pf:s.profitFactor, netR:s.netR };
    });
  }, [trades]);

  if (!trades.length) return (
    <div>
      <SectionHead>Analytics Dashboard</SectionHead>
      <Empty icon="📈" message="No trades yet. Log some trades to see your analytics." />
    </div>
  );

  const pfColor = stats.profitFactor >= 1.4 ? C.green : stats.profitFactor >= 1.0 ? C.amber : C.red;

  return (
    <div>
      <SectionHead sub={`Based on ${trades.length} logged trades`}>Analytics Dashboard</SectionHead>

      {/* SAMPLE SIZE WARNING */}
      {trades.length < 30 && (
        <div style={{ padding:'10px 14px', background:C.redBg, border:`1px solid ${C.redDim}`,
          borderRadius:6, marginBottom:16, fontSize:12, color:C.text, lineHeight:1.5 }}>
          <span style={{ color:C.red, fontWeight:700 }}>⚠️ Weak evidence — </span>
          Only {trades.length} trade{trades.length!==1?'s':''} logged. Fewer than 30 trades is not
          statistically meaningful. Win rates and PF at this stage are noise, not signal.
          Keep backtesting before drawing conclusions.
        </div>
      )}
      {trades.length >= 30 && trades.length < 100 && (
        <div style={{ padding:'10px 14px', background:C.amberBg, border:`1px solid ${C.amberDim}`,
          borderRadius:6, marginBottom:16, fontSize:12, color:C.text, lineHeight:1.5 }}>
          <span style={{ color:C.amber, fontWeight:700 }}>📊 Developing evidence — </span>
          {trades.length} trades. Trends are forming but 100+ trades are needed before drawing
          reliable conclusions. Factor charts may shift significantly as sample grows.
        </div>
      )}
      {trades.length >= 100 && (
        <div style={{ padding:'10px 14px', background:C.greenBg, border:`1px solid ${C.greenDim}`,
          borderRadius:6, marginBottom:16, fontSize:12, color:C.text, lineHeight:1.5 }}>
          <span style={{ color:C.green, fontWeight:700 }}>✓ Stronger evidence — </span>
          {trades.length} trades logged. Edge signals are becoming meaningful.
          {trades.length >= 300 && ' 300+ trades reached — Profit Factor here now meets the demo-entry threshold.'}
        </div>
      )}

      {/* CORE STAT CARDS */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10, marginBottom:24 }}>
        <StatCard label="Total Trades" value={stats.total} color={C.blue} />
        <StatCard label="Win Rate" value={stats.winRate+'%'} color={stats.winRate>=50?C.green:C.red} sub={`${stats.wins}W / ${stats.losses}L / ${stats.be}BE`} />
        <StatCard label="Profit Factor" value={<PFBadge pf={stats.profitFactor}/>} sub={stats.profitFactor>=1.4?'✓ Edge exists':stats.profitFactor>=1.0?'Marginal':'No edge yet'} />
        <StatCard label="Net R" value={(stats.netR>0?'+':'')+stats.netR} color={stats.netR>0?C.green:C.red} />
        <StatCard label="Total Pips" value={(stats.totalPips>0?'+':'')+stats.totalPips} color={stats.totalPips>0?C.green:C.red} />
        <StatCard label="Avg R / Trade" value={(stats.avgR>0?'+':'')+stats.avgR} color={stats.avgR>0?C.green:C.red} />
        <StatCard label="Avg Win (pips)" value={'+'+stats.avgWinPips} color={C.green} />
        <StatCard label="Avg Loss (pips)" value={'-'+stats.avgLossPips} color={C.red} />
      </div>

      {/* CUMULATIVE R CURVE */}
      <Card style={{ marginBottom:16 }}>
        <H3>Cumulative R Curve — Trade-by-Trade</H3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={cumR} margin={{ top:0, right:12, left:-20, bottom:0 }}>
            <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
            <XAxis dataKey="n" tick={{ fill:C.textDim, fontSize:10 }} label={{ value:'Trade #', position:'insideBottom', fill:C.textDim, fontSize:10, dy:10 }} />
            <YAxis tick={{ fill:C.textDim, fontSize:10 }} />
            <Tooltip contentStyle={TT_STYLE} formatter={(v)=>[v.toFixed(2)+'R','Cumulative R']} labelFormatter={v=>`Trade #${v}`} />
            <ReferenceLine y={0} stroke={C.muted} />
            <Line type="monotone" dataKey="cumR" stroke={C.gold} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        {/* PIE CHART */}
        <Card>
          <H3>Result Distribution</H3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pie} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({name,value})=>`${name} (${value})`} labelLine={false}>
                {pie.map((d,i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={TT_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            {pie.map(d => (
              <div key={d.name} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:d.color }} />
                <span style={{ color:C.textDim }}>{d.name}: <b style={{ color:d.color }}>{d.value}</b></span>
              </div>
            ))}
          </div>
        </Card>

        {/* DAY OF WEEK */}
        <Card>
          <H3>Win Rate by Day of Week</H3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={days} margin={{ top:0, right:8, left:-20, bottom:0 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fill:C.textDim, fontSize:11 }} />
              <YAxis tick={{ fill:C.textDim, fontSize:10 }} domain={[0,100]} />
              <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[n==='count'?v:v.toFixed(1)+'%',n==='count'?'Trades':'Win Rate']} />
              <Bar dataKey="winRate" fill={C.purple} radius={[3,3,0,0]} maxBarSize={36} />
              <Bar dataKey="count" fill={C.blue} radius={[3,3,0,0]} maxBarSize={24} opacity={0.4} />
              <ReferenceLine y={50} stroke={C.gold} strokeDasharray="4 4" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* WIN RATE BY FACTOR GRID */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:16 }}>
        <WinRateBar data={gradeWR}  title="Win Rate by Sweep Grade"  color={C.amber} />
        <WinRateBar data={sessWR}   title="Win Rate by Session"      color={C.blue} />
        <WinRateBar data={htfWR}    title="Win Rate by HTF Bias"     color={C.purple} />
        <WinRateBar data={fvgWR}    title="FVG Present vs Absent"    color={C.green} />
        <WinRateBar data={nwWR}     title="No-Wick vs Wick Candle"   color={C.gold} />
        <WinRateBar data={bosWR}    title="BOS After MSS vs No BOS"  color={C.green} />
        <WinRateBar data={momWR}    title="Momentum Quality"         color={C.blue} />
        <WinRateBar data={dispWR}   title="Displacement Strength"    color={C.amber} />
        <WinRateBar data={liqWR}    title="Liquidity Void"           color={C.purple} />
        <WinRateBar data={sweepWR}  title="Asia Sweep Direction"     color={C.gold} />
        <WinRateBar data={dirWR}    title="Trade Direction"          color={C.green} />
        <WinRateBar data={dxyWR}    title="DXY Bias at Entry"        color={C.red} />
      </div>

      {/* MILESTONE TRACKER */}
      {milestones.length > 0 && (
        <Card>
          <H3>Milestone Tracker — Statistical Progress</H3>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ background:C.surface2 }}>
                  {['Trades','Win Rate','Profit Factor','Net R','Status'].map(h=>(
                    <th key={h} style={{ padding:'8px 12px', color:C.textDim, fontWeight:600,
                      textAlign:'left', borderBottom:`2px solid ${C.gold}44` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {milestones.map((m,i)=>(
                  <tr key={i} style={{ background:i%2===0?C.surface:C.surface2, borderBottom:`1px solid ${C.border}` }}>
                    <td style={{ padding:'8px 12px', color:C.textBr, fontWeight:700 }}>{m.trades}</td>
                    <td style={{ padding:'8px 12px', color:m.winRate>=50?C.green:C.red, fontWeight:600 }}>{m.winRate}%</td>
                    <td style={{ padding:'8px 12px' }}><PFBadge pf={m.pf} /></td>
                    <td style={{ padding:'8px 12px', color:m.netR>0?C.green:C.red, fontWeight:600 }}>{m.netR>0?'+':''}{m.netR}</td>
                    <td style={{ padding:'8px 12px' }}>
                      {m.trades < 300 ? <span style={{ color:C.textDim }}>Checkpoint (need 300 for demo)</span>
                        : m.pf >= 1.4 ? <span style={{ color:C.green, fontWeight:700 }}>✓ Edge confirmed → proceed to demo</span>
                        : m.pf >= 1.2 ? <span style={{ color:C.amber }}>Review — extend to {m.trades+100} trades</span>
                        : <span style={{ color:C.red }}>PF too low — review strategy rules</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
