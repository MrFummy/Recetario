import { Search } from 'lucide-react';

interface IngredientSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  matchCount: number;
}

export function IngredientSearch({ searchQuery, setSearchQuery, matchCount }: IngredientSearchProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="relative flex items-center bg-paper-2 border-2 border-ink shadow-brut-lg focus-within:shadow-[6px_6px_0_var(--color-accent)] focus-within:-translate-x-px focus-within:-translate-y-px transition-all">
        <Search className="absolute left-4 text-ink" size={18} strokeWidth={2.2} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="qué tenés en la nevera... (tomate, queso, albahaca)"
          className="w-full pl-12 pr-24 py-3.5 bg-transparent text-ink placeholder:text-ink-soft focus:outline-none font-sans text-[15px]"
        />
        {searchQuery.trim() ? (
          <div className="absolute right-3 bg-accent text-paper text-[11px] font-mono px-2.5 py-1 rounded-sm">
            {matchCount} {matchCount === 1 ? 'match' : 'matches'}
          </div>
        ) : (
          <div className="absolute right-3 hidden sm:block font-mono text-[11px] text-ink-soft bg-paper px-1.5 py-0.5 border border-rule rounded-sm">
            ⌘K
          </div>
        )}
      </div>
      <p className="text-[12px] text-ink-soft mt-2.5 text-center font-mono">
        // separá con comas para encontrar recetas que los contengan TODOS
      </p>
    </div>
  );
}
