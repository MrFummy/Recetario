/** Un trozo de contenido que ocupa `peso`, en la misma unidad que las capacidades de `paginar` (px). */
export interface Bloque<T> {
  peso: number;
  /**
   * No se deja solo al final de una página: se mueve a la siguiente junto con el
   * bloque que viene detrás. Es para los títulos de sección.
   */
  pegado?: boolean;
  contenido: T;
}

/**
 * Reparte bloques en páginas de capacidad fija, en orden. `capacidades[i]` es la de la
 * página `i`; las siguientes repiten la última (la primera podría tener menos, si lleva un
 * título aparte).
 *
 * Hay que repartirlo a mano porque las hojas son de tamaño fijo, sin márgenes de
 * impresión: así el navegador no añade su URL y su fecha a cada página, pero tampoco
 * parte nada por su cuenta. Un bloque más grande que una página entera se coloca igual,
 * solo en la suya.
 */
export function paginar<T>(bloques: Bloque<T>[], capacidades: number[]): T[][] {
  const paginas: T[][] = [[]];
  let usado = 0;
  let capacidad = capacidades[0];

  bloques.forEach((bloque, i) => {
    const siguiente = bloques[i + 1];
    const necesario = bloque.pegado && siguiente ? bloque.peso + siguiente.peso : bloque.peso;

    if (usado > 0 && usado + necesario > capacidad) {
      paginas.push([]);
      usado = 0;
      capacidad = capacidades[Math.min(paginas.length - 1, capacidades.length - 1)];
    }

    paginas[paginas.length - 1].push(bloque.contenido);
    usado += bloque.peso;
  });

  return paginas;
}
