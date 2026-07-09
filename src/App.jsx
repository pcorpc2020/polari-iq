import { useState } from 'react'
import Home from './pages/Home.jsx'
import CohesiveFit from './pages/CohesiveFit.jsx'
import Benchmark from './pages/Benchmark.jsx'
import Hofstede from './pages/Hofstede.jsx'
import Assessments from './pages/Assessments.jsx'
import Signals from './pages/Signals.jsx'
import Opportunities from './pages/Opportunities.jsx'
import MiniQueue from './pages/MiniQueue.jsx'
import Learning from './pages/Learning.jsx'
import ContentInbox from './pages/ContentInbox.jsx'
import Release from './pages/Release.jsx'
import { isLive } from './lib/supabase.js'

const NAV = [
  { id: 'home',    label: 'Command Center',  icon: '◎', desc: 'V1.5 Home' },
  { id: 'cohesive',label: 'Cohesive Fit',  icon: '◈', desc: 'Unified metric' },
  { id: 'bench',   label: 'Benchmark',     icon: '◎', desc: 'Gap analysis' },
  { id: 'hof',     label: 'Cultural Fit',  icon: '❖', desc: 'Hofstede' },
  { id: 'assess',  label: 'Assessments',   icon: '◑', desc: 'Fit scores' },
  { id: 'signals', label: 'Signals',         icon: '⚡', desc: 'Intelligence signals' },
  { id: 'opp',     label: 'Opportunities',   icon: '◈', desc: 'Impact + heatmap' },
  { id: 'mini',    label: 'Mini Queue',      icon: '▷', desc: 'Actions + triage' },
  { id: 'learn',   label: 'Learning',        icon: '⊙', desc: 'Assets + intake' },
  { id: 'inbox',   label: 'Content Inbox',   icon: '⊞', desc: 'Content command' },
  { id: 'release', label: 'Release',         icon: '🚀', desc: 'Readiness gate' },
]

const PAGES = { home: Home, cohesive: CohesiveFit, bench: Benchmark, hof: Hofstede, assess: Assessments, cohesive: CohesiveFit, signals: Signals, opp: Opportunities, mini: MiniQueue, learn: Learning, inbox: ContentInbox, release: Release }

export default function App() {
  const [page, setPage] = useState('home')
  const Page = PAGES[page]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f7f6' }}>
      <aside style={{ width: 228, background: '#fff', borderRight: '1px solid #e5e4de', flexShrink: 0, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #e5e4de' }}>
          <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em' }}>POLARI</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>PCorpCGig V1.5 Intelligence</div>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: isLive ? '#0ca30c' : '#d97706', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: isLive ? '#0ca30c' : '#d97706' }}>
              {isLive ? 'Live — Supabase' : 'Add ANON KEY'}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, paddingTop: 6 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '9px 18px', border: 'none', cursor: 'pointer', textAlign: 'left',
              background: page === n.id ? '#f0efec' : 'transparent',
              color: page === n.id ? '#0b0b0b' : '#52514e',
              borderLeft: `3px solid ${page === n.id ? '#0b0b0b' : 'transparent'}`,
              fontSize: 13, fontWeight: page === n.id ? 700 : 400,
              transition: 'background .15s',
            }}>
              <span style={{ fontSize: 14, opacity: 0.8, flexShrink: 0 }}>{n.icon}</span>
              <div>
                <div>{n.label}</div>
                {page !== n.id && <div style={{ fontSize: 10, color: '#aaa', marginTop: 1 }}>{n.desc}</div>}
              </div>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid #e5e4de', fontSize: 11, color: '#888' }}>
          <div style={{ fontWeight: 700, color: '#0b0b0b', marginBottom: 2 }}>NovaTiguer</div>
          <div>qurrar-engine@pcorpc.pro</div>
          <div style={{ marginTop: 8, fontWeight: 700, color: '#dc2626' }}>launch_ready = false</div>
          <div style={{ color: '#888' }}>IQ target ≥ 85</div>
          <div style={{ marginTop: 6, fontSize: 10, color: '#aaa' }}>Supabase: icfmkbxaszvspxltxmoh</div>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '32px 36px', maxWidth: 1140, overflow: 'auto' }}>
        <Page />
      </main>
    </div>
  )
}
