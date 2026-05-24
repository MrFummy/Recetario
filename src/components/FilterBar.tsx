import type { Category } from '../types';

interface FilterBarProps {
  categories: Category[];
  activeCategory: Category;
  onSelectCategory: (category: Category) => void;
}

export function FilterBar({ categories, activeCategory, onSelectCategory }: FilterBarProps) {
  return (
    <div className="flex overflow-x-auto py-4 px-2 gap-3 no-scrollbar mb-6">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`
            whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all duration-300
            ${activeCategory === category 
              ? 'bg-[var(--color-primary)] text-white shadow-md' 
              : 'bg-white text-[var(--color-text)] hover:bg-gray-100 border border-gray-200'
            }
          `}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
