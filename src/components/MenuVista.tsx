import { useMemo } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { Menu, MenuCompartido, MenuReceta, Recipe } from '../types';
import type { Despensa } from '../hooks/useDespensa';
import { PASES, listaDelMenu } from '../lib/menus';
import { aHash, CATALOGO } from '../lib/rutas';
import { MenuCompra } from './MenuCompra';
import { MenuImprimible } from './MenuImprimible';

interface Props {
  datos: MenuCompartido;
  recipes: Recipe[];
  despensa: Despensa;
  user: User | null;
}

/**
 * Un menú ajeno, de solo lectura: el menú por pases, sus notas, la lista de la compra y el
 * botón de imprimir. Se abre sin sesión si el autor lo compartió por enlace. La lista descuenta
 * la despensa de quien mira: sin sesión sale completa, y marcar algo solo vale en esta visita.
 */
export function MenuVista({ datos, recipes, despensa, user }: Props) {
  // La función no manda `user_id` (no se enseña de quién es la cuenta); el resto de la web sí
  // espera un `Menu`, así que se rellena con algo vacío que aquí no se lee.
  const menu: Menu = useMemo(() => ({ ...datos.menu, user_id: '' }), [datos.menu]);
  const items: MenuReceta[] = useMemo(
    () => datos.recetas.map((r) => ({ ...r, menu_id: datos.menu.id })),
    [datos]
  );
  const porId = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);
  const lista = useMemo(
    () => listaDelMenu(menu, items, recipes, despensa.tengo),
    [menu, items, recipes, despensa.tengo]
  );

  const fecha = menu.fecha
    ? new Date(`${menu.fecha}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const etiquetas = [menu.ocasion, fecha, `${menu.comensales} ${menu.comensales === 1 ? 'comensal' : 'comensales'}`].filter(Boolean);

  return (
    <>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto print:hidden">
        <div className="flex items-center justify-between gap-3 mb-6">
          <a
            href={aHash(user ? { vista: 'menus' } : CATALOGO)}
            className="inline-flex items-center gap-1.5 font-mono text-[12px] text-ink-soft hover:text-accent"
          >
            <ArrowLeft size={14} /> {user ? 'Mis menús' : 'Catálogo'}
          </a>
          <button
            onClick={() => window.print()}
            title="Imprimir o guardar como PDF"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-ink/30 rounded-md font-mono text-[12px] text-ink hover:bg-ink/5 transition-colors"
          >
            <Printer size={14} /> Imprimir
          </button>
        </div>

        <header className="mb-8">
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-accent mb-2">
            {datos.autor ? `Menú compartido por ${datos.autor}` : 'Menú compartido'}
          </p>
          <h2 className="font-display font-black text-4xl sm:text-5xl leading-[1.02] tracking-tight text-ink mb-3">{menu.nombre}</h2>
          <p className="font-mono text-[12.5px] text-ink-soft">{etiquetas.join(' · ')}</p>
        </header>

        <div className="space-y-8">
          {PASES.map(({ id, titulo }) => {
            const delPase = items.filter((i) => i.pase === id).sort((a, b) => a.orden - b.orden);
            if (delPase.length === 0) return null;
            return (
              <section key={id}>
                <h3 className="font-display font-black text-2xl text-ink mb-2">{titulo}</h3>
                <ul className="list-none p-0 m-0 border-t border-dashed border-ink/20">
                  {delPase.map((item) => {
                    const receta = porId.get(item.receta_id);
                    if (!receta) return null;
                    return (
                      <li key={item.receta_id} className="flex items-baseline justify-between gap-3 py-2 border-b border-dashed border-ink/15">
                        <a href={aHash({ vista: 'receta', id: receta.id })} className="text-ink text-[14.5px] hover:text-accent">
                          {receta.titulo}
                        </a>
                        {item.raciones != null && (
                          <span className="font-mono text-[11px] text-ink-soft shrink-0">{item.raciones} raciones</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        {menu.notas && (
          <div className="mt-10 max-w-xl">
            <div className="relative bg-yellow px-6 pt-6 pb-7 -rotate-[1.4deg] shadow-xl">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rotate-2 w-24 h-5 shadow-sm" style={{ background: 'var(--color-tape)' }} />
              <div className="font-script text-[26px] leading-none mb-2 text-ink">~ Notas del menú ~</div>
              <p className="font-script text-[19px] leading-snug text-ink whitespace-pre-line">{menu.notas}</p>
            </div>
          </div>
        )}

        <div className="mt-12">
          <MenuCompra comensales={menu.comensales} hayRecetas={items.length > 0} lista={lista} despensa={despensa} />
        </div>
      </div>

      <MenuImprimible menu={menu} items={items} recipes={recipes} lista={lista} />
    </>
  );
}
