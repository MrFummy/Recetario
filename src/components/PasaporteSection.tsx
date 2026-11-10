import { useMemo, useState } from 'react';
import { AlertTriangle, LayoutGrid, Map as MapIcon } from 'lucide-react';
import type { Recipe } from '../types';
import { usePaises } from '../hooks/usePaises';
import { paisesVisitados } from '../lib/pasaporte';
import { type Ruta } from '../lib/rutas';
import { irA } from '../hooks/useRuta';
import { MapaMundi } from './MapaMundi';
import { PaisPagina } from './PaisPagina';
import { AltaPais } from './AltaPais';
import { ListaVisados } from './ListaVisados';

type Modo = 'mapa' | 'sellos';

interface PasaporteSectionProps {
  ruta: Extract<Ruta, { vista: 'pasaporte' | 'pais' }>;
  recipes: Recipe[];
  loadingRecetas: boolean;
  isAdmin: boolean;
  /** Quitar un país cambia las etiquetas de las recetas: el catálogo debe recargarse. */
  onRecetasCambiadas: () => void;
}

/**
 * «Mi pasaporte»: las recetas del catálogo vistas por los países en los que he
 * estado. El mapa y los sellos llevan a la página de cada país (`#/pasaporte/JP`).
 * La lectura es pública. Ver docs/pasaporte.md.
 */
export function SeccionPasaporte({ ruta, recipes, loadingRecetas, isAdmin, onRecetasCambiadas }: PasaporteSectionProps) {
  const api = usePaises();
  const { paises, fotos, loading, error } = api;
  // Mapa en escritorio, sellos en móvil: el mapa se maneja mal con el dedo.
  const [modo, setModo] = useState<Modo>(() => (window.matchMedia('(min-width: 768px)').matches ? 'mapa' : 'sellos'));

  const visitados = useMemo(() => paisesVisitados(paises, recipes), [paises, recipes]);
  const totalRecetas = visitados.reduce((n, v) => n + v.recetas, 0);

  if (ruta.vista === 'pais') {
    return (
      <PaisPagina
        codigo={ruta.codigo}
        pais={paises.find((p) => p.codigo === ruta.codigo) ?? null}
        fotos={fotos.filter((f) => f.pais === ruta.codigo)}
        recetas={recipes.filter((r) => r.pais === ruta.codigo)}
        cargando={loading || loadingRecetas}
        isAdmin={isAdmin}
        api={api}
        onRecetasCambiadas={onRecetasCambiadas}
      />
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <div className="kicker mb-4">
          {visitados.length} {visitados.length === 1 ? 'país' : 'países'} · {totalRecetas} {totalRecetas === 1 ? 'receta' : 'recetas'}
        </div>
        <h2 className="mb-3 font-display text-4xl font-light leading-[0.98] tracking-[-0.035em] text-ink sm:text-6xl">
          Mi <span className="hl-mark">pasaporte</span>
        </h2>
        <p className="text-base leading-relaxed text-ink-soft">
          Los países en los que he estado y lo que he cocinado desde allí.
        </p>
      </header>

      {error && (
        <div className="flex items-start gap-2 bg-hot-soft border-[1.5px] border-hot text-hot p-4 mb-6 font-mono text-sm">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {isAdmin && <AltaPais api={api} />}

      <div className="mb-6 flex gap-2">
        {([['mapa', 'Mapa', <MapIcon key="m" size={14} />], ['sellos', 'Visados', <LayoutGrid key="s" size={14} />]] as const).map(([valor, etiqueta, icono]) => (
          <button key={valor} onClick={() => setModo(valor)} aria-pressed={modo === valor}
            className={`flex items-center gap-1.5 rounded-full border-[1.5px] border-ink px-3.5 py-1.5 text-[13px] font-semibold transition-all ${modo === valor ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-yellow'}`}>
            {icono} {etiqueta}
          </button>
        ))}
      </div>

      {modo === 'mapa' && <MapaMundi visitados={visitados} onSelect={(codigo) => irA({ vista: 'pais', codigo })} />}

      {visitados.length === 0 && !loading && (
        <p className="mt-8 font-script text-2xl text-ink-soft">
          Aún no hay visados en este pasaporte.
        </p>
      )}

      {(modo === 'sellos' || visitados.length > 0) && (
        <ListaVisados visitados={visitados} className={modo === 'mapa' ? 'mt-12' : ''} />
      )}
    </div>
  );
}
