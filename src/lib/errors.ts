/**
 * Identificador único para nombres de fichero.
 *
 * `crypto.randomUUID()` solo está disponible en contextos seguros (HTTPS o
 * localhost). Al servir la app por HTTP plano en la LAN del Synology sería
 * `undefined` y romperia el cambio de foto, así que hay respaldo.
 */
export function idUnico(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Extrae un mensaje legible de cualquier valor lanzado (Error, PostgrestError, string…). */
export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err) return err;
  if (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as { message: unknown }).message === 'string'
  ) {
    return (err as { message: string }).message;
  }
  return fallback;
}
