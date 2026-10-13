#!/usr/bin/env bash
# Despliega el build de producción al Synology desde un Mac, vía el recurso SMB
# montado en /Volumes/web (//10.99.1.70/web). Equivale a deploy.ps1, que es el
# de Windows (W:\recetario).
#
# Qué hace:
#   1. npm run build (se detiene si falla).
#   2. Comprueba que el bundle lleva embebida la config de Supabase (si no, el
#      build se hizo sin el .env bueno y desplegarlo rompería la app).
#   3. Espeja dist/ contra la carpeta del NAS con rsync --delete: copia lo nuevo
#      y BORRA lo que ya no esté en dist/, para que no se acumulen los ficheros
#      con hash de builds anteriores.
#
# Uso:
#   npm run deploy:mac              # despliega
#   npm run deploy:mac -- --dry-run # solo enseña qué copiaría y qué borraría
#
# NAS_PATH cambia el destino si el recurso se monta en otro sitio.

set -euo pipefail

NAS_PATH="${NAS_PATH:-/Volumes/web/recetario}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$REPO_ROOT/dist"
SECO=""
[[ "${1:-}" == "--dry-run" ]] && SECO="n"

if [[ ! -d "$NAS_PATH" ]]; then
  echo "No se encuentra $NAS_PATH. ¿Está montado el recurso del NAS? (Finder → Ir → Conectar con el servidor → smb://10.99.1.70/web)" >&2
  exit 1
fi

echo "== 1/3 Compilando =="
(cd "$REPO_ROOT" && npm run build)

echo "== 2/3 Comprobando que el build lleva el .env embebido =="
if ! grep -l "supabase\.co" "$DIST"/assets/index-*.js >/dev/null; then
  echo "El bundle no contiene 'supabase.co'. El build se hizo sin el .env correcto: no se despliega." >&2
  exit 1
fi
echo "OK: el bundle contiene la config de Supabase."

echo "== 3/3 Espejando dist/ -> $NAS_PATH (rsync --delete) =="
# SMB no guarda permisos ni propietarios de Unix, y @eaDir/.DS_Store son basura
# de Synology y de macOS que no deben viajar ni borrarse.
rsync -rtv"$SECO" --delete --no-perms --no-owner --no-group \
  --exclude '@eaDir' --exclude '.DS_Store' \
  "$DIST"/ "$NAS_PATH"/

if [[ -n "$SECO" ]]; then
  echo "Ensayo terminado: no se ha tocado nada."
else
  echo "Desplegado en $NAS_PATH."
fi
