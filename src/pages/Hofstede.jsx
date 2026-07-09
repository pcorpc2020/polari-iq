import { useState } from 'react'
import { useQ } from '../hooks/useData.js'
import { supabase } from '../lib/supabase.js'
import { Card, Label, Spinner, Err, SectionHeader } from '../components/ui.jsx'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

const DIMS = [
  { key: 'power_distance', label: 'Power Distance' },
  { key: 'individualism', label: 'Individualism' },
  { key: 'motivation_achievement', label: 'Achievement' },
  { key: 'uncertainty_avoidance', label: 'Uncertainty Avoid.' },
  { key: 'long_term_orientation', label: 'Long-term' },
  { key: 'indulgence', label: 'Indulgence' },
]

export default function Hofstede() {
  const { data, loading, error, refetch } = useQ(async () => {
    const { data, error } = await supabase.from('hofstede_result').select('*')
    if (error) throw error
    return data || []
  })
  const [sel, setSel] = useState(null)
  if (loading) return <Spinner />
  if (error) return <Err msg={error} />
  const rows = data || []
  const detail = sel ? rows.find(r => r.id === sel) : (rows[0] || null)
  const radar = detail ? DIMS.map(d => ({ dim: d.label, v: Number(detail[d.key]||0) })) : []
  return (
    <div>
      <SectionHeader title="Cultural Fit - Hofstede" count={rows.length} onRefresh={refetch} />
      <div style={{fontSize:12,color:'#888',marginBottom:16}}>Six-dimension cultural profile. Higher power-distance score = more comfortable with flat teams.</div>
      <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:16}}>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {rows.map(r=>(
            <Card key={r.id} onClick={()=>setSel(r.id)} style={{background:(detail&&detail.id===r.id)?'#f0efec':'#fff',cursor:'pointer'}}>
              <div style={{fontWeight:600,fontSize:13,marginBottom:4}}>{r.candidate_name}</div>
              <div style={{fontSize:11,color:'#888'}}>PD {Number(r.power_distance).toFixed(0)} - IND {Number(r.individualism).toFixed(0)} - LTO {Number(r.long_term_orientation).toFixed(0)}</div>
            </Card>
          ))}
          {!rows.length && <Card style={{textAlign:'center',color:'#aaa',padding:'2rem'}}>No profiles yet.</Card>}
        </div>
        {detail && (
          <Card>
            <Label>{detail.candidate_name} - Cultural Profile</Label>
            <div style={{height:280,marginBottom:14}}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar} margin={{top:20,right:30,bottom:20,left:30}}>
                  <PolarGrid stroke="#e5e4de" />
                  <PolarAngleAxis dataKey="dim" tick={{fontSize:11,fill:'#52514e'}} />
                  <Radar dataKey="v" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.18} strokeWidth={2} />
                  <Tooltip contentStyle={{fontSize:12,borderRadius:7}} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:14}}>
              {DIMS.map(d=>(
                <div key={d.key} style={{background:'#f7f7f6',borderRadius:8,padding:'8px 10px'}}>
                  <div style={{fontSize:10,color:'#888',marginBottom:3}}>{d.label}</div>
                  <div style={{fontSize:18,fontWeight:700,color:'#8b5cf6'}}>{Number(detail[d.key]||0).toFixed(0)}</div>
                </div>
              ))}
            </div>
            {detail.summary && (
              <div style={{fontSize:12,color:'#52514e',background:'#faf5ff',borderRadius:8,padding:'10px 12px',lineHeight:1.5}}>{detail.summary}</div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
