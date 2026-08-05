import { supabase, SUPABASE_ANON_KEY } from './supabase';

const webhookBase = import.meta.env.VITE_N8N_WEBHOOK_BASE;

if (!webhookBase) {
  throw new Error('Missing n8n environment variables');
}

const base = webhookBase.replace(/\/$/, '');

export const N8N_WEBHOOKS = {
  nuevaReceta: `${base}/nueva-receta`,
  eliminarReceta: `${base}/eliminar-receta`,
  compartirReceta: `${base}/compartir-receta`,
} as const;

/**
 * POST a un webhook de n8n con errores legibles.
 *
 * `fetch` lanza un TypeError genérico ("Failed to fetch") cuando n8n está caído
 * o falta la cabecera CORS, y devuelve la respuesta sin quejarse cuando el flujo
 * responde 4xx/5xx. Aquí distinguimos ambos casos para que el usuario vea algo
 * accionable en lugar de un fallo mudo.
 *
 * Adjunta el access token de Supabase para que el flujo pueda verificar quién
 * llama: los webhooks son URLs públicas y sin esto aceptan cualquier POST.
 */
export async function postToWebhook(
  url: string,
  body: BodyInit,
  contexto: string,
  /**
   * Exige que el flujo conteste `{ "success": true }`.
   *
   * Cuando n8n aborta un flujo con "Respond to Webhook" antes de llegar a ese
   * nodo —por ejemplo si la validación del token falla— responde 200 con cuerpo
   * vacío, no un 5xx. Sin esta comprobación el borrado se daría por bueno y la
   * receta desaparecería de la vista sin haberse borrado en ningún sitio.
   *
   * Solo aplica a los flujos con `responseMode: responseNode` (borrado y envío
   * por email). El de alta responde "Workflow was started" nada más recibir.
   */
  esperaConfirmacion = false
): Promise<Response> {
  let response: Response;

  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {};

  // FormData define su propio Content-Type (con el boundary); solo lo fijamos para JSON.
  if (typeof body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
    // `/auth/v1/user` exige apikey además del Bearer, y es el nodo de n8n quien
    // hace esa llamada reenviando ambas cabeceras. La anon key es pública (viaja
    // ya en el bundle): quien valida de verdad es la firma del JWT.
    headers.apikey = SUPABASE_ANON_KEY;
  }

  try {
    response = await fetch(url, { method: 'POST', headers, body });
  } catch {
    throw new Error(
      `No se pudo conectar con la automatización de ${contexto}. Comprueba que n8n está encendido y que el flujo está activo.`
    );
  }

  if (!response.ok) {
    throw new Error(
      `La automatización de ${contexto} respondió con un error ${response.status}.`
    );
  }

  if (esperaConfirmacion) {
    const texto = (await response.clone().text()).trim();
    let confirmado: boolean;
    try {
      confirmado = texto ? JSON.parse(texto).success === true : false;
    } catch {
      confirmado = false;
    }

    if (!confirmado) {
      throw new Error(
        `La automatización de ${contexto} no confirmó la operación. ` +
        `Si acabas de iniciar sesión, vuelve a intentarlo; si no, revisa la ejecución en n8n.`
      );
    }
  }

  return response;
}
