import { useEffect, useState } from 'react';
import { urlBandera } from '../lib/paises';
import { acentoDePixeles, type AcentoPais } from '../lib/colorBandera';

const LADO = 24;
const cache = new Map<string, AcentoPais | null>();

/** El acento de un país, sacado de su bandera; `null` mientras carga o si falla. */
export function useAcentoPais(codigo: string): AcentoPais | null {
  const [resultado, setResultado] = useState<{ codigo: string; acento: AcentoPais | null } | null>(null);

  useEffect(() => {
    if (cache.has(codigo)) return;
    let activo = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let acento: AcentoPais | null = null;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = LADO;
        canvas.height = LADO;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, LADO, LADO);
          acento = acentoDePixeles(ctx.getImageData(0, 0, LADO, LADO).data);
        }
      } catch {
        // Canvas «manchado» por CORS: sin acento, la página queda como estaba.
      }
      cache.set(codigo, acento);
      if (activo) setResultado({ codigo, acento });
    };
    img.src = urlBandera(codigo);
    return () => { activo = false; };
  }, [codigo]);

  if (cache.has(codigo)) return cache.get(codigo) ?? null;
  return resultado?.codigo === codigo ? resultado.acento : null;
}
