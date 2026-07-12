import { useState } from 'react'
import { useQ } from '../hooks/useData.js'
import { supabase } from '../lib/supabase.js'
import { scoreColor, iqBand } from '../engine/iq.js'
import { Card, Label, Pill, Spinner, Err, Stat, SectionHeader, TableHead, TR, TD } from '../components/ui.jsx'

const COMPONENTS = [
  { key: 'assessment_fit', label: 'Assessment', weight: '40%', color: '#1baf7a' },
  { key: 'benchmark_clearance', label: 'Benchmark', weight: '20%', color: '#2a78d6' },
  { key: 'cultural_fit', label: 'Cultural', weight: '20%', color: '#8b5cf6' },
  { key: 'mbti_role_fit', label: 'MBTI Role', weight: '20%', color: '#d97706' },
]

export default function CohesiveFit() {
  const { data, loading, error, refetch } = useQ(async () => {
    const { data, error } = await supabase.from('vw_cohesive_fit').select('*').order('cohesive_fit_score', { ascending: false })
    if (error) throw error
    return data || []
  })
  const [sel, setSel] = useState(null)
  if (loading) return <Spinner />
  if (error) return <Err msg={error} />
  const rows = data || []
  const detail = sel ? rows.find(r => r.candidate_name === sel) : null
  const ready = rows.filter(r => r.fit_band === 'launch_ready').length
  const avg = rows.length ? (rows.reduce((s, r) => s + Number(r.cohesive_fit_score||0), 0)/rows.length).toFixed(1) : 0
  return (
    <div>
      <SectionHeader title="Cohesive Fit Metric" count={rows.length} onRefresh={refetch} />
      <div style={{fontSize:12,color:'#888',marginBottom:16}}>Assessment 40% + Benchmark 20% + Cultural 20% + MBTI 20%.</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
        <Stat label="Scored" value={rows.length} />
        <Stat label="Launch Ready" value={ready} accent />
        <Stat label="Avg Fit" value={avg} />
      </div>
      <div style={{display:'grid',gridTemplateColumns:detail?'1fr 320px':'1fr',gap:16}}>
        <Card style={{padding:0,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <TableHead cols={['Candidate','Vertical','MBTI','Assess','Bench','Culture','Role','Cohesive','Band']} />
            <tbody>
              {rows.map((r,i)=>(
                <TR key={i} i={i} selected={sel===r.candidate_name} onClick={()=>setSel(sel===r.candidate_name?null:r.candidate_name)}>
                  <TD bold>{r.candidate_name}</TD>
                  <TD color="#52514e">{r.vertical}</TD>
                  <TD color="#8b5cf6" bold>{r.mbti_type||'-'}</TD>
                  <TD color="#52514e">{Number(r.assessment_fit||0).toFixed(0)}</TD>
                  <TD color="#52514e">{Number(r.benchmark_clearance||0).toFixed(0)}</TD>
                  <TD color="#52514e">{Number(r.cultural_fit||0).toFixed(0)}</TD>
                  <TD color="#52514e">{Number(r.mbti_role_fit||0).toFixed(0)}</TD>
                  <TD bold color={scoreColor(r.cohesive_fit_score)}>{Number(r.cohesive_fit_score||0).toFixed(1)}</TD>
                  <TD><Pill status={r.fit_band==='launch_ready'?'green':r.fit_band==='strong'?'baseline':'medium'} label={r.fit_band} /></TD>
                </TR>
              ))}
            </tbody>
          </table>
        </Card>
        {detail && (
          <Card>
            <Label>{detail.candidate_name}</Label>
            <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:4}}>
              <span style={{fontSize:40,fontWeight:700,color:iqBand(detail.cohesive_fit_score).color,lineHeight:1}}>{Number(detail.cohesive_fit_score||0).toFixed(1)}</span>
              <span style={{fontSize:15,color:'#aaa'}}>/100</span>
            </div>
            <div style={{marginBottom:16}}>
              <Pill status={detail.fit_band==='launch_ready'?'green':'baseline'} label={detail.fit_band} />
              {detail.mbti_type && <span style={{marginLeft:8,fontWeight:700,color:'#8b5cf6'}}>{detail.mbti_type}</span>}
            </div>
            {COMPONENTS.map(c=>{
              const v=Number(detail[c.key]||0)
              return (
                <div key={c.key} style={{marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                    <span style={{color:'#52514e'}}>{c.label} <span style={{color:'#aaa',fontSize:10}}>{c.weight}</span></span>
                    <span style={{fontWeight:700,color:c.color}}>{v.toFixed(0)}</span>
                  </div>
                  <div style={{height:5,background:'#e5e4de',borderRadius:3}}>
                    <div style={{height:5,width:v+'%',background:c.color,borderRadius:3}} />
                  </div>
                </div>
              )
            })}
          </Card>
        )}
      </div>
    </div>
  )
}
