import type { Recipe } from '../types';
import { StarRating } from './StarRating';
import { claveCategoria, categoriaCorta } from '../lib/colorCategoria';
import placeholderImg from '../assets/placeholder.jpg';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

/** Tarjeta del catálogo. La forma y la proporción de la foto las fija `.mosaico`, igual para todas. */
export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const imageUrl = recipe.foto_url || placeholderImg;

  const formattedDate = recipe.fecha_clase
    ? new Date(recipe.fecha_clase).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '';

  return (
    <article
      data-k={claveCategoria(recipe.categoria)}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      role="button"
      tabIndex={0}
      className="group relative cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <div className="mosaico-foto relative overflow-hidden bg-rule/60">
        <img
          src={imageUrl}
          alt={recipe.titulo}
          draggable={false}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        {recipe.sin_hacer && (
          <span className="etiqueta absolute left-3 bottom-3 !bg-yellow !text-ink">sin hacer</span>
        )}
      </div>
      <span className="sello absolute -right-1.5 top-2.5 h-[58px] w-[58px] p-1 text-[9px] group-hover:!-rotate-[10deg] group-hover:scale-110">
        {categoriaCorta(recipe.categoria)}
      </span>

      <div className="pt-3.5">
        <div className="mb-1 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-wider text-ink-soft">
          <span className="h-2 w-2 shrink-0 rounded-full border border-ink bg-[var(--k)]" />
          <span className="truncate">{recipe.categoria}</span>
          {formattedDate && <span className="ml-auto shrink-0 normal-case tracking-normal">{formattedDate}</span>}
        </div>
        <h3 className="line-clamp-2 font-display text-lg font-medium leading-[1.12] tracking-[-0.015em] text-ink sm:text-xl">
          <span className="titulo-k">{recipe.titulo}</span>
        </h3>
        {recipe.rating ? (
          <div className="mt-2"><StarRating rating={recipe.rating} size={12} /></div>
        ) : null}
      </div>
    </article>
  );
}
