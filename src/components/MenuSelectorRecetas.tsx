import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import type { Recipe } from '../types';
import { normalizeString } from '../lib/ingredientParser';

interface Props {
  recipes: Recipe[];
  /** Las que ya están en el menú, que no se vuelven a ofrecer. */
  enMenu: Set<string>;
  onAnadir: (receta: Recipe) => void;
}

/** Buscador del catálogo para añadir recetas al menú. */
export function MenuSelectorRecetas({ recipes, enMenu, onAnadir }: Props) {
  const [texto, setTexto] = useState('');

  const resultados = useMemo(() => {
    const buscado = normalizeString(texto.trim());
    return recipes
      .filter((r) => !enMenu.has(r.id) && (!buscado || normalizeString(r.titulo).includes(buscado)))
      .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
  }, [recipes, enMenu, texto]);

  return (
    <section className="border-2 border-dashed border-ink/25 p-4">
      <h3 className="font-mono text-[11px] uppercase tracking-wider text-accent mb-3">
        Añadir recetas
      </h3>
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-ink/30 rounded-md mb-3">
        <Search size={16} className="shrink-0 text-ink-soft" />
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Buscar en el catálogo…"
          aria-label="Buscar recetas para añadir al menú"
          className="w-full bg-transparent text-[14.5px] focus:outline-none"
        />
      </div>

      {resultados.length === 0 ? (
        <p className="font-mono text-[12.5px] text-ink-soft">
          {texto ? 'Ninguna receta encaja con eso.' : 'Ya has añadido todas las recetas.'}
        </p>
      ) : (
        <ul className="list-none p-0 m-0 max-h-80 overflow-y-auto border-t border-dashed border-ink/20">
          {resultados.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => onAnadir(r)}
                className="w-full flex items-center justify-between gap-3 px-2 py-2 text-left border-b
                           border-dashed border-ink/15 hover:bg-yellow/40 transition-colors"
              >
                <span className="min-w-0">
                  <span className="block text-[14.5px] text-ink truncate">{r.titulo}</span>
                  <span className="block font-mono text-[11px] text-ink-soft">{r.categoria}</span>
                </span>
                <Plus size={15} className="shrink-0 text-ink-soft" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
