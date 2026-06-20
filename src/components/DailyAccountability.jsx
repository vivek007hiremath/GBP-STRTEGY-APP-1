import { useState, useEffect, useCallback } from 'react';
import { C } from '../lib/constants.js';
import { computeStats } from '../lib/calculations.js';
import { saveDailyReport, getDailyReport } from '../lib/db.js';
import { SectionHead, Card, Btn } from './ui.jsx';

const today = () => new Date().toISOString().split('T')[0];

const EMPTY = {
  date: today(),
  // Strategy Development
  studyCompleted: false, sessionStudied: '', mssIdentified: false,
  bosIdentified: false, asiaLevelMarked: false, htfConfirmed: false, dxyLogged: false,
  sessionObservation: '',
  // Backtesting
  tradesBacktestedToday: '', winRateCurrent: '', pfCurrent: '',
  mostCommonLossReason: '', allTradesLogged: false, screenshotsSaved: false,
  falseSetupPatternFound: '',
  // Discipline Account
  disciplineMonitored: false, tradeTakenToday: '',
  sessionWindowCorrect: false, dxyChecked: false, falseSetupPassed: false,
  slNeverMoved: false, correctSize: false, onlyOneTrade: false,
  // Frozen Accounts
  frozenZeroOpens: false, frozenZeroTrades: false, inactivityWarning: '',
  // Psychology
  feltFomo: false, fomoTrigger: '', wantedToMoveSL: false,
  urgeExtraMarket: false, urgeModifyStrategy: false,
  emotionMorning: '', emotionEvening: '',
  // Review
  whatStoppedMe: '', whatDistractedMe: '', newPatternForParking: '',
  tomorrowPriority: '', timeSpentToday: '',
  // Sign-off
  allSectionsComplete: false, notionUpdated: false, sheetsUpdated: false, alarmSet: false,
};

const CheckRow = ({ label, sub, checked, onChange, color }) => (
  <div style={{ padding:'7px 0', borderBottom:`1px solid ${C.border}` }}>
    <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
      <div onClick={() => onChange(!checked)} style={{
        width:18, height:18, borderRadius:3, border:`2px solid ${color||C.gold}`,
        flexShrink:0, marginTop:1, cursor:'pointer',
        background: checked ? (color||C.gold)+'33' : 'transparent',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        {checked && <span style={{ color:color||C.gold, fontSize:11, fontWeight:800 }}>✓</span>}
      </div>
      <div>
        <div style={{ fontSize:12, color:C.textBr, fontWeight:600, lineHeight:1.4 }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:C.textDim, marginTop:2 }}>{sub}</div>}
      </div>
    </div>
  </div>
);

const Section = ({ title, color, children, badge }) => (
  <Card style={{ borderLeft:`3px solid ${color}`, marginBottom:12 }}>
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
      <div style={{ fontSize:12, fontWeight:700, color, margin:'0', textTransform:'uppercase', letterSpacing:'0.8px' }}>{title}</div>
      {badge && <span style={{ fontSize:10, color:C.textDim }}>{badge}</span>}
    </div>
    {children}
  </Card>
);

const TextField = ({ label, value, onChange, placeholder, rows=1 }) => (
  <div style={{ padding:'7px 0', borderBottom:`1px solid ${C.border}` }}>
    <div style={{ fontSize:11, color:C.textDim, fontWeight:600, textTransform:'uppercase',
      letterSpacing:'0.6px', marginBottom:4 }}>{label}</div>
    {rows > 1 ? (
      <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        rows={rows} style={{ width:'100%', padding:'6px 8px', borderRadius:4,
          border:`1px solid ${C.border}`, background:C.surface, color:C.text,
          fontSize:12, fontFamily:'inherit', resize:'vertical', lineHeight:1.5 }} />
    ) : (
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%', padding:'6px 8px', borderRadius:4, border:`1px solid ${C.border}`,
          background:C.surface, color:C.text, fontSize:12, fontFamily:'inherit' }} />
    )}
  </div>
);

