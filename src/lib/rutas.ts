/**
 * Las rutas de la aplicación, sobre el hash de la URL.
 *
 * Se usa hash (`#/receta/…`) y no rutas normales por dónde se sirve esto: los
 * estáticos van a un Synology sin reescritura, así que pedir `/receta/123`
 * devolvería un 404 —no existe ese fichero— y un enlace compartido no abriría
 * nada. Con hash el navegador nunca le pide esa parte al servidor.
 *
 * El día que Web Station reescriba todo a `index.html`, pasar a rutas limpias
 * es cambiar `aHash` y `parsearRuta`, y nada más: el resto de la app habla de
 * `Ruta`, no de cadenas.
 */

export type Ruta =
  | { vista: 'catalogo' }
  | { vista: 'nueva' }
  | { vista: 'despensa' }
  | { vista: 'receta'; id: string };

export const CATALOGO: Ruta = { vista: 'catalogo' };

/**
 * `#/receta/abc` → `{ vista: 'receta', id: 'abc' }`.
 *
 * Lo que no encaje cae en el catálogo en vez de romper: una URL vieja o mal
 * copiada enseña algo útil, no una pantalla en blanco.
 */
export function parsearRuta(hash: string): Ruta {
  const partes = hash.replace(/^#/, '').split('/').filter(Boolean);

  if (partes[0] === 'nueva') return { vista: 'nueva' };
  if (partes[0] === 'despensa') return { vista: 'despensa' };
  if (partes[0] === 'receta' && partes[1]) {
    return { vista: 'receta', id: decodeURIComponent(partes[1]) };
  }
  return CATALOGO;
}

/** Inverso de `parsearRuta`. Sirve tanto para navegar como para el `href` de un enlace. */
export function aHash(ruta: Ruta): string {
  switch (ruta.vista) {
    case 'nueva':
      return '#/nueva';
    case 'despensa':
      return '#/despensa';
    case 'receta':
      return `#/receta/${encodeURIComponent(ruta.id)}`;
    case 'catalogo':
      return '#/';
  }
}
