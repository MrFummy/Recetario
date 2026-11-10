import { Loader2, Search, Sparkles, X } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { BusquedaSemantica } from '../hooks/useBusquedaSemantica';

interface IngredientSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  matchCount: number;
  semantica: BusquedaSemantica;
  user: User | null;
}

/**
 * Una sola barra para dos búsquedas. Mientras escribes filtra por ingredientes,
 * en vivo. Con Enter (o el botón ✨) manda la misma frase a la búsqueda por
 * significado, que necesita sesión porque cada consulta gasta cuota de Gemini.
 * Volver a escribir cancela la búsqueda por significado y devuelve el filtro.
 */
export function IngredientSearch({ searchQuery, setSearchQuery, matchCount, semantica, user }: IngredientSearchProps) {
  const { buscar, limpiar, cargando, error, resultado } = semantica;
  const texto = searchQuery.trim();
  const puedeBuscar = !!user && texto.length >= 2 && !cargando;

  const cambiar = (valor: string) => {
    setSearchQuery(valor);
    if (resultado || error || cargando) limpiar();
  };

  const borrar = () => {
    setSearchQuery('');
    limpiar();
  };

  let ayuda: string;
  if (error) ayuda = error;
  else if (resultado) ayuda = `las ${resultado.length} recetas más parecidas, de más a menos · escribe para volver al filtro`;
  else if (!user) ayuda = 'separa con comas para encontrar recetas con TODOS · inicia sesión para buscar por significado';
  else ayuda = 'separa con comas para encontrar recetas con TODOS · Enter para buscar por significado';

  return (
    <div className="mb-10 w-full max-w-2xl">
      <form
        onSubmit={(e) => { e.preventDefault(); if (puedeBuscar) void buscar(searchQuery); }}
        className="relative flex items-center overflow-hidden rounded-full border-[1.5px] border-ink bg-paper-2 shadow-[3px_3px_0_var(--color-ink)] transition-all focus-within:-translate-x-px focus-within:-translate-y-px focus-within:shadow-[5px_5px_0_var(--color-accent)]"
      >
        <Search className="absolute left-4 text-ink" size={18} strokeWidth={2.2} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => cambiar(e.target.value)}
          maxLength={300}
          placeholder="Ingredientes (tomate, queso…) o lo que te apetece (algo ligero de pescado)"
          className="min-w-0 flex-1 pl-12 pr-2 py-3.5 bg-transparent text-ink placeholder:text-ink-soft focus:outline-none font-sans text-[15px]"
        />
        {texto && (
          <span className="mr-1.5 shrink-0 rounded-full bg-accent px-2.5 py-1 font-mono text-[11px] text-paper">
            {resultado ? `✨ ${resultado.length}` : `${matchCount} ${matchCount === 1 ? 'match' : 'matches'}`}
          </span>
        )}
        {texto && (
          <button type="button" onClick={borrar} title="Borrar" className="shrink-0 p-1.5 text-ink-soft hover:text-hot transition-colors">
            <X size={16} />
          </button>
        )}
        <button
          type="submit"
          disabled={!puedeBuscar}
          title={user ? 'Buscar por significado (Enter)' : 'Inicia sesión para buscar por significado'}
          className="flex shrink-0 items-center self-stretch bg-ink px-4 text-paper transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-35"
        >
          {cargando ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
        </button>
      </form>
      <p className={`mt-3 pl-5 font-mono text-[11.5px] ${error ? 'text-hot' : 'text-ink-soft'}`}>
        {ayuda}
      </p>
    </div>
  );
}
