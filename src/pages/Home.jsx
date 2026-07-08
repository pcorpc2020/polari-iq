import { useV15Home, useSystemMap, useImpactCmd, useMetrics } from '../hooks/useData.js'
import { iqBand, scoreColor, LOOP_STEPS } from '../engine/iq.js'
import { Card, Label, Pill, ScoreNum, Bar, Spinner, Err, Stat, LaunchGate, LoopGrid, ModuleRow, SectionHeader } from '../components/ui.jsx'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

export default function Home() {
  const { data: home, loading, error, refetch } = useV15Home()
  const { data: map } = useSystemMap()
  const { data: impact } = useImpactCmd()
  const { data: metrics } = useMetrics()

  if (loading) return <Spinner />
  if (error) return <Err msg={error} />

  // Build loop scores from metrics
  const metricMap = {}
  ;(metrics || []).forEach(m => { metricMap[m.metric_key] = Number(m.metric_value) })
  const loopScores = {
    signal:        metricMap.intelligence_quality_score || 70,
    readiness:     metricMap.data_freshness_score || 65,
    opportunity:   metricMap.platform_readiness_score || 75,
    top_action:    metricMap.outcome_confidence_score || 60,
    mini_task:     metricMap.action_completion_rate || 0,
    communication: 72,
    outcome:       metricMap.outcome_confidence_score || 60,
    learning:      metricMap.recommendation_acceptance_rate || 0,
  }
  const iq = LOOP_STEPS.reduce((s,st) => s + (loopScores[st.key]||0)*st.weight,0) / 12
  const band = iqBand(iq)

  const radarData = LOOP_STEPS.map(s => ({ subject: s.label, score: Math.round(loopScores[s.key]||0), fullMark: 100 }))

  return (
    <div>
      <SectionHeader title="PCorpCGig V1.5 — Command Center" onRefresh={refetch} />

      {/* Launch gate + release */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <LaunchGate status={home?.release_status} />
        <Pill status={home?.release_status} />
        {home?.core_loops_verified && <Pill status="complete" label="Core loops verified ✓" />}
        {home?.top_blocker && <Pill status="high" label={`Blocker: ${home.top_blocker}`} />}
      </div>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        <Stat label="IQ Score" value={iq.toFixed(1)} sub={band.label} />
        <Stat label="Confidence" value={home?.confidence_score} sub={home?.confidence_label} accent />
        <Stat label="Open Mini Tasks" value={home?.open_mini_tasks} sub="Needs action" warn={home?.open_mini_tasks > 0} />
        <Stat label="Active Modules" value={home?.active_modules} sub="All systems" />
      </div>

      {/* IQ Loop + Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 16, marginBottom: 20 }}>
        <Card>
          <Label>Intelligence Loop Health — {iq.toFixed(1)}/100 · Outcome & Learning 3×</Label>
          <LoopGrid scores={loopScores} />
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
              <ScoreNum value={iq} size="lg" />
              <span style={{ fontSize: 18, color: '#aaa' }}>/100</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: band.color }}>{band.label}</span>
              <span style={{ fontSize: 11, color: '#888', marginLeft: 'auto' }}>Target ≥ 85 for release</span>
            </div>
            <Bar value={iq} />
          </div>
        </Card>
        <Card style={{ padding: '14px 10px' }}>
          <Label>Loop Radar</Label>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <PolarGrid stroke="#e5e4de" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: '#888' }} />
                <Radar dataKey="score" stroke="#2a78d6" fill="#2a78d6" fillOpacity={0.15} strokeWidth={1.5} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 7 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Command signals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <Card>
          <Label>Top Intelligence Signals</Label>
          {[
            { label: 'TOP SIGNAL',      value: home?.command },
            { label: 'TOP OPPORTUNITY', value: home?.opportunity },
            { label: 'TOP MINI ACTION', value: home?.mini_action, truncate: 90 },
          ].map(({ label, value, truncate }) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#888', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, color: '#0b0b0b' }}>
                {truncate && value?.length > truncate ? value.slice(0, truncate) + '…' : (value || '—')}
              </div>
            </div>
          ))}
          {home?.missing_questions && (
            <div style={{ background: '#fef3c7', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#92400e' }}>
              <b>Missing:</b> {home.missing_questions}
            </div>
          )}
        </Card>
        <Card>
          <Label>Impact Command</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Open Signals',      value: impact?.open_signals },
              { label: 'Open Opportunities',value: impact?.open_opportunities },
              { label: 'Impact Actions',    value: impact?.impact_actions },
              { label: 'Avg Impact Score',  value: Number(impact?.avg_impact_score||0).toFixed(1) },
            ].map(k => (
              <div key={k.label} style={{ background: '#f7f7f6', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{k.value ?? '—'}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>
            Total spend: <b style={{ color: '#0b0b0b' }}>${impact?.total_spend || 0}</b> &nbsp;·&nbsp;
            Avg efficiency: <b style={{ color: scoreColor(impact?.avg_efficiency) }}>{Number(impact?.avg_efficiency||0).toFixed(1)}</b>
          </div>
        </Card>
      </div>

      {/* System map */}
      <Card style={{ marginBottom: 20 }}>
        <Label>System Map — Loop Coverage</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {(map || []).map(m => <ModuleRow key={m.module} mod={m} />)}
        </div>
        {home?.module_summary && (
          <div style={{ marginTop: 12, fontSize: 11, color: '#888', background: '#f7f7f6', borderRadius: 7, padding: '8px 10px' }}>
            {home.module_summary}
          </div>
        )}
      </Card>

      {/* Learning + Learning status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <Label>Learning Loop Status</Label>
          {[
            { k: 'Latest Learning', v: home?.latest_learning },
            { k: 'Recommendation', v: home?.learning_recommendation },
            { k: 'Learning Status', v: home?.learning_status },
            { k: 'Completed Loops', v: home?.completed_learning_loops },
          ].map(({ k, v }) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0ede8', fontSize: 13 }}>
              <span style={{ color: '#888', fontSize: 12 }}>{k}</span>
              <span style={{ fontWeight: 500, maxWidth: '60%', textAlign: 'right', fontSize: 12 }}>{v ?? '—'}</span>
            </div>
          ))}
        </Card>
        <Card>
          <Label>Mini Triage Summary</Label>
          {(home?.mini_triage_summary || '').split(' | ').map((item, i) => {
            const [domain, count] = item.split(': ')
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0ede8' }}>
                <span style={{ fontSize: 13, color: '#52514e' }}>{domain}</span>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{count}</span>
              </div>
            )
          })}
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Pill status={home?.mini_status} label={`Mini: ${home?.mini_status}`} />
            <Pill status="lesson_created" label={`Learning: ${home?.learning_status}`} />
          </div>
        </Card>
      </div>
    </div>
  )
}
