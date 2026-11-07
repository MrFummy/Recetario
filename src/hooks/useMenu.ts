import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { errorMessage } from '../lib/errors';
import type { Menu, MenuReceta, Pase } from '../types';

/** Lo que se puede cambiar de un menú desde su cabecera. */
export type CambiosMenu = Partial<Pick<Menu, 'nombre' | 'ocasion' | 'fecha' | 'comensales' | 'notas'>>;

export interface MenuAbierto {
  menu: Menu | null;
  items: MenuReceta[];
  loading: boolean;
  /** El id no existe o es de otro usuario: la RLS no distingue entre las dos cosas. */
  noEncontrado: boolean;
  error: string | null;
  actualizar: (cambios: CambiosMenu) => Promise<void>;
  anadir: (recetaId: string, pase: Pase) => Promise<void>;
  quitar: (recetaId: string) => Promise<void>;
  cambiarPase: (recetaId: string, pase: Pase) => Promise<void>;
}

/**
 * Un menú y las recetas que lleva. Los fallos quedan en `error`, no se lanzan.
 * No se reinicia al cambiar de id: quien lo usa se monta con `key={id}`.
 */
export function useMenu(menuId: string): MenuAbierto {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [items, setItems] = useState<MenuReceta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // `activo` descarta una respuesta que llega cuando ya se abrió otro menú.
    let activo = true;

    async function cargar() {
      const [resMenu, resItems] = await Promise.all([
        supabase.from('menus').select('*').eq('id', menuId).maybeSingle(),
        supabase.from('menu_recetas').select('*').eq('menu_id', menuId).order('orden'),
      ]);
      if (!activo) return;
      const fallo = resMenu.error ?? resItems.error;
      if (fallo) {
        setError(errorMessage(fallo, 'No se pudo cargar el menú.'));
      } else {
        setMenu((resMenu.data as Menu | null) ?? null);
        setItems((resItems.data ?? []) as MenuReceta[]);
        setError(null);
      }
      setLoading(false);
    }

    void cargar();
    return () => { activo = false; };
  }, [menuId]);

  const actualizar = useCallback(async (cambios: CambiosMenu) => {
    const { error: err } = await supabase.from('menus').update(cambios).eq('id', menuId);
    if (err) {
      setError(errorMessage(err, 'No se pudo guardar el cambio.'));
      return;
    }
    setMenu((prev) => (prev ? { ...prev, ...cambios } : prev));
    setError(null);
  }, [menuId]);

  const anadir = useCallback(async (recetaId: string, pase: Pase) => {
    const orden = items.reduce((max, i) => Math.max(max, i.orden), -1) + 1;
    const { data, error: err } = await supabase
      .from('menu_recetas')
      .insert({ menu_id: menuId, receta_id: recetaId, pase, orden })
      .select()
      .single();
    if (err) {
      setError(errorMessage(err, 'No se pudo añadir la receta.'));
      return;
    }
    setItems((prev) => [...prev, data as MenuReceta]);
    setError(null);
  }, [menuId, items]);

  const quitar = useCallback(async (recetaId: string) => {
    const { error: err } = await supabase
      .from('menu_recetas').delete().eq('menu_id', menuId).eq('receta_id', recetaId);
    if (err) {
      setError(errorMessage(err, 'No se pudo quitar la receta.'));
      return;
    }
    setItems((prev) => prev.filter((i) => i.receta_id !== recetaId));
    setError(null);
  }, [menuId]);

  const cambiarPase = useCallback(async (recetaId: string, pase: Pase) => {
    const { error: err } = await supabase
      .from('menu_recetas').update({ pase }).eq('menu_id', menuId).eq('receta_id', recetaId);
    if (err) {
      setError(errorMessage(err, 'No se pudo cambiar el pase.'));
      return;
    }
    setItems((prev) => prev.map((i) => (i.receta_id === recetaId ? { ...i, pase } : i)));
    setError(null);
  }, [menuId]);

  return { menu, items, loading, noEncontrado: !loading && !menu && !error, error, actualizar, anadir, quitar, cambiarPase };
}
