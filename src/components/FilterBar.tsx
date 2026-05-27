import type { Category } from '../types';

interface FilterBarProps {
  categories: Category[];
  activeCategory: Category;
  onSelectCategory: (category: Category) => void;
}

export function FilterBar({ categories, activeCategory, onSelectCategory }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar py-1">
      <span className="font-script text-xl text-ink shrink-0 mr-1">filtrar:</span>
      {categories.map((category) => {
        const active = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`
              whitespace-nowrap px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 border-[1.5px]
              ${active
                ? 'bg-ink text-paper border-ink -rotate-[1.5deg] shadow-brut'
                : 'bg-transparent text-ink border-ink hover:bg-ink/5'
              }
            `}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
