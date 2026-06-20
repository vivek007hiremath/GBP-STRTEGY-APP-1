import { C } from '../lib/constants.js';

export const Tag = ({ children, color = C.gold }) => (
  <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:3, fontSize:11,
    fontWeight:700, letterSpacing:'0.5px', textTransform:'uppercase',
    background:color+'22', color, border:`1px solid ${color}44` }}>{children}</span>
);

export const Card = ({ children, style={}, color }) => (
  <div style={{ background:C.surface, border:`1px solid ${color||C.border}`,
    borderRadius:8, padding:'14px 18px', ...style }}>{children}</div>
);

export const SectionHead = ({ children, sub }) => (
  <div style={{ marginBottom:20 }}>
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:sub?5:0 }}>
      <div style={{ width:3, height:20, background:C.gold, borderRadius:2, flexShrink:0 }} />
      <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:C.textBr }}>{children}</h2>
    </div>
    {sub && <p style={{ margin:'0 0 0 13px', color:C.textDim, fontSize:12 }}>{sub}</p>}
  </div>
);

export const H3 = ({ children, color }) => (
  <div style={{ fontSize:12, fontWeight:700, color:color||C.gold, margin:'14px 0 7px',
    textTransform:'uppercase', letterSpacing:'0.8px' }}>{children}</div>
);

export const Bul = ({ children, color }) => (
  <div style={{ display:'flex', gap:8, padding:'3px 0', alignItems:'flex-start' }}>
    <span style={{ color:C.gold, flexShrink:0, fontSize:12 }}>›</span>
    <span style={{ fontSize:12, color:color||C.text, lineHeight:1.55 }}>{children}</span>
  </div>
);

export const Box = ({ label, children, color, bg }) => (
  <div style={{ padding:'10px 14px', background:bg, borderLeft:`3px solid ${color}`,
    borderRadius:'0 4px 4px 0', fontSize:12, color:C.text, margin:'8px 0', lineHeight:1.55 }}>
    <span style={{ color, fontWeight:700 }}>{label} </span>{children}
  </div>
);

export const Btn = ({ children, onClick, color=C.blue, variant='solid', size='md', disabled=false, style={} }) => {
  const pad = size==='sm' ? '4px 10px' : size==='lg' ? '10px 20px' : '6px 14px';
  const fs  = size==='sm' ? 11 : size==='lg' ? 14 : 12;
  const base = {
    padding:pad, borderRadius:5, cursor:disabled?'not-allowed':'pointer',
    fontWeight:700, fontSize:fs, transition:'all 0.15s', border:'none',
    opacity:disabled?0.5:1, fontFamily:'inherit', ...style,
  };
  if (variant==='solid')   return <button onClick={onClick} disabled={disabled} style={{ ...base, background:color, color:'#000' }}>{children}</button>;
  if (variant==='outline') return <button onClick={onClick} disabled={disabled} style={{ ...base, background:'transparent', color, border:`1px solid ${color}` }}>{children}</button>;
  if (variant==='ghost')   return <button onClick={onClick} disabled={disabled} style={{ ...base, background:'transparent', color, border:'1px solid transparent' }}>{children}</button>;
  return <button onClick={onClick} disabled={disabled} style={{ ...base, background:color, color:'#000' }}>{children}</button>;
};

export const StatCard = ({ label, value, sub, color=C.gold, style={} }) => (
  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8,
    padding:'12px 16px', ...style }}>
    <div style={{ fontSize:10, color:C.textDim, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:4 }}>{label}</div>
    <div style={{ fontSize:22, fontWeight:800, color, lineHeight:1.2 }}>{value}</div>
    {sub && <div style={{ fontSize:11, color:C.textDim, marginTop:3 }}>{sub}</div>}
  </div>
);

export const Field = ({ label, required, children, inline=false }) => (
  <div style={{ marginBottom:12, display:inline?'flex':'block', alignItems:inline?'center':'flex-start', gap:inline?12:0 }}>
    <label style={{ display:'block', fontSize:11, fontWeight:600, color:C.textDim,
      textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:inline?0:4,
      whiteSpace:'nowrap' }}>
      {label}{required && <span style={{ color:C.red }}> *</span>}
    </label>
    {children}
  </div>
);

