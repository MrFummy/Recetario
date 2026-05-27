import type { Recipe } from '../types';
import { RecipeCard } from './RecipeCard';

interface RecipeGridProps {
  recipes: Recipe[];
  onRecipeClick: (recipe: Recipe) => void;
  loading: boolean;
}

const SKELETON_TILTS = ['-rotate-1', 'rotate-1', '-rotate-[0.6deg]', 'rotate-[1.2deg]', '-rotate-[1.4deg]', 'rotate-[0.8deg]'];

export function RecipeGrid({ recipes, onRecipeClick, loading }: RecipeGridProps) {
  if (loading) {
    return (
      <div className="masonry-grid">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className={`bg-white p-2.5 pb-3.5 shadow-md ${SKELETON_TILTS[i]}`}>
              <div className="w-full aspect-[4/3] bg-ink/10" />
            </div>
            <div className="pt-3 px-1">
              <div className="h-5 bg-ink/10 rounded w-3/4 mb-2" />
              <div className="h-3 bg-ink/10 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-block bg-white p-2.5 pb-10 shadow-md -rotate-2 mb-6 max-w-[200px]">
          <div className="aspect-square bg-paper-2 grid place-items-center font-script text-ink-soft text-2xl px-4 text-center leading-tight">
            nada por aquí…<br/>todavía
          </div>
        </div>
        <p className="font-display text-2xl text-ink mb-2">No se encontraron recetas.</p>
        <p className="font-mono text-sm text-ink-soft">Probá cambiando de categoría o ingredientes.</p>
      </div>
    );
  }

  return (
    <div className="masonry-grid">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onClick={() => onRecipeClick(recipe)}
        />
      ))}
    </div>
  );
}
