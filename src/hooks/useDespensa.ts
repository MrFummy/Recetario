import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { errorMessage } from '../lib/errors';

/** Forma canónica con la que se guarda un ingrediente en la despensa. */
export function claveDespensa(base: string): string {
  return base.trim().toLowerCase();
}

/**
 * Los ingredientes que el usuario tiene en casa.
 *
 * Se guarda por `base` —el ingrediente genérico— y no por receta: marcar
 * "cebolla" vale para las 19 recetas que la llevan. Sin sesión no se persiste
 * nada, pero los checks siguen funcionando en memoria durante la visita.
 */
export function useDespensa(user?: User | null) {
  const [enDespensa, setEnDespensa] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  useEffect(() => {
    // `activo` descarta la respuesta de una carga que ya quedó obsoleta, por
    // ejemplo si se cierra sesión mientras la consulta sigue en vuelo.
    let activo = true;

    async function cargar() {
      if (!userId) {
        setEnDespensa(new Set());
        return;
      }

      setCargando(true);
      const { data, error } = await supabase.from('despensa').select('base');
      if (!activo) return;

      if (error) {
        setError(errorMessage(error, 'No se pudo cargar tu despensa.'));
      } else {
        setEnDespensa(new Set((data ?? []).map((f) => f.base)));
        setError(null);
      }
      setCargando(false);
    }

    void cargar();

    return () => { activo = false; };
  }, [userId]);

  const tengo = useCallback(
    (base: string) => enDespensa.has(claveDespensa(base)),
    [enDespensa]
  );

  /** Marca o desmarca un ingrediente. Optimista: revierte si falla. */
  const alternar = useCallback(async (base: string) => {
    const clave = claveDespensa(base);
    if (!clave) return;

    const teniaAntes = enDespensa.has(clave);
    const siguiente = new Set(enDespensa);
    if (teniaAntes) siguiente.delete(clave); else siguiente.add(clave);
    setEnDespensa(siguiente);
    setError(null);

    if (!userId) return; // sin sesión, solo en memoria

    const { error } = teniaAntes
      ? await supabase.from('despensa').delete().eq('base', clave)
      : await supabase.from('despensa').upsert({ user_id: userId, base: clave });

    if (error) {
      setEnDespensa(enDespensa); // revertimos al estado previo
      setError(errorMessage(error, teniaAntes
        ? 'No se pudo quitar el ingrediente de tu despensa.'
        : 'No se pudo añadir el ingrediente a tu despensa.'));
    }
  }, [enDespensa, userId]);

  /** Vacía de la despensa los ingredientes indicados, típicamente los de una receta. */
  const quitarVarios = useCallback(async (bases: string[]) => {
    const claves = [...new Set(bases.map(claveDespensa).filter(Boolean))]
      .filter((c) => enDespensa.has(c));
    if (claves.length === 0) return;

    const previo = enDespensa;
    const siguiente = new Set(enDespensa);
    claves.forEach((c) => siguiente.delete(c));
    setEnDespensa(siguiente);
    setError(null);

    if (!userId) return;

    const { error } = await supabase.from('despensa').delete().in('base', claves);
    if (error) {
      setEnDespensa(previo);
      setError(errorMessage(error, 'No se pudieron quitar los ingredientes de tu despensa.'));
    }
  }, [enDespensa, userId]);

  return { tengo, alternar, quitarVarios, cargando, error, total: enDespensa.size };
}
