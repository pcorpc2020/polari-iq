import { useState } from 'react'
import { useQ } from '../hooks/useData.js'
import { supabase } from '../lib/supabase.js'
import { scoreColor } from '../engine/iq.js'
import { Card, Label, Pill, Bar, Spinner, Err, SectionHeader } from '../components/ui.jsx'

function T({label,value,text,sub}) {
  return (
    <div style={{background:'#f7f7f6',borderRadius:8,padding:'8px 10px'}}>
      <div style={{fontSize:10,color:'#888'}}>{label}</div>
      {text ? <div style={{fontSize:12,fontWeight:700}}>{text}</div> : <div style={{fontSize:17,fontWeight:700,color:scoreColor(value)}}>{Number(value||0).toFixed(0)}</div>}
      {sub && <div style={{fontSize:9,color:'#aaa'}}>{sub}</div>}
    </div>
  )
}

export default function Relationships() {
  const { data, loading, error, refetch } = useQ(async () => {
    const { data, error } = await supabase.from('vw_relationship_360').select('*')
    if (error) throw error
    return data || []
  })
  const [sel, setSel] = useState(null)
  if (loading) return <Spinner />
  if (error) return <Err msg={error} />
  const rows = data || []
  const d = sel ? rows.find(x => x.id === sel) : null
  return (
    <div>
      <SectionHeader title="Relationship Intelligence" count={rows.length} onRefresh={refetch} />
      <div style={{display:'grid',gridTemplateColumns:d?'1fr 320px':'1fr',gap:16}}>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {rows.map(r=>(
            <Card key={r.id} onClick={()=>setSel(sel===r.id?null:r.id)} style={{background:sel===r.id?'#f0efec':'#fff',cursor:'pointer'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <span style={{fontWeight:700,fontSize:14}}>{r.client_name}</span>
                <span style={{color:'#aaa'}}>-</span>
                <span style={{fontWeight:600,fontSize:14,color:'#2a78d6'}}>{r.candidate_name}</span>
                <div style={{marginLeft:'auto'}}><Pill status={r.relationship_health} /></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:10}}>
                <T label="Relationship" value={r.relationship_score} />
                <T label="Opportunity" value={r.opportunity_score} />
                <T label="Fit" value={r.candidate_fit_score} sub={r.candidate_assessment} />
                <T label="Readiness" text={r.candidate_readiness_band} />
              </div>
              <div style={{fontSize:11,color:'#888'}}>{r.comm_count} sent - {r.comm_responses} replies</div>
            </Card>
          ))}
        </div>
        {d && (
          <Card>
            <Label>360 View</Label>
            <div style={{fontWeight:700,fontSize:14}}>{d.client_name}</div>
            <div style={{fontSize:13,color:'#2a78d6',marginBottom:14}}>{d.candidate_name}</div>
            {[['Relationship',d.relationship_score],['Trust',d.trust_score],['Engagement',d.engagement_score],['Opportunity',d.opportunity_score],['Influence',d.influence_score]].map(([k,v])=>(
              <div key={k} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                  <span style={{color:'#52514e'}}>{k}</span>
                  <span style={{fontWeight:700,color:scoreColor(v)}}>{v}</span>
                </div>
                <Bar value={Number(v)} height={4} />
              </div>
            ))}
            <div style={{fontSize:12,color:'#52514e',marginTop:12}}>Readiness: {d.candidate_readiness_band}</div>
            <div style={{fontSize:12,color:'#52514e'}}>Comms: {d.comm_count} sent, {d.comm_responses} replies</div>
          </Card>
        )}
      </div>
    </div>
  )
}
