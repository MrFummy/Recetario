/** Cuántas raciones se piden de una receta, y para cuántas está escrita. */
export interface Escala {
  raciones: number;
  /** `porciones_num` de la receta; `null` si no se ha estimado. */
  porciones: number | null;
}

/**
 * Una línea escrita «por persona», «por brocheta», «por rollito»…: la cantidad ya es
 * por ración, así que NO se divide entre las porciones de la receta. Si se dividiera,
 * «80 g por persona» en una receta para 4 saldría como 20 g por persona al pedir 4.
 */
export function esPorRacion(cantidad: string | undefined): boolean {
  return !!cantidad && /\bpor\s+\p{L}+/iu.test(cantidad);
}

/** Por cuánto se multiplica `valor` para una línea de esa receta. */
export function multiplicador(escala: Escala, cantidad: string | undefined): number {
  if (esPorRacion(cantidad)) return escala.raciones;
  // Sin porciones no se sabe escalar: se deja como está. El menú ya avisa de ello.
  return escala.porciones ? escala.raciones / escala.porciones : 1;
}

/** Cosas que se compran enteras: 0,6 cebollas no existe. */
const UNIDADES_ENTERAS = new Set([
  'unidad', 'diente', 'hoja', 'rebanada', 'tira', 'yema', 'pieza', 'manojo', 'pizca', 'gota',
]);

/**
 * Deja un total escalado en una cifra que se pueda comprar o medir: las unidades
 * enteras suben al siguiente entero, g y ml van sin decimales salvo por debajo de 10,
 * y el resto (cucharadas, litros…) con dos decimales como mucho. Se aplica sobre la
 * suma de todas las recetas, no línea a línea, para no redondear dos veces.
 */
export function redondear(valor: number, unidad: string | null | undefined): number {
  if (unidad && UNIDADES_ENTERAS.has(unidad)) {
    // El margen evita que 2,0000000001, por coma flotante, suba a 3.
    return Math.ceil(valor - 1e-9);
  }
  if (unidad === 'g' || unidad === 'ml') {
    return valor >= 10 ? Math.round(valor) : Math.round(valor * 10) / 10;
  }
  return Math.round(valor * 100) / 100;
}
