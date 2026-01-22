# Skrypt uruchamiający backend
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Mobilny Dostawca - Backend API" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $backendPath

Write-Host "Uruchamianie backendu..." -ForegroundColor Yellow
Write-Host ""

dotnet run

Write-Host ""
Write-Host "Backend zatrzymany." -ForegroundColor Red
