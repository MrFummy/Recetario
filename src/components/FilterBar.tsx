import type { Category } from '../types';
import { claveCategoria } from '../lib/colorCategoria';

interface FilterBarProps {
  categories: Category[];
  activeCategory: Category;
  onSelectCategory: (category: Category) => void;
  soloSinHacer: boolean;
  onToggleSinHacer: () => void;
  totalSinHacer: number;
}

const CHIP = 'inline-flex items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-ink px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200';

export function FilterBar({ categories, activeCategory, onSelectCategory, soloSinHacer, onToggleSinHacer, totalSinHacer }: FilterBarProps) {
  return (
    <div className="mb-10">
      <h3 className="mb-4 font-display text-3xl font-medium italic tracking-tight text-ink">Todo el catálogo</h3>
      <div className="flex flex-wrap items-center gap-2.5">
        {categories.map((category) => {
          const active = activeCategory === category;
          const todas = category === 'Todas';
          return (
            <button
              key={category}
              data-k={todas ? undefined : claveCategoria(category)}
              onClick={() => onSelectCategory(category)}
              aria-pressed={active}
              className={`${CHIP} ${active
                ? 'bg-[var(--k)] text-[var(--kt)] shadow-[2px_2px_0_var(--color-ink)] -translate-x-px -translate-y-px'
                : 'bg-transparent text-ink hover:bg-ink/5'}`}
            >
              {!todas && (
                <span className={`h-2.5 w-2.5 rounded-full border border-ink ${active ? 'bg-paper' : 'bg-[var(--k)]'}`} />
              )}
              {category}
            </button>
          );
        })}
        {totalSinHacer > 0 && (
          <button
            onClick={onToggleSinHacer}
            aria-pressed={soloSinHacer}
            className={`${CHIP} ml-1 ${soloSinHacer
              ? 'bg-yellow text-ink shadow-[2px_2px_0_var(--color-ink)] -translate-x-px -translate-y-px'
              : 'border-dashed bg-transparent text-ink hover:bg-yellow/40'}`}
          >
            Sin hacer <span className="font-mono text-[11px] opacity-70">{totalSinHacer}</span>
          </button>
        )}
      </div>
    </div>
  );
}
