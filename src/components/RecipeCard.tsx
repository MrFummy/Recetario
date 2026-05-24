import type { Recipe } from '../types';
import { StarRating } from './StarRating';
import placeholderImg from '../assets/placeholder.jpg';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  // Use placeholder if no image URL is present
  const imageUrl = recipe.foto_url || placeholderImg;

  // Format date if present
  const formattedDate = recipe.fecha_clase 
    ? new Date(recipe.fecha_clase).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full border border-gray-100"
    >
      <div className="w-full h-48 sm:h-56 overflow-hidden relative">
        <img 
          src={imageUrl} 
          alt={recipe.titulo} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-[var(--color-primary)] shadow-sm">
          {recipe.categoria}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg leading-tight mb-2 text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
          {recipe.titulo}
        </h3>
        
        {recipe.rating ? (
          <div className="mb-2">
            <StarRating rating={recipe.rating} size={14} />
          </div>
        ) : null}
        
        <div className="mt-auto pt-4 flex justify-between items-center text-xs text-gray-500">
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
