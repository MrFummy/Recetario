import { useState, useEffect, useCallback, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { errorMessage } from '../lib/errors';

/** Forma canónica con la que se guarda un ingrediente en la despensa. */
export function claveDespensa(base: string): string {
  return base.trim().toLowerCase();
}

export interface Despensa {
  /** Lo que hay en casa, en orden alfabético. */
  ingredientes: string[];
  tengo: (base: string) => boolean;
  anadir: (base: string) => Promise<void>;
  quitar: (base: string) => Promise<void>;
  alternar: (base: string) => Promise<void>;
  quitarVarios: (bases: string[]) => Promise<void>;
  cargando: boolean;
  error: string | null;
  total: number;
}

/**
 * Los ingredientes que el usuario tiene en casa.
 *
 * Se guarda por `base` —el ingrediente genérico— y no por receta: marcar
 * "cebolla" vale para las 19 recetas que la llevan. Sin sesión no se persiste
 * nada, pero los checks siguen funcionando en memoria durante la visita.
 *
 * Se monta una sola vez, en `App`, y baja por props. Si cada lista de
 * ingredientes llamara al hook por su cuenta habría una copia del conjunto por
 * pantalla: marcar algo en la despensa no se vería en la ficha abierta, y cada
 * receta abierta pagaría su propia consulta.
 */
export function useDespensa(user?: User | null): Despensa {
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

  /**
   * Aplica un cambio al conjunto y lo replica en Supabase, revirtiendo si falla.
   * Optimista a propósito: marcar ingredientes es rápido y encadenado, y esperar
   * a la ida y vuelta en cada casilla se nota.
   */
  const guardar = useCallback(async (
    claves: string[],
    accion: 'anadir' | 'quitar',
    mensajeError: string
  ) => {
    if (claves.length === 0) return;

    const previo = enDespensa;
    const siguiente = new Set(enDespensa);
    claves.forEach((c) => accion === 'anadir' ? siguiente.add(c) : siguiente.delete(c));
    setEnDespensa(siguiente);
    setError(null);

    if (!userId) return; // sin sesión, solo en memoria

    const { error } = accion === 'anadir'
      ? await supabase.from('despensa').upsert(claves.map((base) => ({ user_id: userId, base })))
      : await supabase.from('despensa').delete().in('base', claves);

    if (error) {
      setEnDespensa(previo);
      setError(errorMessage(error, mensajeError));
    }
  }, [enDespensa, userId]);

  const anadir = useCallback(async (base: string) => {
    const clave = claveDespensa(base);
    if (!clave || enDespensa.has(clave)) return;
    await guardar([clave], 'anadir', 'No se pudo añadir el ingrediente a tu despensa.');
  }, [enDespensa, guardar]);

  const quitar = useCallback(async (base: string) => {
    const clave = claveDespensa(base);
    if (!clave || !enDespensa.has(clave)) return;
    await guardar([clave], 'quitar', 'No se pudo quitar el ingrediente de tu despensa.');
  }, [enDespensa, guardar]);

  const alternar = useCallback(async (base: string) => {
    const clave = claveDespensa(base);
    if (!clave) return;
    await (enDespensa.has(clave) ? quitar(clave) : anadir(clave));
  }, [enDespensa, anadir, quitar]);

  /** Vacía de la despensa los ingredientes indicados, típicamente los de una receta. */
  const quitarVarios = useCallback(async (bases: string[]) => {
    const claves = [...new Set(bases.map(claveDespensa).filter(Boolean))]
      .filter((c) => enDespensa.has(c));
    await guardar(claves, 'quitar', 'No se pudieron quitar los ingredientes de tu despensa.');
  }, [enDespensa, guardar]);

  const ingredientes = useMemo(
    () => [...enDespensa].sort((a, b) => a.localeCompare(b, 'es')),
    [enDespensa]
  );

  return {
    ingredientes, tengo, anadir, quitar, alternar, quitarVarios,
    cargando, error, total: enDespensa.size,
  };
}
