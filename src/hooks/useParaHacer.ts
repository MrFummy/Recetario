import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { errorMessage } from '../lib/errors';

export interface ParaHacer {
  /** Ids de las recetas que el usuario piensa cocinar. */
  ids: Set<string>;
  esta: (recetaId: string) => boolean;
  anadir: (recetaId: string) => Promise<void>;
  quitar: (recetaId: string) => Promise<void>;
  alternar: (recetaId: string) => Promise<void>;
  error: string | null;
  total: number;
}

/**
 * Las recetas que el usuario tiene "para hacer": alimentan la lista de la
 * compra y se cierran al marcar una receta como "ya hecha".
 *
 * Calcado de `useDespensa`: se monta una sola vez, en `App`, y baja por props,
 * porque la ficha de una receta y la lista de la compra conviven con la misma
 * información y no deben tener cada una su copia. Sin sesión no se persiste
 * nada, pero los cambios siguen funcionando en memoria durante la visita.
 */
export function useParaHacer(user?: User | null): ParaHacer {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  useEffect(() => {
    // `activo` descarta la respuesta de una carga que ya quedó obsoleta.
    let activo = true;

    async function cargar() {
      if (!userId) {
        setIds(new Set());
        return;
      }

      const { data, error } = await supabase.from('para_hacer').select('receta_id');
      if (!activo) return;

      if (error) {
        setError(errorMessage(error, 'No se pudo cargar tu lista de recetas por hacer.'));
      } else {
        setIds(new Set((data ?? []).map((f) => f.receta_id)));
        setError(null);
      }
    }

    void cargar();

    return () => { activo = false; };
  }, [userId]);

  const esta = useCallback((recetaId: string) => ids.has(recetaId), [ids]);

  /** Optimista, como la despensa: se revierte si Supabase rechaza el cambio. */
  const guardar = useCallback(async (
    recetaId: string,
    accion: 'anadir' | 'quitar',
    mensajeError: string
  ) => {
    const previo = ids;
    const siguiente = new Set(ids);
    if (accion === 'anadir') siguiente.add(recetaId); else siguiente.delete(recetaId);
    setIds(siguiente);
    setError(null);

    if (!userId) return; // sin sesión, solo en memoria

    const { error } = accion === 'anadir'
      ? await supabase.from('para_hacer').upsert({ user_id: userId, receta_id: recetaId })
      : await supabase.from('para_hacer').delete().eq('receta_id', recetaId);

    if (error) {
      setIds(previo);
      setError(errorMessage(error, mensajeError));
    }
  }, [ids, userId]);

  const anadir = useCallback(async (recetaId: string) => {
    if (ids.has(recetaId)) return;
    await guardar(recetaId, 'anadir', 'No se pudo marcar la receta como por hacer.');
  }, [ids, guardar]);

  const quitar = useCallback(async (recetaId: string) => {
    if (!ids.has(recetaId)) return;
    await guardar(recetaId, 'quitar', 'No se pudo quitar la receta de tu lista.');
  }, [ids, guardar]);

  const alternar = useCallback(async (recetaId: string) => {
    await (ids.has(recetaId) ? quitar(recetaId) : anadir(recetaId));
  }, [ids, anadir, quitar]);

  return { ids, esta, anadir, quitar, alternar, error, total: ids.size };
}
