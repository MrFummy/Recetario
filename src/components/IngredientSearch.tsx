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
  else if (resultado) ayuda = `// las ${resultado.length} recetas más parecidas, de más a menos · escribe para volver al filtro`;
  else if (!user) ayuda = '// separá con comas para encontrar recetas con TODOS · inicia sesión para buscar por significado';
  else ayuda = '// separá con comas para encontrar recetas con TODOS · Enter para buscar por significado';

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form
        onSubmit={(e) => { e.preventDefault(); if (puedeBuscar) void buscar(searchQuery); }}
        className="relative flex items-center bg-paper-2 border-2 border-ink shadow-brut-lg focus-within:shadow-[6px_6px_0_var(--color-accent)] focus-within:-translate-x-px focus-within:-translate-y-px transition-all"
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
          <span className="shrink-0 bg-accent text-paper text-[11px] font-mono px-2.5 py-1 rounded-sm mr-1.5">
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
          className="shrink-0 self-stretch px-3.5 bg-ink text-paper flex items-center disabled:opacity-35 disabled:cursor-not-allowed"
        >
          {cargando ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
        </button>
      </form>
      <p className={`text-[12px] mt-2.5 text-center font-mono ${error ? 'text-hot' : 'text-ink-soft'}`}>
        {ayuda}
      </p>
    </div>
  );
}
