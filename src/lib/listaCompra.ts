import type { Recipe } from '../types';
import { normalizeIngredients } from './recipeContent';

export interface ItemListaCompra {
  base: string;
  /** Nombre a mostrar, de la primera receta donde aparece. */
  nombre: string;
  /** Cantidades ya fusionadas donde se pudo; una línea por variante restante. */
  lineas: string[];
}

/**
 * La lista de la compra de las recetas elegidas para la semana.
 *
 * A diferencia de la despensa, aquí sí importan las cantidades: la pregunta
 * es puntual ("voy a hacer estas recetas, ¿cuánto compro?") y no hay estado
 * que envejezca. Se suma `valor` cuando es numérico y coincide la `unidad`
 * entre todas las apariciones de un `base`; el resto se lista tal cual viene,
 * sin inventar una suma entre cosas que no se sabe si son comparables.
 */
export function listaDeLaCompra(
  recipes: Recipe[],
  idsSeleccionadas: Set<string>,
  tengo: (base: string) => boolean
): ItemListaCompra[] {
  const porBase = new Map<string, { nombre: string; porUnidad: Map<string | null, { valores: number[]; textos: string[] }> }>();

  for (const receta of recipes) {
    if (!idsSeleccionadas.has(receta.id)) continue;

    for (const item of normalizeIngredients(receta.ingredientes)) {
      if (item.esGrupo || !item.base || tengo(item.base)) continue;

      let grupo = porBase.get(item.base);
      if (!grupo) {
        grupo = { nombre: item.name, porUnidad: new Map() };
        porBase.set(item.base, grupo);
      }

      const clave = item.unidad ?? null;
      let sub = grupo.porUnidad.get(clave);
      if (!sub) {
        sub = { valores: [], textos: [] };
        grupo.porUnidad.set(clave, sub);
      }

      if (item.valor != null) {
        sub.valores.push(item.valor);
      } else if (item.qty) {
        sub.textos.push(item.qty);
      }
    }
  }

  const items: ItemListaCompra[] = [];
  for (const [base, { nombre, porUnidad }] of porBase) {
    const lineas: string[] = [];
    for (const [unidad, { valores, textos }] of porUnidad) {
      if (valores.length > 0) {
        const total = valores.reduce((a, b) => a + b, 0);
        lineas.push(unidad ? `${total} ${unidad}` : `${total}`);
      }
      for (const texto of new Set(textos)) {
        lineas.push(texto);
      }
    }
    items.push({ base, nombre, lineas });
  }

  return items.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}
