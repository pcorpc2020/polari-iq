import { useState } from 'react'
import { useQ } from '../hooks/useData.js'
import { supabase } from '../lib/supabase.js'
import { scoreColor } from '../engine/iq.js'
import { Card, Label, Pill, Bar, Spinner, Err, SectionHeader, TableHead, TR, TD } from '../components/ui.jsx'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

export default function Assessments() {
  const { data, loading, error, refetch } = useQ(async () => {
    const { data, error } = await supabase.from('assessment_result').select('*').order('overall_fit_score', { ascending: false })
    if (error) throw error
    return data || []
  })
  const [sel, setSel] = useState(null)
  if (loading) return <Spinner />
  if (error) return <Err msg={error} />
  const rows = data || []
  const detail = sel ? rows.find(d => d.id === sel) : null
  const radar = detail ? [
    { dim: 'Knowledge', v: Number(detail.knowledge_score||0) },
    { dim: 'Skill', v: Number(detail.skill_score||0) },
    { dim: 'Behavior', v: Number(detail.behavior_score||0) },
    { dim: 'Project Fit', v: Number(detail.project_fit_score||0) },
    { dim: 'Client Fit', v: Number(detail.client_fit_score||0) },
  ] : []
  return (
    <div>
      <SectionHeader title="Assessment Intelligence" count={rows.length} onRefresh={refetch} />
      <div style={{display:'grid',gridTemplateColumns:detail?'1fr 320px':'1fr',gap:16}}>
        <Card style={{padding:0,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <TableHead cols={['Candidate','Assessment','Score','Knowledge','Skill','Behavior','Overall Fit','Status']} />
            <tbody>
              {rows.map((r,i)=>(
                <TR key={r.id} i={i} selected={sel===r.id} onClick={()=>setSel(sel===r.id?null:r.id)}>
                  <TD bold>{r.candidate_name}</TD>
                  <TD color="#52514e">{r.assessment_name}</TD>
                  <TD bold color={scoreColor(r.score)}>{r.score}</TD>
                  <TD color="#52514e">{Number(r.knowledge_score||0).toFixed(0)}</TD>
                  <TD color="#52514e">{Number(r.skill_score||0).toFixed(0)}</TD>
                  <TD color="#52514e">{Number(r.behavior_score||0).toFixed(0)}</TD>
                  <TD bold color={scoreColor(r.overall_fit_score)}>{Number(r.overall_fit_score||0).toFixed(1)}</TD>
                  <TD><Pill status={r.status} /></TD>
                </TR>
              ))}
            </tbody>
          </table>
        </Card>
        {detail && (
          <Card>
            <Label>{detail.candidate_name}</Label>
            <div style={{fontSize:13,color:'#52514e',marginBottom:12}}>{detail.assessment_name}</div>
            <div style={{height:200,marginBottom:14}}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar} margin={{top:12,right:18,bottom:12,left:18}}>
                  <PolarGrid stroke="#e5e4de" />
                  <PolarAngleAxis dataKey="dim" tick={{fontSize:10,fill:'#888'}} />
                  <Radar dataKey="v" stroke="#1baf7a" fill="#1baf7a" fillOpacity={0.18} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:'#888',marginBottom:5}}>OVERALL FIT</div>
              <div style={{fontWeight:700,fontSize:28,color:scoreColor(detail.overall_fit_score),marginBottom:5}}>{Number(detail.overall_fit_score||0).toFixed(1)}</div>
              <Bar value={Number(detail.overall_fit_score)} />
            </div>
            {detail.result_summary && (
              <div style={{fontSize:12,color:'#52514e',background:'#f7f7f6',borderRadius:8,padding:'10px 12px',lineHeight:1.5}}>{detail.result_summary}</div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
