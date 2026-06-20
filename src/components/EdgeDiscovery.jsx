import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { C } from '../lib/constants.js';
import { computeEdgeDiscovery } from '../lib/calculations.js';
import { SectionHead, Card, H3, PFBadge, Empty } from './ui.jsx';

const TT = { background:C.surface, border:`1px solid ${C.border}`, borderRadius:6, fontSize:11 };

const COLORS_BY_IDX = [C.green, C.red, C.blue, C.amber, C.purple, C.gold];

function EdgeTable({ factor, rows }) {
  const [expanded, setExpanded] = useState(false);
  const best = rows.reduce((b,r) => r.count>0&&r.winRate>b.winRate?r:b, {winRate:0, label:''});

  return (
    <Card style={{ marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}
        onClick={() => setExpanded(e => !e)}>
        <div>
          <span style={{ fontSize:13, fontWeight:700, color:C.textBr }}>{factor}</span>
          {best.label && best.count > 0 && (
            <span style={{ fontSize:11, color:C.green, marginLeft:10 }}>
              Best: {best.label} ({best.winRate}% WR)
            </span>
          )}
        </div>
        <span style={{ color:C.textDim, fontSize:14 }}>{expanded?'▲':'▼'}</span>
      </div>

      {/* INLINE BAR CHART (always visible) */}
      {rows.some(r => r.count > 0) && (
        <div style={{ marginTop:10 }}>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={rows.filter(r=>r.count>0)} layout="vertical" margin={{ left:0, right:40, top:0, bottom:0 }}>
              <XAxis type="number" domain={[0,100]} tick={{ fill:C.textDim, fontSize:9 }} />
              <YAxis type="category" dataKey="label" tick={{ fill:C.textDim, fontSize:10 }} width={80} />
              <Tooltip contentStyle={TT} formatter={(v)=>[v.toFixed(1)+'%','Win Rate']} />
              <ReferenceLine x={50} stroke={C.gold} strokeDasharray="3 3" />
              <Bar dataKey="winRate" radius={[0,3,3,0]} maxBarSize={20}>
                {rows.filter(r=>r.count>0).map((r,i) => (
                  <Cell key={i} fill={r.winRate>=55?C.green:r.winRate>=45?C.amber:C.red} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* DETAILED TABLE (expanded) */}
      {expanded && (
        <div style={{ overflowX:'auto', marginTop:10 }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
            <thead>
              <tr style={{ background:C.surface2 }}>
                {['Condition','Trades','Win Rate','Profit Factor','Avg R','Total Pips'].map(h=>(
                  <th key={h} style={{ padding:'6px 10px', color:C.textDim, fontWeight:600,
                    textAlign:'left', borderBottom:`1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r,i) => (
                <tr key={i} style={{ background:i%2===0?C.surface:C.surface2, borderBottom:`1px solid ${C.border}` }}>
                  <td style={{ padding:'7px 10px', color:C.textBr, fontWeight:600 }}>{r.label}</td>
                  <td style={{ padding:'7px 10px', color:C.textDim }}>
                    {r.count}
                    <span style={{ color:C.textDim, fontSize:10, marginLeft:4 }}>trades</span>
                    {r.count > 0 && r.count < 10  && <span style={{ color:C.red,   fontSize:10, marginLeft:5, fontWeight:700 }}>⚠️ too few</span>}
                    {r.count >= 10 && r.count < 20 && <span style={{ color:C.amber, fontSize:10, marginLeft:5 }}>~ low</span>}
                  </td>
                  <td style={{ padding:'7px 10px', fontWeight:700,
                    color:r.count===0?C.border:r.winRate>=55?C.green:r.winRate>=45?C.amber:C.red }}>
                    {r.count===0?'—':r.winRate.toFixed(1)+'%'}
                  </td>
                  <td style={{ padding:'7px 10px' }}>
                    {r.count===0?<span style={{ color:C.border }}>—</span>:<PFBadge pf={r.pf}/>}
                  </td>
                  <td style={{ padding:'7px 10px', fontWeight:600,
                    color:r.count===0?C.border:r.avgR>0?C.green:C.red }}>
                    {r.count===0?'—':(r.avgR>0?'+':'')+r.avgR.toFixed(2)}
                  </td>
                  <td style={{ padding:'7px 10px', fontWeight:600,
                    color:r.count===0?C.border:r.totalPips>0?C.green:C.red }}>
                    {r.count===0?'—':(r.totalPips>0?'+':'')+r.totalPips.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default function EdgeDiscovery({ trades }) {
  const edge = useMemo(() => computeEdgeDiscovery(trades), [trades]);

  // Summary: factors sorted by biggest gap between best and worst group
  const ranked = useMemo(() => {
    return edge.map(e => {
      const withData = e.rows.filter(r => r.count >= 3);
      if (withData.length < 2) return { ...e, gap:0 };
      const maxWR = Math.max(...withData.map(r=>r.winRate));
      const minWR = Math.min(...withData.map(r=>r.winRate));
      return { ...e, gap: maxWR - minWR, best: withData.find(r=>r.winRate===maxWR) };
    }).sort((a,b) => b.gap - a.gap);
  }, [edge]);

  if (!trades.length) return (
    <div>
      <SectionHead>Edge Discovery</SectionHead>
      <Empty icon="🔬" message="No trades yet. Log trades to discover which conditions genuinely improve your edge." />
    </div>
  );

  return (
    <div>
      <SectionHead sub="Compare every strategy condition against actual win rate, profit factor, and average R. Discover what actually matters.">
        Edge Discovery
      </SectionHead>

      {/* SAMPLE SIZE WARNING */}
      {trades.length < 30 && (
        <div style={{ padding:'10px 14px', background:C.redBg, border:`1px solid ${C.redDim}`,
          borderRadius:6, marginBottom:14, fontSize:12, color:C.text, lineHeight:1.5 }}>
          <span style={{ color:C.red, fontWeight:700 }}>⚠️ Weak evidence — </span>
          {trades.length} trades. Edge factor comparisons need 30+ trades per condition group
          to have any meaning. The rankings below are effectively random at this stage.
        </div>
      )}
      {trades.length >= 30 && trades.length < 100 && (
        <div style={{ padding:'10px 14px', background:C.amberBg, border:`1px solid ${C.amberDim}`,
          borderRadius:6, marginBottom:14, fontSize:12, color:C.text, lineHeight:1.5 }}>
          <span style={{ color:C.amber, fontWeight:700 }}>📊 Developing evidence — </span>
          {trades.length} trades. Some factors may show signal but many rows still have fewer than
          10 trades — marked with ⚠️. Wait for 100+ trades before acting on these rankings.
        </div>
      )}
      {trades.length >= 100 && (
        <div style={{ padding:'10px 14px', background:C.greenBg, border:`1px solid ${C.greenDim}`,
          borderRadius:6, marginBottom:14, fontSize:12, color:C.text, lineHeight:1.5 }}>
          <span style={{ color:C.green, fontWeight:700 }}>✓ Stronger evidence — </span>
          {trades.length} trades. Factor comparisons with 10+ trades per group are statistically
          meaningful.{trades.length >= 300 ? ' 300+ trades: use this page to make demo entry decisions.' : ' Keep building toward 300 for full validation.'}
        </div>
      )}

      {/* HOW TO USE */}
      <div style={{ padding:'12px 16px', background:C.blueBg, borderLeft:`3px solid ${C.blue}`,
        borderRadius:'0 6px 6px 0', marginBottom:20, fontSize:12, color:C.text, lineHeight:1.6 }}>
        <b style={{ color:C.blue }}>How to use: </b>
        Any factor where Win Rate ≥ 55% AND Profit Factor ≥ 1.4 for one group vs significantly lower for the other group = a genuine edge factor.
        Factors are ranked by the biggest performance gap between their groups. Requires ≥ 3 trades per group for meaningful data.
        When a factor reaches 5+ observations in your losses → move it to the Hypothesis Parking Lot.
      </div>

      {/* TOP FACTORS SUMMARY */}
      <Card style={{ marginBottom:20 }}>
        <H3 color={C.gold}>Top Edge Factors Ranked by Performance Gap</H3>
        <p style={{ fontSize:11, color:C.textDim, marginBottom:12 }}>
          Factors ranked by the win rate gap between their best and worst groups (minimum 3 trades per group).
        </p>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
            <thead>
              <tr style={{ background:C.surface2 }}>
                {['Rank','Factor','Best Condition','Best Win Rate','Gap vs Worst','Action'].map(h=>(
                  <th key={h} style={{ padding:'7px 10px', color:C.textDim, fontWeight:600,
                    textAlign:'left', borderBottom:`2px solid ${C.gold}44` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranked.filter(r=>r.gap>0).slice(0,8).map((r,i)=>(
                <tr key={r.factor} style={{ background:i%2===0?C.surface:C.surface2,
                  borderBottom:`1px solid ${C.border}` }}>
                  <td style={{ padding:'7px 10px', color:C.gold, fontWeight:700 }}>#{i+1}</td>
                  <td style={{ padding:'7px 10px', color:C.textBr, fontWeight:600 }}>{r.factor}</td>
                  <td style={{ padding:'7px 10px', color:C.green }}>{r.best?.label||'—'}</td>
                  <td style={{ padding:'7px 10px', fontWeight:700,
                    color:r.best?.winRate>=55?C.green:r.best?.winRate>=45?C.amber:C.red }}>
                    {r.best?.winRate!=null?r.best.winRate.toFixed(1)+'%':'—'}
                  </td>
                  <td style={{ padding:'7px 10px', fontWeight:700, color:r.gap>=15?C.green:r.gap>=8?C.amber:C.textDim }}>
                    {r.gap.toFixed(1)}%
                  </td>
                  <td style={{ padding:'7px 10px', fontSize:10, color:C.textDim }}>
                    {(!r.best || r.best.count < 10) ? '⚠️ Too few trades — gather more data'
                     : r.gap>=15 ? '✓ Strong signal — filter by this condition'
                     : r.gap>=8  ? 'Moderate signal — gather more data'
                     : 'Weak signal — may be random at this sample size'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ALL FACTORS (expandable) */}
      <H3 color={C.gold}>All Factors — Click to Expand Details</H3>
      {ranked.map(e => (
        <EdgeTable key={e.factor} factor={e.factor} rows={e.rows} />
      ))}

      {/* COMBINATION ANALYSIS */}
      {trades.length >= 20 && (
        <Card style={{ marginTop:16 }}>
          <H3 color={C.purple}>Combination Analysis — Best Multi-Factor Setups</H3>
          <p style={{ fontSize:11, color:C.textDim, marginBottom:12 }}>
            Win rate when multiple confluence conditions are present simultaneously.
          </p>
          {[
            { label:'Grade A + FVG + No-Wick', fn:t=>t.sweepGrade==='A'&&t.fvgPresent&&t.noWickCandle },
            { label:'Grade A + BOS + Strong Momentum', fn:t=>t.sweepGrade==='A'&&t.bosAfterMss&&t.momentumQuality==='Strong' },
            { label:'FVG + No-Wick + BOS', fn:t=>t.fvgPresent&&t.noWickCandle&&t.bosAfterMss },
            { label:'FVG + Strong Displacement', fn:t=>t.fvgPresent&&t.displacementStrength==='Strong' },
            { label:'Grade A + FVG + BOS + No-Wick (All 4)', fn:t=>t.sweepGrade==='A'&&t.fvgPresent&&t.bosAfterMss&&t.noWickCandle },
            { label:'No false signals (all 3 = No)', fn:t=>!t.falseMss&&!t.liquidityAlreadyTaken&&!t.mssAgainstHtf },
            { label:'HTF Aligned + No false signals', fn:t=>!t.mssAgainstHtf&&!t.falseMss&&!t.liquidityAlreadyTaken },
          ].map(combo => {
            const filtered = trades.filter(combo.fn);
            const wins = filtered.filter(t=>t.result==='Win').length;
            const wr = filtered.length ? (wins/filtered.length*100) : 0;
            const winPips = filtered.filter(t=>t.result==='Win').reduce((s,t)=>s+(parseFloat(t.pipsResult)||0),0);
            const lossPips = Math.abs(filtered.filter(t=>t.result==='Loss').reduce((s,t)=>s+(parseFloat(t.pipsResult)||0),0));
            const pf = lossPips > 0 ? winPips/lossPips : wins>0?99.9:0;
            return (
              <div key={combo.label} style={{ display:'flex', gap:10, padding:'8px 0',
                borderBottom:`1px solid ${C.border}`, alignItems:'center', flexWrap:'wrap' }}>
                <span style={{ fontSize:12, color:C.textBr, minWidth:280 }}>{combo.label}</span>
                <span style={{ fontSize:11, color:C.textDim }}>{filtered.length} trades</span>
                <span style={{ fontSize:12, fontWeight:700, minWidth:60,
                  color:wr>=60?C.green:wr>=50?C.amber:C.red }}>{filtered.length?wr.toFixed(1)+'%':'—'}</span>
                <span style={{ fontSize:11 }}><PFBadge pf={filtered.length?pf:null}/></span>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
