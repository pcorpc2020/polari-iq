import { useState } from 'react'
import { useQ } from '../hooks/useData.js'
import { supabase } from '../lib/supabase.js'
import { scoreColor } from '../engine/iq.js'
import { Card, Label, Pill, Spinner, Err, Stat, TableHead, TR, TD, Btn } from '../components/ui.jsx'

const MODE = { confident:'green', explore:'medium', unproven:'low' }
const RISK = { diversified:'green', moderate:'medium', high_dependence:'red' }

export default function RouterLearning() {
  const { data:routes, loading:l1, refetch:r1 } = useQ(async () => {
    const { data, error } = await supabase.from('vw_route_final').select('*')
    if (error) throw error
    return data || []
  })
  const { data:conc, loading:l2, refetch:r2 } = useQ(async () => {
    const { data, error } = await supabase.from('vw_provider_concentration').select('*')
    if (error) throw error
    return data || []
  })
  const { data:scores, loading:l3, refetch:r3 } = useQ(async () => {
    const { data, error } = await supabase.from('model_task_score').select('*').order('sample_size', { ascending: false })
    if (error) throw error
    return data || []
  })
  const [busy, setBusy] = useState(false)

  async function learn() {
    setBusy(true)
    try {
      const { error } = await supabase.rpc('router_learn_task')
      if (error) throw error
      await Promise.all([r1(),r2(),r3()])
    } catch(e) { alert(e.message) }
    finally { setBusy(false) }
  }

  if (l1||l2||l3) return <Spinner />
  const rt = routes || []
  const cn = conc || []
  const sc = scores || []
  const learned = rt.filter(r => r.score_source === 'task_learned').length
  const confident = rt.filter(r => r.route_mode === 'confident').length
  const topRisk = cn[0] || {}

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,margin:0}}>Router Learning</h1>
          <div style={{fontSize:13,color:'#888'}}>Per-task scores. Diversity enforced.</div>
        </div>
        <Btn onClick={learn} disabled={busy}>{busy?'Learning...':'Run Learning'}</Btn>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
        <Stat label="Routes" value={rt.length} />
        <Stat label="Evidence-Backed" value={learned} accent />
        <Stat label="Confident" value={confident} warn={confident===0} />
        <Stat label="Top Provider" value={(topRisk.pct_of_steps||0)+'%'} warn={topRisk.risk==='high_dependence'} />
      </div>

      <Card style={{marginBottom:20}}>
        <Label>Provider Concentration</Label>
        {cn.map(c=>(
          <div key={c.provider} style={{marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
              <span style={{color:'#52514e'}}>{c.provider} <span style={{color:'#aaa'}}>{c.steps_won} steps</span></span>
              <Pill status={RISK[c.risk]||'medium'} label={c.risk} />
            </div>
            <div style={{height:6,background:'#e5e4de',borderRadius:3}}>
              <div style={{height:6,width:c.pct_of_steps+'%',background:c.risk==='high_dependence'?'#dc2626':'#1baf7a',borderRadius:3}} />
            </div>
          </div>
        ))}
      </Card>

      <Card style={{padding:0,overflow:'hidden',marginBottom:20}}>
        <div style={{padding:'14px 20px',borderBottom:'1px solid #e5e4de'}}><Label>Final Routes (diversity-adjusted)</Label></div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <TableHead cols={['Step','Model','Provider','Raw','Adj','Source','N','Fallback','Margin','Mode']} />
          <tbody>
            {rt.map((r,i)=>(
              <TR key={i} i={i}>
                <TD bold>{r.loop_step}</TD>
                <TD bold color="#2a78d6">{r.primary_model}</TD>
                <TD color="#52514e">{r.primary_provider}</TD>
                <TD color="#aaa">{Number(r.raw_score).toFixed(1)}</TD>
                <TD bold color={scoreColor(r.adj_score)}>{Number(r.adj_score).toFixed(1)}</TD>
                <TD color={r.score_source==='task_learned'?'#0ca30c':'#aaa'}>{r.score_source==='task_learned'?'learned':'prior'}</TD>
                <TD color="#52514e">{r.samples}</TD>
                <TD color="#888">{r.fallback_model}</TD>
                <TD color="#52514e">{Number(r.margin).toFixed(1)}</TD>
                <TD><Pill status={MODE[r.route_mode]||'medium'} label={r.route_mode} /></TD>
              </TR>
            ))}
          </tbody>
        </table>
      </Card>

      <Card style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 20px',borderBottom:'1px solid #e5e4de'}}><Label>Per-Task Scorecards (evidence only)</Label></div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <TableHead cols={['Model','Task Type','Spec','Speed','Cost','Samples','Confidence']} />
          <tbody>
            {sc.map((s,i)=>(
              <TR key={s.id||i} i={i}>
                <TD bold>{s.model_name}</TD>
                <TD color="#52514e">{s.task_type}</TD>
                <TD bold color={scoreColor(s.specificity_score)}>{Number(s.specificity_score).toFixed(1)}</TD>
                <TD color="#52514e">{Number(s.speed_score).toFixed(1)}</TD>
                <TD color="#52514e">{Number(s.cost_score).toFixed(1)}</TD>
                <TD color="#52514e">{s.sample_size}</TD>
                <TD bold color={scoreColor(Number(s.confidence)*100)}>{(Number(s.confidence)*100).toFixed(0)}%</TD>
              </TR>
            ))}
            {!sc.length && <TR i={0}><TD color="#aaa">No task-specific evidence yet.</TD></TR>}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
