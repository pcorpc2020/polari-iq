# ================================================================
#  POLARI V1.5 — AUTONOMOUS DEPLOY SCRIPT
#  GitHub → Vercel (NovaTiguer team) + Supabase already live
#
#  Run: Right-click → Run with PowerShell (Admin)
#  You will be prompted for 3 credentials only.
# ================================================================

$ErrorActionPreference = "Continue"
$Name    = "polari-iq"
$Team    = "nova-tiguer"
$TeamId  = "team_IFKg9fLVQFmGhRO835Ubq7fg"
$SbUrl   = "https://icfmkbxaszvspxltxmoh.supabase.co"
$Folder  = "$env:USERPROFILE\Projects\$Name"

function H($t)  { Write-Host ""; Write-Host "  ══ $t ══" -ForegroundColor Yellow }
function OK($t) { Write-Host "  ✓ $t" -ForegroundColor Green }
function I($t)  { Write-Host "  · $t" -ForegroundColor Cyan }
function W($t)  { Write-Host "  ! $t" -ForegroundColor Red }
function Ask($label) {
  Write-Host ""
  Write-Host "  ┌─ CREDENTIAL NEEDED ─────────────────────┐" -ForegroundColor Magenta
  Write-Host "  │  $label" -ForegroundColor White
  Write-Host "  └─────────────────────────────────────────┘" -ForegroundColor Magenta
  $s = Read-Host "  Enter value" -AsSecureString
  return [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($s))
}

Clear-Host
Write-Host ""
Write-Host "  POLARI V1.5 — AUTONOMOUS DEPLOY" -ForegroundColor White
Write-Host "  Supabase: icfmkbxaszvspxltxmoh (ACTIVE)" -ForegroundColor Green
Write-Host "  Vercel Team: NovaTiguer ($TeamId)" -ForegroundColor Green
Write-Host "  GitHub: will create polari-iq repo" -ForegroundColor Green
Write-Host ""
Read-Host "  Press Enter to begin"

# ── Step 0: Prerequisites ─────────────────────────────────
H "Step 0 — Prerequisites"
if (-not (Get-Command node -EA SilentlyContinue)) { W "Node.js missing. Install from nodejs.org"; exit 1 }
if (-not (Get-Command git  -EA SilentlyContinue)) { W "Git missing. Install from git-scm.com";  exit 1 }
OK "Node: $(node --version)  Git: $(git --version)"

if (-not (Get-Command gh -EA SilentlyContinue)) {
  I "Installing GitHub CLI..."
  winget install --id GitHub.cli -e --silent --accept-package-agreements --accept-source-agreements 2>$null
}

# ── Step 1: Extract project ───────────────────────────────
H "Step 1 — Extract project"
$zip = "$env:USERPROFILE\Downloads\polari-v2.zip"
if (-not (Test-Path $zip)) {
  $zip = Read-Host "  Path to polari-v2.zip (check Downloads/Desktop)"
}
if (-not (Test-Path $zip)) { W "Zip not found. Exiting."; exit 1 }

if (Test-Path $Folder) { Remove-Item $Folder -Recurse -Force }
New-Item -ItemType Directory -Path $Folder -Force | Out-Null
Expand-Archive -Path $zip -DestinationPath $Folder -Force

# Flatten if nested
$inner = Get-ChildItem $Folder -Directory | Select-Object -First 1
if ($inner -and (Test-Path "$Folder\$($inner.Name)\package.json")) {
  Get-ChildItem "$Folder\$($inner.Name)" | ForEach-Object { Move-Item $_.FullName $Folder -Force }
  Remove-Item "$Folder\$($inner.Name)" -Recurse -Force
}

Set-Location $Folder
I "Running npm install..."
npm install --silent 2>$null
OK "Project ready at $Folder"

# ── Step 2: Supabase anon key ─────────────────────────────
H "Step 2 — Supabase Anon Key"
Write-Host "  Go to: https://supabase.com/dashboard/project/icfmkbxaszvspxltxmoh/settings/api" -ForegroundColor Cyan
Write-Host "  Copy the 'anon / public' key" -ForegroundColor Cyan
$SbKey = Ask "SUPABASE ANON KEY"

