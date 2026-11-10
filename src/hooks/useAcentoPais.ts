import { useEffect, useState } from 'react';
import { acentoEnCache, cargarAcento } from '../lib/cargarAcento';
import type { AcentoPais } from '../lib/colorBandera';

/** El acento de un país, sacado de su bandera; `null` mientras carga o si falla. */
export function useAcentoPais(codigo: string): AcentoPais | null {
  const [resultado, setResultado] = useState<{ codigo: string; acento: AcentoPais | null } | null>(null);

  useEffect(() => {
    if (acentoEnCache(codigo) !== undefined) return;
    let activo = true;
    void cargarAcento(codigo).then((acento) => { if (activo) setResultado({ codigo, acento }); });
    return () => { activo = false; };
  }, [codigo]);

  const enCache = acentoEnCache(codigo);
  if (enCache !== undefined) return enCache;
  return resultado?.codigo === codigo ? resultado.acento : null;
}

/** Los acentos de varios países a la vez (para el mapa); los que aún cargan no aparecen. */
export function useAcentosPaises(codigos: string[]): Map<string, AcentoPais> {
  const [, setVersion] = useState(0);
  const clave = [...codigos].sort().join(',');

  useEffect(() => {
    let activo = true;
    for (const codigo of clave.split(',').filter(Boolean)) {
      if (acentoEnCache(codigo) === undefined) {
        void cargarAcento(codigo).then(() => { if (activo) setVersion((v) => v + 1); });
      }
    }
    return () => { activo = false; };
  }, [clave]);

  const mapa = new Map<string, AcentoPais>();
  for (const codigo of codigos) {
    const acento = acentoEnCache(codigo);
    if (acento) mapa.set(codigo, acento);
  }
  return mapa;
}
