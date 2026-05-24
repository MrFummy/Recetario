import { Search } from 'lucide-react';

interface IngredientSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  matchCount: number;
}

export function IngredientSearch({ searchQuery, setSearchQuery, matchCount }: IngredientSearchProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8">
      <div className="relative flex items-center">
        <Search className="absolute left-4 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Busca por ingredientes (ej. tomate, queso, albahaca)..."
          className="w-full pl-12 pr-24 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
        />
        {searchQuery.trim() && (
          <div className="absolute right-4 bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
            {matchCount} {matchCount === 1 ? 'receta' : 'recetas'}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Separa los ingredientes con comas para buscar recetas que los contengan TODOS.
      </p>
    </div>
  );
}
