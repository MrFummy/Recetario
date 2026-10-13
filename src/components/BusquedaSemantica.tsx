import { Loader2, Sparkles, X } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { BusquedaSemantica as Busqueda } from '../hooks/useBusquedaSemantica';

interface BusquedaSemanticaProps {
  busqueda: Busqueda;
  user: User | null;
}

/** Caja de búsqueda por frase libre. Necesita sesión: cada consulta gasta cuota. */
export function BusquedaSemantica({ busqueda, user }: BusquedaSemanticaProps) {
  const { consulta, setConsulta, buscar, limpiar, cargando, error, resultado } = busqueda;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form
        onSubmit={(e) => { e.preventDefault(); void buscar(); }}
        className="flex items-stretch bg-paper-2 border-2 border-ink border-dashed focus-within:border-solid transition-all"
      >
        <Sparkles className="self-center ml-4 shrink-0 text-accent" size={18} strokeWidth={2.2} />
        <input
          type="text"
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          disabled={!user}
          maxLength={300}
          placeholder={user ? 'Descríbeme lo que te apetece… (algo ligero de pescado para verano)' : 'Inicia sesión para buscar por frase'}
          className="w-full px-3 py-3.5 bg-transparent text-ink placeholder:text-ink-soft focus:outline-none font-sans text-[15px] disabled:cursor-not-allowed"
        />
        {resultado && (
          <button type="button" onClick={limpiar} title="Quitar la búsqueda" className="px-2 text-ink-soft hover:text-hot transition-colors">
            <X size={18} />
          </button>
        )}
        <button
          type="submit"
          disabled={!user || cargando || consulta.trim().length < 2}
          className="px-4 bg-ink text-paper font-mono text-[12px] uppercase tracking-wider disabled:opacity-40 flex items-center gap-1.5"
        >
          {cargando ? <Loader2 size={14} className="animate-spin" /> : 'buscar'}
        </button>
      </form>
      <p className="text-[12px] text-ink-soft mt-2.5 text-center font-mono">
        {error ? <span className="text-hot">{error}</span>
          : resultado ? `// las ${resultado.length} recetas más parecidas, de más a menos`
          : '// búsqueda por significado, no por palabras exactas'}
      </p>
    </div>
  );
}