const inputBase = {
  width:'100%', padding:'7px 10px', borderRadius:5, border:`1px solid #1C2230`,
  background:'#0F1318', color:'#C8D0DC', fontSize:12, fontFamily:'inherit',
  outline:'none', transition:'border-color 0.15s',
};

export const Input = ({ value, onChange, type='text', placeholder='', min, max, step, style={} }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    min={min} max={max} step={step}
    style={{ ...inputBase, ...style }}
    onFocus={e => e.target.style.borderColor = '#C9A84C'}
    onBlur={e => e.target.style.borderColor = '#1C2230'} />
);

export const Select = ({ value, onChange, children, style={} }) => (
  <select value={value} onChange={onChange}
    style={{ ...inputBase, cursor:'pointer', ...style }}>
    {children}
  </select>
);

export const Textarea = ({ value, onChange, placeholder='', rows=4 }) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
    style={{ ...inputBase, resize:'vertical', lineHeight:1.5 }}
    onFocus={e => e.target.style.borderColor = '#C9A84C'}
    onBlur={e => e.target.style.borderColor = '#1C2230'} />
);

export const Toggle = ({ label, checked, onChange, color=C.green }) => (
  <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:12, color:C.text }}>
    <div onClick={() => onChange(!checked)} style={{
      width:36, height:20, borderRadius:10, position:'relative',
      background: checked ? color : C.border, transition:'background 0.2s',
      flexShrink:0, cursor:'pointer',
    }}>
      <div style={{
        position:'absolute', top:2, left: checked ? 18 : 2, width:16, height:16,
        borderRadius:'50%', background:'#fff', transition:'left 0.2s',
      }} />
    </div>
    {label}
  </label>
);

export const Divider = ({ style={} }) => (
  <div style={{ height:1, background:C.border, margin:'16px 0', ...style }} />
);

export const Badge = ({ children, color=C.blue }) => (
  <span style={{ padding:'2px 7px', borderRadius:10, fontSize:10, fontWeight:700,
    background:color+'22', color, border:`1px solid ${color}33` }}>{children}</span>
);

export const ResultBadge = ({ result }) => {
  const cfg = {
    Win:       { c:C.green, bg:C.greenBg },
    Loss:      { c:C.red,   bg:C.redBg },
    Breakeven: { c:C.gold,  bg:C.goldBg },
    Partial:   { c:C.blue,  bg:C.blueBg },
  }[result] || { c:C.muted, bg:C.surface2 };
  return (
    <span style={{ padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:700,
      background:cfg.bg, color:cfg.c, border:`1px solid ${cfg.c}44` }}>{result}</span>
  );
};

export const GradeBadge = ({ grade }) => {
  const cfg = { A:C.green, B:C.gold, C:C.red }[grade] || C.muted;
  return (
    <span style={{ padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:800,
      background:cfg+'22', color:cfg }}>{grade || '—'}</span>
  );
};

export const Modal = ({ children, onClose, title, width=640 }) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000,
    display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background:C.surface, border:`1px solid ${C.borderHi}`, borderRadius:10,
      width:'100%', maxWidth:width, maxHeight:'90vh', overflow:'auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'14px 18px', borderBottom:`1px solid ${C.border}` }}>
        <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:C.textBr }}>{title}</h3>
        <button onClick={onClose} style={{ background:'none', border:'none', color:C.textDim,
          cursor:'pointer', fontSize:20, lineHeight:1, padding:'0 4px' }}>×</button>
      </div>
      <div style={{ padding:'16px 18px' }}>{children}</div>
    </div>
  </div>
);

export const Empty = ({ icon='📊', message }) => (
  <div style={{ textAlign:'center', padding:'48px 16px', color:C.textDim }}>
    <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
    <div style={{ fontSize:14 }}>{message}</div>
  </div>
);

export const PFBadge = ({ pf }) => {
  const n = parseFloat(pf);
  const color = n >= 1.4 ? C.green : n >= 1.0 ? C.amber : C.red;
  return <span style={{ fontWeight:700, color }}>{isNaN(n) ? '—' : n.toFixed(2)}</span>;
};
