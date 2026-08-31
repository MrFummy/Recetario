import { useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { X, AlertTriangle, LogIn, ChefHat, Loader2 } from 'lucide-react';
import type { Recipe } from '../types';
import type { Despensa } from '../hooks/useDespensa';
import { ingredientesDelCatalogo, ordenarPorLoQueFalta } from '../lib/inventario';
import { aHash } from '../lib/rutas';
import { AnadirIngrediente } from './AnadirIngrediente';

const VISIBLES_AL_PRINCIPIO = 12;

interface Props {
  recipes: Recipe[];
  despensa: Despensa;
  user?: User | null;
}

/**
 * La despensa como sección propia.
 *
 * Hasta ahora solo se tocaba desde dentro de una receta, lo que obligaba a
 * recordar en cuál salía el pimentón para poder decir que se ha acabado. Aquí se
 * ve entera, y sobre todo se lee al revés: no "qué lleva esta receta" sino "qué
 * puedo cocinar con lo que tengo".
 */
export function SeccionDespensa({ recipes, despensa, user }: Props) {
  const [verTodas, setVerTodas] = useState(false);

  const catalogo = useMemo(() => ingredientesDelCatalogo(recipes), [recipes]);
  const cocinables = useMemo(
    () => ordenarPorLoQueFalta(recipes, despensa.tengo),
    [recipes, despensa.tengo]
  );

  const mostradas = verTodas ? cocinables : cocinables.slice(0, VISIBLES_AL_PRINCIPIO);
  const vacia = despensa.total === 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-accent mb-3">
          <span className="w-2 h-2 rounded-full bg-hot dot-blink" />
          {despensa.total} {despensa.total === 1 ? 'ingrediente' : 'ingredientes'} en casa
        </div>
        <h2 className="font-display font-black text-4xl sm:text-6xl leading-[0.98] tracking-tight text-ink mb-3">
          Tu <span className="hl-mark">despensa</span>
        </h2>
        <p className="text-base text-ink-soft leading-relaxed">
          Lo que marcas aquí vale para todas las recetas que lo lleven. Sin cantidades:
          un inventario se desactualiza solo, y uno falso es peor que ninguno.
        </p>
      </header>

      {!user && (
        <div className="mb-6 flex items-start gap-2 border-2 border-dashed border-ink/30 bg-yellow/25 px-3 py-2.5">
          <LogIn size={15} className="shrink-0 mt-0.5 text-ink" />
          <p className="font-mono text-[11.5px] leading-snug text-ink">
            Sin sesión iniciada.{' '}
            <span className="text-ink-soft">
              Puedes probar la despensa, pero se vaciará al cerrar la pestaña.
            </span>
          </p>
        </div>
      )}

      {despensa.error && (
        <p className="mb-6 flex items-start gap-1.5 font-mono text-[11.5px] text-hot leading-snug">
          <AlertTriangle size={13} className="shrink-0 mt-px" /> {despensa.error}
        </p>
      )}

      <AnadirIngrediente catalogo={catalogo} despensa={despensa} />

      {/* ── Lo que hay ───────────────────────────────────── */}
      <section className="mt-10">
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-accent mb-3">
          Lo que tienes
        </h3>

        {despensa.cargando && vacia ? (
          <p className="flex items-center gap-2 font-mono text-[12px] text-ink-soft py-2">
            <Loader2 size={14} className="animate-spin" /> cargando tu despensa…
          </p>
        ) : vacia ? (
          <p className="font-mono text-[12.5px] text-ink-soft leading-relaxed border-2 border-dashed border-ink/20 px-4 py-5">
            Todavía no hay nada. Añade arriba lo que tengas en casa, o ve marcando
            ingredientes dentro de cualquier receta: es la misma despensa.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
            {despensa.ingredientes.map((base) => (
              <li key={base}>
                <button
                  onClick={() => void despensa.quitar(base)}
                  title="Quitar de la despensa"
                  className="group flex items-center gap-1.5 border-[1.6px] border-ink bg-white
                             pl-3 pr-2 py-1.5 text-[14px] text-ink
                             hover:border-hot hover:text-hot transition-colors"
                >
                  {base}
                  <X size={13} className="text-ink-soft group-hover:text-hot transition-colors" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Qué se puede cocinar ─────────────────────────── */}
      {!vacia && (
        <section className="mt-12">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-accent mb-1">
            Qué puedes cocinar
          </h3>
          <p className="font-mono text-[11px] text-ink-soft mb-4">
            ordenado por lo poco que te falta
          </p>

          {cocinables.length === 0 ? (
            <p className="font-mono text-[12.5px] text-ink-soft border-2 border-dashed border-ink/20 px-4 py-5">
              Ninguna receta usa lo que tienes. Añade algo más y vuelve.
            </p>
          ) : (
            <>
              <ul className="list-none p-0 m-0 border-t border-dashed border-ink/20">
                {mostradas.map(({ receta, total, tienes, faltan }) => (
                  <li key={receta.id} className="border-b border-dashed border-ink/20">
                    <a
                      href={aHash({ vista: 'receta', id: receta.id })}
                      className="block py-3 group"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-display font-bold text-[17px] text-ink group-hover:text-accent transition-colors">
                          {receta.titulo}
                        </span>
                        <span className="font-mono text-[11px] text-ink-soft whitespace-nowrap">
                          {tienes}/{total}
                        </span>
                      </div>
                      {faltan.length === 0 ? (
                        <span className="inline-flex items-center gap-1.5 mt-1 font-mono text-[11.5px] text-accent">
                          <ChefHat size={12} /> puedes hacerla ya
                        </span>
                      ) : (
                        <p className="mt-1 font-mono text-[11.5px] text-ink-soft leading-snug">
                          te {faltan.length === 1 ? 'falta' : 'faltan'} {faltan.length}:{' '}
                          {faltan.slice(0, 4).join(', ')}
                          {faltan.length > 4 && `, y ${faltan.length - 4} más`}
                        </p>
                      )}
                    </a>
                  </li>
                ))}
              </ul>

              {cocinables.length > VISIBLES_AL_PRINCIPIO && (
                <button
                  onClick={() => setVerTodas((v) => !v)}
                  className="mt-4 font-mono text-[11.5px] underline decoration-dotted underline-offset-2
                             text-ink-soft hover:text-accent transition-colors"
                >
                  {verTodas
                    ? 'ver solo las más cercanas'
                    : `ver las ${cocinables.length} recetas`}
                </button>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
