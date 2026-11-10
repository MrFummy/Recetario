import type { CSSProperties } from 'react';
import type { PaisVisitado } from '../lib/pasaporte';
import { aHash } from '../lib/rutas';
import { useAcentoPais } from '../hooks/useAcentoPais';
import { FORMAS_VISADO } from '../lib/visados';
import { SelloVisado } from './SelloVisado';

const GIROS = [-5, 4, -3, 6, -6, 3];

interface VisadoProps {
  visitado: PaisVisitado;
  indice: number;
}

/** Un visado de la lista. Vive aparte porque el color de tinta se calcula por país (hook). */
function Visado({ visitado: v, indice }: VisadoProps) {
  const acento = useAcentoPais(v.codigo);
  const estilo = {
    '--tinta': acento?.vivo ?? 'var(--color-accent)',
    '--giro': `${GIROS[indice % GIROS.length]}deg`,
    '--retardo': `${Math.min(indice, 10) * 0.1}s`,
  } as CSSProperties;

  return (
    <a href={aHash({ vista: 'pais', codigo: v.codigo })} className="visado" style={estilo}>
      <SelloVisado codigo={v.codigo} nombre={v.nombre} fecha={v.fecha} forma={FORMAS_VISADO[indice % FORMAS_VISADO.length]} />
      <div className="mt-2 font-mono text-[11px] text-ink-soft">
        {v.recetas} {v.recetas === 1 ? 'receta' : 'recetas'}
      </div>
    </a>
  );
}

/** La libreta de visados: un sello por país, estampado con la tinta de su bandera. */
export function ListaVisados({ visitados, className = '' }: { visitados: PaisVisitado[]; className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] sm:gap-x-6 sm:gap-y-10 ${className}`}>
      {visitados.map((v, i) => <Visado key={v.codigo} visitado={v} indice={i} />)}
    </div>
  );
}