export default function DailyAccountability({ trades }) {
  const [form,    setForm]    = useState({ ...EMPTY });
  const [saved,   setSaved]   = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };

  const todayStats = (() => {
    const todayTrades = trades.filter(t => t.date === form.date);
    return { ...computeStats(todayTrades), count: todayTrades.length };
  })();

  const cumulativeStats = computeStats(trades);

  const loadReport = useCallback(async (date) => {
    setLoading(true);
    const report = await getDailyReport(date);
    if (report) setForm({ ...EMPTY, ...report });
    else setForm({ ...EMPTY, date });
    setSaved(false);
    setLoading(false);
  }, []);

  useEffect(() => { loadReport(today()); }, [loadReport]);

  const handleSave = async () => {
    setSaving(true);
    await saveDailyReport({ ...form });
    setSaved(true);
    setSaving(false);
  };

  const cs = (k, color) => (
    <CheckRow label={k} checked={!!form[k]} onChange={v => set(k, v)} color={color} />
  );

  const completionCount = [
    form.studyCompleted, form.allTradesLogged, form.disciplineMonitored,
    form.frozenZeroOpens, form.allSectionsComplete, form.notionUpdated,
    form.sheetsUpdated, form.alarmSet
  ].filter(Boolean).length;

  return (
    <div style={{ maxWidth:960, margin:'0 auto' }}>
      <SectionHead sub="Complete this every day — even on no-trade days. A skipped report breaks the data chain.">
        Daily Accountability Report
      </SectionHead>

      {/* DATE + STATS HEADER */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr', gap:8, marginBottom:20 }}>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 14px' }}>
          <div style={{ fontSize:10, color:C.textDim, textTransform:'uppercase', marginBottom:4 }}>Report Date</div>
          <input type="date" value={form.date} onChange={e => { set('date', e.target.value); loadReport(e.target.value); }}
            style={{ background:'none', border:'none', color:C.gold, fontSize:16, fontWeight:800,
              cursor:'pointer', fontFamily:'inherit', width:'100%' }} />
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 14px' }}>
          <div style={{ fontSize:10, color:C.textDim, textTransform:'uppercase', marginBottom:2 }}>Total Trades</div>
          <div style={{ fontSize:22, fontWeight:800, color:C.blue }}>{trades.length}</div>
          <div style={{ fontSize:10, color:C.textDim }}>all-time</div>
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 14px' }}>
          <div style={{ fontSize:10, color:C.textDim, textTransform:'uppercase', marginBottom:2 }}>Cumulative WR</div>
          <div style={{ fontSize:22, fontWeight:800, color:cumulativeStats.winRate>=50?C.green:C.red }}>
            {trades.length ? cumulativeStats.winRate+'%' : '—'}
          </div>
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 14px' }}>
          <div style={{ fontSize:10, color:C.textDim, textTransform:'uppercase', marginBottom:2 }}>Profit Factor</div>
          <div style={{ fontSize:22, fontWeight:800, color:cumulativeStats.profitFactor>=1.4?C.green:cumulativeStats.profitFactor>=1.0?C.amber:C.red }}>
            {trades.length ? cumulativeStats.profitFactor : '—'}
          </div>
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 14px' }}>
          <div style={{ fontSize:10, color:C.textDim, textTransform:'uppercase', marginBottom:2 }}>Completion</div>
          <div style={{ fontSize:22, fontWeight:800, color:completionCount>=6?C.green:C.amber }}>{completionCount}/8</div>
          <div style={{ fontSize:10, color:C.textDim }}>checklist items</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:40, color:C.textDim }}>Loading report…</div>
      ) : (
        <>
          {/* SECTION 1: STRATEGY DEVELOPMENT */}
          <Section title="1. Strategy Development — GBPUSD Study" color={C.blue}>
            <CheckRow label="Completed today's GBPUSD review session"
              sub="Minimum 45 min of focused chart study." checked={form.studyCompleted} onChange={v=>set('studyCompleted',v)} color={C.blue} />
            <CheckRow label="Identified MSS / CHOCH on 15M with screenshot"
              checked={form.mssIdentified} onChange={v=>set('mssIdentified',v)} color={C.blue} />
            <CheckRow label="Identified BOS after MSS and logged in Column S"
              checked={form.bosIdentified} onChange={v=>set('bosIdentified',v)} color={C.blue} />
            <CheckRow label="Asia High and Low marked before reviewing London"
              checked={form.asiaLevelMarked} onChange={v=>set('asiaLevelMarked',v)} color={C.blue} />
            <CheckRow label="HTF (1H) bias confirmed before reviewing each setup"
              checked={form.htfConfirmed} onChange={v=>set('htfConfirmed',v)} color={C.blue} />
            <CheckRow label="DXY checked and logged in journal for each trade"
              checked={form.dxyLogged} onChange={v=>set('dxyLogged',v)} color={C.blue} />
            <TextField label="Session observation (1 sentence)"
              value={form.sessionObservation} onChange={v=>set('sessionObservation',v)}
              placeholder="e.g. Asia Low sweeps between 07:15–08:00 GMT produced the cleanest MSS today." />
          </Section>

          {/* SECTION 2: BACKTESTING */}
          <Section title="2. Backtesting Progress" color={C.purple}>
            <TextField label="Trades backtested today (number)" value={form.tradesBacktestedToday}
              onChange={v=>set('tradesBacktestedToday',v)} placeholder="e.g. 12" />
            <CheckRow label="All trades logged in Trade Entry tab AND data complete"
              sub="Every field filled. No partial entries." checked={form.allTradesLogged} onChange={v=>set('allTradesLogged',v)} color={C.purple} />
            <CheckRow label="Screenshots saved for all reviewed setups"
              checked={form.screenshotsSaved} onChange={v=>set('screenshotsSaved',v)} color={C.purple} />
            <TextField label="Current Win Rate %" value={form.winRateCurrent}
              onChange={v=>set('winRateCurrent',v)} placeholder="From Edge Discovery tab — recalculate after session" />
            <TextField label="Current Profit Factor" value={form.pfCurrent}
              onChange={v=>set('pfCurrent',v)} placeholder="PF ≥ 1.4 = edge. PF < 1.2 = investigate." />
            <TextField label="Most common loss reason found today" value={form.mostCommonLossReason}
              onChange={v=>set('mostCommonLossReason',v)} placeholder="One word or phrase from Primary Loss Reason column" />
            <TextField label="False setup pattern found today (for Parking Lot)"
              value={form.falseSetupPatternFound} onChange={v=>set('falseSetupPatternFound',v)}
              placeholder="If 5+ losses share same signal → add to Hypothesis Parking Lot. Otherwise note here." />
          </Section>

          {/* SECTION 3: DISCIPLINE ACCOUNT */}
          <Section title="3. Discipline Account — Live Trading" color={C.green}>
            <CheckRow label="Discipline Account monitored during London session (07:00–10:30 GMT)"
              checked={form.disciplineMonitored} onChange={v=>set('disciplineMonitored',v)} color={C.green} />
            <TextField label="Trade taken today? (Y — fill below / N — log 'no valid setup')"
              value={form.tradeTakenToday} onChange={v=>set('tradeTakenToday',v)} placeholder="Y or N" />
            {(form.tradeTakenToday||'').toLowerCase()==='y' && (
              <>
                <CheckRow label="Session was 07:00–10:30 GMT at entry?" checked={form.sessionWindowCorrect}
                  onChange={v=>set('sessionWindowCorrect',v)} color={C.green} />
                <CheckRow label="DXY checked before entry?" checked={form.dxyChecked}
                  onChange={v=>set('dxyChecked',v)} color={C.green} />
                <CheckRow label="All 3 false setup checks passed (all = No)?"
                  checked={form.falseSetupPassed} onChange={v=>set('falseSetupPassed',v)} color={C.green} />
                <CheckRow label="SL set BEFORE entry and NEVER moved after?"
                  checked={form.slNeverMoved} onChange={v=>set('slNeverMoved',v)} color={C.green} />
                <CheckRow label="Position size was 0.25% (pre-calculated)?"
                  checked={form.correctSize} onChange={v=>set('correctSize',v)} color={C.green} />
                <CheckRow label="Only 1 trade taken (not 2 or more)?"
                  checked={form.onlyOneTrade} onChange={v=>set('onlyOneTrade',v)} color={C.green} />
              </>
            )}
            <div style={{ padding:'8px 12px', background:C.redBg, borderRadius:6, marginTop:8,
              border:`1px solid ${C.redDim}`, fontSize:12, color:C.text }}>
              <b style={{ color:C.red }}>Non-negotiable: </b>
              Any SL modification after entry = 14-day account freeze. Log it immediately if it happened.
            </div>
          </Section>

          {/* SECTION 4: FROZEN ACCOUNTS */}
          <Section title="4. Frozen Accounts Status" color={C.muted}>
            <CheckRow label="Zero frozen account platforms opened today" sub="Target: every day = YES."
              checked={form.frozenZeroOpens} onChange={v=>set('frozenZeroOpens',v)} />
            <CheckRow label="Zero trades on any frozen account"
              checked={form.frozenZeroTrades} onChange={v=>set('frozenZeroTrades',v)} />
            <TextField label="Inactivity warning received from any firm?"
              value={form.inactivityWarning} onChange={v=>set('inactivityWarning',v)}
              placeholder="None — or: [Firm name] — action taken: [pause/maintenance trade per framework]" />
          </Section>

          {/* SECTION 5: PSYCHOLOGY */}
          <Section title="5. Psychology" color={C.red}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 20px' }}>
              <CheckRow label="Felt FOMO today?" checked={form.feltFomo} onChange={v=>set('feltFomo',v)} color={C.red} />
              <CheckRow label="Wanted to move SL on a live trade?" checked={form.wantedToMoveSL} onChange={v=>set('wantedToMoveSL',v)} color={C.red} />
              <CheckRow label="Urge to open extra market (USDJPY/Gold)?" checked={form.urgeExtraMarket} onChange={v=>set('urgeExtraMarket',v)} color={C.red} />
              <CheckRow label="Urge to modify strategy during session?" checked={form.urgeModifyStrategy} onChange={v=>set('urgeModifyStrategy',v)} color={C.red} />
            </div>
            {form.feltFomo && (
              <TextField label="FOMO trigger — what caused it?" value={form.fomoTrigger}
                onChange={v=>set('fomoTrigger',v)} placeholder="Which market / setup triggered it?" />
            )}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px', marginTop:6 }}>
              <TextField label="Emotional state — morning (1–5)" value={form.emotionMorning}
                onChange={v=>set('emotionMorning',v)} placeholder="1=Anxious  3=Neutral  5=Calm & Clear" />
              <TextField label="Emotional state — evening (1–5)" value={form.emotionEvening}
                onChange={v=>set('emotionEvening',v)} placeholder="1=Drained  3=Neutral  5=Energised & Clear" />
            </div>
          </Section>

          {/* SECTION 6: DAILY REVIEW */}
          <Section title="6. Daily Review" color={C.amber}>
            <TextField label="What stopped me today?" value={form.whatStoppedMe}
              onChange={v=>set('whatStoppedMe',v)} rows={2}
              placeholder="Honest answer: distraction / fatigue / confusion / no setups / platform issues" />
            <TextField label="What distracted me today?" value={form.whatDistractedMe}
              onChange={v=>set('whatDistractedMe',v)}
              placeholder="Social media / other markets / news / personal" />
            <TextField label="New pattern noticed (→ Hypothesis Parking Lot if 5+ times)"
              value={form.newPatternForParking} onChange={v=>set('newPatternForParking',v)}
              placeholder="Write idea here. Do NOT implement it today. Add to Parking Lot tab." />
            <TextField label="Tomorrow's single highest-priority task (one task only)"
              value={form.tomorrowPriority} onChange={v=>set('tomorrowPriority',v)}
              placeholder="One task. Not a list." />
            <TextField label="Time spent today (hours + minutes)"
              value={form.timeSpentToday} onChange={v=>set('timeSpentToday',v)} placeholder="e.g. 2h 15min" />
          </Section>

          {/* SECTION 7: SIGN-OFF */}
          <Section title="7. Sign-Off" color={C.gold}>
            <CheckRow label="All 6 sections above completed in full" checked={form.allSectionsComplete}
              onChange={v=>set('allSectionsComplete',v)} color={C.gold} />
            <CheckRow label="Trade Entry tab updated with all today's trades"
              checked={form.notionUpdated} onChange={v=>set('notionUpdated',v)} color={C.gold} />
            <CheckRow label="Edge Discovery checked — no new filter rules added impulsively"
              checked={form.sheetsUpdated} onChange={v=>set('sheetsUpdated',v)} color={C.gold} />
            <CheckRow label="Tomorrow's London session alarm set (06:45 GMT)"
              checked={form.alarmSet} onChange={v=>set('alarmSet',v)} color={C.gold} />
          </Section>

          {/* SAVE */}
          <div style={{ display:'flex', justifyContent:'flex-end', gap:12, marginTop:20 }}>
            {saved && <span style={{ fontSize:12, color:C.green, alignSelf:'center' }}>✓ Report saved</span>}
            <Btn color={C.gold} size="lg" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : '💾 Save Report'}
            </Btn>
          </div>
        </>
      )}
    </div>
  );
}
