import { useState } from 'react'
import { useOpportunities, useImpactHeat, useIQImpact } from '../hooks/useData.js'
import { scoreColor } from '../engine/iq.js'
import { Card, Label, Pill, Bar, Spinner, Err, Stat, SectionHeader, TableHead, TR, TD } from '../components/ui.jsx'

export default function Opportunities() {
  const { data, loading, error, refetch } = useOpportunities()
  const { data: heat } = useImpactHeat()
  const { data: iqImpact } = useIQImpact()
  const [tab, setTab] = useState('opportunities')
  const [selected, setSelected] = useState(null)

  if (loading) return <Spinner />
  if (error) return <Err msg={error} />

  const detail = selected ? (data||[]).find(d => d.id === selected) : null

  return (
    <div>
      <SectionHeader title="Opportunity Intelligence" count={(data||[]).length} onRefresh={refetch} />

      {/* IQ Impact stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        <Stat label="Impact IQ" value={Number(iqImpact?.polari_impact_iq_score||0).toFixed(1)} sub="National" accent />
        <Stat label="Impact Quality" value={Number(iqImpact?.impact_quality||0).toFixed(1)} />
        <Stat label="Leverage Quality" value={Number(iqImpact?.leverage_quality||0).toFixed(1)} />
        <Stat label="ROI Quality" value={Number(iqImpact?.roi_quality||0).toFixed(1)} accent />
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {[{ id: 'opportunities', label: `Opportunities (${(data||[]).length})` }, { id: 'heatmap', label: 'Impact Heatmap' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            fontSize: 13, padding: '6px 16px', borderRadius: 20, border: '1px solid',
            borderColor: tab === t.id ? '#0b0b0b' : '#e5e4de',
            background: tab === t.id ? '#0b0b0b' : '#fff',
            color: tab === t.id ? '#fff' : '#52514e', cursor: 'pointer', fontWeight: 600,
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'opportunities' && (
        <div style={{ display: 'grid', gridTemplateColumns: detail ? '1fr 300px' : '1fr', gap: 16 }}>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <TableHead cols={['Title', 'Type', 'Region', 'Industry', 'Impact', 'Urgency', 'ROI', 'Status']} />
              <tbody>
                {(data||[]).map((row, i) => (
                  <TR key={row.id} i={i} selected={selected === row.id} onClick={() => setSelected(selected === row.id ? null : row.id)}>
                    <TD bold>{row.title}</TD>
                    <TD color="#52514e">{row.opportunity_type}</TD>
                    <TD>{row.region}</TD>
                    <TD color="#52514e">{row.industry}</TD>
                    <TD bold color={scoreColor(row.impact_score)}>{Number(row.impact_score||0).toFixed(1)}</TD>
                    <TD bold color={scoreColor(row.urgency_score)}>{Number(row.urgency_score||0).toFixed(0)}</TD>
                    <TD bold color="#0ca30c">{Number(row.estimated_roi||0).toFixed(0)}</TD>
                    <TD><Pill status={row.status} /></TD>
                  </TR>
                ))}
              </tbody>
            </table>
          </Card>
          {detail && (
            <Card>
              <Label>Opportunity Detail</Label>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>{detail.title}</div>
              {[
                { label: 'Impact Score', value: detail.impact_score },
                { label: 'Urgency Score', value: detail.urgency_score },
                { label: 'Leverage Score', value: detail.leverage_score },
                { label: 'Est. ROI', value: detail.estimated_roi },
              ].map(({ label, value }) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                    <span style={{ color: '#888' }}>{label}</span>
                    <span style={{ fontWeight: 700, color: scoreColor(Number(value)) }}>{Number(value||0).toFixed(1)}</span>
                  </div>
                  <Bar value={Number(value)} />
                </div>
              ))}
              <div style={{ fontSize: 12, color: '#52514e', lineHeight: 1.5, marginTop: 10 }}>{detail.description}</div>
            </Card>
          )}
        </div>
      )}

      {tab === 'heatmap' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(heat||[]).map((row, i) => (
            <Card key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{row.region} — {row.industry}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{row.opportunity_type} · {row.opportunity_count} opportunities</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 22, color: scoreColor(row.avg_impact_score) }}>{Number(row.avg_impact_score||0).toFixed(1)}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Avg Impact', value: row.avg_impact_score },
                  { label: 'Avg Leverage', value: row.avg_leverage_score },
                  { label: 'Avg ROI', value: row.avg_estimated_roi },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: '#f7f7f6', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontWeight: 700, color: scoreColor(Number(value)) }}>{Number(value||0).toFixed(1)}</div>
                    <Bar value={Number(value)} height={3} />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
