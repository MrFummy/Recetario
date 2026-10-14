import { supabase } from './supabase';
import { N8N_WEBHOOKS, postToWebhook } from './n8n';
import type { Candidata } from '../types';

/** Lo que se decide al pasar una candidata al recetario. */
export interface OpcionesPromocion {
  categoria: string;
  /** Fecha en que se cocinó, `YYYY-MM-DD`. */
  fecha: string;
  /** Foto propia del plato, si la hay; sin ella el flujo pone la imagen por defecto. */
  foto: File | null;
}

const ESPERA_MAX_MS = 150_000;
const CADA_MS = 4_000;

/**
 * Manda la candidata al flujo de alta de n8n, que genera el PDF y la sincroniza con
 * Notion, Drive, Sheets y Supabase igual que cualquier otra receta.
 *
 * El alta responde «Workflow was started» nada más recibirla, así que esto solo
 * confirma que n8n la aceptó; para saber si la receta existe hay que esperarla con
 * `esperarReceta`.
 */
export async function enviarAlta(candidata: Candidata, opciones: OpcionesPromocion): Promise<void> {
  const formData = new FormData();
  formData.append('candidata', JSON.stringify({
    titulo: candidata.titulo,
    categoria: opciones.categoria,
    ingredientes: candidata.ingredientes,
    pasos: candidata.pasos,
    notas: candidata.notas,
    tiempo: candidata.tiempo,
    porciones: candidata.porciones,
    dificultad: candidata.dificultad,
  }));
  formData.append('fecha_clase', opciones.fecha);
  if (opciones.foto) formData.append('foto_plato', opciones.foto);

  await postToWebhook(N8N_WEBHOOKS.nuevaReceta, formData, 'alta de receta');
}

/**
 * Espera a que la receta aparezca en `recetas`; devuelve su id, o `null` si no ha
 * aparecido a tiempo. Sin esta espera borraríamos la candidata aunque el alta hubiera
 * fallado después de aceptarla, y la receta no existiría en ningún sitio.
 */
export async function esperarReceta(titulo: string, desdeISO: string): Promise<string | null> {
  const limite = Date.now() + ESPERA_MAX_MS;
  while (Date.now() < limite) {
    await new Promise((resolver) => setTimeout(resolver, CADA_MS));
    const { data } = await supabase
      .from('recetas')
      .select('id')
      .eq('titulo', titulo)
      .gte('created_at', desdeISO)
      .limit(1);
    if (data && data.length > 0) return data[0].id as string;
  }
  return null;
}
