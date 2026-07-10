import { useState } from 'react'
import { useQ } from '../hooks/useData.js'
import { supabase } from '../lib/supabase.js'
import { scoreColor } from '../engine/iq.js'
import { Card, Label, Pill, Spinner, Err, Stat, SectionHeader } from '../components/ui.jsx'

const SCORES = [[0,'Useless','#dc2626'],[25,'Poor','#e8834a'],[50,'OK','#d97706'],[75,'Good','#1baf7a'],[100,'Excellent','#0ca30c']]

export default function Rating() {
  const { data:queue, loading:l1, refetch:r1 } = useQ(async () => {
    const { data, error } = await supabase.from('vw_rating_queue').select('*')
    if (error) throw error
    return data || []
  })
  const { data:ev, loading:l2, refetch:r2 } = useQ(async () => {
    const { data, error } = await supabase.from('vw_evidence_quality').select('*')
    if (error) throw error
    return data || []
  })
  const [busy, setBusy] = useState(null)

  async function rate(id, score) {
    setBusy(id)
    try {
      const { data, error } = await supabase.rpc('rate_agent_output', { p_log_id: id, p_score: score })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      await Promise.all([r1(), r2()])
    } catch(e) { alert(e.message) }
    finally { setBusy(null) }
  }

  if (l1||l2) return <Spinner />
  const q = queue || []
  const e = ev || []
  const totalEv = e.reduce((s,x)=>s+Number(x.effective_evidence||0),0)
  const humanEv = e.filter(x=>x.quality_source==='human').reduce((s,x)=>s+Number(x.effective_evidence||0),0)

  return (
    <div>
      <SectionHeader title="Human Rating" count={q.length} onRefresh={r1} />
      <div style={{fontSize:12,color:'#888',marginBottom:16}}>Your ratings carry trust 1.00. Auto-heuristic carries 0.20. Rate what matters.</div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
        <Stat label="Awaiting Rating" value={q.length} warn={q.length>20} />
        <Stat label="Effective Evidence" value={totalEv.toFixed(1)} />
        <Stat label="From Humans" value={humanEv.toFixed(1)} accent />
      </div>

      <Card style={{marginBottom:20}}>
        <Label>Evidence Quality — what the router actually knows</Label>
        {e.map(x=>(
          <div key={x.quality_source} style={{marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
              <span style={{color:'#52514e'}}>{x.quality_source} <span style={{color:'#aaa'}}>trust {x.trust}</span></span>
              <span style={{fontWeight:700}}>{x.rows} rows = <b style={{color:'#1baf7a'}}>{x.effective_evidence}</b> effective</span>
            </div>
            <div style={{height:5,background:'#e5e4de',borderRadius:3}}>
              <div style={{height:5,width:Math.min(100,Number(x.effective_evidence)*8)+'%',background:Number(x.trust)>=1?'#0ca30c':Number(x.trust)>=0.5?'#d97706':'#aaa',borderRadius:3}} />
            </div>
          </div>
        ))}
        {!e.length && <div style={{fontSize:12,color:'#aaa'}}>No rated evidence yet.</div>}
      </Card>

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {q.map(r=>(
          <Card key={r.id}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,flexWrap:'wrap'}}>
              <span style={{fontWeight:700,fontSize:13}}>{r.role_name}</span>
              <span style={{fontSize:12,color:'#2a78d6'}}>{r.model_name}</span>
              <span style={{fontSize:11,color:'#888'}}>{r.task_type} · wave {r.wave}</span>
              {r.dry_run && <Pill status="low" label="dry run" />}
              {!r.succeeded && <Pill status="red" label="failed" />}
              <div style={{marginLeft:'auto',fontSize:11,color:'#888'}}>
                {r.observed_latency_ms}ms · ${Number(r.observed_cost_usd||0).toFixed(5)}
              </div>
            </div>
            <div style={{fontSize:12,color:'#52514e',background:'#f7f7f6',borderRadius:8,padding:'10px 12px',marginBottom:10,whiteSpace:'pre-wrap',maxHeight:120,overflow:'auto'}}>
              {r.preview || '(no output)'}
            </div>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              <span style={{fontSize:11,color:'#888',marginRight:4}}>Rate:</span>
              {SCORES.map(([v,lbl,col])=>(
                <button key={v} onClick={()=>rate(r.id,v)} disabled={busy===r.id}
                  style={{fontSize:11,padding:'5px 12px',borderRadius:14,border:'1px solid '+col,background:'#fff',color:col,cursor:'pointer',fontWeight:600,opacity:busy===r.id?0.4:1}}>
                  {lbl}
                </button>
              ))}
              {r.output_quality_score!=null && <span style={{marginLeft:'auto',fontSize:11,color:'#aaa'}}>auto: {Number(r.output_quality_score).toFixed(0)}</span>}
            </div>
          </Card>
        ))}
        {!q.length && <Card style={{textAlign:'center',color:'#aaa',padding:'3rem'}}>Nothing to rate. Run the agents first.</Card>}
      </div>
    </div>
  )
}
