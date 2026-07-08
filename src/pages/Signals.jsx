import { useState } from 'react'
import { useSignals, addSignal } from '../hooks/useData.js'
import { scoreColor } from '../engine/iq.js'
import { Card, Label, Pill, Bar, Spinner, Err, SectionHeader, Btn, Input } from '../components/ui.jsx'

export default function Signals() {
  const { data, loading, error, refetch } = useSignals()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ signal_type: 'job_gap', region: 'National', signal_strength: 80, source: 'manual' })
  const [saving, setSaving] = useState(false)

  if (loading) return <Spinner />
  if (error) return <Err msg={error} />

  async function handleAdd() {
    setSaving(true)
    try { await addSignal({ ...form, signal_strength: Number(form.signal_strength) }); setShowAdd(false); refetch() }
    catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <SectionHeader title="Signal Intelligence" count={(data||[]).length} onRefresh={refetch} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <Btn variant="outline" onClick={() => setShowAdd(!showAdd)} small>{showAdd ? '✕ Cancel' : '+ New Signal'}</Btn>
      </div>

      {showAdd && (
        <Card style={{ marginBottom: 16, background: '#f0fff8', borderColor: '#bbf7d0' }}>
          <Label>Insert Signal</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 12 }}>
            <Input label="Signal Type" value={form.signal_type} onChange={v => setForm(p => ({ ...p, signal_type: v }))} placeholder="job_gap" />
            <Input label="Region" value={form.region} onChange={v => setForm(p => ({ ...p, region: v }))} placeholder="National" />
            <Input label="Strength (0-100)" type="number" value={form.signal_strength} onChange={v => setForm(p => ({ ...p, signal_strength: v }))} placeholder="80" />
            <Input label="Source" value={form.source} onChange={v => setForm(p => ({ ...p, source: v }))} placeholder="manual" />
          </div>
          <Btn onClick={handleAdd} disabled={saving}>{saving ? 'Saving…' : 'Insert Signal'}</Btn>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(data||[]).map((s, i) => (
          <Card key={s.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 5 }}>{s.signal_type || s.top_signal || 'Signal'}</div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#888' }}>
                {s.region && <span>Region: <b style={{ color: '#0b0b0b' }}>{s.region}</b></span>}
                {s.industry && <span>Industry: <b style={{ color: '#0b0b0b' }}>{s.industry}</b></span>}
                <span>Source: <b style={{ color: '#0b0b0b' }}>{s.source_system || s.source || 'POLARI'}</b></span>
              </div>
              {(s.signal_strength || s.expected_impact_score) && (
                <div style={{ marginTop: 8 }}>
                  <Bar value={Number(s.signal_strength || s.expected_impact_score)} height={4} />
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              {(s.signal_strength || s.expected_impact_score) && (
                <div style={{ fontWeight: 700, fontSize: 24, color: scoreColor(Number(s.signal_strength || s.expected_impact_score)), lineHeight: 1 }}>
                  {Number(s.signal_strength || s.expected_impact_score).toFixed(0)}
                </div>
              )}
              {s.status && <div style={{ marginTop: 5 }}><Pill status={s.status} /></div>}
            </div>
          </Card>
        ))}
        {!(data||[]).length && (
          <Card style={{ textAlign: 'center', color: '#aaa', padding: '3rem' }}>No signals yet. Add one above.</Card>
        )}
      </div>
    </div>
  )
}
