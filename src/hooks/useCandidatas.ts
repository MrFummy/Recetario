import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { errorMessage } from '../lib/errors';
import { enviarAlta, esperarReceta, type OpcionesPromocion } from '../lib/promover';
import type { Candidata, EstadoCandidata, Json } from '../types';

/** Lo que se puede cambiar a mano desde la web; el resto lo escribe el flujo de n8n. */
export type CambiosCandidata = Partial<{
  titulo: string;
  categoria: string | null;
  notas: Json | null;
  estado: EstadoCandidata;
}>;

export interface Candidatas {
  candidatas: Candidata[];
  loading: boolean;
  error: string | null;
  actualizar: (id: string, cambios: CambiosCandidata) => Promise<void>;
  borrar: (candidata: Candidata) => Promise<void>;
  /**
   * Pasa la candidata al recetario y, solo cuando la receta ya existe, la borra de
   * aquí. Devuelve el id de la receta, o `null` si no apareció a tiempo: en ese caso
   * la candidata se queda donde está.
   */
  promover: (candidata: Candidata, opciones: OpcionesPromocion) => Promise<string | null>;
}

/**
 * Las candidatas de El Laboratorio.
 *
 * Solo las lee el admin: la RLS de `candidatas` no da nada a nadie más, así que
 * para el resto esto devolvería una lista vacía sin error. La sección ya está
 * detrás de `SoloAdmin`, y el hook vive dentro de ella, no en `App`: no hay otro
 * sitio que necesite estos datos.
 */
export function useCandidatas(): Candidatas {
  const [candidatas, setCandidatas] = useState<Candidata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // `activo` descarta una respuesta que llega cuando la sección ya se cerró.
    let activo = true;

    async function cargar() {
      const { data, error: err } = await supabase
        .from('candidatas')
        .select('*')
        .order('created_at', { ascending: false });
      if (!activo) return;
      if (err) setError(errorMessage(err, 'No se pudieron cargar las candidatas.'));
      else setCandidatas((data ?? []) as Candidata[]);
      setLoading(false);
    }

    void cargar();
    return () => { activo = false; };
  }, []);

  const actualizar = useCallback(async (id: string, cambios: CambiosCandidata) => {
    const { error: err } = await supabase.from('candidatas').update(cambios).eq('id', id);
    if (err) throw err;
    setCandidatas((prev) => prev.map((c) => (c.id === id ? { ...c, ...cambios } : c)));
  }, []);

  const borrar = useCallback(async (candidata: Candidata) => {
    const { error: err } = await supabase.from('candidatas').delete().eq('id', candidata.id);
    if (err) throw err;
    setCandidatas((prev) => prev.filter((c) => c.id !== candidata.id));

    // La foto se llama como la fila. Que no se pueda borrar no es fatal: la
    // candidata ya no existe, y un fichero suelto es mantenimiento, no un error.
    if (candidata.foto_url) {
      const { error: errFoto } = await supabase.storage
        .from('fotos-candidatas')
        .remove([`${candidata.id}.jpg`]);
      if (errFoto) console.error('No se pudo borrar la foto de la candidata:', errFoto);
    }
  }, []);

  const promover = useCallback(async (candidata: Candidata, opciones: OpcionesPromocion) => {
    // Un minuto de margen: el reloj de este navegador y el de Supabase no coinciden.
    const desde = new Date(Date.now() - 60_000).toISOString();
    await enviarAlta(candidata, opciones);
    const recetaId = await esperarReceta(candidata.titulo, desde);
    if (recetaId) await borrar(candidata);
    return recetaId;
  }, [borrar]);

  return { candidatas, loading, error, actualizar, borrar, promover };
}
