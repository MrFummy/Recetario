import type { Menu, MenuReceta, Recipe } from '../types';
import type { ItemListaCompra } from '../lib/listaCompra';
import { PASES } from '../lib/menus';

interface Props {
  menu: Menu;
  items: MenuReceta[];
  recipes: Recipe[];
  lista: ItemListaCompra[];
}

/**
 * La hoja que sale al imprimir (o al guardar como PDF): el menú por pases y, en
 * otra página, la lista de la compra. En pantalla está oculta; el resto de la web
 * se oculta al imprimir (`print:hidden`). Va en blanco y negro y sin sombras, que
 * es lo que mejor sale en papel.
 */
export function MenuImprimible({ menu, items, recipes, lista }: Props) {
  const porId = new Map(recipes.map((r) => [r.id, r]));
  const fecha = menu.fecha
    ? new Date(`${menu.fecha}T00:00`).toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;
  const detalles = [menu.ocasion, fecha, `${menu.comensales} ${menu.comensales === 1 ? 'comensal' : 'comensales'}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="hidden print:block text-black">
      <h1 className="font-display font-black text-4xl leading-tight">{menu.nombre}</h1>
      <p className="font-mono text-[12px] mt-1 mb-8">{detalles}</p>

      {PASES.map(({ id, titulo }) => {
        const delPase = items.filter((i) => i.pase === id).sort((a, b) => a.orden - b.orden);
        if (delPase.length === 0) return null;
        return (
          <section key={id} className="mb-6 break-inside-avoid">
            <h2 className="font-display font-black text-xl border-b border-black pb-1 mb-2">{titulo}</h2>
            <ul className="list-none p-0 m-0">
              {delPase.map((item) => {
                const receta = porId.get(item.receta_id);
                if (!receta) return null;
                return (
                  <li key={item.receta_id} className="flex items-baseline justify-between gap-4 py-1 text-[14px]">
                    <span>{receta.titulo}</span>
                    {item.raciones != null && (
                      <span className="font-mono text-[11px] shrink-0">{item.raciones} raciones</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {menu.notas && (
        <section className="mb-6 break-inside-avoid">
          <h2 className="font-display font-black text-xl border-b border-black pb-1 mb-2">Notas</h2>
          <p className="text-[14px] whitespace-pre-line">{menu.notas}</p>
        </section>
      )}

      {lista.length > 0 && (
        <section className="break-before-page">
          <h2 className="font-display font-black text-2xl border-b border-black pb-1 mb-1">Lista de la compra</h2>
          <p className="font-mono text-[11px] mb-3">Para {menu.comensales} {menu.comensales === 1 ? 'comensal' : 'comensales'}, sin lo que ya hay en la despensa.</p>
          <ul className="list-none p-0 m-0">
            {lista.map((item) => (
              <li key={item.base} className="flex items-baseline gap-3 py-1.5 border-b border-dashed border-black/40 break-inside-avoid text-[14px]">
                <span className="inline-block w-3.5 h-3.5 border border-black shrink-0 self-center" aria-hidden />
                <span className="flex-1">{item.nombre}</span>
                <span className="font-mono text-[12px] shrink-0">{item.lineas.join(' + ')}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
