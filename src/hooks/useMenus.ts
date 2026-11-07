import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { errorMessage } from '../lib/errors';
import type { Menu } from '../types';

export type MenuResumen = Menu & { recetas: number };

export interface Menus {
  menus: MenuResumen[];
  loading: boolean;
  error: string | null;
  /** Devuelve el menú creado, o `null` si falló (el motivo queda en `error`). */
  crear: (nombre: string, comensales: number) => Promise<Menu | null>;
  borrar: (id: string) => Promise<void>;
}

/**
 * Los menús del usuario. Viven en la sección, no en `App`: nadie más los usa.
 * La RLS de `menus` solo deja ver los propios, así que no hace falta filtrar
 * por usuario al leer.
 */
export function useMenus(user: User | null): Menus {
  const [menus, setMenus] = useState<MenuResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  useEffect(() => {
    // `activo` descarta una respuesta que llega cuando la sección ya se cerró.
    let activo = true;

    async function cargar() {
      const { data, error: err } = await supabase
        .from('menus')
        .select('*, menu_recetas(count)')
        .order('created_at', { ascending: false });
      if (!activo) return;
      if (err) {
        setError(errorMessage(err, 'No se pudieron cargar tus menús.'));
      } else {
        const filas = (data ?? []) as (Menu & { menu_recetas: { count: number }[] })[];
        setMenus(filas.map(({ menu_recetas, ...menu }) => ({ ...menu, recetas: menu_recetas[0]?.count ?? 0 })));
        setError(null);
      }
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

  return { menus, loading, error, crear, borrar };
}
