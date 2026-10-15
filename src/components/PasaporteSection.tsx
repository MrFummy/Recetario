import { useMemo, useState } from 'react';
import { AlertTriangle, LayoutGrid, Map as MapIcon } from 'lucide-react';
import type { Recipe } from '../types';
import { usePaises } from '../hooks/usePaises';
import { paisesVisitados } from '../lib/pasaporte';
import { banderaPais } from '../lib/paises';
import { aHash, type Ruta } from '../lib/rutas';
import { irA } from '../hooks/useRuta';
import { MapaMundi } from './MapaMundi';
import { PaisPagina } from './PaisPagina';
import { AltaPais } from './AltaPais';

type Modo = 'mapa' | 'sellos';

const SELLO_GIROS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];

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
      <header className="mb-8 text-center">
        <h2 className="font-display font-black text-4xl sm:text-5xl leading-none text-ink mb-2">Mi pasaporte</h2>
        <p className="text-ink-soft max-w-xl mx-auto">
          Los países en los que he estado y lo que he cocinado desde allí.
        </p>
        <p className="font-mono text-[12px] tracking-widest uppercase text-accent mt-3">
          {visitados.length} {visitados.length === 1 ? 'país' : 'países'} · {totalRecetas} {totalRecetas === 1 ? 'receta' : 'recetas'}
        </p>
      </header>

      {error && (
        <div className="flex items-start gap-2 bg-hot-soft border-2 border-hot text-hot p-4 mb-6 font-mono text-sm">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {isAdmin && <AltaPais api={api} />}

      <div className="flex justify-center gap-2 mb-6">
        {([['mapa', 'Mapa', <MapIcon key="m" size={14} />], ['sellos', 'Sellos', <LayoutGrid key="s" size={14} />]] as const).map(([valor, etiqueta, icono]) => (
          <button key={valor} onClick={() => setModo(valor)} aria-pressed={modo === valor}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold border-[1.5px] border-ink transition-colors ${modo === valor ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-yellow'}`}>
            {icono} {etiqueta}
          </button>
        ))}
      </div>

      {modo === 'mapa' && <MapaMundi visitados={visitados} onSelect={(codigo) => irA({ vista: 'pais', codigo })} />}

      {visitados.length === 0 && !loading && (
        <p className="text-center font-script text-2xl text-ink-soft mt-8">
          Aún no hay sellos en este pasaporte.
        </p>
      )}

      {(modo === 'sellos' || visitados.length > 0) && (
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 ${modo === 'mapa' ? 'mt-10' : ''}`}>
          {visitados.map((v, i) => (
            <a key={v.codigo} href={aHash({ vista: 'pais', codigo: v.codigo })}
              className={`block bg-paper-2 border-2 border-dashed border-ink/60 p-4 text-center transition-transform hover:rotate-0 hover:scale-[1.03] hover:border-accent ${SELLO_GIROS[i % SELLO_GIROS.length]}`}>
              <div className="text-5xl leading-none mb-2" aria-hidden="true">{banderaPais(v.codigo)}</div>
              <div className="font-display font-bold text-lg leading-tight text-ink">{v.nombre}</div>
              {v.fecha && <div className="font-script text-xl text-accent leading-none mt-1">{v.fecha}</div>}
              <div className="font-mono text-[11px] text-ink-soft mt-2">
                {v.recetas} {v.recetas === 1 ? 'receta' : 'recetas'}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
