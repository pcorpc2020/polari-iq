import { useState } from 'react'
import { useMiniQueue, useMiniTriage, completeMini } from '../hooks/useData.js'
import { scoreColor } from '../engine/iq.js'
import { Card, Label, Pill, Bar, Spinner, Err, SectionHeader, TableHead, TR, TD, Btn } from '../components/ui.jsx'

export default function MiniQueue() {
  const { data, loading, error, refetch } = useMiniQueue()
  const { data: triage } = useMiniTriage()
  const [tab, setTab] = useState('queue')
  const [busy, setBusy] = useState({})
  const [selected, setSelected] = useState(null)

  if (loading) return <Spinner />
  if (error) return <Err msg={error} />

  const open = (data || []).filter(d => d.status !== 'complete')
  const done = (data || []).filter(d => d.status === 'complete')
  const detail = selected ? (data || []).find(d => d.id === selected) : null

  async function doComplete(id, e) {
    e.stopPropagation()
    setBusy(p => ({ ...p, [id]: true }))
    try { await completeMini(id); await refetch() }
    catch (e) { alert(e.message) }
    finally { setBusy(p => ({ ...p, [id]: false })) }
  }

  const tabs = [
    { id: 'queue', label: `Queue (${open.length})` },
    { id: 'triage', label: 'Triage View' },
    { id: 'done', label: `Done (${done.length})` },
  ]

  return (
    <div>
      <SectionHeader title="Mini Action Queue" count={(data||[]).length} onRefresh={refetch} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            fontSize: 13, padding: '6px 16px', borderRadius: 20, border: '1px solid',
            borderColor: tab === t.id ? '#0b0b0b' : '#e5e4de',
            background: tab === t.id ? '#0b0b0b' : '#fff',
            color: tab === t.id ? '#fff' : '#52514e', cursor: 'pointer', fontWeight: 600,
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'queue' && (
        <div style={{ display: 'grid', gridTemplateColumns: detail ? '1fr 300px' : '1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {open.map(item => (
              <Card key={item.id} onClick={() => setSelected(selected === item.id ? null : item.id)}
                style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: selected === item.id ? '#f0efec' : '#fff' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, lineHeight: 1.4 }}>{item.title}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                    <Pill status={item.priority} />
                    <Pill status={item.action_domain} label={item.action_domain} />
                    <Pill status="open" label={item.action_type} />
                  </div>
                  <div style={{ fontSize: 11, color: '#888' }}>
                    <b style={{ color: scoreColor(item.expected_impact_score) }}>{item.expected_impact_score}</b> impact
                    {item.region && <> · {item.region}</>}
                    · {item.source_system}
                  </div>
                </div>
                <Btn small disabled={busy[item.id]} onClick={e => doComplete(item.id, e)}>
                  {busy[item.id] ? '…' : '✓ Done'}
                </Btn>
              </Card>
            ))}
            {open.length === 0 && <Card style={{ textAlign: 'center', color: '#aaa', padding: '3rem' }}>All mini actions complete! 🎉</Card>}
          </div>

          {detail && (
            <Card>
              <Label>Action Detail</Label>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{detail.title}</div>
              {[
                ['Type', detail.action_type],
                ['Domain', detail.action_domain],
                ['Priority', detail.priority],
                ['Source', detail.source_system],
                ['Status', detail.status],
                ['Region', detail.region],
              ].map(([k, v]) => v && (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0ede8', fontSize: 13 }}>
                  <span style={{ color: '#888' }}>{k}</span>
                  <span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 14 }}>
                <Label>Expected Impact</Label>
                <div style={{ fontWeight: 700, fontSize: 26, color: scoreColor(detail.expected_impact_score), marginBottom: 6 }}>{detail.expected_impact_score}</div>
                <Bar value={detail.expected_impact_score} />
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'triage' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableHead cols={['Title', 'Priority', 'Domain', 'Type', 'Impact', 'Status']} />
            <tbody>
              {(triage || []).map((row, i) => (
                <TR key={row.id || i} i={i}>
                  <TD bold>{(row.title || row.action_title || '').slice(0, 60)}{(row.title || '').length > 60 ? '…' : ''}</TD>
                  <TD><Pill status={row.priority} /></TD>
                  <TD color="#52514e">{row.action_domain}</TD>
                  <TD color="#52514e">{row.action_type}</TD>
                  <TD color={scoreColor(row.expected_impact_score)} bold>{row.expected_impact_score}</TD>
                  <TD><Pill status={row.status} /></TD>
                </TR>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'done' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {done.map(item => (
            <Card key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.65 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{item.title?.slice(0, 70)}</div>
              <Pill status="complete" />
            </Card>
          ))}
          {done.length === 0 && <Card style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>No completed actions yet.</Card>}
        </div>
      )}
    </div>
  )
}
