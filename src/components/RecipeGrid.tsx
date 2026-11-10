import type { Recipe } from '../types';
import { RecipeCard } from './RecipeCard';

interface RecipeGridProps {
  recipes: Recipe[];
  onRecipeClick: (recipe: Recipe) => void;
  loading: boolean;
}

export function RecipeGrid({ recipes, onRecipeClick, loading }: RecipeGridProps) {
  if (loading) {
    return (
      <div className="mosaico">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="mosaico-foto bg-ink/10" />
            <div className="pt-3.5">
              <div className="mb-2 h-3 w-1/3 rounded bg-ink/10" />
              <div className="h-5 w-3/4 rounded bg-ink/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="sello mx-auto mb-6 h-28 w-28 px-3 text-[13px]" data-k="otro">nada por aquí… todavía</div>
        <p className="mb-2 font-display text-3xl font-medium tracking-tight text-ink">No se encontraron recetas.</p>
        <p className="font-mono text-sm text-ink-soft">Prueba cambiando de categoría o de ingredientes.</p>
      </div>
    );
  }

  return (
    <div className="mosaico">
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
