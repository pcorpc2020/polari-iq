import { useState, useEffect } from 'react'

// Simple visitor gate. Not bulletproof (password ships in the bundle),
// but it stops any casual visitor cold. Change PASSWORD to whatever you want.
const PASSWORD = 'polari2026'
const STORAGE_KEY = 'polari_gate_ok'

export default function PasswordGate({ children }) {
  const [ok, setOk] = useState(false)
  const [entry, setEntry] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === 'yes') setOk(true)
  }, [])

  function submit(e) {
    e.preventDefault()
    if (entry === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'yes')
      setOk(true)
    } else {
      setError(true)
      setEntry('')
    }
  }

  if (ok) return children

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0b0f14', fontFamily: 'system-ui,sans-serif'
    }}>
      <form onSubmit={submit} style={{
        background: '#111823', border: '1px solid #1e2a38', borderRadius: 14,
        padding: '40px 36px', width: 320, textAlign: 'center'
      }}>
        <div style={{ fontSize: 13, letterSpacing: '.18em', color: '#3aa0ff', marginBottom: 8, fontWeight: 700 }}>
          POLARI · IQ
        </div>
        <div style={{ fontSize: 14, color: '#7d8aa0', marginBottom: 24 }}>
          This site is private. Enter the password to continue.
        </div>
        <input
          type="password"
          value={entry}
          autoFocus
          onChange={e => { setEntry(e.target.value); setError(false) }}
          placeholder="Password"
          style={{
            width: '100%', padding: '11px 14px', borderRadius: 8, boxSizing: 'border-box',
            border: '1px solid ' + (error ? '#dc2626' : '#1e2a38'),
            background: '#0b0f14', color: '#e8edf4', fontSize: 14, marginBottom: 12
          }}
        />
        {error && <div style={{ color: '#dc2626', fontSize: 12, marginBottom: 12 }}>Incorrect password</div>}
        <button type="submit" style={{
          width: '100%', padding: '11px', borderRadius: 8, border: 'none',
          background: '#3aa0ff', color: '#04121f', fontSize: 14, fontWeight: 700, cursor: 'pointer'
        }}>
          Enter
        </button>
      </form>
    </div>
  )
}
