// Indexa las recetas para la búsqueda semántica: construye un texto de cada una,
// lo embebe con Gemini y guarda el vector en `recetas_embeddings`.
//
// Solo para admin, o para `buscar-recetas`, que lo llama con la service_role
// cuando detecta recetas sin vector (las altas nuevas).
//
// Es idempotente: guarda el hash del texto embebido y salta las recetas cuyo
// texto no ha cambiado, así que volver a lanzarlo cuesta solo lo que se haya
// editado.
//
// Cuerpo opcional: { "receta_id": "<uuid>" } para indexar una sola (p. ej. la
// que acaba de darse de alta); sin él, recorre todas.
//
// Secreto necesario: GEMINI_API_KEY (el mismo que usa `buscar-recetas`).

import { createClient } from 'npm:@supabase/supabase-js@2';

const MODELO = 'gemini-embedding-001';
const DIMENSIONES = 768;
const LOTE = 20;
const MAX_CARACTERES = 6000;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(cuerpo: unknown, status = 200) {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

/** Aplana un JSONB cualquiera (cadenas, objetos, arrays anidados) a trozos de texto. */
function trozos(valor: unknown): string[] {
  if (valor == null) return [];
  if (typeof valor === 'string') return valor.trim() ? [valor.trim()] : [];
  if (typeof valor === 'number' || typeof valor === 'boolean') return [String(valor)];
  if (Array.isArray(valor)) return valor.flatMap(trozos);
  if (typeof valor === 'object') {
    const o = valor as Record<string, unknown>;
    // Un ingrediente estructurado: "cantidad nombre". Lo demás son `base`,
    // `valor`, `unidad`, `id`…, que no aportan significado al embedding.
    if (typeof o.nombre === 'string') {
      return [`${typeof o.cantidad === 'string' ? o.cantidad : ''} ${o.nombre}`.trim()];
    }
    return Object.values(o).flatMap(trozos);
  }
  return [];
}

interface Receta {
  id: string;
  titulo: string | null;
  categoria: string | null;
  ingredientes: unknown;
  pasos: unknown;
  notas: unknown;
}

function textoDe(r: Receta): string {
  const texto = [
    `${r.titulo ?? ''}. Categoría: ${r.categoria ?? 'sin categoría'}.`,
    `Ingredientes: ${trozos(r.ingredientes).join(', ')}.`,
    `Preparación: ${trozos(r.pasos).join(' ')}`,
    trozos(r.notas).length ? `Notas: ${trozos(r.notas).join(' ')}` : '',
  ].filter(Boolean).join('\n');
  return texto.slice(0, MAX_CARACTERES);
}

async function sha256(texto: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function embeberLote(textos: string[]): Promise<number[][]> {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:batchEmbedContents`,
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': Deno.env.get('GEMINI_API_KEY') ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: textos.map((t) => ({
          model: `models/${MODELO}`,
          content: { parts: [{ text: t }] },
          taskType: 'RETRIEVAL_DOCUMENT',
          outputDimensionality: DIMENSIONES,
        })),
      }),
    },
  );
  if (!r.ok) throw new Error(`Gemini ${r.status}`);
  return (await r.json()).embeddings.map((e: { values: number[] }) => e.values);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  // Llamada interna de `buscar-recetas`: la service_role nunca sale del servidor.
  const esInterna = token !== '' && token === Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!esInterna) {
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return json({ error: 'Hace falta iniciar sesión.' }, 401);

    // Misma regla que `es_admin()`, pero aquí se evalúa con service_role, que se
    // salta la RLS de `admins` (esa tabla no tiene policies).
    const { data: admin } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
    if (!admin) return json({ error: 'Solo el admin puede reindexar.' }, 403);
  }

  const recetaId = ((await req.json().catch(() => ({}))).receta_id ?? '').toString();

  try {
    let consulta = supabase.from('recetas').select('id,titulo,categoria,ingredientes,pasos,notas');
    if (recetaId) consulta = consulta.eq('id', recetaId);
    const { data: recetas, error } = await consulta;
    if (error) throw error;

    const { data: existentes, error: errEx } = await supabase.from('recetas_embeddings').select('receta_id,texto_hash');
    if (errEx) throw errEx;
    const hashes = new Map((existentes ?? []).map((e) => [e.receta_id, e.texto_hash]));

    const pendientes: { id: string; texto: string; hash: string }[] = [];
    for (const r of (recetas ?? []) as Receta[]) {
      const texto = textoDe(r);
      const hash = await sha256(texto);
      if (hashes.get(r.id) !== hash) pendientes.push({ id: r.id, texto, hash });
    }

    for (let i = 0; i < pendientes.length; i += LOTE) {
      const lote = pendientes.slice(i, i + LOTE);
      const vectores = await embeberLote(lote.map((p) => p.texto));
      const { error: errUp } = await supabase.from('recetas_embeddings').upsert(
        lote.map((p, j) => ({
          receta_id: p.id,
          embedding: JSON.stringify(vectores[j]),
          texto_hash: p.hash,
          actualizado: new Date().toISOString(),
        })),
      );
      if (errUp) throw errUp;
    }

    return json({
      total: recetas?.length ?? 0,
      indexadas: pendientes.length,
      sin_cambios: (recetas?.length ?? 0) - pendientes.length,
    });
  } catch (e) {
    console.error(e);
    return json({ error: 'No se pudo completar la indexación.' }, 502);
  }
});
