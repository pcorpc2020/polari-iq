import { useState, useEffect } from 'react'
import { useQ } from '../hooks/useData.js'
import { supabase } from '../lib/supabase.js'
import { scoreColor } from '../engine/iq.js'
import { Card, Label, Pill, Spinner, Err, Stat, SectionHeader, Btn } from '../components/ui.jsx'

const PC = { OpenAI:'#10a37f', Anthropic:'#d97706', Google:'#2a78d6', DeepSeek:'#8b5cf6', Mistral:'#e8834a' }
const QS = { human:'#0ca30c', ground_truth:'#1baf7a', critic_rated:'#d97706', auto_heuristic:'#aaa', unrated:'#ccc' }

function Agent({ a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{background:'#fff',border:'1px solid #e5e4de',borderLeft:'3px solid '+(PC[a.provider]||'#aaa'),borderRadius:8,padding:'10px 12px'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,flexWrap:'wrap'}}>
        <span style={{fontWeight:700,fontSize:12}}>{a.role_name}</span>
        <span style={{fontSize:12,color:PC[a.provider]||'#888'}}>{a.model_name}</span>
        {!a.succeeded && <Pill status="red" label="failed" />}
        <div style={{marginLeft:'auto',display:'flex',gap:10,fontSize:10,color:'#888'}}>
          <span>{a.observed_latency_ms}ms</span>
          <span>${Number(a.observed_cost_usd||0).toFixed(5)}</span>
          {a.output_quality_score!=null && (
            <span style={{fontWeight:700,color:scoreColor(a.output_quality_score)}}>
              {Number(a.output_quality_score).toFixed(0)}
            </span>
          )}
          <span style={{color:QS[a.quality_source]||'#ccc',fontWeight:600}}>{a.quality_source}</span>
        </div>
      </div>
      {a.error_text && <div style={{fontSize:11,color:'#dc2626',marginBottom:6}}>{a.error_text.slice(0,160)}</div>}
      {a.output_text && (
        <>
          <button onClick={()=>setOpen(!open)} style={{fontSize:10,color:'#2a78d6',background:'none',border:'none',cursor:'pointer',padding:0,marginBottom:4}}>
            {open?'hide':'show'} output
          </button>
          {open && (
            <pre style={{fontSize:11,background:'#f7f7f6',padding:10,borderRadius:6,overflow:'auto',maxHeight:220,whiteSpace:'pre-wrap',margin:0}}>
              {a.output_text}
            </pre>
          )}
        </>
      )}
    </div>
  )
}

export default function Runs() {
  const { data:runs, loading:l1, refetch:r1 } = useQ(async () => {
    const { data, error } = await supabase.from('vw_agent_runs').select('*')
    if (error) throw error; return data || []
  })
  const { data:cases } = useQ(async () => {
    const { data, error } = await supabase.from('sql_eval_case').select('id,question,discriminating')
    if (error) throw error; return data || []
  })
  const [sel, setSel] = useState(null)
  const [agents, setAgents] = useState([])
  const [caseId, setCaseId] = useState('')
  const [busy, setBusy] = useState(false)
  const [graded, setGraded] = useState(null)

  async function loadAgents(id) {
    setSel(id); setGraded(null)
    const { data } = await supabase.from('routing_log').select('*').eq('run_id', id).order('wave').order('role_name')
    setAgents(data || [])
  }
  async function grade() {
    if (!caseId) return alert('Pick an eval case first')
    setBusy(true)
    try {
      const { data, error } = await supabase.rpc('fn_grade_run', { p_run_id: sel, p_case_id: Number(caseId) })
      if (error) throw error
      setGraded(data || [])
      await loadAgents(sel); await r1()
    } catch(e) { alert(e.message) } finally { setBusy(false) }
  }

  if (l1) return <Spinner />
  const rs = runs || []
  const run = rs.find(r => r.id === sel)
  const waves = [...new Set(agents.map(a => a.wave))].sort((a,b)=>a-b)
  const hasCoder = agents.some(a => a.role_name === 'coder')

  return (
    <div>
      <SectionHeader title="Agent Runs" count={rs.length} onRefresh={r1} />
      <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:16}}>
        <div style={{display:'flex',flexDirection:'column',gap:8,maxHeight:640,overflowY:'auto'}}>
          {rs.map(r=>(
            <Card key={r.id} onClick={()=>loadAgents(r.id)} style={{background:sel===r.id?'#f0efec':'#fff',cursor:'pointer',padding:'10px 12px'}}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                <span style={{fontWeight:700,fontSize:12}}>{r.task_type}</span>
                {r.dry_run && <Pill status="low" label="dry" />}
                <Pill status={r.status==='complete'?'green':r.status==='failed'?'red':'medium'} label={r.status} />
              </div>
              <div style={{fontSize:11,color:'#888'}}>
                {r.agents_run} agents · {r.agents_failed} failed · {r.total_latency_ms}ms · ${Number(r.total_cost_usd||0).toFixed(4)}
              </div>
              <div style={{fontSize:10,color:'#aaa',marginTop:3}}>{new Date(r.started_at).toLocaleString()}</div>
            </Card>
          ))}
          {!rs.length && <Card style={{textAlign:'center',color:'#aaa',padding:'2rem'}}>No runs yet.</Card>}
        </div>

        <div>
          {!run && <Card style={{textAlign:'center',color:'#aaa',padding:'4rem'}}>Select a run.</Card>}
          {run && (
            <>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
                <Stat label="Agents" value={run.agents_run} />
                <Stat label="Failed" value={run.agents_failed} warn={run.agents_failed>0} />
                <Stat label="Latency" value={run.total_latency_ms+'ms'} />
                <Stat label="Cost" value={'$'+Number(run.total_cost_usd||0).toFixed(4)} />
              </div>

              {hasCoder && (
                <Card style={{marginBottom:16,background:'#f0fff8',borderColor:'#bbf7d0'}}>
                  <Label>Grade against ground truth</Label>
                  <div style={{display:'flex',gap:8,alignItems:'center',marginTop:8}}>
                    <select value={caseId} onChange={e=>setCaseId(e.target.value)}
                      style={{flex:1,fontSize:12,padding:'7px 10px',borderRadius:7,border:'1px solid #e5e4de'}}>
                      <option value="">Pick an eval case…</option>
                      {(cases||[]).map(c=>(
                        <option key={c.id} value={c.id}>{c.discriminating?'':'[control] '}{c.question}</option>
                      ))}
                    </select>
                    <Btn onClick={grade} disabled={busy} small>{busy?'Grading…':'Grade'}</Btn>
                  </div>
                  {graded && graded.map((g,i)=>(
                    <div key={i} style={{fontSize:11,marginTop:8,color:'#166534'}}>
                      <b>{g.model}</b> → {Number(g.score).toFixed(0)}/100 {g.extracted?'':'(no SQL found)'}
                    </div>
                  ))}
                </Card>
              )}

              {waves.map(w=>{
                const wa = agents.filter(a=>a.wave===w)
                return (
                  <div key={w} style={{marginBottom:16}}>
                    <div style={{fontSize:11,color:'#888',marginBottom:8,textTransform:'uppercase',letterSpacing:'.06em'}}>
                      Wave {w} {wa.length>1 && <span style={{color:'#1baf7a'}}>· {wa.length} in parallel</span>}
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:8}}>
                      {wa.map(a=><Agent key={a.id} a={a} />)}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
