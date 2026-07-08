export const LOOP_STEPS = [
  { key: 'signal',        label: 'Signal',        weight: 1 },
  { key: 'readiness',     label: 'Readiness',     weight: 1 },
  { key: 'opportunity',   label: 'Opportunity',   weight: 1 },
  { key: 'top_action',    label: 'Top Action',    weight: 1 },
  { key: 'mini_task',     label: 'Mini Task',     weight: 1 },
  { key: 'communication', label: 'Communication', weight: 1 },
  { key: 'outcome',       label: 'Outcome',       weight: 3 },
  { key: 'learning',      label: 'Learning',      weight: 3 },
]
export const TOTAL_WEIGHT = 12

export const calcIQ = (scores) =>
  Math.round(LOOP_STEPS.reduce((s, st) => s + (Number(scores?.[st.key]) || 0) * st.weight, 0) / TOTAL_WEIGHT * 10) / 10

export const iqBand = (v) => {
  v = Number(v)
  if (v >= 85) return { label: 'Launch Ready',  color: '#0ca30c', bg: '#eaf3de', ring: '#b8e0a0' }
  if (v >= 70) return { label: 'Good',          color: '#1baf7a', bg: '#e1f5ee', ring: '#9fe0c8' }
  if (v >= 55) return { label: 'Developing',    color: '#d97706', bg: '#fef3c7', ring: '#fcd34d' }
  if (v >= 40) return { label: 'Needs Work',    color: '#ea580c', bg: '#ffedd5', ring: '#fdba74' }
  return              { label: 'Critical',      color: '#dc2626', bg: '#fee2e2', ring: '#fca5a5' }
}

export const scoreColor = (v) => {
  v = Number(v)
  if (v >= 70) return '#0ca30c'
  if (v >= 55) return '#d97706'
  return '#dc2626'
}

export const statusColor = (s) => ({
  open:              { bg: '#dbeafe', fg: '#1e40af' },
  complete:          { bg: '#dcfce7', fg: '#166534' },
  high:              { bg: '#fee2e2', fg: '#991b1b' },
  medium:            { bg: '#fef3c7', fg: '#92400e' },
  low:               { bg: '#f1f5f9', fg: '#475569' },
  baseline:          { bg: '#ede9fe', fg: '#5b21b6' },
  not_started:       { bg: '#fee2e2', fg: '#991b1b' },
  red:               { bg: '#fee2e2', fg: '#991b1b' },
  green:             { bg: '#dcfce7', fg: '#166534' },
  READY_FOR_UI_REVIEW:{ bg: '#dbeafe', fg: '#1e40af' },
  routed_to_mini:    { bg: '#dcfce7', fg: '#166534' },
  lesson_created:    { bg: '#ede9fe', fg: '#5b21b6' },
}[s] || { bg: '#f1f5f9', fg: '#475569' })
