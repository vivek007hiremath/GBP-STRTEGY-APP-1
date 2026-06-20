import { useState } from 'react';
import { C } from '../lib/constants.js';
import { SectionHead, Card, H3, Btn, Input, Textarea } from './ui.jsx';

export default function HypothesisParkingLot({ hypotheses, onUpdate, onAdd, onDelete }) {
  const [newIdea, setNewIdea] = useState('');
  const [adding,  setAdding]  = useState(false);

  const bump = async (hyp) => {
    const newCount = hyp.count + 1;
    const status   = newCount >= 5 ? 'Ready to Test (100-trade isolated backtest)' : 'Parking';
    await onUpdate({ ...hyp, count: newCount, status });
  };

  const reset = async (hyp) => {
    await onUpdate({ ...hyp, count: 0, status: 'Parking' });
  };

  const handleAdd = async () => {
    if (!newIdea.trim()) return;
    setAdding(true);
    await onAdd({ idea: newIdea.trim(), count: 0, status: 'Parking' });
    setNewIdea('');
    setAdding(false);
  };

  const ready     = hypotheses.filter(h => h.count >= 5);
  const inParking = hypotheses.filter(h => h.count < 5);

  return (
    <div>
      <SectionHead sub="Do not implement any idea until it has 5+ observed occurrences. Then run a 100-trade isolated test before integrating.">
        Hypothesis Parking Lot
      </SectionHead>

      {/* RULE BOX */}
      <div style={{ padding:'12px 16px', background:C.amberBg, borderLeft:`3px solid ${C.amber}`,
        borderRadius:'0 6px 6px 0', fontSize:12, color:C.text, marginBottom:20, lineHeight:1.6 }}>
        <b style={{ color:C.amber }}>The Rule: </b>
        Add any idea you notice during backtesting. Click "+ Seen it" each time you observe that pattern.
        When an idea reaches <b style={{ color:C.gold }}>5 observations</b>, it earns an isolated 100-trade parallel test.
        Do NOT modify your live strategy ruleset until the test is complete and shows PF improvement ≥ 0.2.
      </div>

      {/* READY TO TEST */}
      {ready.length > 0 && (
        <>
          <H3 color={C.green}>Ready to Test ({ready.length})</H3>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
            {ready.map(hyp => (
              <Card key={hyp.id} style={{ borderLeft:`4px solid ${C.green}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.textBr, marginBottom:6 }}>{hyp.idea}</div>
                    <div style={{ fontSize:11, color:C.green, fontWeight:700 }}>
                      ✓ Observed {hyp.count} times → Ready for 100-trade isolated backtest
                    </div>
                    <div style={{ fontSize:11, color:C.textDim, marginTop:6, lineHeight:1.5 }}>
                      Next step: Run 100 trades using EXISTING ruleset. Track this factor separately (Y/N per trade).
                      Compare: trades where this was present vs absent. If PF improves ≥ 0.2 → take to Modification Control framework.
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'center' }}>
                    <div style={{ fontSize:22, fontWeight:800, color:C.green }}>{hyp.count}/5</div>
                    <Btn size="sm" variant="ghost" color={C.muted} onClick={() => reset(hyp)}>Reset</Btn>
                    <Btn size="sm" variant="outline" color={C.red} onClick={() => { if(window.confirm('Delete this hypothesis?')) onDelete(hyp.id); }}>×</Btn>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ height:4, background:C.border, borderRadius:2, marginTop:10 }}>
                  <div style={{ width:'100%', height:'100%', background:C.green, borderRadius:2 }} />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* IN PARKING */}
      <H3 color={C.gold}>In Parking ({inParking.length})</H3>
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
        {inParking.length === 0 && (
          <div style={{ color:C.textDim, fontSize:12, padding:'16px', textAlign:'center' }}>
            No ideas in parking yet. Add new hypotheses below as you observe patterns during backtesting.
          </div>
        )}
        {inParking.map(hyp => {
          const pct  = (hyp.count / 5) * 100;
          const color = hyp.count >= 3 ? C.amber : C.muted;
          return (
            <Card key={hyp.id} style={{ borderLeft:`4px solid ${color}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.textBr, marginBottom:4 }}>{hyp.idea}</div>
                  <div style={{ fontSize:11, color:C.textDim }}>
                    {hyp.count === 0
                      ? 'Not yet observed — click "+ Seen it" when you notice this pattern in a backtest trade'
                      : `Observed ${hyp.count} time${hyp.count!==1?'s':''} — need ${5-hyp.count} more to unlock isolated test`}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'center', flexShrink:0 }}>
                  <div style={{ fontSize:18, fontWeight:800, color }}>{hyp.count}/5</div>
                  <Btn size="sm" color={C.gold} onClick={() => bump(hyp)}>+ Seen it</Btn>
                  <Btn size="sm" variant="ghost" color={C.red} onClick={() => { if(window.confirm('Delete this hypothesis?')) onDelete(hyp.id); }}>×</Btn>
                </div>
              </div>
              <div style={{ height:4, background:C.border, borderRadius:2, marginTop:10 }}>
                <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:2, transition:'width 0.3s' }} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* ADD NEW */}
      <Card style={{ borderTop:`3px solid ${C.blue}`, paddingTop:16 }}>
        <H3 color={C.blue}>Add New Hypothesis</H3>
        <p style={{ fontSize:11, color:C.textDim, marginBottom:10 }}>
          Write ideas in a testable format: "When [condition] is present, [metric] improves/worsens."
        </p>
        <Textarea value={newIdea} onChange={e => setNewIdea(e.target.value)}
          placeholder={`Example: "When HTF shows 3 consecutive bullish 1H candles before Asia close, London sweep of Asia Low is more likely to produce a clean entry."`}
          rows={3} />
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:10 }}>
          <Btn color={C.blue} onClick={handleAdd} disabled={!newIdea.trim() || adding}>
            {adding ? 'Adding…' : '+ Add to Parking Lot'}
          </Btn>
        </div>
      </Card>

      {/* HOW TO TEST */}
      <Card style={{ marginTop:16, background:C.surface2 }}>
        <H3 color={C.gold}>How to Test When an Idea Reaches 5</H3>
        {[
          'Run 100 trades using the SAME current ruleset — no modifications.',
          'For each trade, additionally record Y/N whether this hypothesis condition was present.',
          'After 100 trades, calculate separately: Win Rate and PF where the condition WAS present vs WAS NOT present.',
          'If presence improves PF by ≥ 0.2 AND Win Rate by ≥ 5% → take to the Modification Control framework for formal evaluation.',
          'If improvement is smaller or random → keep in parking lot and observe 50 more trades.',
          'Never run more than 1 hypothesis test at a time — parallel testing contaminates results.',
        ].map((s,i) => (
          <div key={i} style={{ display:'flex', gap:10, padding:'6px 0', borderBottom:`1px solid ${C.border}` }}>
            <span style={{ color:C.gold, fontWeight:800, minWidth:20, fontSize:12 }}>{i+1}.</span>
            <span style={{ fontSize:12, color:C.text, lineHeight:1.5 }}>{s}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