"VITE_SUPABASE_URL=$SbUrl`nVITE_SUPABASE_ANON_KEY=$SbKey" | Set-Content "$Folder\.env.local" -Encoding UTF8
OK ".env.local written"

# ── Step 3: GitHub ────────────────────────────────────────
H "Step 3 — GitHub"
$ghStatus = gh auth status 2>&1
if ($ghStatus -notmatch "Logged in") {
  I "Opening GitHub login..."
  gh auth login --web
}
$ghUser = gh api user --jq .login 2>$null
I "GitHub user: $ghUser"

gh repo create "$ghUser/$Name" --public --description "POLARI V1.5 Intelligence Platform" 2>$null
git init -q
git add .
git commit -m "POLARI V1.5 — autonomous build $(Get-Date -Format 'yyyy-MM-dd')" -q
git branch -M main
git remote remove origin 2>$null
git remote add origin "https://github.com/$ghUser/$Name.git"
git push -u origin main --force -q
OK "Pushed: https://github.com/$ghUser/$Name"

# ── Step 4: Vercel ────────────────────────────────────────
H "Step 4 — Vercel Deploy"
npm install -g vercel --silent 2>$null
Write-Host "  Go to: https://vercel.com/account/tokens" -ForegroundColor Cyan
Write-Host "  Click 'Create' → name it 'polari-deploy' → copy the token" -ForegroundColor Cyan
$VToken = Ask "VERCEL TOKEN"

$env:VERCEL_ORG_ID = $TeamId
$out = vercel --token $VToken --scope $Team --yes --prod 2>&1 | Out-String
$url = [regex]::Match($out, 'https://[^\s]+\.vercel\.app').Value

if ($url) {
  OK "Deployed: $url"
  # Set env vars on Vercel
  I "Setting Supabase env vars on Vercel..."
  echo $SbUrl | vercel env add VITE_SUPABASE_URL production --token $VToken --scope $Team --yes 2>$null
  echo $SbKey | vercel env add VITE_SUPABASE_ANON_KEY production --token $VToken --scope $Team --yes 2>$null
  I "Triggering redeploy with env vars..."
  vercel --token $VToken --scope $Team --yes --prod 2>$null | Out-Null
  OK "Redeploy triggered"
  Start-Process $url
} else {
  W "Could not parse URL. Check Vercel dashboard: https://vercel.com/$Team"
  W "Raw output: $out"
  I "Starting local dev server instead..."
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Folder'; npm run dev"
  Start-Process "http://localhost:5173"
}

# ── Summary ───────────────────────────────────────────────
H "BUILD COMPLETE"
Write-Host ""
Write-Host "  GitHub:    https://github.com/$ghUser/$Name" -ForegroundColor Green
if ($url) { Write-Host "  Vercel:    $url" -ForegroundColor Green }
Write-Host "  Supabase:  https://supabase.com/dashboard/project/icfmkbxaszvspxltxmoh" -ForegroundColor Green
Write-Host "  Local:     $Folder" -ForegroundColor Green
Write-Host ""
Write-Host "  Pages live:" -ForegroundColor White
Write-Host "    ◎  Command Center  (vw_app_pcorpcgig_v15_home)" -ForegroundColor Gray
Write-Host "    ⚡  Signals         (vw_app_command_signal + write)" -ForegroundColor Gray
Write-Host "    ◈  Opportunities   (vw_app_opportunity + heatmap)" -ForegroundColor Gray
Write-Host "    ▷  Mini Queue      (vw_app_mini_queue + complete)" -ForegroundColor Gray
Write-Host "    ⊙  Learning        (assets + intake + command)" -ForegroundColor Gray
Write-Host "    ⊞  Content Inbox   (inbox + command + write)" -ForegroundColor Gray
Write-Host "    🚀 Release          (readiness gate + metrics)" -ForegroundColor Gray
Write-Host ""
Write-Host "  launch_ready = false until IQ >= 85" -ForegroundColor Cyan
Write-Host ""
