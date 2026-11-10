import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { errorMessage } from '../lib/errors';
import type { Menu } from '../types';

export type MenuResumen = Menu & { recetas: number };
/** Un menú que otro usuario ha compartido con los afans, con el nombre de su perfil si lo tiene. */
export type MenuDeOtro = MenuResumen & { autor: string | null };

export interface Menus {
  menus: MenuResumen[];
  /** Los menús de otros usuarios compartidos con los afans. */
  compartidos: MenuDeOtro[];
  loading: boolean;
  error: string | null;
  /** Devuelve el menú creado, o `null` si falló (el motivo queda en `error`). */
  crear: (nombre: string, comensales: number) => Promise<Menu | null>;
  borrar: (id: string) => Promise<void>;
}

type Fila = Menu & { menu_recetas: { count: number }[] };
const aResumen = ({ menu_recetas, ...menu }: Fila): MenuResumen => ({ ...menu, recetas: menu_recetas[0]?.count ?? 0 });

/**
 * Los menús del usuario y los que otros han compartido con los afans. Viven en la sección, no
 * en `App`: nadie más los usa.
 *
 * Los propios se piden filtrando por `user_id`: la RLS ya no basta, porque los menús «afans» de
 * otros también son legibles para cualquier usuario con sesión.
 */
export function useMenus(user: User | null): Menus {
  const [menus, setMenus] = useState<MenuResumen[]>([]);
  const [compartidos, setCompartidos] = useState<MenuDeOtro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  useEffect(() => {
    // `activo` descarta una respuesta que llega cuando la sección ya se cerró.
    let activo = true;

    async function cargar() {
      if (!userId) {
        setMenus([]);
        setCompartidos([]);
        setLoading(false);
        return;
      }

      const [propios, ajenos] = await Promise.all([
        supabase.from('menus').select('*, menu_recetas(count)').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('menus').select('*, menu_recetas(count)').eq('visibilidad', 'afans').neq('user_id', userId).order('created_at', { ascending: false }),
      ]);
      if (!activo) return;

      const fallo = propios.error ?? ajenos.error;
      if (fallo) {
        setError(errorMessage(fallo, 'No se pudieron cargar tus menús.'));
        setLoading(false);
        return;
      }

      const deOtros = ((ajenos.data ?? []) as Fila[]).map(aResumen);
      // Los nombres salen de `perfiles`, que solo tiene a quien lo ha rellenado: sin él, sin firma.
      const nombres = new Map<string, string>();
      if (deOtros.length > 0) {
        const { data: perfiles } = await supabase
          .from('perfiles')
          .select('user_id, nombre')
          .in('user_id', [...new Set(deOtros.map((m) => m.user_id))]);
        for (const p of (perfiles ?? []) as { user_id: string; nombre: string }[]) nombres.set(p.user_id, p.nombre);
        if (!activo) return;
      }

      setMenus(((propios.data ?? []) as Fila[]).map(aResumen));
      setCompartidos(deOtros.map((m) => ({ ...m, autor: nombres.get(m.user_id) ?? null })));
      setError(null);
      setLoading(false);
    }

    void cargar();
    return () => { activo = false; };
  }, [userId]);

  const crear = useCallback(async (nombre: string, comensales: number) => {
    if (!userId) return null;
    const { data, error: err } = await supabase
      .from('menus')
      .insert({ user_id: userId, nombre: nombre.trim(), comensales })
      .select()
      .single();
    if (err) {
      setError(errorMessage(err, 'No se pudo crear el menú.'));
      return null;
    }
    const menu = data as Menu;
    setMenus((prev) => [{ ...menu, recetas: 0 }, ...prev]);
    setError(null);
    return menu;
  }, [userId]);

  const borrar = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('menus').delete().eq('id', id);
    if (err) {
      setError(errorMessage(err, 'No se pudo borrar el menú.'));
      return;
    }
    setMenus((prev) => prev.filter((m) => m.id !== id));
    setError(null);
  }, []);

  return { menus, compartidos, loading, error, crear, borrar };
}
