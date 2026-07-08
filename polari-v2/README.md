# POLARI — PCorpCGig V1.5 Intelligence Platform

**Stack:** React + Vite → Vercel (NovaTiguer) ← Supabase `icfmkbxaszvspxltxmoh`

## Deploy in one command
```powershell
# Right-click DEPLOY.ps1 → Run with PowerShell
# You'll be prompted for 3 credentials:
#   1. Supabase anon key
#   2. GitHub login (browser)
#   3. Vercel token
```

## Manual setup
```bash
npm install
cp .env.example .env.local   # add your VITE_SUPABASE_ANON_KEY
npm run dev                  # http://localhost:5173
```

## Live Supabase Views (project: icfmkbxaszvspxltxmoh)

| Page | Views |
|---|---|
| Command Center | `vw_app_pcorpcgig_v15_home`, `vw_polari_impact_command_center`, `vw_polari_latest_metric_status` |
| Signals | `vw_app_command_signal` → writes `polari_intelligence_signal` |
| Opportunities | `vw_app_opportunity`, `vw_polari_impact_heatmap`, `vw_polari_intelligence_quality_impact` |
| Mini Queue | `vw_app_mini_queue`, `vw_app_mini_triage` → writes `mini_action_queue` |
| Learning | `vw_app_learning`, `vw_app_learning_intake_bridge`, `vw_polari_learning_command_center` → writes `polari_learning_intake` |
| Content Inbox | `vw_app_content_inbox`, `vw_app_content_command` → writes `pcorpc_content_inbox` |
| Release | `vw_app_pcorpcgig_v15_release_readiness`, `vw_polari_latest_metric_status` |

## IQ Formula
```
IQ = (signal + readiness + opportunity + top_action + mini_task
      + communication + outcome×3 + learning×3) / 12
```
Launch gate: **IQ ≥ 85** — currently `false`

## Current live readings
- Release status: `READY_FOR_UI_REVIEW`
- Top blocker: Impact actions need review
- Open mini tasks: 6
- Impact IQ: 89.30 (National)
- Core loops verified: ✓
