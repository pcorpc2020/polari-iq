import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://icfmkbxaszvspxltxmoh.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljZm1rYnhhc3p2c3B4bHR4bW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMjAwMDQsImV4cCI6MjA5NTU5NjAwNH0.7EsYE1vxWQFVRRvrMdRogJtqJkoGhv6zwxS9VhTywbY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
export const isLive = !!import.meta.env.VITE_SUPABASE_ANON_KEY
