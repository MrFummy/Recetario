import type { Recipe } from '../types';
import { StarRating } from './StarRating';
import placeholderImg from '../assets/placeholder.jpg';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

// Rotación pseudo-aleatoria estable basada en el id de la receta
function tiltFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash << 5) - hash + id.charCodeAt(i);
  const tilts = ['-rotate-1', 'rotate-1', '-rotate-[0.6deg]', 'rotate-[1.2deg]', '-rotate-[1.4deg]'];
  return tilts[Math.abs(hash) % tilts.length];
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const imageUrl = recipe.foto_url || placeholderImg;

  const formattedDate = recipe.fecha_clase
    ? new Date(recipe.fecha_clase).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '';

  const tilt = tiltFor(recipe.id);

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
    >
      {/* Marco polaroid */}
      <div className={`relative bg-white p-2.5 pb-3.5 shadow-md group-hover:shadow-xl transition-shadow duration-300 ${tilt}`}>
        {/* Washi tape */}
        <span
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-4 rotate-[-3deg] shadow-sm"
          style={{ background: 'var(--color-tape)' }}
        />
        {/* Cat tag */}
        <span className="absolute top-3 right-3 z-[1] bg-white/95 border border-ink px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink">
          {recipe.categoria}
        </span>
        {/* Foto */}
        <div className="w-full aspect-[4/3] overflow-hidden bg-ink/10">
          <img
            src={imageUrl}
            alt={recipe.titulo}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
      </div>

      {/* Info debajo del polaroid */}
      <div className="pt-3 px-1">
        <h3 className="font-display font-semibold text-lg leading-tight text-ink group-hover:text-accent transition-colors line-clamp-2 mb-1.5">
          {recipe.titulo}
        </h3>
        <div className="flex justify-between items-center font-mono text-[11px] text-ink-soft">
          {recipe.rating ? (
            <StarRating rating={recipe.rating} size={12} />
          ) : (
            <span className="opacity-50">sin valorar</span>
          )}
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
