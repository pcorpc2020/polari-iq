import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

function useQ(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const run = useCallback(async () => {
    setLoading(true); setError(null)
    try { setData(await fn()) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, deps)
  useEffect(() => { run() }, [run])
  return { data, loading, error, refetch: run }
}

const q = async (view, opts = {}) => {
  let query = supabase.from(view).select('*')
  if (opts.order)  query = query.order(opts.order, { ascending: opts.asc ?? false })
  if (opts.limit)  query = query.limit(opts.limit)
  if (opts.single) query = query.limit(1).single()
  const { data, error } = await query
  if (error) throw error
  return data
}

// V1.5 Home — richest view, single row
export const useV15Home      = () => useQ(() => q('vw_app_pcorpcgig_v15_home', { single: true }))
// V1.5 Command — full pipeline row
export const useV15Command   = () => useQ(() => q('vw_app_pcorpcgig_v15_command', { single: true }))
// V1.5 Release readiness
export const useRelease      = () => useQ(() => q('vw_app_pcorpcgig_v15_release_readiness', { single: true }))
// System map — 8 modules
export const useSystemMap    = () => useQ(() => q('vw_app_pcorpcgig_system_map', { order: 'module', asc: true }))
// Impact command
export const useImpactCmd    = () => useQ(() => q('vw_polari_impact_command_center', { single: true }))
// Impact heatmap
export const useImpactHeat   = () => useQ(() => q('vw_polari_impact_heatmap'))
// IQ impact
export const useIQImpact     = () => useQ(() => q('vw_polari_intelligence_quality_impact', { single: true }))
// Metrics
export const useMetrics      = () => useQ(() => q('vw_polari_latest_metric_status', { order: 'release_priority', asc: true }))
// Mini queue
export const useMiniQueue    = () => useQ(() => q('vw_app_mini_queue', { order: 'expected_impact_score', limit: 30 }))
// Mini triage
export const useMiniTriage   = () => useQ(() => q('vw_app_mini_triage', { limit: 20 }))
// Learning command center
export const useLearningCmd  = () => useQ(() => q('vw_polari_learning_command_center', { limit: 20 }))
// Learning assets
export const useLearning     = () => useQ(() => q('vw_app_learning', { order: 'created_at', limit: 30 }))
// Learning intake bridge
export const useLearningBridge = () => useQ(() => q('vw_app_learning_intake_bridge', { limit: 20 }))
// Opportunities
export const useOpportunities= () => useQ(() => q('vw_app_opportunity', { order: 'urgency_score', limit: 20 }))
// Signals
export const useSignals      = () => useQ(() => q('vw_app_command_signal', { limit: 20 }))
// Content inbox
export const useContent      = () => useQ(() => q('vw_app_content_inbox', { order: 'created_at', limit: 20 }))
// Content command
export const useContentCmd   = () => useQ(() => q('vw_app_content_command', { limit: 20 }))

// ── Mutations ─────────────────────────────────────────────
export async function completeMini(id) {
  const { error } = await supabase.from('mini_action_queue')
    .update({ status: 'complete' }).eq('id', id)
  if (error) throw error
}

export async function addSignal(payload) {
  const { error } = await supabase.from('polari_intelligence_signal').insert(payload)
  if (error) throw error
}

export async function addLearningIntake(payload) {
  const { error } = await supabase.from('polari_learning_intake').insert(payload)
  if (error) throw error
}

export async function addContentInbox(payload) {
  const { error } = await supabase.from('pcorpc_content_inbox').insert(payload)
  if (error) throw error
}
