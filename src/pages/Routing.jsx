import { useState } from 'react'
import { useQ } from '../hooks/useData.js'
import { supabase } from '../lib/supabase.js'
import { scoreColor } from '../engine/iq.js'
import { Card, Label, Pill, Bar, Spinner, Err, SectionHeader, TableHead, TR, TD } from '../components/ui.jsx'

export default function Routing() {
  const { data: models, loading: l1 } = useQ(async () => {
    const { data, error } = await supabase.from('model_registry').select('*').order('specificity_score', { ascending: false })
    if (error) throw error
    return data || []
  })
  const { data: winners, loading: l2, refetch } = useQ(async () => {
    const { data, error } = await supabase.from('vw_route_winner').select('*')
    if (error) throw error
    return data || []
  })
  const [spec, setSpec] = useState(50)
  const [speed, setSpeed] = useState(30)
  const [cost, setCost] = useState(20)

  if (l1 || l2) return <Spinner />
  const ms = models || []
  const total = spec + speed + cost || 1
  const ranked = [...ms].map(m => ({
    ...m,
    score: Math.round((m.specificity_score*spec + m.speed_score*speed + m.cost_score*cost) / total * 10) / 10
  })).sort((a,b) => b.score - a.score)

  return (
    <div>
      <SectionHeader title="Model Routing Emulator" count={ms.length} onRefresh={refetch} />
      <div style={{fontSize:12,color:'#888',marginBottom:16}}>Adjust weights to see which model wins. Emulator only - no API calls made.</div>

      <Card style={{marginBottom:20}}>
        <Label>Routing Weights</Label>
        {[['Specificity',spec,setSpec,'#1baf7a'],['Speed',speed,setSpeed,'#2a78d6'],['Cost',cost,setCost,'#d97706']].map(([lbl,val,set,col])=>(
          <div key={lbl} style={{marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:5}}>
              <span style={{color:'#52514e'}}>{lbl}</span>
              <span style={{fontWeight:700,color:col}}>{val}%</span>
            </div>
            <input type="range" min="0" max="100" value={val} onChange={e=>set(Number(e.target.value))} style={{width:'100%',accentColor:col}} />
          </div>
        ))}
      </Card>

      <Card style={{padding:0,overflow:'hidden',marginBottom:20}}>
        <div style={{padding:'14px 20px',borderBottom:'1px solid #e5e4de'}}><Label>Live Ranking</Label></div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <TableHead cols={['Rank','Model','Provider','Spec','Speed','Cost','Score']} />
          <tbody>
            {ranked.map((m,i)=>(
              <TR key={m.id} i={i}>
                <TD bold color={i===0?'#0ca30c':'#888'}>{i===0?'WINNER':i+1}</TD>
                <TD bold>{m.model_name}</TD>
                <TD color="#52514e">{m.provider}</TD>
                <TD color="#52514e">{Number(m.specificity_score).toFixed(0)}</TD>
                <TD color="#52514e">{Number(m.speed_score).toFixed(0)}</TD>
                <TD color="#52514e">{Number(m.cost_score).toFixed(0)}</TD>
                <TD bold color={scoreColor(m.score)}>{m.score.toFixed(1)}</TD>
              </TR>
            ))}
          </tbody>
        </table>
      </Card>

      <Card style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 20px',borderBottom:'1px solid #e5e4de'}}><Label>Configured Routes by Loop Step</Label></div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <TableHead cols={['Loop Step','Task Type','Routed Model','Provider','Score']} />
          <tbody>
            {(winners||[]).map((w,i)=>(
              <TR key={i} i={i}>
                <TD bold>{w.loop_step}</TD>
                <TD color="#52514e">{w.task_type}</TD>
                <TD bold color="#2a78d6">{w.model_name}</TD>
                <TD color="#52514e">{w.provider}</TD>
                <TD bold color={scoreColor(w.route_score)}>{Number(w.route_score).toFixed(1)}</TD>
              </TR>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
