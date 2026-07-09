import { useState } from 'react'
import { useQ } from '../hooks/useData.js'
import { supabase } from '../lib/supabase.js'
import { scoreColor, iqBand } from '../engine/iq.js'
import { Card, Label, Pill, Bar, Spinner, Err, Stat, SectionHeader, TableHead, TR, TD, Btn } from '../components/ui.jsx'

const STAGES = [
  { key:'signals', label:'Signal', color:'#2a78d6' },
  { key:'readiness', label:'Readiness', color:'#5b8def' },
  { key:'opportunities', label:'Opportunity', color:'#1baf7a' },
  { key:'top_actions', label:'Top Action', color:'#d97706' },
  { key:'mini_tasks', label:'Mini Task', color:'#e8834a' },
  { key:'completed', label:'Completed', color:'#0ca30c' },
  { key:'learnings', label:'Learning', color:'#8b5cf6' },
]

export default function Loop() {
  const { data:iq, loading:l1, refetch:r1 } = useQ(async () => {
    const { data, error } = await supabase.from('vw_loop_iq').select('*').maybeSingle()
    if (error) throw error
    return data
  })
  const { data:funnel, loading:l2, refetch:r2 } = useQ(async () => {
    const { data, error } = await supabase.from('vw_loop_funnel').select('*').maybeSingle()
    if (error) throw error
    return data
  })
  const { data:trace, loading:l3, refetch:r3 } = useQ(async () => {
    const { data, error } = await supabase.from('vw_loop_trace').select('*').limit(30)
    if (error) throw error
    return data || []
  })
  const [running, setRunning] = useState(false)
  const [last, setLast] = useState(null)

  async function run() {
    setRunning(true)
    try {
      const { data, error } = await supabase.rpc('run_intelligence_loop')
      if (error) throw error
      setLast(data)
      await Promise.all([r1(),r2(),r3()])
    } catch(e) { alert(e.message) }
    finally { setRunning(false) }
  }

  if (l1||l2||l3) return <Spinner />
  const score = Number(iq?.iq_score||0)
  const band = iqBand(score)
  const max = Math.max(...STAGES.map(s=>Number(funnel?.[s.key]||0)),1)

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,margin:0}}>Intelligence Loop</h1>
          <div style={{fontSize:13,color:'#888'}}>Signal to Learning - live</div>
        </div>
        <Btn onClick={run} disabled={running}>{running?'Running...':'Run Loop'}</Btn>
      </div>
      {last && <Card style={{marginBottom:16,background:'#f0fff8',borderColor:'#bbf7d0'}}><div style={{fontSize:13,color:'#166534'}}>Loop ran - IQ now {Number(last.iq).toFixed(1)}</div></Card>}
      <div style={{display:'grid',gridTemplateColumns:'200px 1fr',gap:12,marginBottom:20}}>
        <Card>
          <Label>Loop IQ</Label>
          <div style={{display:'flex',alignItems:'baseline',gap:6,marginBottom:6}}>
            <span style={{fontSize:42,fontWeight:700,color:band.color,lineHeight:1}}>{score.toFixed(1)}</span>
            <span style={{fontSize:16,color:'#aaa'}}>/100</span>
          </div>
          <div style={{fontSize:13,fontWeight:600,color:band.color,marginBottom:10}}>{band.label}</div>
          <Bar value={score} />
          <div style={{fontSize:11,color:'#888',marginTop:8}}>Learning weighted 3x</div>
        </Card>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10}}>
          <Stat label="Signal" value={Number(iq?.signal_accuracy||0).toFixed(0)} />
          <Stat label="Readiness" value={Number(iq?.readiness_quality||0).toFixed(0)} />
          <Stat label="Opportunity" value={Number(iq?.opportunity_quality||0).toFixed(0)} />
          <Stat label="Top Action" value={Number(iq?.top_action_quality||0).toFixed(0)} />
          <Stat label="Learning 3x" value={Number(iq?.learning_quality||0).toFixed(0)} accent />
        </div>
      </div>
      <Card style={{marginBottom:20}}>
        <Label>Loop Funnel</Label>
        {STAGES.map(s=>{
          const c = Number(funnel?.[s.key]||0)
          const pct = (c/max)*100
          return (
            <div key={s.key} style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
              <div style={{width:90,fontSize:12,color:'#52514e',textAlign:'right'}}>{s.label}</div>
              <div style={{flex:1,height:26,background:'#f2f1ee',borderRadius:6,position:'relative'}}>
                <div style={{height:'100%',width:pct+'%',background:s.color,borderRadius:6,minWidth:c>0?28:0}} />
                <span style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',fontSize:12,fontWeight:700,color:'#fff'}}>{c}</span>
              </div>
            </div>
          )
        })}
      </Card>
      <Card style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 20px',borderBottom:'1px solid #e5e4de'}}><Label>Loop Trace</Label></div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:800}}>
            <TableHead cols={['Entity','Vertical','Signal','Str','Readiness','Opp','Mini','Out','Lesson']} />
            <tbody>
              {(trace||[]).map((r,i)=>(
                <TR key={i} i={i}>
                  <TD bold>{r.entity_name}</TD>
                  <TD color="#52514e">{r.vertical||'-'}</TD>
                  <TD color="#52514e">{(r.signal_name||'').slice(0,18)}</TD>
                  <TD bold color={scoreColor(r.signal_strength)}>{Number(r.signal_strength||0).toFixed(0)}</TD>
                  <TD><Pill status={r.readiness_band} /></TD>
                  <TD bold color={scoreColor(r.opportunity_score)}>{Number(r.opportunity_score||0).toFixed(0)}</TD>
                  <TD><Pill status={r.mini_status||'open'} /></TD>
                  <TD bold color={scoreColor(r.outcome_score)}>{r.outcome_score?Number(r.outcome_score).toFixed(0):'-'}</TD>
                  <TD color="#52514e">{(r.lesson||'').slice(0,24)}</TD>
                </TR>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
