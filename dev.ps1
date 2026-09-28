<#
    Starts both halves of the app for local development.

    The web app proxies /api to the FastAPI service, so running `npm run dev` on its own
    leaves every upload failing: the proxy has nothing to forward to. This starts both.

    Usage:  .\dev.ps1
#>

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

$python = Join-Path $root "backend\.venv\Scripts\python.exe"
if (-not (Test-Path $python)) {
    Write-Host "No virtualenv found at backend\.venv." -ForegroundColor Red
    Write-Host "Create it first:" -ForegroundColor Yellow
    Write-Host "  cd backend; python -m venv .venv; .\.venv\Scripts\python.exe -m pip install -r requirements.txt"
    exit 1
}
if (-not (Test-Path (Join-Path $root "frontend\node_modules"))) {
    Write-Host "Frontend dependencies are missing. Run: cd frontend; npm install" -ForegroundColor Red
    exit 1
}

# FFmpeg powers the video cleaner. Its absence is not fatal: the video endpoints answer
# 503 with a clear message and image cleaning is unaffected, so only warn.
$ffmpegPath = (Select-String -Path (Join-Path $root "backend\.env") -Pattern "^FFMPEG_PATH=(.+)$" -ErrorAction SilentlyContinue |
    Select-Object -First 1).Matches.Groups[1].Value
$haveFfmpeg = $false
if ($ffmpegPath -and (Test-Path (Join-Path $ffmpegPath "ffmpeg.exe"))) { $haveFfmpeg = $true }
elseif (Get-Command ffmpeg -ErrorAction SilentlyContinue) { $haveFfmpeg = $true }
if ($haveFfmpeg) {
    Write-Host "FFmpeg found - the video cleaner is enabled." -ForegroundColor Green
} else {
    Write-Host "FFmpeg not found. Video cleaning will report 503; images are unaffected." -ForegroundColor Yellow
    Write-Host "  Install it, then set FFMPEG_PATH and FFPROBE_PATH in backend\.env" -ForegroundColor DarkYellow
}

Write-Host "Starting API on http://127.0.0.1:8000 ..." -ForegroundColor Cyan
Start-Process -FilePath $python `
    -ArgumentList "-m", "uvicorn", "app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000" `
    -WorkingDirectory (Join-Path $root "backend")

# Give uvicorn a moment, then confirm it is actually answering before starting the web app.
$ready = $false
foreach ($i in 1..20) {
    Start-Sleep -Milliseconds 500
    try {
        if ((Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/health" -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200) {
            $ready = $true; break
        }
    } catch { }
}
if ($ready) {
    Write-Host "API is up." -ForegroundColor Green
} else {
    Write-Host "API did not answer on :8000 - check the window it opened for the error." -ForegroundColor Yellow
}

Write-Host "Starting web app on http://localhost:3000 ..." -ForegroundColor Cyan
Set-Location (Join-Path $root "frontend")
npm run dev
