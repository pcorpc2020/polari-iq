import { useRelease, useMetrics, useV15Home } from '../hooks/useData.js'
import { scoreColor } from '../engine/iq.js'
import { Card, Label, Pill, Bar, Spinner, Err, Stat, SectionHeader } from '../components/ui.jsx'

export default function Release() {
  const { data: rel, loading, error, refetch } = useRelease()
  const { data: metrics } = useMetrics()
  const { data: home } = useV15Home()

  if (loading) return <Spinner />
  if (error) return <Err msg={error} />

  const checks = [
    { label: 'Core Loops Verified', value: rel?.core_loops_verified, pass: rel?.core_loops_verified },
    { label: 'Completed Learning Loops', value: rel?.completed_learning_loops, pass: rel?.completed_learning_loops >= 2 },
    { label: 'Completed Impact Measurements', value: rel?.completed_impact_measurements, pass: rel?.completed_impact_measurements >= 2 },
    { label: 'Routed Content Items', value: rel?.routed_content_items, pass: rel?.routed_content_items >= 1 },
    { label: 'Open Mini Tasks', value: rel?.open_mini_tasks, pass: rel?.open_mini_tasks === 0 },
    { label: 'Open Impact Signals', value: rel?.open_impact_signals, pass: false },
    { label: 'Open Impact Actions', value: rel?.open_impact_actions, pass: false },
  ]

  return (
    <div>
      <SectionHeader title="Release Readiness" onRefresh={refetch} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        <Stat label="Release" value={rel?.release_name} sub={rel?.release_status} />
        <Stat label="Top Blocker" value={rel?.top_blocker} warn />
        <Stat label="Status" value={rel?.release_status} accent={rel?.release_status === 'READY_FOR_UI_REVIEW'} />
      </div>

      {/* Checklist */}
      <Card style={{ marginBottom: 20 }}>
        <Label>Release Gate Checklist</Label>
        {checks.map(c => (
          <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0ede8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>{c.pass ? '✅' : '❌'}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{c.label}</span>
            </div>
            <span style={{ fontWeight: 700, color: c.pass ? '#0ca30c' : '#dc2626' }}>{String(c.value ?? '—')}</span>
          </div>
        ))}
      </Card>

      {/* Metrics */}
      <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e4de' }}><Label>Live Metrics — vw_polari_latest_metric_status</Label></div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: '#f7f7f6' }}>
            {['Layer', 'Metric', 'Value', 'Status', 'Notes'].map(h => (
              <th key={h} style={{ padding: '9px 13px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e5e4de' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {(metrics||[]).map((m, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafaf9', borderBottom: '1px solid #f0ede8' }}>
                <td style={{ padding: '9px 13px', fontSize: 12, color: '#52514e' }}>{m.metric_layer}</td>
                <td style={{ padding: '9px 13px', fontWeight: 600 }}>{m.metric_name}</td>
                <td style={{ padding: '9px 13px', fontWeight: 700, color: scoreColor(m.metric_value) }}>{m.metric_value}</td>
                <td style={{ padding: '9px 13px' }}><Pill status={m.metric_status} /></td>
                <td style={{ padding: '9px 13px', fontSize: 12, color: '#888' }}>{m.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Module summary */}
      {home?.module_summary && (
        <Card>
          <Label>Module Summary</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {home.module_summary.split(' | ').map((item, i) => (
              <div key={i} style={{ background: '#f7f7f6', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
                {item}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: '#888' }}>Last refresh: {home?.last_refresh ? new Date(home.last_refresh).toLocaleString() : '—'}</div>
        </Card>
      )}
    </div>
  )
}
