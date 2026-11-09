import { useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';
import type { Menu, MenuReceta, Recipe } from '../types';
import type { Despensa } from '../hooks/useDespensa';
import type { Escala } from '../lib/escalado';
import { listaDeLaCompra } from '../lib/listaCompra';

interface Props {
  menu: Menu;
  items: MenuReceta[];
  recipes: Recipe[];
  despensa: Despensa;
}

/**
 * La lista de la compra del menú: los ingredientes de sus recetas escalados a las
 * raciones de cada una (las suyas, o los comensales del menú), menos lo que la
 * despensa dice que ya hay. Marcar uno lo añade a la despensa, como en la lista de
 * «para hacer»: no hay un estado de «comprado» aparte.
 */
export function MenuCompra({ menu, items, recipes, despensa }: Props) {
  const lista = useMemo(() => {
    const porId = new Map(recipes.map((r) => [r.id, r]));
    const escalas = new Map<string, Escala>();
    for (const item of items) {
      const receta = porId.get(item.receta_id);
      if (!receta) continue;
      escalas.set(item.receta_id, {
        raciones: item.raciones ?? menu.comensales,
        porciones: receta.porciones_num ?? null,
      });
    }
    return listaDeLaCompra(recipes, new Set(escalas.keys()), despensa.tengo, escalas);
  }, [recipes, items, menu.comensales, despensa.tengo]);

  return (
    <section>
      <h3 className="font-display font-black text-2xl text-ink mb-1">Lista de la compra</h3>
      <p className="font-mono text-[11.5px] text-ink-soft leading-snug mb-3">
        Escalada a {menu.comensales} {menu.comensales === 1 ? 'comensal' : 'comensales'}, sin lo que ya
        tienes en la despensa. Lo que no tiene número («al gusto») no se escala.
      </p>

      {items.length === 0 ? (
        <p className="font-mono text-[12.5px] text-ink-soft leading-relaxed border-2 border-dashed border-ink/20 px-4 py-5">
          Aquí saldrá lo que haya que comprar cuando añadas recetas.
        </p>
      ) : lista.length === 0 ? (
        <p className="flex items-center gap-2 font-mono text-[12.5px] text-accent leading-relaxed border-2 border-dashed border-ink/20 px-4 py-5">
          <ShoppingCart size={15} /> No te falta nada para este menú.
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
              <span className="relative w-4 h-4 border-[1.6px] border-ink rounded-[3px] self-center bg-white" aria-hidden />
              <span className="text-ink text-[14.5px]">{item.nombre}</span>
              <span className="font-mono text-[12px] text-ink-soft text-right">{item.lineas.join(' + ')}</span>
            </li>
          ))}
        </ul>
      )}

      {despensa.error && <p className="mt-3 font-mono text-[11px] text-hot leading-snug">{despensa.error}</p>}
    </section>
  );
}
