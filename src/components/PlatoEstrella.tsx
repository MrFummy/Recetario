import { Star } from 'lucide-react';
import type { Recipe } from '../types';
import type { AcentoPais } from '../lib/colorBandera';
import { StarRating } from './StarRating';
import placeholderImg from '../assets/placeholder.jpg';

interface PlatoEstrellaProps {
  receta: Recipe;
  acento: AcentoPais | null;
  onClick: () => void;
}

/** La receta destacada de un país, en grande antes de la cuadrícula. */
export function PlatoEstrella({ receta, acento, onClick }: PlatoEstrellaProps) {
  const datos = [receta.tiempo, receta.porciones, receta.dificultad].filter((d): d is string => Boolean(d));

  return (
    <button type="button" onClick={onClick}
      className="group w-full text-left grid grid-cols-1 sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-6 items-center mb-12 p-5 sm:p-8 bg-paper-2 border-[1.5px] border-ink shadow-brut transition-transform hover:-translate-y-1"
      style={acento ? { borderLeft: `8px solid ${acento.vivo}` } : undefined}>
      <div className="bg-white p-2.5 pb-4 shadow-md -rotate-1 group-hover:rotate-0 transition-transform">
        <img src={receta.foto_url || placeholderImg} alt={receta.titulo} className="w-full aspect-[4/3] object-cover" />
      </div>
      <div>
        <p className="flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-wider mb-2"
          style={acento ? { color: acento.oscuro } : undefined}>
          <Star size={14} fill="currentColor" /> Plato estrella
        </p>
        <h3 className="font-display font-black text-3xl sm:text-4xl leading-tight text-ink group-hover:text-accent transition-colors mb-3">
          {receta.titulo}
        </h3>
        {receta.rating ? <StarRating rating={receta.rating} size={16} /> : null}
        {datos.length > 0 && (
          <p className="font-mono text-[12px] text-ink-soft mt-3">{datos.join(' · ')}</p>
        )}
      </div>
    </button>
  );
}
