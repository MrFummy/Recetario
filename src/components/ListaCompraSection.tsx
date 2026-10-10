import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import type { Recipe } from '../types';
import type { Despensa } from '../hooks/useDespensa';
import { listaDeLaCompra } from '../lib/listaCompra';

const CLAVE_LOCALSTORAGE = 'lista-compra:recetas';

interface Props {
  recipes: Recipe[];
  despensa: Despensa;
}

function leerSeleccionGuardada(): Set<string> {
  try {
    const guardado = localStorage.getItem(CLAVE_LOCALSTORAGE);
    const ids = guardado ? JSON.parse(guardado) : [];
    return Array.isArray(ids) ? new Set(ids.filter((id) => typeof id === 'string')) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * Elige recetas de la semana y ve la lista de la compra: sus ingredientes,
 * agregados, menos lo que ya dice la despensa que tienes.
 *
 * La selección se recuerda en este navegador (no en Supabase: es de la
 * semana, no de la cuenta) para no perderla si recargas a medio planificar.
 *
 * Marcar un ingrediente de la lista como comprado lo añade a la despensa
 * —"tachar en el súper será añadir a la despensa"— así que no hay un estado
 * de "comprado" aparte: la fila desaparece sola porque `despensa.tengo` ya
 * dice que sí.
 */
export function SeccionListaCompra({ recipes, despensa }: Props) {
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(leerSeleccionGuardada);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_LOCALSTORAGE, JSON.stringify([...seleccionadas]));
    } catch {
      // Sin acceso a localStorage (privado, cuota llena...) se sigue
      // funcionando, solo que sin recordar la selección entre visitas.
    }
  }, [seleccionadas]);

  const recetasOrdenadas = useMemo(
    () => [...recipes].sort((a, b) => a.titulo.localeCompare(b.titulo, 'es')),
    [recipes]
  );

  const lista = useMemo(
    () => listaDeLaCompra(recipes, seleccionadas, despensa.tengo),
    [recipes, seleccionadas, despensa.tengo]
  );

  const alternarReceta = (id: string) => {
    setSeleccionadas((actual) => {
      const siguiente = new Set(actual);
      if (siguiente.has(id)) {
        siguiente.delete(id);
      } else {
        siguiente.add(id);
      }
      return siguiente;
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-accent mb-3">
          <span className="w-2 h-2 rounded-full bg-hot dot-blink" />
          {seleccionadas.size} {seleccionadas.size === 1 ? 'receta' : 'recetas'} esta semana
        </div>
        <h2 className="font-display font-black text-4xl sm:text-6xl leading-[0.98] tracking-tight text-ink mb-3">
          Lista de la <span className="hl-mark">compra</span>
        </h2>
        <p className="text-base text-ink-soft leading-relaxed">
          Elige las recetas que vas a hacer. Se descuenta lo que ya tienes en la
          despensa, y marcar algo aquí lo añade a ella.
        </p>
      </header>

      {/* ── Elegir recetas ───────────────────────────────── */}
      <section>
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-accent mb-3">
          Recetas de la semana
        </h3>
        <ul className="list-none p-0 m-0 border-t border-dashed border-ink/20 max-h-80 overflow-y-auto">
          {recetasOrdenadas.map((receta) => {
            const marcada = seleccionadas.has(receta.id);
            return (
              <li
                key={receta.id}
                className="grid grid-cols-[20px_1fr] gap-2.5 py-2 items-baseline border-b border-dashed border-ink/15 cursor-pointer select-none"
                onClick={() => alternarReceta(receta.id)}
              >
                <span
                  className={`relative w-4 h-4 border-[1.6px] border-ink rounded-[3px] self-center transition-colors ${marcada ? 'bg-ink' : 'bg-white'}`}
                  aria-hidden
                >
                  {marcada && (
                    <span className="absolute -top-1 left-px font-script text-[22px] leading-none text-hot">✓</span>
                  )}
                </span>
                <span className="text-ink text-[14.5px]">{receta.titulo}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── La lista ──────────────────────────────────────── */}
      <section className="mt-12">
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-accent mb-3">
          Lo que hace falta comprar
        </h3>

        {seleccionadas.size === 0 ? (
          <p className="font-mono text-[12.5px] text-ink-soft leading-relaxed border-2 border-dashed border-ink/20 px-4 py-5">
            Elige arriba las recetas que vas a hacer esta semana.
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

        {despensa.error && (
          <p className="mt-3 font-mono text-[11px] text-hot leading-snug">{despensa.error}</p>
        )}
      </section>
    </div>
  );
}
