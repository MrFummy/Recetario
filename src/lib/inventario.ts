import type { Recipe } from '../types';
import { normalizeIngredients } from './recipeContent';
import { normalizeString } from './ingredientParser';

/**
 * Lo que el catálogo entero sabe de un ingrediente genérico.
 *
 * `base` es la clave con la que se guarda en la despensa; `recetas` es en
 * cuántas aparece, que sirve para ordenar las sugerencias por lo que más se usa
 * en vez de por orden alfabético.
 */
export interface IngredienteDelCatalogo {
  base: string;
  recetas: number;
}

/**
 * Todos los ingredientes genéricos del catálogo, de más usado a menos.
 *
 * Es la lista sobre la que autocompleta la despensa. Escribir a mano sin
 * sugerencias haría convivir "cebolla" y "cebollas" como cosas distintas, que es
 * justo lo que la migración a ingredientes estructurados vino a arreglar.
 */
export function ingredientesDelCatalogo(recipes: Recipe[]): IngredienteDelCatalogo[] {
  const cuenta = new Map<string, number>();

  for (const receta of recipes) {
    // Un mismo `base` puede salir dos veces en una receta (dos tipos de queso);
    // para "en cuántas recetas aparece" cuenta una sola vez.
    const enEsta = new Set(basesDeReceta(receta));
    for (const base of enEsta) {
      cuenta.set(base, (cuenta.get(base) ?? 0) + 1);
    }
  }

  return [...cuenta.entries()]
    .map(([base, recetas]) => ({ base, recetas }))
    .sort((a, b) => b.recetas - a.recetas || a.base.localeCompare(b.base, 'es'));
}

/** Los ingredientes marcables de una receta, ya en forma de clave de despensa. */
export function basesDeReceta(receta: Recipe): string[] {
  return normalizeIngredients(receta.ingredientes)
    .filter((i) => !i.esGrupo && i.base)
    .map((i) => i.base!.trim().toLowerCase())
    .filter(Boolean);
}

export interface RecetaConFaltantes {
  receta: Recipe;
  total: number;
  tienes: number;
  faltan: string[];
}

/**
 * Ordena el catálogo por lo cerca que estás de poder cocinarlo.
 *
 * Primero lo que puedes hacer ya, luego por número de ingredientes que faltan.
 * A igualdad, primero la receta más corta: si a dos les falta uno, la de cinco
 * ingredientes está más a mano que la de veinte.
 *
 * Se descartan las recetas de las que no tienes nada: sin ningún ingrediente en
 * común no es una sugerencia, es el catálogo entero otra vez.
 */
export function ordenarPorLoQueFalta(
  recipes: Recipe[],
  tengo: (base: string) => boolean
): RecetaConFaltantes[] {
  return recipes
    .map((receta) => {
      const bases = [...new Set(basesDeReceta(receta))];
      const faltan = bases.filter((b) => !tengo(b));
      return { receta, total: bases.length, tienes: bases.length - faltan.length, faltan };
    })
    .filter((r) => r.total > 0 && r.tienes > 0)
    .sort((a, b) =>
      a.faltan.length - b.faltan.length ||
      a.total - b.total ||
      a.receta.titulo.localeCompare(b.receta.titulo, 'es')
    );
}

/**
 * Sugerencias para el buscador de la despensa: coincidencia por subcadena sin
 * tildes, para que "azucar" encuentre "azúcar".
 */
export function buscarIngredientes(
  catalogo: IngredienteDelCatalogo[],
  texto: string,
  limite = 8
): IngredienteDelCatalogo[] {
  const q = normalizeString(texto.trim());
  if (!q) return [];
  return catalogo.filter((i) => normalizeString(i.base).includes(q)).slice(0, limite);
}
