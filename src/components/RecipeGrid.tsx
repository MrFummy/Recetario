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
      <div className="masonry-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100 shadow-sm">
            <div className="w-full h-48 bg-gray-200 rounded-t-2xl"></div>
            <div className="p-5">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">No se encontraron recetas con esos criterios.</p>
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
