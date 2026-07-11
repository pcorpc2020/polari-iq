import { useState } from 'react'
import { useQ } from '../hooks/useData.js'
import { supabase } from '../lib/supabase.js'
import { Card, Label, Pill, Spinner, SectionHeader } from '../components/ui.jsx'

const WHERE_BADGE = {
  terminal: { label: 'terminal (bash)', color: '#2a78d6', hint: 'Paste into your Ubuntu terminal in ~/Projects/polari-iq' },
  sql: { label: 'SQL', color: '#8b5cf6', hint: 'Paste into Supabase SQL Editor — or paste to Claude to run it for you' },
}

export default function QuickFn() {
  const { data: fns, loading, refetch } = useQ(async () => {
    const { data, error } = await supabase.from('quick_function').select('*').order('sort_order')
    if (error) throw error
    return data || []
  })
  const [app, setApp] = useState('')
  const [fnId, setFnId] = useState('')
  const [vals, setVals] = useState({})
  const [copied, setCopied] = useState(false)

  if (loading) return <Spinner />
  const all = fns || []
  const apps = [...new Set(all.map(f => f.app))]
  const inApp = all.filter(f => f.app === app)
  const fn = all.find(f => String(f.id) === fnId)
  const params = fn ? (fn.params || []) : []

  const command = fn ? params.reduce(
    (cmd, p) => cmd.replaceAll('{{' + p.name + '}}', vals[p.name] || ('{{' + p.name + '}}')),
    fn.command_template
  ) : ''
  const ready = params.every(p => (vals[p.name] || '').trim().length > 0)
  const badge = fn ? (WHERE_BADGE[fn.run_where] || WHERE_BADGE.terminal) : null

  async function copy() {
    try { await navigator.clipboard.writeText(command); setCopied(true); setTimeout(() => setCopied(false), 1500) }
    catch { alert('Copy failed - select the text manually') }
  }

  return (
    <div>
      <SectionHeader title="Quick Functions" count={all.length} onRefresh={refetch} />
      <div style={{fontSize:12,color:'#888',marginBottom:16}}>
        Pick the app, pick the function, fill the blanks. Copy the command, run it, follow the next step. New functions are added with a single INSERT into quick_function - no rebuild.
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
        <div>
          <Label>1. App</Label>
          <select value={app} onChange={e => { setApp(e.target.value); setFnId(''); setVals({}) }}
            style={{width:'100%',fontSize:13,padding:'9px 10px',borderRadius:8,border:'1px solid #e5e4de',marginTop:6}}>
            <option value="">Select an app…</option>
            {apps.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <Label>2. Function</Label>
          <select value={fnId} onChange={e => { setFnId(e.target.value); setVals({}) }} disabled={!app}
            style={{width:'100%',fontSize:13,padding:'9px 10px',borderRadius:8,border:'1px solid #e5e4de',marginTop:6}}>
            <option value="">{app ? 'Select a function…' : 'Pick an app first'}</option>
            {inApp.map(f => <option key={f.id} value={f.id}>{f.fn_name}</option>)}
          </select>
        </div>
      </div>

      {fn && (
        <>
          <Card style={{marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
              <span style={{fontWeight:700,fontSize:14}}>{fn.fn_name}</span>
              <span style={{fontSize:10,fontWeight:700,color:'#fff',background:badge.color,borderRadius:10,padding:'3px 10px'}}>{badge.label}</span>
            </div>
            <div style={{fontSize:12,color:'#52514e'}}>{fn.purpose}</div>
            <div style={{fontSize:11,color:'#aaa',marginTop:4}}>{badge.hint}</div>
          </Card>

          {params.length > 0 && (
            <Card style={{marginBottom:14}}>
              <Label>3. Fill in</Label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10,marginTop:8}}>
                {params.map(p => (
                  <div key={p.name}>
                    <div style={{fontSize:11,color:'#888',marginBottom:3}}>{p.label}</div>
                    <input value={vals[p.name] || ''} placeholder={p.example}
                      onChange={e => setVals({...vals, [p.name]: e.target.value})}
                      style={{width:'100%',fontSize:12,padding:'8px 10px',borderRadius:7,border:'1px solid #e5e4de',boxSizing:'border-box'}} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card style={{marginBottom:14,background:'#1c1c1a'}}>
            <div style={{display:'flex',alignItems:'center',marginBottom:8}}>
              <Label style={{color:'#aaa'}}>4. Command</Label>
              <button onClick={copy} disabled={!ready}
                style={{marginLeft:'auto',fontSize:11,fontWeight:700,padding:'6px 16px',borderRadius:14,border:'none',cursor:ready?'pointer':'not-allowed',background:ready?'#1baf7a':'#3a3a38',color:'#fff'}}>
                {copied ? 'Copied ✓' : ready ? 'Copy' : 'Fill blanks first'}
              </button>
            </div>
            <pre style={{fontSize:11.5,color:'#7ee2b0',whiteSpace:'pre-wrap',wordBreak:'break-all',margin:0,fontFamily:'monospace'}}>{command}</pre>
          </Card>

          {fn.next_step && (
            <Card style={{background:'#f0f9ff',borderColor:'#bae6fd'}}>
              <Label>5. Then</Label>
              <div style={{fontSize:12.5,color:'#0c4a6e',marginTop:5}}>{fn.next_step}</div>
            </Card>
          )}
        </>
      )}
      {!fn && <Card style={{textAlign:'center',color:'#aaa',padding:'3rem'}}>Select an app and function above.</Card>}
    </div>
  )
}
