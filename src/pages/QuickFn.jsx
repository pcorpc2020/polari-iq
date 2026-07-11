import { useState } from 'react'
import { useQ } from '../hooks/useData.js'
import { supabase } from '../lib/supabase.js'
import { Card, Label, Pill, Spinner, SectionHeader } from '../components/ui.jsx'

const WHERE = {
  terminal: { label: 'terminal', color: '#2a78d6', hint: 'Paste into your Ubuntu terminal in ~/Projects/polari-iq' },
  sql: { label: 'SQL', color: '#8b5cf6', hint: 'Runs against the database' },
}
const SAFE = {
  read_only:   { label: 'read-only', color: '#1baf7a', runnable: true },
  writes_data: { label: 'writes data', color: '#d97706', runnable: true },
  dangerous:   { label: 'dangerous', color: '#dc2626', runnable: true },
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
  const [confirm, setConfirm] = useState('')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)

  if (loading) return <Spinner />
  const all = fns || []
  const apps = [...new Set(all.map(f => f.app))]
  const inApp = all.filter(f => f.app === app)
  const fn = all.find(f => String(f.id) === fnId)
  const params = fn ? (fn.params || []) : []
  const command = fn ? params.reduce(
    (c, p) => c.replaceAll('{{' + p.name + '}}', vals[p.name] || ('{{' + p.name + '}}')),
    fn.command_template) : ''
  const ready = params.every(p => (vals[p.name] || '').trim().length > 0)
  const where = fn ? (WHERE[fn.run_where] || WHERE.terminal) : null
  const safe = fn ? (SAFE[fn.safety] || SAFE.writes_data) : null

  // A SQL function can be executed in-browser only if it's a single SELECT rpc.
  // Everything else stays copy-only. Dangerous requires typing the name.
  const canRunHere = fn && fn.run_where === 'sql' && ready
  const needsType = fn && fn.safety === 'dangerous'
  const confirmed = !needsType || confirm.trim() === fn.fn_name

  function reset() { setResult(null); setConfirm('') }
  async function copy() {
    try { await navigator.clipboard.writeText(command); setCopied(true); setTimeout(() => setCopied(false), 1500) }
    catch { alert('Copy failed — select manually') }
  }
  async function runHere() {
    if (!confirmed) return
    setBusy(true); setResult(null)
    try {
      // only read_only + writes_data SELECT-style get executed; dangerous stays copy-only in-browser
      const { data, error } = await supabase.rpc('exec_quick_read', { p_sql: command })
      if (error) throw error
      setResult({ ok: true, data })
    } catch (e) { setResult({ ok: false, error: e.message }) }
    finally { setBusy(false) }
  }

  return (
    <div>
      <SectionHeader title="Quick Functions" count={all.length} onRefresh={refetch} />
      <div style={{fontSize:12,color:'#888',marginBottom:16}}>
        App → function → fill blanks → copy or run. Logic lives in the database, not the browser — the router, agents, and eval harness all call the same functions. New ones: one INSERT, no rebuild.
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
        <div>
          <Label>1. App</Label>
          <select value={app} onChange={e => { setApp(e.target.value); setFnId(''); setVals({}); reset() }}
            style={{width:'100%',fontSize:13,padding:'9px 10px',borderRadius:8,border:'1px solid #e5e4de',marginTop:6}}>
            <option value="">Select an app…</option>
            {apps.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <Label>2. Function</Label>
          <select value={fnId} onChange={e => { setFnId(e.target.value); setVals({}); reset() }} disabled={!app}
            style={{width:'100%',fontSize:13,padding:'9px 10px',borderRadius:8,border:'1px solid #e5e4de',marginTop:6}}>
            <option value="">{app ? 'Select…' : 'Pick an app first'}</option>
            {inApp.map(f => <option key={f.id} value={f.id}>{f.fn_name}</option>)}
          </select>
        </div>
      </div>

      {fn && (
        <>
          <Card style={{marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,flexWrap:'wrap'}}>
              <span style={{fontWeight:700,fontSize:14}}>{fn.fn_name}</span>
              <span style={{fontSize:10,fontWeight:700,color:'#fff',background:where.color,borderRadius:10,padding:'3px 10px'}}>{where.label}</span>
              <span style={{fontSize:10,fontWeight:700,color:'#fff',background:safe.color,borderRadius:10,padding:'3px 10px'}}>{safe.label}</span>
            </div>
            <div style={{fontSize:12,color:'#52514e'}}>{fn.purpose}</div>
            <div style={{fontSize:11,color:'#aaa',marginTop:4}}>{where.hint}</div>
          </Card>

          {params.length > 0 && (
            <Card style={{marginBottom:14}}>
              <Label>3. Fill in</Label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10,marginTop:8}}>
                {params.map(p => (
                  <div key={p.name}>
                    <div style={{fontSize:11,color:'#888',marginBottom:3}}>{p.label}</div>
                    <input value={vals[p.name] || ''} placeholder={p.example}
                      onChange={e => { setVals({...vals, [p.name]: e.target.value}); reset() }}
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
                style={{marginLeft:'auto',fontSize:11,fontWeight:700,padding:'6px 16px',borderRadius:14,border:'none',cursor:ready?'pointer':'not-allowed',background:ready?'#3a3a38':'#2a2a28',color:'#fff'}}>
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
            <pre style={{fontSize:11.5,color:'#7ee2b0',whiteSpace:'pre-wrap',wordBreak:'break-all',margin:0,fontFamily:'monospace'}}>{command}</pre>
          </Card>

          {canRunHere && (
            <Card style={{marginBottom:14,background:fn.safety==='dangerous'?'#fff5f5':'#f0fff8',borderColor:fn.safety==='dangerous'?'#fecaca':'#bbf7d0'}}>
              <Label>Run here</Label>
              {fn.safety==='read_only' && <div style={{fontSize:11,color:'#166534',margin:'4px 0 8px'}}>Read-only. Safe to run.</div>}
              {fn.safety==='writes_data' && <div style={{fontSize:11,color:'#92400e',margin:'4px 0 8px'}}>This writes data. Reversible, but review the command first.</div>}
              {needsType && (
                <div style={{margin:'4px 0 8px'}}>
                  <div style={{fontSize:11,color:'#991b1b',marginBottom:5,fontWeight:600}}>⚠ Dangerous — real money or live switches. Type <b>{fn.fn_name}</b> to confirm:</div>
                  <input value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder={fn.fn_name}
                    style={{width:'100%',fontSize:12,padding:'8px 10px',borderRadius:7,border:'1px solid #fecaca',boxSizing:'border-box'}} />
                </div>
              )}
              <button onClick={runHere} disabled={busy || !confirmed}
                style={{fontSize:12,fontWeight:700,padding:'8px 20px',borderRadius:8,border:'none',cursor:(busy||!confirmed)?'not-allowed':'pointer',background:confirmed?(fn.safety==='dangerous'?'#dc2626':'#1baf7a'):'#ccc',color:'#fff'}}>
                {busy ? 'Running…' : 'Execute'}
              </button>
              {result && (
                <pre style={{fontSize:11,marginTop:10,background:result.ok?'#f7f7f6':'#fef2f2',color:result.ok?'#333':'#991b1b',padding:10,borderRadius:6,overflow:'auto',maxHeight:200,whiteSpace:'pre-wrap'}}>
                  {result.ok ? JSON.stringify(result.data, null, 2) : result.error}
                </pre>
              )}
            </Card>
          )}

          {fn.next_step && (
            <Card style={{background:'#f0f9ff',borderColor:'#bae6fd'}}>
              <Label>5. Then</Label>
              <div style={{fontSize:12.5,color:'#0c4a6e',marginTop:5}}>{fn.next_step}</div>
            </Card>
          )}
        </>
      )}
      {!fn && <Card style={{textAlign:'center',color:'#aaa',padding:'3rem'}}>Select an app and function.</Card>}
    </div>
  )
}
