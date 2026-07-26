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
