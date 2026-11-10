import type { CSSProperties } from 'react';
import type { Pais } from '../types';

const DATOS: { clave: 'capital' | 'idioma' | 'moneda'; etiqueta: string }[] = [
  { clave: 'capital', etiqueta: 'Capital' },
  { clave: 'idioma', etiqueta: 'Idioma' },
  { clave: 'moneda', etiqueta: 'Moneda' },
];

/**
 * Capital, idioma y moneda como un billete de viaje: celdas separadas por una línea
 * discontinua y muescas en los lados. Solo pinta los datos que el admin ha escrito.
 */
export function FichaPais({ pais }: { pais: Pais | null }) {
  const datos = DATOS.filter((d) => pais?.[d.clave]);
  if (!pais || datos.length === 0) return null;

  return (
    <dl
      className="relative mt-9 grid grid-cols-1 rounded-[4px] border-[1.5px] border-ink bg-paper-2 sm:[grid-template-columns:var(--columnas)]"
      style={{ '--columnas': `repeat(${datos.length}, minmax(0, 1fr))` } as CSSProperties}
    >
      <span aria-hidden="true" className="absolute -left-[9px] top-1/2 hidden h-4 w-4 -translate-y-1/2 rounded-full border-[1.5px] border-ink bg-paper sm:block" />
      <span aria-hidden="true" className="absolute -right-[9px] top-1/2 hidden h-4 w-4 -translate-y-1/2 rounded-full border-[1.5px] border-ink bg-paper sm:block" />
      {datos.map(({ clave, etiqueta }) => (
        <div key={clave} className="border-t-[1.5px] border-dashed border-ink px-5 py-3.5 first:border-t-0 sm:border-l-[1.5px] sm:border-t-0 sm:first:border-l-0">
          <dt className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">{etiqueta}</dt>
          <dd className="font-display text-xl font-semibold leading-tight tracking-tight text-ink">{pais[clave]}</dd>
        </div>
      ))}
    </dl>
  );
}
