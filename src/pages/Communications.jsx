import { useQ } from '../hooks/useData.js'
import { supabase } from '../lib/supabase.js'
import { scoreColor } from '../engine/iq.js'
import { Card, Pill, Bar, Spinner, Err, Stat, SectionHeader } from '../components/ui.jsx'

export default function Communications() {
  const { data, loading, error, refetch } = useQ(async () => {
    const { data, error } = await supabase.from('communication_log').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  })
  if (loading) return <Spinner />
  if (error) return <Err msg={error} />
  const rows = data || []
  const total = rows.length
  const replied = rows.filter(c => c.response_received).length
  const rate = total ? Math.round((replied/total)*100) : 0
  const avg = total ? Math.round(rows.reduce((s,c)=>s+Number(c.intelligence_score||0),0)/total) : 0
  return (
    <div>
      <SectionHeader title="Communication Intelligence" count={total} onRefresh={refetch} />
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
        <Stat label="Total" value={total} />
        <Stat label="Replied" value={replied} accent />
        <Stat label="Response Rate" value={rate+'%'} warn={rate<50} />
        <Stat label="Avg Score" value={avg} />
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {rows.map((c,i)=>(
          <Card key={c.id||i}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                  <span style={{fontWeight:600,fontSize:13}}>{c.subject}</span>
                  <Pill status={c.direction==='outbound'?'medium':'low'} label={c.direction} />
                </div>
                <div style={{fontSize:12,color:'#888'}}>{c.entity_name} - {c.communication_type}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontWeight:700,fontSize:18,color:scoreColor(c.intelligence_score)}}>{Number(c.intelligence_score||0).toFixed(0)}</div>
                <div style={{fontSize:11,marginTop:3}}>
                  {c.response_received ? <span style={{color:'#0ca30c',fontWeight:600}}>replied</span> : <span style={{color:'#dc2626'}}>no reply</span>}
                </div>
              </div>
            </div>
            <Bar value={Number(c.intelligence_score||0)} height={4} />
          </Card>
        ))}
        {!total && <Card style={{textAlign:'center',color:'#aaa',padding:'3rem'}}>No communications logged.</Card>}
      </div>
    </div>
  )
}
