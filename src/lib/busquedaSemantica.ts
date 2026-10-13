import { supabase } from './supabase';

export interface ResultadoIndexacion {
  total: number;
  indexadas: number;
  sin_cambios: number;
}

/**
 * Pide a la Edge Function que calcule los vectores de las recetas nuevas o
 * editadas. Solo funciona con sesión de admin: la comprobación real está en la
 * función, no aquí. `supabase.functions.invoke` reenvía el JWT de la sesión.
 */
export async function reindexarBusqueda(recetaId?: string): Promise<ResultadoIndexacion> {
  const { data, error } = await supabase.functions.invoke<ResultadoIndexacion>('indexar-recetas', {
    body: recetaId ? { receta_id: recetaId } : {},
  });
  if (error || !data) {
    throw new Error('No se pudo reindexar la búsqueda. Revisa que la función esté desplegada y que seas admin.');
  }
  return data;
}

/**
 * Devuelve los ids de las recetas más parecidas a la frase, de más a menos.
 *
 * Exige sesión: cada búsqueda gasta cuota de Gemini, y la función lo comprueba.
 * Las similitudes salen muy apretadas (0,82 hasta para recetas lejanas), así
 * que la función devuelve siempre las 12 mejores y no se filtra por umbral.
 */
export async function buscarSemantico(consulta: string): Promise<string[]> {
  const { data, error } = await supabase.functions.invoke<{ resultados: { receta_id: string }[] }>(
    'buscar-recetas',
    { body: { consulta } },
  );
  if (error || !data) {
    throw new Error('No se pudo hacer la búsqueda. Inténtalo de nuevo en un momento.');
  }
  return data.resultados.map((r) => r.receta_id);
}
