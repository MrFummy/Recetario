// Búsqueda semántica: embebe la consulta con la API de Gemini (Google AI
// Studio) y devuelve los ids de las recetas más parecidas, por similitud.
//
// Es la misma API y el mismo tipo de clave que usa el nodo "Vertex AI" de n8n
// (que pese al nombre llama a generativelanguage.googleapis.com, no a Vertex):
// no hace falta cuenta de servicio, solo una API key.
//
// Secreto necesario (supabase secrets set GEMINI_API_KEY=…).
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los inyecta Supabase.
//
// Exige sesión: cada búsqueda consume cuota de Gemini y esta URL es pública.
// `verify_jwt` solo comprueba que el token esté bien firmado, y la clave anónima
// (que va en el frontend) también lo está, así que además se pide un usuario
// real con `auth.getUser`.

import { createClient } from 'npm:@supabase/supabase-js@2';

const MODELO = 'gemini-embedding-001';
const DIMENSIONES = 768;

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

async function embeber(texto: string): Promise<number[]> {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:embedContent`,
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': Deno.env.get('GEMINI_API_KEY') ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: { parts: [{ text: texto }] },
        // RETRIEVAL_QUERY para la consulta y RETRIEVAL_DOCUMENT al indexar:
        // el modelo los trata distinto a propósito.
        taskType: 'RETRIEVAL_QUERY',
        outputDimensionality: DIMENSIONES,
      }),
    },
  );
  if (!r.ok) throw new Error(`Gemini ${r.status}`);
  return (await r.json()).embedding.values;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);

  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return json({ error: 'Hace falta iniciar sesión.' }, 401);

  const consulta = ((await req.json().catch(() => ({}))).consulta ?? '').toString().trim();
  if (consulta.length < 2 || consulta.length > 300) {
    return json({ error: 'La consulta debe tener entre 2 y 300 caracteres.' }, 400);
  }

  try {
    const vector = await embeber(consulta);
    const { data, error } = await supabase.rpc('buscar_recetas_semantico', {
      consulta: JSON.stringify(vector),
      limite: 12,
    });
    if (error) throw error;
    return json({ resultados: data });
  } catch (e) {
    console.error(e);
    return json({ error: 'No se pudo completar la búsqueda.' }, 502);
  }
});
