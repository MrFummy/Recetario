/**
 * Clave de color de una categoría para el atributo `data-k` (ver sistema.css).
 * Las categorías vienen de la base de datos como texto libre, así que lo que no
 * se reconoce cae en `otro`, que es el color neutro (tinta).
 */
export type ClaveCategoria =
  | 'aperitivos' | 'postres' | 'carnes' | 'pescados' | 'sopas'
  | 'ensaladas' | 'arroces' | 'pastas' | 'otro';

const PREFIJOS: [string, ClaveCategoria][] = [
  ['aperit', 'aperitivos'], ['postre', 'postres'], ['carne', 'carnes'],
  ['pescad', 'pescados'], ['sopa', 'sopas'], ['crema', 'sopas'],
  ['ensal', 'ensaladas'], ['arroc', 'arroces'], ['pasta', 'pastas'],
];

export function claveCategoria(categoria: string | null | undefined): ClaveCategoria {
  const c = (categoria ?? '').trim().toLowerCase();
  return PREFIJOS.find(([prefijo]) => c.startsWith(prefijo))?.[1] ?? 'otro';
}

/** Primera palabra de la categoría, que es lo que cabe dentro de un sello. */
export function categoriaCorta(categoria: string | null | undefined): string {
  return (categoria ?? '').split(/[/ ]/)[0];
}
