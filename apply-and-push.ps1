# ClusterHub — apply the API-hang fixes, test, commit, push (Vercel then auto-deploys)
# Run in PowerShell from anywhere. It works on YOUR laptop copy of the project:
#   C:\Users\Ahad\OneDrive - Higher Education Commission\Desktop\CusterHub
# Before running: download "ClusterHub-fixes.patch" from Muse into that same folder.

$ErrorActionPreference = 'Stop'
$Project = 'C:\Users\Ahad\OneDrive - Higher Education Commission\Desktop\CusterHub'
$Patch   = Join-Path $Project 'ClusterHub-fixes.patch'

if (!(Test-Path $Project)) { throw "Project folder not found: $Project" }
if (!(Test-Path $Patch))   { throw "Patch file not found in project folder: $Patch  (download ClusterHub-fixes.patch there first)" }

Set-Location $Project
Write-Host "`n== 1/6  Check this really is the ClusterHub repo ==" -ForegroundColor Cyan
git remote -v
git status --short

Write-Host "`n== 2/6  Apply the patch (dry check first) ==" -ForegroundColor Cyan
git apply --check $Patch
git apply $Patch
git status --short

Write-Host "`n== 3/6  Install the one new backend dependency (express-async-errors) ==" -ForegroundColor Cyan
npm --prefix backend install

Write-Host "`n== 4/6  Build + run the full test suite (expect: 38 passed) ==" -ForegroundColor Cyan
npm --prefix backend run build
npm --prefix backend test

Write-Host "`n== 5/6  Commit ==" -ForegroundColor Cyan
git add -A
git commit -m "fix: stop API hanging when MongoDB is unreachable (repo tier fallback + failure cooldown, async error forwarding, serverless init-once with fast health, frontend fetch timeout, regression tests)"

Write-Host "`n== 6/6  Push to GitHub (main) — Vercel auto-deploys both projects from this push ==" -ForegroundColor Cyan
git push origin main

Write-Host "`nDONE. Wait 1-3 minutes for Vercel, then open:" -ForegroundColor Green
Write-Host "  Frontend: https://cluster-hub-uikz.vercel.app/"
Write-Host "  API health (should now answer in under ~1s): https://cluster-hub-two.vercel.app/api/health"
Write-Host "  API games  (should return data, not hang):    https://cluster-hub-two.vercel.app/api/games"
Write-Host "`nReminder: the patch makes the app survive a dead database by falling back to seed data."
Write-Host "For your REAL MongoDB data, also check in Atlas/Vercel: MONGODB_URI + password, cluster not paused, Network Access 0.0.0.0/0."
