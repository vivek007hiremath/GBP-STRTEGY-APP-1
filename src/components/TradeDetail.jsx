import { useEffect, useState } from 'react';
import { C } from '../lib/constants.js';
import { getScreenshot } from '../lib/db.js';
import { Modal, ResultBadge, GradeBadge, Btn, H3 } from './ui.jsx';

const Row = ({ label, value, color }) => (
  <div style={{ display:'flex', padding:'6px 0', borderBottom:`1px solid ${C.border}`, gap:8 }}>
    <span style={{ fontSize:11, color:C.textDim, minWidth:150, flexShrink:0, fontWeight:600 }}>{label}</span>
    <span style={{ fontSize:12, color:color||C.text, lineHeight:1.4 }}>{value}</span>
  </div>
);

const Bool = ({ val }) => (
  <span style={{ fontWeight:700, color:val?C.green:C.border }}>{val?'✓ Yes':'– No'}</span>
);

export default function TradeDetail({ trade: t, onClose, onEdit }) {
  const [screenshot, setScreenshot] = useState(null);

  useEffect(() => {
    if (t?.id) getScreenshot(t.id).then(url => setScreenshot(url));
    return () => setScreenshot(null);
  }, [t?.id]);

  if (!t) return null;

  const rColor = (parseFloat(t.actualR)||0) > 0 ? C.green : C.red;
  const pipColor = (parseFloat(t.pipsResult)||0) > 0 ? C.green : C.red;

  return (
    <Modal title={`Trade #${t.id} — ${t.date}`} onClose={onClose} width={720}>
      {/* RESULT BANNER */}
      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:16,
        padding:'10px 14px', background:C.surface2, borderRadius:6 }}>
        <ResultBadge result={t.result||'—'} />
        <GradeBadge grade={t.sweepGrade} />
        <span style={{ fontSize:13, fontWeight:700, color:rColor }}>
          {t.actualR!=null&&t.actualR!==''?((parseFloat(t.actualR)>0?'+':'')+parseFloat(t.actualR).toFixed(2)+' R'):''}
        </span>
        <span style={{ fontSize:13, fontWeight:700, color:pipColor }}>
          {t.pipsResult!=null&&t.pipsResult!==''?((parseFloat(t.pipsResult)>0?'+':'')+parseFloat(t.pipsResult).toFixed(1)+' pips'):''}
        </span>
        <span style={{ marginLeft:'auto', color:C.textDim, fontSize:11 }}>{t.dayOfWeek}</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* LEFT */}
        <div>
          <H3 color={C.blue}>Trade Identity</H3>
          <Row label="Date" value={t.date} />
          <Row label="Session" value={t.session} />
          <Row label="HTF Bias (1H)" value={t.htfBias} color={t.htfBias==='Bullish'?C.green:t.htfBias==='Bearish'?C.red:C.amber} />
          <Row label="DXY Bias" value={t.dxyBias} />
          <Row label="Major News" value={<Bool val={t.majorNews} />} />

          <H3 color={C.amber}>Asia Setup</H3>
          <Row label="Asia Sweep" value={t.asiaSweepType} />
          <Row label="MSS / CHOCH" value={<Bool val={t.mssOccurred} />} />
          <Row label="Trade Direction" value={t.tradeDirection} color={t.tradeDirection==='Long'?C.green:C.red} />
          {t.tradeTaken && <Row label="Trade Taken" value={t.tradeTaken} color={t.tradeTaken==='Yes'?C.green:C.amber} />}

          <H3 color={C.green}>Execution</H3>
          <Row label="Entry Price" value={t.entryPrice||'—'} />
          <Row label="Stop Loss" value={t.stopLossPrice||'—'} />
          <Row label="Take Profit" value={t.takeProfitPrice||'—'} />
          <Row label="SL Pips" value={t.slPips||'—'} />
          <Row label="TP Pips" value={t.tpPips||'—'} />
          <Row label="R:R Set" value={t.rr||'—'} color={C.gold} />
        </div>

        {/* RIGHT */}
        <div>
          <H3 color={C.purple}>Quality Checklist</H3>
          <Row label="BOS After MSS" value={<Bool val={t.bosAfterMss} />} />
          <Row label="FVG Present" value={<Bool val={t.fvgPresent} />} />
          <Row label="No-Wick Candle" value={<Bool val={t.noWickCandle} />} />
          <Row label="Liquidity Void" value={<Bool val={t.liquidityVoid} />} />
          <Row label="Inverse FVG" value={<Bool val={t.inverseFvg} />} />
          <Row label="Momentum Quality" value={t.momentumQuality||'—'} />
          <Row label="Displacement Strength" value={t.displacementStrength||'—'} />

          <H3 color={C.red}>False Setup Analysis</H3>
          <Row label="False MSS?" value={<Bool val={t.falseMss} />} />
          <Row label="Liquidity Already Taken?" value={<Bool val={t.liquidityAlreadyTaken} />} />
          <Row label="MSS Against HTF?" value={<Bool val={t.mssAgainstHtf} />} />
          {t.primaryLossReason && <Row label="Loss Reason" value={t.primaryLossReason} color={C.red} />}

          {t.notes && (
            <>
              <H3 color={C.muted}>Notes</H3>
              <div style={{ fontSize:12, color:C.text, lineHeight:1.6, padding:'8px 10px',
                background:C.surface2, borderRadius:4 }}>{t.notes}</div>
            </>
          )}
        </div>
      </div>

      {/* SCREENSHOT */}
      {screenshot && (
        <div style={{ marginTop:16 }}>
          <H3 color={C.muted}>Screenshot</H3>
          <img src={screenshot} alt="Trade chart" style={{ width:'100%', borderRadius:6,
            border:`1px solid ${C.border}`, maxHeight:400, objectFit:'contain',
            background:C.surface2 }} />
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
        <Btn variant="outline" color={C.gold} onClick={onEdit}>✏️ Edit Trade</Btn>
        <Btn variant="outline" color={C.muted} onClick={onClose}>Close</Btn>
      </div>
    </Modal>
  );
}
