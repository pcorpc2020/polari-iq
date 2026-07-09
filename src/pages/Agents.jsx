import { useQ } from '../hooks/useData.js'
import { supabase } from '../lib/supabase.js'
import { scoreColor } from '../engine/iq.js'
import { Card, Label, Pill, Spinner, Err, Stat, SectionHeader } from '../components/ui.jsx'

const PC = { OpenAI:'#10a37f', Anthropic:'#d97706', Google:'#2a78d6', DeepSeek:'#8b5cf6', Mistral:'#e8834a', xAI:'#52514e', Microsoft:'#0ca30c' }

export default function Agents() {
  const { data, loading, error, refetch } = useQ(async () => {
    const { data, error } = await supabase.from('vw_agent_assignment').select('*')
    if (error) throw error
    return data || []
  })
  if (loading) return <Spinner />
  if (error) return <Err msg={error} />
  const rows = data || []
  const steps = [...new Set(rows.map(r => r.loop_step))]
  const provs = [...new Set(rows.map(r => r.agent_provider))]

  return (
    <div>
      <SectionHeader title="Multi-Agent Collaboration" count={rows.length} onRefresh={refetch} />
      <div style={{fontSize:12,color:'#888',marginBottom:16}}>Same wave = runs in parallel on different providers. Higher wave waits.</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
        <Stat label="Agents Deployed" value={rows.length} accent />
        <Stat label="Loop Steps" value={steps.length} />
        <Stat label="Providers Used" value={provs.length} />
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {steps.map(step => {
          const sr = rows.filter(r => r.loop_step === step)
          const waves = [...new Set(sr.map(r => r.wave))].sort()
          const par = (sr.length / waves.length).toFixed(2)
          return (
            <Card key={step}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                <span style={{fontWeight:700,fontSize:15}}>{step}</span>
                <span style={{fontSize:11,color:'#888'}}>{sr.length} agents / {waves.length} waves</span>
                <div style={{marginLeft:'auto'}}>
                  <Pill status={Number(par)>=1.5?'green':'medium'} label={par+'x parallel'} />
                </div>
              </div>
              {waves.map(w => {
                const wr = sr.filter(r => r.wave === w)
                return (
                  <div key={w} style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:8}}>
                    <div style={{width:60,fontSize:11,color:'#888',paddingTop:8,textAlign:'right'}}>
                      Wave {w}{wr.length>1?' ||':''}
                    </div>
                    <div style={{flex:1,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:8}}>
                      {wr.map((r,i)=>(
                        <div key={i} style={{background:'#f7f7f6',borderRadius:8,padding:'8px 10px',borderLeft:'3px solid '+(PC[r.agent_provider]||'#aaa')}}>
                          <div style={{fontSize:11,fontWeight:700,color:'#0b0b0b',marginBottom:2}}>{r.role_name}</div>
                          <div style={{fontSize:11,color:'#52514e'}}>{r.agent_model}</div>
                          <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                            <span style={{fontSize:9,color:PC[r.agent_provider]||'#888',fontWeight:600}}>{r.agent_provider}</span>
                            <span style={{fontSize:10,fontWeight:700,color:scoreColor(r.role_score)}}>{Number(r.role_score).toFixed(0)}</span>
                          </div>
                          {r.score_source==='task_learned' && <div style={{fontSize:8,color:'#0ca30c',marginTop:2}}>learned ({r.samples})</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
