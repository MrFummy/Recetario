import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { errorMessage } from '../lib/errors';

export type EstadoSugerencia = 'pendiente' | 'aceptada' | 'descartada' | 'hecha';

export interface Sugerencia {
  id: string;
  user_id: string;
  enlace: string | null;
  texto: string | null;
  nota: string | null;
  estado: EstadoSugerencia;
  citar: boolean;
  /** La receta creada a partir de ella; solo la pone el admin. */
  receta_id: string | null;
  created_at: string;
}

export interface NuevaSugerencia {
  enlace: string;
  texto: string;
  nota: string;
  citar: boolean;
}

/**
 * Las sugerencias que el usuario puede ver: las suyas, o todas si es el admin (lo decide la RLS,
 * no este hook). Enviar tiene límites en la base de datos —correo confirmado y 5 al día—, y su
 * mensaje de error se enseña tal cual.
 */
export function useSugerencias(userId: string) {
  const [lista, setLista] = useState<Sugerencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function leer() {
    const { data, error: err } = await supabase
      .from('sugerencias')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: (data ?? []) as Sugerencia[], err };
  }

  useEffect(() => {
    // `activo` descarta una respuesta que llega cuando el componente ya no está.
    let activo = true;
    void leer().then(({ data, err }) => {
      if (!activo) return;
      if (err) setError(errorMessage(err, 'No se pudieron cargar las sugerencias.'));
      else setLista(data);
      setCargando(false);
    });
    return () => { activo = false; };
  }, []);

  const enviar = useCallback(async (n: NuevaSugerencia) => {
    const { error: err } = await supabase.from('sugerencias').insert({
      user_id: userId,
      enlace: n.enlace.trim() || null,
      texto: n.texto.trim() || null,
      nota: n.nota.trim() || null,
      citar: n.citar,
    });
    if (err) throw err;
    const { data, err: errLeer } = await leer();
    if (!errLeer) setLista(data);
  }, [userId]);

  const cambiarEstado = useCallback(async (id: string, estado: EstadoSugerencia) => {
    const { error: err } = await supabase.from('sugerencias').update({ estado }).eq('id', id);
    if (err) setError(errorMessage(err, 'No se pudo cambiar el estado.'));
    else setLista((l) => l.map((s) => (s.id === id ? { ...s, estado } : s)));
  }, []);

  const enlazarReceta = useCallback(async (id: string, recetaId: string | null) => {
    const { error: err } = await supabase.from('sugerencias').update({ receta_id: recetaId }).eq('id', id);
    if (err) setError(errorMessage(err, 'No se pudo enlazar la receta.'));
    else setLista((l) => l.map((s) => (s.id === id ? { ...s, receta_id: recetaId } : s)));
  }, []);

  const borrar = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('sugerencias').delete().eq('id', id);
    if (err) setError(errorMessage(err, 'No se pudo borrar.'));
    else setLista((l) => l.filter((s) => s.id !== id));
  }, []);

  return { lista, cargando, error, enviar, cambiarEstado, enlazarReceta, borrar };
}
