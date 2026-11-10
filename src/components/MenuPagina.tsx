import type { User } from '@supabase/supabase-js';
import type { Recipe } from '../types';
import type { Despensa } from '../hooks/useDespensa';
import { useMenuCompartido } from '../hooks/useMenuCompartido';
import { MenuEditor } from './MenuEditor';
import { MenuVista } from './MenuVista';

interface Props {
  id: string;
  recipes: Recipe[];
  despensa: Despensa;
  user: User | null;
}

/**
 * `#/menu/<id>`: decide qué se enseña. Un menú de otro que esté compartido con quien mira se
 * abre en solo lectura; el propio (compartido o no) y cualquier otro caso van al editor, que lo
 * pide a la tabla y deja que la RLS diga si es suyo, o enseña «no existe» si no.
 */
export function MenuPagina({ id, recipes, despensa, user }: Props) {
  const { cargando, datos } = useMenuCompartido(id, user?.id);

  if (cargando) return <p className="max-w-3xl mx-auto font-mono text-sm text-ink-soft">Cargando…</p>;

  if (datos && !datos.es_mio) {
    return <MenuVista datos={datos} recipes={recipes} despensa={despensa} user={user} />;
  }
  return <MenuEditor id={id} recipes={recipes} despensa={despensa} />;
}
