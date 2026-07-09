import { useState } from 'react'
import { useQ } from '../hooks/useData.js'
import { supabase } from '../lib/supabase.js'
import { scoreColor } from '../engine/iq.js'
import { Card, Pill, Spinner, Err, Stat, SectionHeader, TableHead, TR, TD } from '../components/ui.jsx'

export default function Benchmark() {
  const { data, loading, error, refetch } = useQ(async () => {
    const { data, error } = await supabase.from('vw_benchmark_gap').select('*').order('gap', { ascending: true })
    if (error) throw error
    return data || []
  })
  const [filter, setFilter] = useState('all')
  if (loading) return <Spinner />
  if (error) return <Err msg={error} />
  const rows = data || []
  const below = rows.filter(r => r.status === 'below')
  const meets = rows.filter(r => r.status === 'meets')
  const filtered = filter === 'below' ? below : filter === 'meets' ? meets : rows
  const avgGap = rows.length ? (rows.reduce((s, r) => s + Number(r.gap||0), 0)/rows.length).toFixed(1) : 0
  return (
    <div>
      <SectionHeader title="Benchmark Intelligence" count={rows.length} onRefresh={refetch} />
      <div style={{fontSize:12,color:'#888',marginBottom:16}}>Assessment scores vs per-vertical benchmark targets. Negative gap = below bar.</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
        <Stat label="Total Checks" value={rows.length} />
        <Stat label="Meets Bar" value={meets.length} accent />
        <Stat label="Below Bar" value={below.length} warn={below.length>0} />
        <Stat label="Avg Gap" value={avgGap} warn={Number(avgGap)<0} />
      </div>
      <div style={{display:'flex',gap:4,marginBottom:16}}>
        {[['all','All'],['below','Below Bar ('+below.length+')'],['meets','Meets Bar ('+meets.length+')']].map(([id,lbl])=>(
          <button key={id} onClick={()=>setFilter(id)} style={{fontSize:13,padding:'6px 16px',borderRadius:20,border:'1px solid',borderColor:filter===id?'#0b0b0b':'#e5e4de',background:filter===id?'#0b0b0b':'#fff',color:filter===id?'#fff':'#52514e',cursor:'pointer',fontWeight:600}}>{lbl}</button>
        ))}
      </div>
      <Card style={{padding:0,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <TableHead cols={['Candidate','Vertical','Benchmark','Dimension','Target','Actual','Gap','Status']} />
          <tbody>
            {filtered.map((r,i)=>(
              <TR key={i} i={i}>
                <TD bold>{r.candidate_name}</TD>
                <TD color="#52514e">{r.vertical}</TD>
                <TD color="#52514e">{r.benchmark_name}</TD>
                <TD color="#52514e">{r.dimension}</TD>
                <TD>{Number(r.target_score).toFixed(0)}</TD>
                <TD bold color={scoreColor(r.actual_score)}>{Number(r.actual_score).toFixed(1)}</TD>
                <TD bold color={Number(r.gap)>=0?'#0ca30c':'#dc2626'}>{Number(r.gap)>=0?'+':''}{Number(r.gap).toFixed(1)}</TD>
                <TD><Pill status={r.status==='meets'?'green':'red'} label={r.status} /></TD>
              </TR>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
