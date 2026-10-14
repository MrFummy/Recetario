import { Check } from 'lucide-react';
import type { Candidata } from '../types';
import { ETIQUETA_FUENTE } from '../lib/fuentes';
import { normalizeIngredients, normalizeSteps } from '../lib/recipeContent';
import placeholderImg from '../assets/placeholder.jpg';

interface Props {
  candidata: Candidata;
  onClick: () => void;
}

/** Tarjeta de una candidata: la misma foto polaroid que el catálogo, con lo que importa aquí. */
export function CandidataCard({ candidata, onClick }: Props) {
  const nIngredientes = normalizeIngredients(candidata.ingredientes).filter((i) => !i.esGrupo).length;
  const nPasos = normalizeSteps(candidata.pasos).length;
  const probada = candidata.estado === 'probada';

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="relative bg-white p-2.5 pb-3.5 shadow-md group-hover:shadow-xl transition-shadow duration-300">
        <span className="absolute top-3 left-3 z-[1] bg-white/95 border border-ink px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink">
          {ETIQUETA_FUENTE[candidata.fuente_tipo]}
        </span>
        {probada && (
          <span className="absolute top-3 right-3 z-[1] flex items-center gap-1 bg-yellow border border-ink px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink">
            <Check size={11} /> probada
          </span>
        )}
        <div className="w-full aspect-[4/3] overflow-hidden bg-ink/10">
          <img
            src={candidata.foto_url || placeholderImg}
            alt={candidata.titulo}
            draggable={false}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
      </div>

      <div className="pt-3 px-1">
        <h3 className="font-display font-semibold text-lg leading-tight text-ink group-hover:text-accent transition-colors line-clamp-2 mb-1.5">
          {candidata.titulo}
        </h3>
        <div className="flex justify-between items-center font-mono text-[11px] text-ink-soft">
          <span>{nIngredientes} ingredientes · {nPasos} pasos</span>
          {nPasos === 0 && <span className="text-hot">sin pasos</span>}
        </div>
      </div>
    </div>
  );
}
