import { scoreColor, statusColor, iqBand, LOOP_STEPS } from '../engine/iq.js'

const C = { border: '#e5e4de', surface: '#ffffff', bg: '#f7f7f6', muted: '#888580', text: '#0b0b0b', sub: '#52514e' }

export const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', ...style, ...(onClick ? { cursor: 'pointer' } : {}) }}>{children}</div>
)

export const Label = ({ children, style }) => (
  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: C.muted, marginBottom: 10, ...style }}>{children}</div>
)

export const Pill = ({ status, label }) => {
  const s = statusColor(status)
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: s.bg, color: s.fg, whiteSpace: 'nowrap', display: 'inline-block' }}>{label ?? status}</span>
}

export const ScoreNum = ({ value, size = 'md' }) => {
  const fs = { lg: 44, md: 24, sm: 15 }[size]
  const band = iqBand(value)
  return <span style={{ fontSize: fs, fontWeight: 700, color: band.color, lineHeight: 1 }}>{Number(value).toFixed(1)}</span>
}

export const Bar = ({ value, max = 100, height = 5 }) => {
  const pct = Math.min(100, Math.max(0, (Number(value) / max) * 100))
  return (
    <div style={{ height, background: '#e5e4de', borderRadius: height }}>
      <div style={{ height, width: `${pct}%`, background: scoreColor(value), borderRadius: height, transition: 'width .4s' }} />
    </div>
  )
}

export const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: C.muted, fontSize: 13 }}>
    <span style={{ marginRight: 8, display: 'inline-block', animation: 'spin 1s linear infinite' }}>◌</span> Loading live data…
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
)

export const Err = ({ msg }) => (
  <div style={{ padding: '1rem 1.25rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#991b1b' }}>⚠ {msg}</div>
)

export const RefreshBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 7, border: `1px solid ${C.border}`, background: C.surface, cursor: 'pointer', color: C.sub, display: 'flex', alignItems: 'center', gap: 5 }}>↺ Refresh</button>
)

export const Stat = ({ label, value, sub, warn, accent }) => (
  <Card style={{ padding: '14px 16px' }}>
    <Label>{label}</Label>
    <div style={{ fontSize: 28, fontWeight: 700, color: warn ? '#dc2626' : accent ? '#1baf7a' : C.text, lineHeight: 1, marginBottom: sub ? 5 : 0 }}>{value ?? '—'}</div>
    {sub && <div style={{ fontSize: 11, color: warn ? '#dc2626' : C.muted, marginTop: 3 }}>{sub}</div>}
  </Card>
)

export const LaunchGate = ({ status, score }) => {
  const ready = status === 'READY_FOR_UI_REVIEW' || Number(score) >= 85
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: ready ? '#dcfce7' : '#fee2e2', color: ready ? '#166534' : '#991b1b' }}>
      {ready ? '● READY FOR UI REVIEW' : '● NOT READY — IQ < 85'}
    </div>
  )
}

export const LoopGrid = ({ scores }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', background: '#f7f7f6', borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}` }}>
    {LOOP_STEPS.map((step, i) => {
      const v = Math.round(Number(scores?.[step.key]) || 0)
      return (
        <div key={step.key} style={{ textAlign: 'center', padding: '12px 4px', borderRight: i < 7 ? `1px solid ${C.border}` : 'none' }}>
          <div style={{ fontSize: 9, color: C.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{step.label}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: scoreColor(v) }}>{v}</div>
          {step.weight > 1 && <div style={{ fontSize: 8, color: '#d97706', marginTop: 2, fontWeight: 700 }}>{step.weight}×</div>}
        </div>
      )
    })}
  </div>
)

export const ModuleRow = ({ mod }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{mod.module}</div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{mod.loop_name}</div>
    </div>
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 12 }}>
      <span style={{ color: C.muted }}>Total: <b style={{ color: C.text }}>{mod.total_records}</b></span>
      <span style={{ color: mod.open_records > 0 ? '#d97706' : C.muted }}>Open: <b>{mod.open_records}</b></span>
      <span style={{ color: '#0ca30c' }}>Done: <b>{mod.active_or_processed_records}</b></span>
    </div>
  </div>
)

export const SectionHeader = ({ title, count, onRefresh }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, marginBottom: 3 }}>{title}</h1>
      {count !== undefined && <div style={{ fontSize: 13, color: C.muted }}>{count} records · Live · Supabase</div>}
    </div>
    {onRefresh && <RefreshBtn onClick={onRefresh} />}
  </div>
)

export const TableHead = ({ cols }) => (
  <thead>
    <tr style={{ background: '#f7f7f6' }}>
      {cols.map(c => <th key={c} style={{ padding: '9px 13px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#888580', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid #e5e4de`, whiteSpace: 'nowrap' }}>{c}</th>)}
    </tr>
  </thead>
)

export const TR = ({ children, selected, onClick, i }) => (
  <tr onClick={onClick} style={{ background: selected ? '#f0efec' : i % 2 === 0 ? '#fff' : '#fafaf9', borderBottom: '1px solid #f0ede8', cursor: onClick ? 'pointer' : 'default' }}>{children}</tr>
)

export const TD = ({ children, bold, color, mono }) => (
  <td style={{ padding: '9px 13px', fontSize: 13, fontWeight: bold ? 600 : 400, color: color || '#0b0b0b', fontFamily: mono ? 'monospace' : 'inherit' }}>{children ?? '—'}</td>
)

export const Input = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div>
    <div style={{ fontSize: 11, fontWeight: 600, color: '#888580', marginBottom: 5 }}>{label}</div>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', fontSize: 13, padding: '8px 10px', borderRadius: 7, border: '1px solid #e5e4de', outline: 'none', background: '#fff' }} />
  </div>
)

export const Btn = ({ children, onClick, disabled, variant = 'dark', small }) => {
  const styles = {
    dark:    { background: disabled ? '#e5e4de' : '#0b0b0b', color: disabled ? '#888' : '#fff', border: 'none' },
    outline: { background: '#fff', color: '#0b0b0b', border: '1px solid #e5e4de' },
    green:   { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
    red:     { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' },
  }[variant]
  return (
    <button onClick={onClick} disabled={disabled} style={{ fontSize: small ? 11 : 13, padding: small ? '4px 10px' : '8px 18px', borderRadius: 7, cursor: disabled ? 'default' : 'pointer', fontWeight: 600, ...styles }}>{children}</button>
  )
}
