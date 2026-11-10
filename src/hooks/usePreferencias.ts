import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { errorMessage } from '../lib/errors';

export interface Preferencias {
  cargando: boolean;
  /** `false` hasta que el usuario lo pide: los avisos son siempre opt-in. */
  avisosRecetas: boolean;
  error: string | null;
  guardarAvisosRecetas: (activo: boolean) => Promise<void>;
}

/**
 * Los ajustes del usuario (`preferencias`). Sin fila, todo está apagado: la fila se crea la
 * primera vez que se cambia algo. El correo al que llegan los avisos es el de la cuenta; aquí
 * no se guarda ni se pide otro.
 */
export function usePreferencias(user: User | null): Preferencias {
  const [avisosRecetas, setAvisosRecetas] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  useEffect(() => {
    // `activo` descarta una respuesta que llega cuando ya se cerró la sesión o la página.
    let activo = true;

    async function cargar() {
      if (!userId) {
        setAvisosRecetas(false);
        setCargando(false);
        return;
      }
      const { data, error: err } = await supabase
        .from('preferencias')
        .select('avisos_recetas')
        .eq('user_id', userId)
        .maybeSingle();
      if (!activo) return;
      if (err) setError(errorMessage(err, 'No se pudieron cargar tus ajustes.'));
      else {
        setAvisosRecetas(data?.avisos_recetas ?? false);
        setError(null);
      }
      setCargando(false);
    }

    void cargar();
    return () => { activo = false; };
  }, [userId]);

  /** Optimista, como la despensa: se revierte si Supabase rechaza el cambio. */
  const guardarAvisosRecetas = useCallback(async (nuevo: boolean) => {
    if (!userId) return;
    const anterior = avisosRecetas;
    setAvisosRecetas(nuevo);
    const { error: err } = await supabase
      .from('preferencias')
      .upsert({ user_id: userId, avisos_recetas: nuevo });
    if (err) {
      setAvisosRecetas(anterior);
      setError(errorMessage(err, 'No se pudo guardar el cambio.'));
      return;
    }
    setError(null);
  }, [userId, avisosRecetas]);

  return { cargando, avisosRecetas, error, guardarAvisosRecetas };
}
