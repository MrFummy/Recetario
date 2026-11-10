import { urlBandera } from './paises';
import { acentoDePixeles, type AcentoPais } from './colorBandera';

const LADO = 24;
const cache = new Map<string, AcentoPais | null>();
const pendientes = new Map<string, Promise<AcentoPais | null>>();

/** El acento ya calculado de un país; `undefined` si todavía no se ha pedido. */
export function acentoEnCache(codigo: string): AcentoPais | null | undefined {
  return cache.get(codigo);
}

/**
 * Calcula (una sola vez por país) el acento de una bandera leyendo sus píxeles en un
 * canvas diminuto. Nunca rechaza: si la imagen falla o el canvas queda «manchado» por
 * CORS, resuelve a `null` y la página se queda sin acento.
 */
export function cargarAcento(codigo: string): Promise<AcentoPais | null> {
  if (cache.has(codigo)) return Promise.resolve(cache.get(codigo) ?? null);
  const enCurso = pendientes.get(codigo);
  if (enCurso) return enCurso;

  const promesa = new Promise<AcentoPais | null>((resolve) => {
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
        // Canvas «manchado» por CORS: sin acento.
      }
      cache.set(codigo, acento);
      resolve(acento);
    };
    img.onerror = () => { cache.set(codigo, null); resolve(null); };
    img.src = urlBandera(codigo);
  });
  pendientes.set(codigo, promesa);
  return promesa;
}
