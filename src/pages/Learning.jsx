import { useState } from 'react'
import { useLearning, useLearningBridge, useLearningCmd, addLearningIntake } from '../hooks/useData.js'
import { scoreColor } from '../engine/iq.js'
import { Card, Label, Pill, Bar, Spinner, Err, SectionHeader, Btn, Input } from '../components/ui.jsx'

export default function Learning() {
  const { data: assets, loading, error, refetch } = useLearning()
  const { data: bridge } = useLearningBridge()
  const { data: cmd } = useLearningCmd()
  const [tab, setTab] = useState('assets')
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ input_text: '', source: 'manual' })
  const [saving, setSaving] = useState(false)

  if (loading) return <Spinner />
  if (error) return <Err msg={error} />

  const detail = selected ? (assets || []).find(d => d.id === selected) : null

  async function handleAdd() {
    setSaving(true)
    try { await addLearningIntake(form); setShowAdd(false); setForm({ input_text: '', source: 'manual' }); refetch() }
    catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const tabs = [
    { id: 'assets',  label: `Assets (${(assets||[]).length})` },
    { id: 'bridge',  label: `Intake Bridge (${(bridge||[]).length})` },
    { id: 'command', label: `Command (${(cmd||[]).length})` },
  ]

  return (
    <div>
      <SectionHeader title="Learning Intelligence" count={(assets||[]).length} onRefresh={refetch} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              fontSize: 13, padding: '6px 16px', borderRadius: 20, border: '1px solid',
              borderColor: tab === t.id ? '#0b0b0b' : '#e5e4de',
              background: tab === t.id ? '#0b0b0b' : '#fff',
              color: tab === t.id ? '#fff' : '#52514e', cursor: 'pointer', fontWeight: 600,
            }}>{t.label}</button>
          ))}
        </div>
        <Btn variant="outline" onClick={() => setShowAdd(!showAdd)} small>{showAdd ? '✕ Cancel' : '+ Add Intake'}</Btn>
      </div>

      {showAdd && (
        <Card style={{ marginBottom: 16, background: '#f0fff8', borderColor: '#bbf7d0' }}>
          <Label>New Learning Intake</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 10, marginBottom: 12 }}>
            <Input label="Input Text" value={form.input_text} onChange={v => setForm(p => ({ ...p, input_text: v }))} placeholder="What did you learn or observe?" />
            <Input label="Source" value={form.source} onChange={v => setForm(p => ({ ...p, source: v }))} placeholder="manual" />
          </div>
          <Btn onClick={handleAdd} disabled={saving || !form.input_text}>{saving ? 'Saving…' : 'Submit Intake'}</Btn>
        </Card>
      )}

      {tab === 'assets' && (
        <div style={{ display: 'grid', gridTemplateColumns: detail ? '1fr 300px' : '1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(assets || []).map(item => (
              <Card key={item.id} onClick={() => setSelected(selected === item.id ? null : item.id)}
                style={{ background: selected === item.id ? '#f0efec' : '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, flex: 1, marginRight: 10, lineHeight: 1.4 }}>{item.title}</div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <Pill status={item.item_type} />
                    {item.quality_score && <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor(item.quality_score) }}>{item.quality_score}</span>}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#52514e', lineHeight: 1.5, marginBottom: 6 }}>{item.summary}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{item.category} · {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</div>
              </Card>
            ))}
          </div>
          {detail && (
            <Card>
              <Label>Asset Detail</Label>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{detail.title}</div>
              <Pill status={detail.item_type} />
              {detail.quality_score && (
                <div style={{ margin: '14px 0' }}>
                  <div style={{ fontSize: 10, color: '#888', marginBottom: 5 }}>QUALITY SCORE</div>
                  <div style={{ fontWeight: 700, fontSize: 28, color: scoreColor(detail.quality_score), marginBottom: 5 }}>{detail.quality_score}</div>
                  <Bar value={detail.quality_score} />
                </div>
              )}
              <div style={{ fontSize: 12, color: '#52514e', lineHeight: 1.6, marginBottom: 10 }}>{detail.summary}</div>
              {detail.recommendation && (
                <div style={{ background: '#f0fff8', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#166534', lineHeight: 1.5 }}>
                  <b>Recommendation:</b> {detail.recommendation}
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {tab === 'bridge' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(bridge || []).map((item, i) => (
            <Card key={item.id || i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title || item.input_text?.slice(0, 60)}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {item.mini_task_created && <Pill status="complete" label="Mini ✓" />}
                  {item.lesson_created && <Pill status="lesson_created" label="Lesson ✓" />}
                </div>
              </div>
              {item.missing_questions && <div style={{ fontSize: 12, color: '#92400e', background: '#fef3c7', padding: '6px 8px', borderRadius: 6, marginBottom: 6 }}>❓ {item.missing_questions}</div>}
              {item.recommended_action && <div style={{ fontSize: 12, color: '#166534' }}>→ {item.recommended_action}</div>}
              <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>
                Confidence: <b style={{ color: scoreColor(item.confidence_score) }}>{item.confidence_score}</b>
                {item.source && <> · Source: {item.source}</>}
              </div>
            </Card>
          ))}
          {!(bridge||[]).length && <Card style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>No bridge records yet.</Card>}
        </div>
      )}

      {tab === 'command' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(cmd || []).map((item, i) => (
            <Card key={item.id || i}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{item.title || `Learning Command ${i + 1}`}</div>
              {item.recommendation && <div style={{ fontSize: 12, color: '#52514e', lineHeight: 1.5 }}>{item.recommendation}</div>}
            </Card>
          ))}
          {!(cmd||[]).length && <Card style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>No command records yet.</Card>}
        </div>
      )}
    </div>
  )
}
