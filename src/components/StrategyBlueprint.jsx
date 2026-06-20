import { C } from '../lib/constants.js';
import { SectionHead, Card, H3, Bul, Box, Tag } from './ui.jsx';

const SG = ({ label, color, children }) => (
  <div style={{ padding:'14px 16px', background:C.surface2, borderRadius:8,
    border:`1px solid ${color||C.border}`, marginBottom:12 }}>
    <div style={{ fontSize:11, fontWeight:700, color:color||C.gold, textTransform:'uppercase',
      letterSpacing:'0.8px', marginBottom:10 }}>{label}</div>
    {children}
  </div>
);

const Step = ({ n, step, detail, color }) => (
  <div style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'10px 12px',
    background:C.surface2, borderRadius:6, borderLeft:`3px solid ${color}`, marginBottom:8 }}>
    <div style={{ width:26, height:26, borderRadius:'50%', background:color,
      color:'#000', display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:13, fontWeight:800, flexShrink:0 }}>{n}</div>
    <div>
      <div style={{ fontWeight:700, color:C.textBr, fontSize:13, marginBottom:2 }}>{step}</div>
      <div style={{ fontSize:12, color:C.textDim }}>{detail}</div>
    </div>
  </div>
);

export default function StrategyBlueprint() {
  return (
    <div>
      <SectionHead sub="Decoded from your handwritten strategy notes — your complete GBPUSD London Session playbook.">
        GBPUSD Strategy Blueprint
      </SectionHead>

      {/* CORE SETUP */}
      <Card style={{ borderLeft:`4px solid ${C.gold}`, marginBottom:14 }}>
        <H3 color={C.gold}>The Core Setup — In Order</H3>
        <Step n={1} color={C.blue} step="Asia Session establishes a range"
          detail="Mark Asia HIGH and Asia LOW on your 15M chart before London opens. These are your liquidity pools." />
        <Step n={2} color={C.amber} step="Asia High OR Asia Low gets SWEPT in London"
          detail="Price takes out the Asia high (buy-side liquidity) or Asia low (sell-side liquidity). This is the trigger event." />
        <Step n={3} color={C.purple} step="15M CHOCH / MSS occurs after the sweep"
          detail="A Change of Character or Market Structure Shift on 15M confirms the sweep was a liquidity grab, not a breakout." />
        <Step n={4} color={C.green} step="ENTRY is OPPOSITE to the sweep direction"
          detail="Sweep of Asia High → Short entry (sell-side run). Sweep of Asia Low → Long entry. Entry is WITH the confirmed displacement." />

        <div style={{ padding:'10px 14px', background:C.goldBg, borderRadius:6, marginTop:8,
          border:`1px solid ${C.goldDim}`, fontSize:12, color:C.text }}>
          <b style={{ color:C.gold }}>One-line rule: </b>
          Asia HIGH or LOW gets SWEPT → 15M CHOCH/MSS occurs → ENTRY is OPPOSITE to the sweep.
        </div>
      </Card>

      {/* TIMEFRAME + SESSION */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
        <Card>
          <H3 color={C.blue}>Timeframe Stack</H3>
          {[
            { tf:'1H (Higher TF)',  role:'Bias — Bullish / Bearish / Neutral', color:C.blue, note:'Must align with trade direction' },
            { tf:'15M (Execution)', role:'Liquidity Sweep → MSS → Displacement', color:C.amber, note:'Primary execution timeframe' },
            { tf:'5M (Optional)',   role:'Entry refinement only — initially only', color:C.muted, note:'Not required — use for precision' },
          ].map((r,i) => (
            <div key={i} style={{ padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:12, fontWeight:700, color:r.color }}>{r.tf}</span>
              </div>
              <div style={{ fontSize:12, color:C.text, margin:'2px 0' }}>{r.role}</div>
              <div style={{ fontSize:11, color:C.textDim }}>{r.note}</div>
            </div>
          ))}
        </Card>
        <Card>
          <H3 color={C.purple}>Session Rules</H3>
          <div style={{ padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.textBr }}>London Only</span>
              <Tag color={C.green}>Primary</Tag>
            </div>
            <div style={{ fontSize:11, color:C.textDim }}>07:00 – 10:30 GMT. Highest probability. Single session focus.</div>
          </div>
          <div style={{ padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.textBr, marginBottom:4 }}>London + NY Overlap</div>
            <div style={{ fontSize:11, color:C.textDim }}>13:00 – 15:00 GMT. Secondary. Track separately in journal.</div>
          </div>
          <H3 color={C.red}>Pre-Trade Mandatory Filters</H3>
          <Bul><b>HTF (1H) bias</b> must align with trade direction — no counter-trend trades</Bul>
          <Bul><b>DXY bias</b> must confirm: DXY rising = GBPUSD short; DXY falling = GBPUSD long</Bul>
          <Bul><b>Major news:</b> No entry within 15 min before/after red-folder news</Bul>
        </Card>
      </div>

      {/* SL / TP */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
        <Card style={{ borderLeft:`3px solid ${C.red}` }}>
          <H3 color={C.red}>Stop Loss — Placement Rules</H3>
          <Bul><b>Option 1:</b> Beyond the sweep extreme (the wick that grabbed the liquidity)</Bul>
          <Bul><b>Option 2:</b> Beyond the invalidation structure level (the last MSS candle)</Bul>
          <Box label="Non-negotiable rule:" color={C.red} bg={C.redBg}>
            SL is set BEFORE entry and NEVER modified after entry. Any modification triggers the 14-day account freeze on the Discipline Account.
          </Box>
        </Card>
        <Card style={{ borderLeft:`3px solid ${C.green}` }}>
          <H3 color={C.green}>Take Profit — Models</H3>
          <div style={{ padding:'8px 10px', background:C.greenBg, borderRadius:6, marginBottom:8,
            border:`1px solid ${C.greenDim}` }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.green, marginBottom:3 }}>Model A (Medium) — Fixed 1:2 R:R</div>
            <div style={{ fontSize:11, color:C.textDim }}>Conservative. Higher win rate. Easier to execute. Preferred for early backtesting phase.</div>
          </div>
          <div style={{ padding:'8px 10px', background:C.surface2, borderRadius:6,
            border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.gold, marginBottom:3 }}>Model B — Opposite Asia Liquidity</div>
            <div style={{ fontSize:11, color:C.textDim }}>Target the opposite Asia High/Low. Higher R:R but requires clean opposite structure. Compare performance vs Model A after 100+ trades.</div>
          </div>
        </Card>
      </div>

      {/* FALSE SETUP CHECKLIST */}
      <Card style={{ borderLeft:`4px solid ${C.red}`, marginBottom:14 }}>
        <H3 color={C.red}>False Setup Checklist — Ask ALL Three Before Entry</H3>
        <p style={{ fontSize:12, color:C.textDim, marginBottom:12 }}>
          If any answer is YES → abort the trade. Track these on every loss.
          Rule: if 5+ losses share the same false signal → that signal gets a new filter rule.
        </p>
        {[
          { q:'Is this a False MSS?', detail:'Price appeared to shift structure but no strong displacement candle followed. Price returned through the MSS level without holding.', color:C.red },
          { q:'Was liquidity already taken before this setup?', detail:'The Asia High or Low target was already swept in a prior session. No fresh pool remaining. Do not trade a swept pool.', color:C.red },
          { q:'Is the MSS going against the 1H HTF bias?', detail:'15M shows a bullish MSS but 1H structure is bearish. Counter-trend setups have materially lower win rate — your data will confirm this.', color:C.red },
        ].map((f,i) => (
          <div key={i} style={{ padding:'10px 12px', background:C.redBg, borderRadius:6,
            marginBottom:8, border:`1px solid ${C.redDim}` }}>
            <div style={{ fontWeight:700, color:C.textBr, fontSize:12, marginBottom:4 }}>
              {i+1}. {f.q}
            </div>
            <div style={{ fontSize:11, color:C.textDim, marginBottom:6 }}>{f.detail}</div>
            <div style={{ display:'flex', gap:8 }}>
              <Tag color={C.red}>YES → Do not trade</Tag>
              <Tag color={C.green}>NO → Can proceed (if all 3 are No)</Tag>
            </div>
          </div>
        ))}
      </Card>

      {/* QUALITY CHECKLIST */}
      <Card style={{ marginBottom:14 }}>
        <H3 color={C.purple}>Quality Checklist — Track Per Trade</H3>
        <p style={{ fontSize:12, color:C.textDim, marginBottom:12 }}>
          These 8 factors are tracked on every trade (Y/N). After 100+ trades, Edge Discovery shows which ones genuinely improve your win rate.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[
            { n:'BOS After MSS', d:'Break of Structure occurs after the MSS, confirming direction. Tracked as a confluence factor.' },
            { n:'Imbalance Present', d:'Visible imbalance or gap in the displacement area. Price tends to fill imbalances.' },
            { n:'FVG — Pre-set', d:'Fair Value Gap was marked and pre-planned as entry zone before the setup formed.' },
            { n:'No-Wick Candle', d:'Strong body candle with no or minimal wick in the displacement area. Shows conviction.' },
            { n:'Liquidity Void', d:'Thin area above/below price. Price accelerates through voids — increases actual R.' },
            { n:'Inverse FVG', d:'Mitigation block used as entry zone. More refined entry than FVG alone.' },
            { n:'Momentum Quality', d:'(Strong / Medium / Weak) How strong was the displacement candle momentum post-MSS.' },
            { n:'Displacement Strength', d:'(Strong / Medium / Weak) Overall displacement strength after the confirmed MSS.' },
          ].map((f,i) => (
            <div key={i} style={{ padding:'8px 10px', background:C.surface2, borderRadius:6,
              border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.textBr, marginBottom:3 }}>{f.n}</div>
              <div style={{ fontSize:11, color:C.textDim, lineHeight:1.5 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* GRADE SYSTEM */}
      <Card style={{ marginBottom:14 }}>
        <H3 color={C.amber}>Sweep Quality Grading — A / B / C</H3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
          {[
            { grade:'A', color:C.green, desc:'Strong wick sweep into Asia level, immediate MSS candle with body close, strong displacement, no-wick continuation candle, FVG present. Take full size.' },
            { grade:'B', color:C.gold, desc:'Clean sweep but displacement is moderate, MSS present but candle body weaker, partial FVG present. Take normal size.' },
            { grade:'C', color:C.red, desc:'Marginal sweep, slow or weak MSS, choppy structure, no clear FVG. Take minimum size or skip. Most losses will be Grade C.' },
          ].map(g => (
            <div key={g.grade} style={{ padding:'12px 14px', background:C.surface2, borderRadius:6,
              borderTop:`3px solid ${g.color}` }}>
              <div style={{ fontSize:22, fontWeight:800, color:g.color, marginBottom:6 }}>Grade {g.grade}</div>
              <div style={{ fontSize:11, color:C.textDim, lineHeight:1.55 }}>{g.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* DECISION RULES */}
      <Card style={{ background:C.surface2 }}>
        <H3 color={C.blue}>Binary Decision Rules</H3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[
            { rule:'Entry Allowed?', crit:'All 3 false setup checks = No + HTF aligned + DXY confirms + No news', color:C.green },
            { rule:'SL after entry?', crit:'Never moved. Period. Set it and leave it.', color:C.red },
            { rule:'Second trade today?', crit:'Only if first trade was taken and closed first. Max 2 trades per session.', color:C.amber },
            { rule:'Grade C setup?', crit:'Pass if combined confluence count ≤ 2 factors. Only trade if 3+ present.', color:C.amber },
            { rule:'News incoming?', crit:'Exit or hold depending on direction. No new entries within 15 min of news.', color:C.red },
            { rule:'Modify TP after entry?', crit:'Yes — TP can be moved in profit direction only, never against.', color:C.green },
          ].map((r,i) => (
            <div key={i} style={{ padding:'8px 10px', background:C.surface, borderRadius:6,
              border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:11, fontWeight:700, color:r.color, marginBottom:3 }}>{r.rule}</div>
              <div style={{ fontSize:11, color:C.textDim, lineHeight:1.4 }}>{r.crit}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
