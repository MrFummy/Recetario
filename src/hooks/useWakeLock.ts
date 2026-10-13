import { useEffect } from 'react';

/**
 * Mantiene la pantalla encendida mientras `activo` sea true.
 *
 * El navegador suelta el bloqueo solo cuando la pestaña pasa a segundo plano,
 * así que se vuelve a pedir al regresar. Si el navegador no soporta la API
 * (o rechaza la petición) no pasa nada: la pantalla se apagará como siempre.
 */
export function useWakeLock(activo: boolean) {
  useEffect(() => {
    if (!activo || !('wakeLock' in navigator)) return;

    let candado: WakeLockSentinel | null = null;
    let cancelado = false;

    const pedir = async () => {
      try {
        const nuevo = await navigator.wakeLock.request('screen');
        if (cancelado) void nuevo.release();
        else candado = nuevo;
      } catch {
        // Sin permiso o sin batería suficiente: seguimos sin el bloqueo.
      }
    };

    const alVolver = () => {
      if (document.visibilityState === 'visible') void pedir();
    };

    void pedir();
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      cancelado = true;
      document.removeEventListener('visibilitychange', alVolver);
      void candado?.release();
    };
  }, [activo]);
}
