import type { Recipe } from '../types';
import { claveCategoria } from '../lib/colorCategoria';
import { aHash } from '../lib/rutas';

interface PortadaCatalogoProps {
  recipes: Recipe[];
  /** Con una búsqueda o un filtro activos la portada se retira: los resultados suben. */
  compacta: boolean;
}

/** Receta destacada: cambia cada día, pero es la misma para todos durante ese día. */
function destacadaDelDia(recipes: Recipe[]): Recipe | null {
  const conFoto = recipes.filter((r) => r.foto_url);
  const cortas = conFoto.filter((r) => r.titulo.length <= 52);
  const pool = cortas.length > 0 ? cortas : conFoto;
  if (pool.length === 0) return null;
  return pool[Math.floor(Date.now() / 86_400_000) % pool.length];
}

export function PortadaCatalogo({ recipes, compacta }: PortadaCatalogoProps) {
  const mes = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const destacada = compacta ? null : destacadaDelDia(recipes);
  const palabras = destacada?.titulo.trim().split(' ') ?? [];
  const ultima = palabras.length > 1 ? palabras.pop() : null;

  return (
    <section className="mb-14">
      <div className="mb-8 flex justify-between gap-4 border-b border-rule pb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">
        <span>Nº {recipes.length} · {mes}</span>
        <span className="hidden text-right sm:block">Recetas probadas en casa, por un chef novato</span>
      </div>

      {destacada && (
        <a
          href={aHash({ vista: 'receta', id: destacada.id })}
          data-k={claveCategoria(destacada.categoria)}
          className="group relative grid items-end gap-6 md:grid-cols-[6fr_5fr] md:gap-0"
        >
          <span className="sello sello-estampa absolute left-[6%] top-[5%] z-10 h-[92px] w-[92px] text-[10px] md:h-28 md:w-28">
            <span><b className="block font-display text-4xl font-black leading-[0.9] tracking-tight">{recipes.length}</b>recetas</span>
          </span>
          <div className="arco aspect-[1/1.02] bg-rule/60">
            <img
              src={destacada.foto_url ?? ''}
              alt={destacada.titulo}
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            />
          </div>
          <div className="md:pb-4 md:pl-10">
            <div className="kicker mb-5">{destacada.categoria} · Receta destacada</div>
            <h2 className="mb-6 line-clamp-4 font-display text-[2.6rem] font-light leading-[0.95] tracking-[-0.035em] md:-ml-[7vw] md:text-[clamp(3rem,6vw,5.75rem)]">
              <span className="bg-paper pr-3 [box-decoration-break:clone]">
                {palabras.join(' ')}
                {ultima && <> <em className="font-normal text-accent">{ultima}</em></>}
              </span>
            </h2>
            <div className="mb-6 flex flex-wrap gap-2.5">
              <span className="etiqueta">{destacada.categoria}</span>
              {destacada.tiempo && <span className="etiqueta etiqueta-neutra">{destacada.tiempo}</span>}
            </div>
            <span className="boton-sello">Ver receta →</span>
          </div>
        </a>
      )}
    </section>
  );
}
