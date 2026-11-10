import type { Menu, MenuReceta, Pase, Recipe, Visibilidad } from '../types';
import { listaDeLaCompra, type ItemListaCompra } from './listaCompra';
import type { Escala } from './escalado';

/** Los pases en el orden en que se sirven, con el título de su sección. */
export const PASES: { id: Pase; titulo: string }[] = [
  { id: 'aperitivo', titulo: 'Aperitivos' },
  { id: 'entrante', titulo: 'Entrantes' },
  { id: 'principal', titulo: 'Platos principales' },
  { id: 'postre', titulo: 'Postres' },
  { id: 'otro', titulo: 'Otros' },
];

/** El pase que se propone al añadir una receta; el usuario puede cambiarlo. */
export function paseSegunCategoria(categoria: string): Pase {
  switch (categoria) {
    case 'Aperitivos':
      return 'aperitivo';
    case 'Sopas/Cremas':
    case 'Ensaladas':
      return 'entrante';
    case 'Arroces':
    case 'Pastas':
    case 'Carnes':
    case 'Pescados y mariscos':
      return 'principal';
    case 'Postres':
      return 'postre';
    default:
      return 'otro';
  }
}

/**
 * La lista de la compra de un menú: cada receta a sus raciones (las suyas, o los
 * comensales del menú) y sin lo que la despensa dice que ya hay. La usan la pantalla
 * y la hoja impresa, para que no puedan salir distintas.
 */
export function listaDelMenu(
  menu: Menu,
  items: MenuReceta[],
  recipes: Recipe[],
  tengo: (base: string) => boolean
): ItemListaCompra[] {
  const porId = new Map(recipes.map((r) => [r.id, r]));
  const escalas = new Map<string, Escala>();
  for (const item of items) {
    const receta = porId.get(item.receta_id);
    if (!receta) continue;
    escalas.set(item.receta_id, {
      raciones: item.raciones ?? menu.comensales,
      porciones: receta.porciones_num ?? null,
    });
  }
  return listaDeLaCompra(recipes, new Set(escalas.keys()), tengo, escalas);
}

/** Los tres niveles de visibilidad de un menú, con lo que significa cada uno. */
export const VISIBILIDADES: { id: Visibilidad; titulo: string; detalle: string }[] = [
  { id: 'privado', titulo: 'Privado', detalle: 'Solo tú lo ves.' },
  { id: 'afans', titulo: 'Los afans', detalle: 'Cualquier usuario con sesión, desde su lista de menús.' },
  { id: 'enlace', titulo: 'Enlace', detalle: 'Cualquiera con el enlace, también sin cuenta.' },
];
