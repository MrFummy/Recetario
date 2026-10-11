import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { errorMessage } from '../lib/errors';

/** Una vez que se cocinó una receta: una fila de `valoraciones`. */
export interface Realizacion {
  id: string;
  user_id: string;
  /** Día en que se cocinó, `YYYY-MM-DD`. */
  fecha: string;
  notas: string | null;
  puntuacion: number | null;
  /** Nombre de pila de quien la hizo, si ha elegido uno. */
  nombre: string | null;
}

export interface DatosRealizacion {
  notas: string;
  puntuacion: number | null;
}

/**
 * Las realizaciones de una receta, que alimentan el muro de notas.
 *
 * Nota y puntuación son opcionales; la fecha la pone la base de datos (hoy, en
 * hora de España). La RLS solo deja leer a quien tiene sesión, así que sin
 * usuario la lista queda vacía.
 *
 * `onCambio` se llama tras cada escritura: la media de la receta la recalcula
 * un trigger en Supabase y quien lo usa debe volver a leerla.
 */
export function useRealizaciones(recetaId: string, user: User | null | undefined, onCambio: () => void) {
  const [realizaciones, setRealizaciones] = useState<Realizacion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    // `activo` descarta la respuesta de una carga que ya quedó obsoleta (otra
    // receta abierta, o la sesión cambió mientras la consulta seguía en vuelo).
    let activo = true;

    async function cargar() {
      if (!userId) {
        setRealizaciones([]);
        return;
      }

      setCargando(true);
      const { data, error } = await supabase
        .from('valoraciones')
        .select('id, user_id, fecha, notas, puntuacion')
        .eq('receta_id', recetaId)
        .order('fecha', { ascending: false })
        .order('created_at', { ascending: false });
      if (!activo) return;

      if (error) {
        setError(errorMessage(error, 'No se pudo cargar el muro de notas.'));
        setCargando(false);
        return;
      }

      // No hay clave foránea entre `valoraciones` y `perfiles` (ambas apuntan a
      // `auth.users`), así que PostgREST no puede unirlas: se piden aparte.
      const autores = [...new Set((data ?? []).map((f) => f.user_id))];
      const nombres = new Map<string, string>();
      if (autores.length > 0) {
        const { data: perfiles } = await supabase
          .from('perfiles')
          .select('user_id, nombre')
          .in('user_id', autores);
        (perfiles ?? []).forEach((p) => nombres.set(p.user_id, p.nombre));
      }
      if (!activo) return;

      setRealizaciones((data ?? []).map((f) => ({ ...f, nombre: nombres.get(f.user_id) ?? null })));
      setError(null);
      setCargando(false);
    }

    void cargar();

    return () => { activo = false; };
  }, [recetaId, userId, recarga]);

  const cargar = () => setRecarga((n) => n + 1);

  /** Crea una realización nueva, o edita una propia si se pasa su `id`. */
  const guardar = async (datos: DatosRealizacion, id?: string) => {
    if (!userId) throw new Error('Debes iniciar sesión para marcar una receta como hecha.');

    const fila = { notas: datos.notas.trim() || null, puntuacion: datos.puntuacion };
    const { error } = id
      ? await supabase.from('valoraciones').update(fila).eq('id', id)
      : await supabase.from('valoraciones').insert({ ...fila, receta_id: recetaId, user_id: userId });
    if (error) throw error;

    cargar();
    onCambio();
  };

  const borrar = async (id: string) => {
    const { error } = await supabase.from('valoraciones').delete().eq('id', id);
    if (error) throw error;

    cargar();
    onCambio();
  };

  return { realizaciones, cargando, error, guardar, borrar };
}
