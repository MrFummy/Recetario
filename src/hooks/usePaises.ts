import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { errorMessage } from '../lib/errors';
import type { FotoPais, Pais } from '../types';

/**
 * Los países visitados de «Mi pasaporte» y sus fotos. La lectura es pública (como
 * el catálogo), así que no depende de la sesión. Vive dentro de la sección, no en
 * `App`: nadie más usa estos datos.
 */
export function usePaises() {
  const [paises, setPaises] = useState<Pais[]>([]);
  const [fotos, setFotos] = useState<FotoPais[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // `active` descarta la respuesta si la sección se desmonta antes de que llegue.
    let active = true;

    async function load() {
      const [p, f] = await Promise.all([
        supabase.from('paises').select('*').order('nombre'),
        supabase.from('fotos_pais').select('*').order('orden'),
      ]);
      if (!active) return;
      const fallo = p.error ?? f.error;
      if (fallo) setError(errorMessage(fallo, 'No se pudieron cargar los países.'));
      else {
        setPaises(p.data ?? []);
        setFotos(f.data ?? []);
      }
      setLoading(false);
    }

    void load();
    return () => { active = false; };
  }, []);

  return { paises, fotos, loading, error };
}
