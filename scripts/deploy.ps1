# Despliega el build de producción al Synology, vía la unidad de red W:\recetario
# (\\10.99.1.70\web\recetario). Solo funciona desde un equipo con ese recurso
# montado; en cualquier otro sitio, usa la Opción A/B del README.
#
# Qué hace:
#   1. npm run build (falla el script si falla el build).
#   2. Comprueba que el bundle lleva embebida la config de Supabase (si no,
#      el build se hizo sin el .env bueno y desplegarlo rompería la app).
#   3. Espeja dist/ contra W:\recetario con robocopy /MIR: copia lo nuevo y
#      BORRA lo que ya no esté en dist/ (ahí es donde vivían los builds
#      antiguos acumulados en assets/, uno por cada despliegue manual desde
#      mayo de 2026).
#
# Uso: powershell -ExecutionPolicy Bypass -File scripts\deploy.ps1

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$distPath = Join-Path $repoRoot 'dist'
$nasPath = 'W:\recetario'

if (-not (Test-Path $nasPath)) {
    Write-Error "No se encuentra $nasPath. ¿Está montada la unidad de red del NAS?"
    exit 1
}

Write-Host "`n== 1/3 Compilando ==" -ForegroundColor Cyan
Push-Location $repoRoot
try {
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build falló (código $LASTEXITCODE)" }
} finally {
    Pop-Location
}

Write-Host "`n== 2/3 Comprobando que el build lleva el .env embebido ==" -ForegroundColor Cyan
$bundleMatch = Get-ChildItem "$distPath\assets\index-*.js" | Select-String -Pattern 'supabase\.co' -List
if (-not $bundleMatch) {
    Write-Error "El bundle no contiene 'supabase.co'. El build se hizo sin el .env correcto: no se despliega."
    exit 1
}
Write-Host "OK: $($bundleMatch.Path | Split-Path -Leaf) contiene la config de Supabase."

Write-Host "`n== 3/3 Espejando dist/ -> $nasPath (robocopy /MIR) ==" -ForegroundColor Cyan
robocopy $distPath $nasPath /MIR /XD '@eaDir' /R:2 /W:2 /NFL /NDL
# robocopy usa códigos de salida 0-7 como "éxito" (bits de qué copió/borró);
# solo 8+ es un fallo real.
if ($LASTEXITCODE -ge 8) {
    Write-Error "robocopy devolvió el código $LASTEXITCODE (fallo real; 0-7 es éxito con distintos matices)."
    exit 1
}

Write-Host "`nDesplegado en $nasPath." -ForegroundColor Green
