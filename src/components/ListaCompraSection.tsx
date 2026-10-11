import { useMemo } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import type { Recipe } from '../types';
import type { Despensa } from '../hooks/useDespensa';
import type { ParaHacer } from '../hooks/useParaHacer';
import { listaDeLaCompra } from '../lib/listaCompra';
import { aHash, CATALOGO } from '../lib/rutas';

interface Props {
  recipes: Recipe[];
  despensa: Despensa;
  paraHacer: ParaHacer;
}

/**
 * La lista de la compra de las recetas que el usuario tiene "para hacer":
 * sus ingredientes, agregados, menos lo que ya dice la despensa que tienes.
 *
 * Las recetas se marcan desde su ficha, no aquí: esta pantalla solo las
 * muestra (con enlace y una forma rápida de quitarlas), para que haya un único
 * sitio donde elegir. Se guardan en Supabase, así que se ven igual desde
 * cualquier dispositivo, y marcar una como "ya hecha" la saca de aquí.
 *
 * Marcar un ingrediente de la lista como comprado lo añade a la despensa
 * —"tachar en el súper será añadir a la despensa"— así que no hay un estado
 * de "comprado" aparte: la fila desaparece sola porque `despensa.tengo` ya
 * dice que sí.
 */
export function SeccionListaCompra({ recipes, despensa, paraHacer }: Props) {
  const seleccionadas = paraHacer.ids;

  const recetasPorHacer = useMemo(
    () => recipes
      .filter((r) => seleccionadas.has(r.id))
      .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es')),
    [recipes, seleccionadas]
  );

  const lista = useMemo(
    () => listaDeLaCompra(recipes, seleccionadas, despensa.tengo),
    [recipes, seleccionadas, despensa.tengo]
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-accent mb-3">
          <span className="w-2 h-2 rounded-full bg-hot dot-blink" />
          {seleccionadas.size} {seleccionadas.size === 1 ? 'receta' : 'recetas'} por hacer
        </div>
        <h2 className="font-display font-black text-4xl sm:text-6xl leading-[0.98] tracking-tight text-ink mb-3">
          Lista de la <span className="hl-mark">compra</span>
        </h2>
        <p className="text-base text-ink-soft leading-relaxed">
          Marca "para hacer" en la ficha de las recetas que vas a cocinar. Se descuenta lo que
          ya tienes en la despensa, y marcar algo aquí lo añade a ella.
        </p>
      </header>

      {/* ── La lista ──────────────────────────────────────── */}
      <section>
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-accent mb-3">
          Lo que hace falta comprar
        </h3>

        {seleccionadas.size === 0 ? (
          <p className="font-mono text-[12.5px] text-ink-soft leading-relaxed border-2 border-dashed border-ink/20 px-4 py-5">
            Aquí saldrá lo que te falte comprar.
          </p>
        ) : lista.length === 0 ? (
          <p className="flex items-center gap-2 font-mono text-[12.5px] text-accent leading-relaxed border-2 border-dashed border-ink/20 px-4 py-5">
            <ShoppingCart size={15} /> No te falta nada para estas recetas.
          </p>
        ) : (
          <ul className="list-none p-0 m-0 border-t border-dashed border-ink/20">
            {lista.map((item) => (
              <li
                key={item.base}
                className="grid grid-cols-[20px_1fr_auto] gap-2.5 py-2.5 items-baseline border-b border-dashed border-ink/15 cursor-pointer select-none"
                onClick={() => void despensa.anadir(item.base)}
                title="Ya lo he comprado"
              >
                <span
                  className="relative w-4 h-4 border-[1.6px] border-ink rounded-[3px] self-center bg-white"
                  aria-hidden
                />
                <span className="text-ink text-[14.5px]">{item.nombre}</span>
                <span className="font-mono text-[12px] text-ink-soft text-right whitespace-nowrap">
                  {item.lineas.join(' + ')}
                </span>
              </li>
            ))}
          </ul>
        )}

        {(despensa.error || paraHacer.error) && (
          <p className="mt-3 font-mono text-[11px] text-hot leading-snug">{despensa.error ?? paraHacer.error}</p>
        )}
      </section>

      {/* ── Recetas por hacer ────────────────────────────── */}
      <section className="mt-12">
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-accent mb-3">
          Recetas por hacer
        </h3>
        {recetasPorHacer.length === 0 ? (
          <p className="font-mono text-[12.5px] text-ink-soft leading-relaxed border-2 border-dashed border-ink/20 px-4 py-5">
            Aún no has marcado ninguna. Abre una receta del{' '}
            <a href={aHash(CATALOGO)} className="underline decoration-dotted hover:text-accent">catálogo</a>{' '}
            y pulsa «para hacer».
          </p>
        ) : (
          <ul className="list-none p-0 m-0 border-t border-dashed border-ink/20">
            {recetasPorHacer.map((receta) => (
              <li
                key={receta.id}
                className="flex items-center justify-between gap-3 py-2 border-b border-dashed border-ink/15"
              >
                <a
                  href={aHash({ vista: 'receta', id: receta.id })}
                  className="text-ink text-[14.5px] hover:text-accent"
                >
                  {receta.titulo}
                </a>
                <button
                  onClick={() => void paraHacer.quitar(receta.id)}
                  title="Quitar de por hacer"
                  aria-label={`Quitar ${receta.titulo} de por hacer`}
                  className="text-ink-soft hover:text-hot transition-colors"
                >
                  <X size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
