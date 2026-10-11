import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

/**
 * El nombre de pila del usuario, con el que firma sus notas en el muro.
 *
 * Hasta que lo elige, `nombre` es null y el formulario de "ya hecha" se lo pide.
 */
export function usePerfil(user: User | null | undefined) {
  const [nombre, setNombre] = useState<string | null>(null);
  const userId = user?.id;

  useEffect(() => {
    let activo = true;

    async function cargar() {
      if (!userId) {
        setNombre(null);
        return;
      }
      const { data } = await supabase
        .from('perfiles')
        .select('nombre')
        .eq('user_id', userId)
        .maybeSingle();
      if (activo) setNombre(data?.nombre ?? null);
    }

    void cargar();

    return () => { activo = false; };
  }, [userId]);

  const guardarNombre = async (nuevo: string) => {
    if (!userId) throw new Error('Debes iniciar sesión.');
    const limpio = nuevo.trim();
    const { error } = await supabase
      .from('perfiles')
      .upsert({ user_id: userId, nombre: limpio });
    if (error) throw error;
    setNombre(limpio);
  };

  return { nombre, guardarNombre };
}
