import { useState } from 'react'
import { useContent, useContentCmd, addContentInbox } from '../hooks/useData.js'
import { Card, Label, Pill, Spinner, Err, SectionHeader, Btn, Input } from '../components/ui.jsx'
import { scoreColor } from '../engine/iq.js'

export default function ContentInbox() {
  const { data, loading, error, refetch } = useContent()
  const { data: cmd } = useContentCmd()
  const [tab, setTab] = useState('inbox')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', raw_content: '', content_source: 'manual_note', target_product: 'PCorpCGig' })
  const [saving, setSaving] = useState(false)

  if (loading) return <Spinner />
  if (error) return <Err msg={error} />

  async function handleAdd() {
    setSaving(true)
    try { await addContentInbox(form); setShowAdd(false); setForm({ title: '', raw_content: '', content_source: 'manual_note', target_product: 'PCorpCGig' }); refetch() }
    catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <SectionHeader title="Content Inbox" count={(data||[]).length} onRefresh={refetch} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[{ id: 'inbox', label: `Inbox (${(data||[]).length})` }, { id: 'command', label: `Command (${(cmd||[]).length})` }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              fontSize: 13, padding: '6px 16px', borderRadius: 20, border: '1px solid',
              borderColor: tab === t.id ? '#0b0b0b' : '#e5e4de',
              background: tab === t.id ? '#0b0b0b' : '#fff',
              color: tab === t.id ? '#fff' : '#52514e', cursor: 'pointer', fontWeight: 600,
            }}>{t.label}</button>
          ))}
        </div>
        <Btn variant="outline" onClick={() => setShowAdd(!showAdd)} small>{showAdd ? '✕ Cancel' : '+ Add Content'}</Btn>
      </div>

      {showAdd && (
        <Card style={{ marginBottom: 16, background: '#f0fff8', borderColor: '#bbf7d0' }}>
          <Label>New Content Item</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <Input label="Title" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} placeholder="Content title" />
            <Input label="Source" value={form.content_source} onChange={v => setForm(p => ({ ...p, content_source: v }))} placeholder="manual_note" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 5 }}>Raw Content</div>
            <textarea value={form.raw_content} onChange={e => setForm(p => ({ ...p, raw_content: e.target.value }))}
              placeholder="Paste content, notes, or product direction here…"
              style={{ width: '100%', fontSize: 13, padding: '8px 10px', borderRadius: 7, border: '1px solid #e5e4de', outline: 'none', background: '#fff', minHeight: 80, resize: 'vertical' }} />
          </div>
          <Btn onClick={handleAdd} disabled={saving || !form.title}>{saving ? 'Saving…' : 'Submit to Inbox'}</Btn>
        </Card>
      )}

      {tab === 'inbox' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(data||[]).map((item, i) => (
            <Card key={item.id || i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 13, flex: 1, marginRight: 10 }}>{item.title || item.content_title || `Item ${i+1}`}</div>
                <div style={{ display: 'flex', gap: 5 }}>
                  {item.status && <Pill status={item.status} />}
                  {item.create_mini_task && <Pill status="complete" label="→ Mini ✓" />}
                  {item.create_learning_intake && <Pill status="lesson_created" label="→ Learn ✓" />}
                </div>
              </div>
              {item.summary && <div style={{ fontSize: 12, color: '#52514e', lineHeight: 1.5, marginBottom: 8 }}>{item.summary}</div>}
              {item.missing_questions && (
                <div style={{ fontSize: 11, color: '#92400e', background: '#fef3c7', padding: '6px 8px', borderRadius: 6, marginBottom: 6 }}>
                  ❓ {item.missing_questions}
                </div>
              )}
              {item.recommendation && (
                <div style={{ fontSize: 12, color: '#166534' }}>→ {item.recommendation}</div>
              )}
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>
                {item.content_source || item.source} · {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                {item.confidence_score && <> · Confidence: <b style={{ color: scoreColor(item.confidence_score) }}>{item.confidence_score}</b></>}
              </div>
            </Card>
          ))}
          {!(data||[]).length && <Card style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>Inbox is empty. Add content above.</Card>}
        </div>
      )}

      {tab === 'command' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(cmd||[]).map((item, i) => (
            <Card key={item.id || i}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{item.title || item.content_title || `Command ${i+1}`}</div>
              {item.raw_content && <div style={{ fontSize: 12, color: '#52514e', lineHeight: 1.5, marginBottom: 6 }}>{item.raw_content}</div>}
              {item.recommended_action && <div style={{ fontSize: 12, color: '#166534' }}>→ {item.recommended_action}</div>}
            </Card>
          ))}
          {!(cmd||[]).length && <Card style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>No command records.</Card>}
        </div>
      )}
    </div>
  )
}
