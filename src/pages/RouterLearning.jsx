import { useState } from 'react'
import { useQ } from '../hooks/useData.js'
import { supabase } from '../lib/supabase.js'
import { scoreColor } from '../engine/iq.js'
import { Card, Label, Pill, Bar, Spinner, Err, Stat, SectionHeader, TableHead, TR, TD, Btn } from '../components/ui.jsx'

export default function RouterLearning() {
  const { data:models, loading:l1, refetch:r1 } = useQ(async () => {
    const { data, error } = await supabase.from('model_registry').select('*').order('specificity_score', { ascending: false })
    if (error) throw error
    return data || []
  })
  const { data:logs, loading:l2, refetch:r2 } = useQ(async () => {
    const { data, error } = await supabase.from('routing_log').select('*').order('created_at', { ascending: false }).limit(20)
    if (error) throw error
    return data || []
  })
  const { data:hist, loading:l3, refetch:r3 } = useQ(async () => {
    const { data, error } = await supabase.from('model_score_history').select('*').order('created_at', { ascending: false }).limit(20)
    if (error) throw error
    return data || []
  })
  const [running, setRunning] = useState(false)
  const [last, setLast] = useState(null)

  async function learn() {
    setRunning(true)
    try {
      const { data, error } = await supabase.rpc('router_learn')
      if (error) throw error
      setLast(data)
      await Promise.all([r1(),r2(),r3()])
    } catch(e) { alert(e.message) }
    finally { setRunning(false) }
  }

  if (l1||l2||l3) return <Spinner />
  const ms = models || []
  const ls = logs || []
  const pending = ls.filter(l => !l.learned).length
  const avgQ = ls.length ? Math.round(ls.reduce((s,l)=>s+Number(l.output_quality_score||0),0)/ls.length) : 0

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,margin:0}}>Router Learning</h1>
          <div style={{fontSize:13,color:'#888'}}>Scores self-tune from observed performance</div>
        </div>
        <Btn onClick={learn} disabled={running}>{running?'Learning...':'Run Learning'}</Btn>
      </div>
      {last && <Card style={{marginBottom:16,background:'#f0fff8',borderColor:'#bbf7d0'}}><div style={{fontSize:13,color:'#166534'}}>Learned. {last.pending_logs} logs pending.</div></Card>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
        <Stat label="Models" value={ms.length} />
        <Stat label="Logged Calls" value={ls.length} />
        <Stat label="Pending Learn" value={pending} warn={pending>0} />
        <Stat label="Avg Quality" value={avgQ} accent />
      </div>

      <Card style={{padding:0,overflow:'hidden',marginBottom:20}}>
        <div style={{padding:'14px 20px',borderBottom:'1px solid #e5e4de'}}><Label>Live Model Scores (post-learning)</Label></div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <TableHead cols={['Model','Provider','Specificity','Speed','Cost']} />
          <tbody>
            {ms.map((m,i)=>(
              <TR key={m.id} i={i}>
                <TD bold>{m.model_name}</TD>
                <TD color="#52514e">{m.provider}</TD>
                <TD bold color={scoreColor(m.specificity_score)}>{Number(m.specificity_score).toFixed(1)}</TD>
                <TD bold color={scoreColor(m.speed_score)}>{Number(m.speed_score).toFixed(1)}</TD>
                <TD bold color={scoreColor(m.cost_score)}>{Number(m.cost_score).toFixed(1)}</TD>
              </TR>
            ))}
          </tbody>
        </table>
      </Card>

      <Card style={{padding:0,overflow:'hidden',marginBottom:20}}>
        <div style={{padding:'14px 20px',borderBottom:'1px solid #e5e4de'}}><Label>Recent Routed Calls</Label></div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <TableHead cols={['Task','Model','Latency','Cost','Quality','OK','Learned']} />
          <tbody>
            {ls.map((l,i)=>(
              <TR key={l.id} i={i}>
                <TD color="#52514e">{l.task_type}</TD>
                <TD bold>{l.model_name}</TD>
                <TD color="#52514e">{l.observed_latency_ms}ms</TD>
                <TD color="#52514e">${Number(l.observed_cost_usd||0).toFixed(4)}</TD>
                <TD bold color={scoreColor(l.output_quality_score)}>{Number(l.output_quality_score||0).toFixed(0)}</TD>
                <TD color={l.succeeded?'#0ca30c':'#dc2626'}>{l.succeeded?'yes':'no'}</TD>
                <TD><Pill status={l.learned?'green':'medium'} label={l.learned?'yes':'pending'} /></TD>
              </TR>
            ))}
          </tbody>
        </table>
      </Card>

      <Card style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 20px',borderBottom:'1px solid #e5e4de'}}><Label>Score Drift History</Label></div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <TableHead cols={['Model','Spec','Speed','Cost','Samples','Reason']} />
          <tbody>
            {(hist||[]).map((h,i)=>(
              <TR key={h.id} i={i}>
                <TD bold>{h.model_name}</TD>
                <TD color="#52514e">{Number(h.specificity_score).toFixed(1)}</TD>
                <TD color="#52514e">{Number(h.speed_score).toFixed(1)}</TD>
                <TD color="#52514e">{Number(h.cost_score).toFixed(1)}</TD>
                <TD color="#52514e">{h.sample_size}</TD>
                <TD color="#888">{h.reason}</TD>
              </TR>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
