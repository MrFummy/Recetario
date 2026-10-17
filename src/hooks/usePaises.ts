import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { errorMessage, idUnico } from '../lib/errors';
import { comprimirImagen } from '../lib/imagen';
import { nombrePais } from '../lib/paises';
import type { FotoPais, Pais } from '../types';

const BUCKET = 'fotos-paises';

/** Lo que el admin puede escribir de un país a mano. */
export type CambiosPais = Partial<Pick<Pais, 'fecha_viaje' | 'contexto' | 'lema' | 'portada_url'>>;

export interface Paises {
  paises: Pais[];
  fotos: FotoPais[];
  loading: boolean;
  error: string | null;
  /** Crea el país si no existe (el nombre sale del código) y aplica los cambios. */
  guardar: (codigo: string, cambios: CambiosPais) => Promise<void>;
  /** Comprime y sube fotos a la galería del país; lo no subido se cuenta en el error. */
  subirFotos: (codigo: string, archivos: File[]) => Promise<void>;
  borrarFoto: (foto: FotoPais) => Promise<void>;
  /**
   * Borra el país y su galería. Las recetas etiquetadas **no se borran**: pierden el
   * país (`recetas.pais` a `null`), o el país seguiría saliendo en el mapa.
   */
  borrar: (codigo: string) => Promise<void>;
}

/** La ruta de un objeto del bucket a partir de su URL pública. */
function rutaEnBucket(url: string): string | null {
  return url.match(new RegExp(`${BUCKET}/(.*)$`))?.[1] ?? null;
}

/**
 * Los países visitados de «Mi pasaporte» y sus fotos. La lectura es pública (como
 * el catálogo), así que no depende de la sesión; las escrituras solo las admite la
 * RLS para el admin. Vive dentro de la sección, no en `App`: nadie más usa estos datos.
 */
export function usePaises(): Paises {
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

  const guardar = useCallback(async (codigo: string, cambios: CambiosPais) => {
    const { data, error: err } = await supabase
      .from('paises')
      .upsert({ codigo, nombre: nombrePais(codigo), ...cambios }, { onConflict: 'codigo' })
      .select()
      .single();
    if (err) throw err;
    setPaises((prev) => [...prev.filter((p) => p.codigo !== codigo), data as Pais]
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
  }, []);

  const subirFotos = useCallback(async (codigo: string, archivos: File[]) => {
    // La FK de `fotos_pais` exige que el país exista: se da de alta si hace falta.
    if (!paises.some((p) => p.codigo === codigo)) await guardar(codigo, {});

    let orden = fotos.filter((f) => f.pais === codigo).reduce((m, f) => Math.max(m, f.orden), -1);
    const fallos: string[] = [];

    for (const archivo of archivos) {
      try {
        const blob = await comprimirImagen(archivo);
        const ruta = `${codigo}/${idUnico()}.jpg`;
        const { error: errSubida } = await supabase.storage
          .from(BUCKET)
          .upload(ruta, blob, { contentType: 'image/jpeg' });
        if (errSubida) throw errSubida;

        const url = supabase.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
        const { data, error: errFila } = await supabase
          .from('fotos_pais')
          .insert({ pais: codigo, url, orden: orden + 1 })
          .select()
          .single();
        if (errFila) {
          // Sin fila el fichero queda suelto: se intenta retirar.
          await supabase.storage.from(BUCKET).remove([ruta]);
          throw errFila;
        }
        orden += 1;
        setFotos((prev) => [...prev, data as FotoPais]);
      } catch (err) {
        fallos.push(`${archivo.name}: ${errorMessage(err, 'no se pudo subir')}`);
      }
    }
    if (fallos.length) throw new Error(`No se subieron ${fallos.length} de ${archivos.length} fotos. ${fallos.join(' · ')}`);
  }, [paises, fotos, guardar]);

  const borrarFoto = useCallback(async (foto: FotoPais) => {
    const { error: err } = await supabase.from('fotos_pais').delete().eq('id', foto.id);
    if (err) throw err;
    setFotos((prev) => prev.filter((f) => f.id !== foto.id));

    // Si era la portada, el país se queda sin ella en vez de apuntar a un fichero borrado.
    const pais = paises.find((p) => p.codigo === foto.pais);
    if (pais?.portada_url === foto.url) await guardar(foto.pais, { portada_url: null });

    // Que no se pueda borrar el fichero no es fatal: la foto ya no existe para la web.
    const ruta = rutaEnBucket(foto.url);
    if (ruta) {
      const { data, error: errFoto } = await supabase.storage.from(BUCKET).remove([ruta]);
      if (errFoto) console.error('No se pudo borrar la foto del país:', errFoto);
      else if (!data || data.length === 0) console.warn(`La foto (${ruta}) no se borró: queda huérfana en el bucket.`);
    }
  }, [paises, guardar]);

  const borrar = useCallback(async (codigo: string) => {
    const { error: errRecetas } = await supabase.from('recetas').update({ pais: null }).eq('pais', codigo);
    if (errRecetas) throw errRecetas;
    const { error: err } = await supabase.from('paises').delete().eq('codigo', codigo);
    if (err) throw err;
    setPaises((prev) => prev.filter((p) => p.codigo !== codigo));
    setFotos((prev) => prev.filter((f) => f.pais !== codigo));

    // La galería se borra por carpeta, no por filas: las filas ya se fueron en cascada.
    const { data: objetos } = await supabase.storage.from(BUCKET).list(codigo);
    if (objetos?.length) {
      const { error: errFotos } = await supabase.storage.from(BUCKET).remove(objetos.map((o) => `${codigo}/${o.name}`));
      if (errFotos) console.error('No se pudieron borrar las fotos del país:', errFotos);
    }
  }, []);

  return { paises, fotos, loading, error, guardar, subirFotos, borrarFoto, borrar };
}
