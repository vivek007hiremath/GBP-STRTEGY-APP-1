import { useState, useEffect, useRef } from 'react';
import { C, SESSIONS, HTF_BIAS, DXY_BIAS, ASIA_SWEEP, DIRECTION, MOMENTUM, DISPLACEMENT, GRADES, RESULTS, LOSS_REASONS, EMPTY_TRADE } from '../lib/constants.js';
import { getDayOfWeek, calcRR, calcActualR } from '../lib/calculations.js';
import { getScreenshot, deleteScreenshot } from '../lib/db.js';
import { Field, Input, Select, Textarea, Toggle, Btn, H3, Divider, Card, SectionHead } from './ui.jsx';

const SG = ({ label, children, color }) => (
  <div style={{ padding:'14px 16px', background:C.surface2, borderRadius:8,
    border:`1px solid ${color||C.border}`, marginBottom:12 }}>
    <div style={{ fontSize:11, fontWeight:700, color:color||C.gold, textTransform:'uppercase',
      letterSpacing:'0.8px', marginBottom:12 }}>{label}</div>
    {children}
  </div>
);

const G2 = ({ children }) => (
  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>{children}</div>
);

const G3 = ({ children }) => (
  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0 16px' }}>{children}</div>
);

export default function TradeEntry({ onSave, onCancel, editTrade }) {
  const [form,        setForm]        = useState({ ...EMPTY_TRADE });
  const [screenshot,  setScreenshot]  = useState(null); // base64 dataUrl
  const [thumbUrl,    setThumbUrl]    = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [errors,      setErrors]      = useState({});
  const fileRef = useRef();

  useEffect(() => {
    if (editTrade) {
      setForm({ ...EMPTY_TRADE, ...editTrade });
      getScreenshot(editTrade.id).then(url => {
        if (url) setThumbUrl(url);
      });
    } else {
      setForm({ ...EMPTY_TRADE, date: new Date().toISOString().split('T')[0] });
      setScreenshot(null);
      setThumbUrl(null);
    }
    setErrors({});
  }, [editTrade]);

  const set = (field, value) => setForm(f => {
    const next = { ...f, [field]: value };
    // auto-derive day of week
    if (field === 'date') next.dayOfWeek = getDayOfWeek(value);
    // auto-calc RR
    if (field === 'slPips' || field === 'tpPips') {
      const sl = field==='slPips' ? value : f.slPips;
      const tp = field==='tpPips' ? value : f.tpPips;
      next.rr = calcRR(sl, tp);
    }
    // auto-calc actualR
    if (field === 'result' || field === 'rr' || field === 'slPips' || field === 'tpPips') {
      const rr = field==='rr' ? value : (next.rr || f.rr);
      const result = field==='result' ? value : f.result;
      next.actualR = calcActualR(result, rr);
    }
    return next;
  });

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setScreenshot(ev.target.result); setThumbUrl(ev.target.result); };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const validate = () => {
    const e = {};
    if (!form.date)          e.date = 'Required';
    if (!form.session)       e.session = 'Required';
    if (!form.htfBias)       e.htfBias = 'Required';
    if (!form.asiaSweepType) e.asiaSweepType = 'Required';
    if (!form.tradeDirection)e.tradeDirection = 'Required';
    if (!form.sweepGrade)    e.sweepGrade = 'Required';
    if (!form.result)        e.result = 'Required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleClearScreenshot = async () => {
    if (editTrade?.id) await deleteScreenshot(editTrade.id).catch(() => {});
    setScreenshot(null);
    setThumbUrl(null);
  };

  const handleSubmit = async () => {
    if (!validate()) { window.scrollTo(0, 0); return; }
    setSaving(true);
    const tradeData = {
      ...form,
      dayOfWeek: getDayOfWeek(form.date),
      rr: calcRR(form.slPips, form.tpPips),
      actualR: calcActualR(form.result, calcRR(form.slPips, form.tpPips)),
      slPips: parseFloat(form.slPips) || '',
      tpPips: parseFloat(form.tpPips) || '',
      pipsResult: parseFloat(form.pipsResult) || '',
      entryPrice: parseFloat(form.entryPrice) || '',
      stopLossPrice: parseFloat(form.stopLossPrice) || '',
      takeProfitPrice: parseFloat(form.takeProfitPrice) || '',
    };
    await onSave(tradeData, screenshot);
    setSaving(false);
  };

  const ErrMsg = ({ f }) => errors[f] ? <div style={{ color:C.red, fontSize:10, marginTop:2 }}>{errors[f]}</div> : null;
  const sel = (field, opts, placeholder='Select…') => (
    <>
      <Select value={form[field]} onChange={e => set(field, e.target.value)} style={{ borderColor: errors[field] ? C.red : C.border }}>
        <option value="">{placeholder}</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </Select>
      <ErrMsg f={field} />
    </>
  );

  const isLoss = form.result === 'Loss';

  return (
    <div style={{ maxWidth:900, margin:'0 auto' }}>
      <SectionHead sub={editTrade ? `Editing Trade #${editTrade.id}` : 'Log a new GBPUSD backtest trade — all fields from your strategy'}>
        {editTrade ? 'Edit Trade' : 'New Trade Entry'}
      </SectionHead>

      {Object.keys(errors).length > 0 && (
        <div style={{ padding:'10px 14px', background:C.redBg, border:`1px solid ${C.redDim}`,
          borderRadius:6, marginBottom:16, fontSize:12, color:C.red }}>
          Please fill in the required fields marked with a red border.
        </div>
      )}

      {/* SECTION 1: TRADE IDENTITY */}
      <SG label="1 — Trade Identity" color={C.blue}>
        <G3>
          <Field label="Date" required>
            <Input type="date" value={form.date} onChange={e => set('date', e.target.value)}
              style={{ borderColor: errors.date ? C.red : C.border }} />
          </Field>
          <Field label="Day of Week">
            <Input value={getDayOfWeek(form.date)} style={{ color:C.textDim }} />
          </Field>
          <Field label="Session" required>
            {sel('session', SESSIONS)}
          </Field>
        </G3>
        <G3>
          <Field label="HTF Bias (1H)" required>
            {sel('htfBias', HTF_BIAS)}
          </Field>
          <Field label="DXY Bias">
            {sel('dxyBias', DXY_BIAS)}
          </Field>
          <Field label="Major News Present">
            <div style={{ paddingTop:6 }}>
              <Toggle label={form.majorNews ? 'YES — news day' : 'No'} checked={form.majorNews} onChange={v => set('majorNews', v)} color={C.red} />
            </div>
          </Field>
        </G3>
      </SG>

      {/* SECTION 2: ASIA SETUP */}
      <SG label="2 — Asia Setup" color={C.amber}>
        <G3>
          <Field label="Asia Sweep Type" required>
            {sel('asiaSweepType', ASIA_SWEEP)}
          </Field>
          <Field label="MSS / CHOCH Occurred">
            <div style={{ paddingTop:6 }}>
              <Toggle label={form.mssOccurred ? 'YES — MSS confirmed' : 'No MSS'} checked={form.mssOccurred} onChange={v => set('mssOccurred', v)} color={C.green} />
            </div>
          </Field>
          <Field label="Trade Direction" required>
            {sel('tradeDirection', DIRECTION)}
          </Field>
          <Field label="Trade Taken">
            {sel('tradeTaken', ['Yes', 'No'], 'Any')}
          </Field>
        </G3>
      </SG>

      {/* SECTION 3: QUALITY FACTORS */}
      <SG label="3 — Quality Factors" color={C.purple}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px 20px', marginBottom:12 }}>
          {[
            { f:'bosAfterMss',  l:'BOS After MSS' },
            { f:'fvgPresent',   l:'FVG Present' },
            { f:'noWickCandle', l:'No-Wick Candle' },
            { f:'liquidityVoid',l:'Liquidity Void' },
            { f:'inverseFvg',   l:'Inverse FVG' },
          ].map(({ f, l }) => (
            <Toggle key={f} label={l} checked={!!form[f]} onChange={v => set(f, v)} color={C.purple} />
          ))}
        </div>
        <G3>
          <Field label="Momentum Quality">
            {sel('momentumQuality', MOMENTUM)}
          </Field>
          <Field label="Displacement Strength">
            {sel('displacementStrength', DISPLACEMENT)}
          </Field>
          <Field label="Sweep Grade" required>
            {sel('sweepGrade', GRADES.map(g => g))}
          </Field>
        </G3>
      </SG>

      {/* SECTION 4: EXECUTION */}
      <SG label="4 — Execution Details" color={C.green}>
        <G3>
          <Field label="Entry Price">
            <Input type="number" step="0.00001" value={form.entryPrice} onChange={e => set('entryPrice', e.target.value)} placeholder="1.27500" />
          </Field>
          <Field label="Stop Loss Price">
            <Input type="number" step="0.00001" value={form.stopLossPrice} onChange={e => set('stopLossPrice', e.target.value)} placeholder="1.27350" />
          </Field>
          <Field label="Take Profit Price">
            <Input type="number" step="0.00001" value={form.takeProfitPrice} onChange={e => set('takeProfitPrice', e.target.value)} placeholder="1.27800" />
          </Field>
        </G3>
        <G3>
          <Field label="SL (Pips)">
            <Input type="number" step="0.1" value={form.slPips} onChange={e => set('slPips', e.target.value)} placeholder="15" />
          </Field>
          <Field label="TP (Pips)">
            <Input type="number" step="0.1" value={form.tpPips} onChange={e => set('tpPips', e.target.value)} placeholder="30" />
          </Field>
          <Field label="R:R (Auto)">
            <Input value={form.rr || ''} style={{ color:C.gold, fontWeight:700 }} placeholder="Auto" />
          </Field>
        </G3>
      </SG>

      {/* SECTION 5: RESULT */}
      <SG label="5 — Trade Result" color={C.green}>
        <G3>
          <Field label="Result" required>
            {sel('result', RESULTS)}
          </Field>
          <Field label="Pips Result (+/-)">
            <Input type="number" step="0.1" value={form.pipsResult} onChange={e => set('pipsResult', e.target.value)} placeholder="+30 or -15" />
          </Field>
          <Field label="Actual R (Auto)">
            <Input value={form.actualR !== '' ? form.actualR : ''} style={{ color: parseFloat(form.actualR)>0 ? C.green : C.red, fontWeight:700 }} placeholder="Auto" />
          </Field>
        </G3>
      </SG>

      {/* SECTION 6: FALSE SETUP ANALYSIS */}
      <SG label="6 — False Setup Analysis" color={C.red}>
        <p style={{ fontSize:11, color:C.textDim, marginBottom:12 }}>
          Answer honestly for every trade — especially losses. This data finds your blind spots.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px 20px', marginBottom:12 }}>
          <Toggle label="False MSS?" checked={!!form.falseMss} onChange={v => set('falseMss', v)} color={C.red} />
          <Toggle label="Liquidity Already Taken?" checked={!!form.liquidityAlreadyTaken} onChange={v => set('liquidityAlreadyTaken', v)} color={C.red} />
          <Toggle label="MSS Against HTF?" checked={!!form.mssAgainstHtf} onChange={v => set('mssAgainstHtf', v)} color={C.red} />
        </div>
        {isLoss && (
          <Field label="Primary Loss Reason">
            {sel('primaryLossReason', LOSS_REASONS, 'Select reason…')}
          </Field>
        )}
      </SG>

      {/* SECTION 7: NOTES & SCREENSHOT */}
      <SG label="7 — Notes & Screenshot" color={C.muted}>
        <Field label="Trade Notes">
          <Textarea value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="What did you observe? Lesson? Hypothesis triggered?" rows={3} />
        </Field>
        <Field label="Screenshot">
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Btn variant="outline" color={C.blue} onClick={() => fileRef.current?.click()}>
              📷 {thumbUrl ? 'Replace' : 'Upload'} Screenshot
            </Btn>
            {thumbUrl && (
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <img src={thumbUrl} alt="screenshot" style={{ width:60, height:40, objectFit:'cover', borderRadius:4, border:`1px solid ${C.border}` }} />
                <Btn variant="ghost" color={C.red} size="sm" onClick={() => { setScreenshot(null); setThumbUrl(null); }}>✕</Btn>
                {editTrade?.id && (
                  <Btn variant="outline" color={C.red} size="sm" onClick={handleClearScreenshot}>
                    🗑️ Clear Saved
                  </Btn>
                )}
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display:'none' }} />
        </Field>
      </SG>

      {/* ACTIONS */}
      <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:20 }}>
        <Btn variant="outline" color={C.muted} onClick={onCancel}>Cancel</Btn>
        <Btn color={C.gold} onClick={handleSubmit} disabled={saving} size="lg">
          {saving ? 'Saving…' : editTrade ? 'Update Trade' : '+ Log Trade'}
        </Btn>
      </div>
    </div>
  );
}
