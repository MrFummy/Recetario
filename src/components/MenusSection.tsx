import type { User } from '@supabase/supabase-js';
import type { Recipe } from '../types';
import type { Despensa } from '../hooks/useDespensa';
import type { Ruta } from '../lib/rutas';
import { MenusLista } from './MenusLista';
import { MenuEditor } from './MenuEditor';

interface Props {
  ruta: Extract<Ruta, { vista: 'menus' | 'menu' }>;
  recipes: Recipe[];
  despensa: Despensa;
  user: User | null;
}

/** `#/menus` es la lista; `#/menu/<id>`, un menú abierto. */
export function SeccionMenus({ ruta, recipes, despensa, user }: Props) {
  return ruta.vista === 'menu'
    ? <MenuEditor key={ruta.id} id={ruta.id} recipes={recipes} despensa={despensa} />
    : <MenusLista user={user} />;
}
