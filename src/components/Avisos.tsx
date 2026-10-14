import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { aHash, CATALOGO } from '../lib/rutas';

/**
 * Puerta de la pantalla de alta.
 *
 * Solo decide qué se pinta: quien de verdad impide dar de alta una receta es la
 * validación de JWT del webhook de n8n. Espera a saber si hay sesión antes de
 * negar nada, porque un admin recargando en #/nueva veía "acceso denegado"
 * durante el instante que tarda `getSession`.
 */
export function SoloAdmin({
  sesionCargada, isAdmin, accion = 'añadir recetas', children,
}: {
  sesionCargada: boolean;
  isAdmin: boolean;
  /** Lo que se intenta hacer, para el mensaje de «acceso denegado». */
  accion?: string;
  children: ReactNode;
}) {
  if (!sesionCargada) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-ink-soft font-mono text-sm">
        <Loader2 size={18} className="animate-spin" />
        Comprobando la sesión…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-20 animate-in fade-in zoom-in-95 duration-300">
        <h2 className="text-2xl font-bold text-ink mb-2">Acceso denegado</h2>
        <p className="text-ink-soft">No tienes permisos para {accion}.</p>
        <a
          href={aHash(CATALOGO)}
          className="inline-block mt-6 px-6 py-2 bg-ink text-paper rounded-md hover:bg-ink-soft transition-colors"
        >
          Volver al catálogo
        </a>
      </div>
    );
  }

  return <div className="animate-in fade-in zoom-in-95 duration-300 pt-4">{children}</div>;
}

/** Alguien ha abierto el enlace de una receta borrada, o con el id mal copiado. */
export function RecetaNoEncontrada() {
  return (
    <div className="fixed inset-0 z-40 bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4
                    animate-in fade-in duration-200">
      <div className="bg-paper max-w-sm w-full p-8 text-center shadow-brut border-2 border-ink -rotate-1">
        <p className="font-display text-2xl text-ink mb-2">Esta receta no está.</p>
        <p className="font-mono text-sm text-ink-soft mb-6">
          O se ha borrado, o el enlace llegó incompleto.
        </p>
        <a
          href={aHash(CATALOGO)}
          className="inline-block px-6 py-2 bg-ink text-paper rounded-md hover:bg-ink-soft transition-colors"
        >
          Ir al catálogo
        </a>
      </div>
    </div>
  );
}
