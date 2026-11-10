import { Check } from 'lucide-react';
import type { Candidata } from '../types';
import { ETIQUETA_FUENTE } from '../lib/fuentes';
import { claveCategoria } from '../lib/colorCategoria';
import { normalizeIngredients, normalizeSteps } from '../lib/recipeContent';
import placeholderImg from '../assets/placeholder.jpg';

interface Props {
  candidata: Candidata;
  /** Número de muestra: su puesto por antigüedad, que no cambia al filtrar. */
  numero: number;
  onClick: () => void;
}

/**
 * Tarjeta de una candidata, con la forma del catálogo (la foto en arco la fija `.mosaico`).
 * Lo propio del laboratorio: el sello de la fuente en la esquina, el estado sobre la foto y
 * un número de muestra, que la distingue de una receta ya aceptada.
 */
export function CandidataCard({ candidata, numero, onClick }: Props) {
  const nIngredientes = normalizeIngredients(candidata.ingredientes).filter((i) => !i.esGrupo).length;
  const nPasos = normalizeSteps(candidata.pasos).length;
  const probada = candidata.estado === 'probada';

  return (
    <article
      data-k={claveCategoria(candidata.categoria)}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      role="button"
      tabIndex={0}
      className="group relative cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <div className="mosaico-foto relative overflow-hidden bg-rule/60">
        <img
          src={candidata.foto_url || placeholderImg}
          alt={candidata.titulo}
          draggable={false}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <span className={`etiqueta absolute bottom-3 left-3 ${probada ? '!bg-bottle !text-paper' : '!bg-yellow !text-ink'}`}>
          {probada ? <><Check size={11} strokeWidth={3} /> probada</> : 'por probar'}
        </span>
      </div>
      <span className="sello absolute -right-1.5 top-2.5 h-[58px] w-[58px] !bg-paper-2 p-1 text-[9px] !text-ink group-hover:!-rotate-[10deg] group-hover:scale-110">
        {ETIQUETA_FUENTE[candidata.fuente_tipo]}
      </span>

      <div className="pt-3.5">
        <div className="mb-1 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-wider text-ink-soft">
          <span className="h-2 w-2 shrink-0 rounded-full border border-ink bg-[var(--k)]" />
          <span className="truncate">Muestra {String(numero).padStart(2, '0')}</span>
          {candidata.categoria && <span className="ml-auto shrink-0 truncate normal-case tracking-normal">{candidata.categoria}</span>}
        </div>
        <h3 className="line-clamp-2 font-display text-lg font-medium leading-[1.12] tracking-[-0.015em] text-ink sm:text-xl">
          <span className="titulo-k">{candidata.titulo}</span>
        </h3>
        <div className="mt-1.5 flex items-center justify-between font-mono text-[11px] text-ink-soft">
          <span>{nIngredientes} ingredientes · {nPasos} pasos</span>
          {nPasos === 0 && <span className="text-hot">sin pasos</span>}
        </div>
      </div>
    </article>
  );
}
