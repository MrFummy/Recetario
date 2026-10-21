import { Coins, Landmark, Languages, type LucideIcon } from 'lucide-react';
import type { Pais } from '../types';

const DATOS: { clave: 'capital' | 'idioma' | 'moneda'; etiqueta: string; icono: LucideIcon }[] = [
  { clave: 'capital', etiqueta: 'Capital', icono: Landmark },
  { clave: 'idioma', etiqueta: 'Idioma', icono: Languages },
  { clave: 'moneda', etiqueta: 'Moneda', icono: Coins },
];

/** Franja con capital, idioma y moneda; solo pinta los que el admin ha escrito. */
export function FichaPais({ pais }: { pais: Pais | null }) {
  const datos = DATOS.filter((d) => pais?.[d.clave]);
  if (!pais || datos.length === 0) return null;

  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
      {datos.map(({ clave, etiqueta, icono: Icono }) => (
        <div key={clave} className="flex items-center gap-2">
          <Icono size={18} className="text-ink-soft shrink-0" aria-hidden="true" />
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-soft leading-none">{etiqueta}</dt>
            <dd className="font-semibold text-ink leading-tight">{pais[clave]}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
