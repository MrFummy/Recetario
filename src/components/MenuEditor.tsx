import { useMemo } from 'react';
import { AlertTriangle, ArrowLeft, Printer } from 'lucide-react';
import type { Recipe } from '../types';
import type { Despensa } from '../hooks/useDespensa';
import { useMenu } from '../hooks/useMenu';
import { PASES, listaDelMenu, paseSegunCategoria } from '../lib/menus';
import { aHash } from '../lib/rutas';
import { MenuCabecera } from './MenuCabecera';
import { MenuCompartir } from './MenuCompartir';
import { MenuFila } from './MenuFila';
import { MenuCompra } from './MenuCompra';
import { MenuImprimible } from './MenuImprimible';
import { MenuSelectorRecetas } from './MenuSelectorRecetas';

interface Props {
  id: string;
  recipes: Recipe[];
  despensa: Despensa;
}

/**
 * Un menú por dentro: cabecera, recetas agrupadas por pase y buscador para
 * añadir más. Cada receta entra en el pase que le corresponde por su categoría
 * y se puede cambiar desde la propia fila.
 */
export function MenuEditor({ id, recipes, despensa }: Props) {
  const {
    menu, items, loading, noEncontrado, error, actualizar, anadir, quitar, cambiarPase, mover, fijarRaciones,
  } = useMenu(id);

  const porId = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);
  const enMenu = useMemo(() => new Set(items.map((i) => i.receta_id)), [items]);
  // Una sola lista para la pantalla y para la hoja impresa: no pueden salir distintas.
  const lista = useMemo(
    () => (menu ? listaDelMenu(menu, items, recipes, despensa.tengo) : []),
    [menu, items, recipes, despensa.tengo]
  );

  // Sin `porciones_num` no se sabe cómo escalar: se avisa en vez de callarlo, que
  // luego la lista de la compra saldría corta sin que se entendiera por qué.
  const sinRaciones = items
    .map((i) => porId.get(i.receta_id))
    .filter((r): r is Recipe => !!r && r.porciones_num == null);

  const volver = (
    <a href={aHash({ vista: 'menus' })} className="inline-flex items-center gap-1.5 font-mono text-[12px] text-ink-soft hover:text-accent">
      <ArrowLeft size={14} /> Mis menús
    </a>
  );

  if (loading) return <p className="max-w-3xl mx-auto font-mono text-sm text-ink-soft">Cargando…</p>;

  if (!menu) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">{volver}</div>
        <p className="font-mono text-[12.5px] text-ink-soft border-2 border-dashed border-ink/20 px-4 py-5">
          {noEncontrado ? 'Este menú no existe, no está compartido o no es tuyo.' : error}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto print:hidden">
        <div className="flex items-center justify-between gap-3 mb-6">
          {volver}
          <button
            onClick={() => window.print()}
            disabled={items.length === 0}
            title={items.length === 0 ? 'Añade recetas para poder imprimir' : 'Imprimir o guardar como PDF'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-ink/30 rounded-md font-mono text-[12px]
                       text-ink hover:bg-ink/5 transition-colors disabled:opacity-35 disabled:hover:bg-transparent"
          >
            <Printer size={14} /> Imprimir
          </button>
        </div>

        <MenuCabecera key={menu.id} menu={menu} onCambiar={(c) => void actualizar(c)} />

        <div className="mt-6">
          <MenuCompartir menu={menu} onCambiar={(visibilidad) => void actualizar({ visibilidad })} />
        </div>

        {error && <p className="mt-4 font-mono text-[11px] text-hot leading-snug">{error}</p>}

        {sinRaciones.length > 0 && (
          <p className="mt-6 flex items-start gap-2 font-mono text-[12px] text-ink leading-snug bg-yellow/40 border-2 border-dashed border-ink/30 px-3 py-2.5">
            <AlertTriangle size={14} className="shrink-0 mt-px" />
            <span>
              Sin raciones definidas: {sinRaciones.map((r) => r.titulo).join(', ')}. No se podrán
              escalar a {menu.comensales} comensales.
            </span>
          </p>
        )}

        <div className="mt-10 space-y-8">
          {items.length === 0 && (
            <p className="font-mono text-[12.5px] text-ink-soft leading-relaxed border-2 border-dashed border-ink/20 px-4 py-5">
              El menú está vacío. Busca recetas abajo para empezar.
            </p>
          )}

          {PASES.map(({ id: pase, titulo }) => {
            const delPase = items.filter((i) => i.pase === pase).sort((a, b) => a.orden - b.orden);
            if (delPase.length === 0) return null;
            return (
              <section key={pase}>
                <h3 className="font-display font-black text-2xl text-ink mb-2">{titulo}</h3>
                <ul className="list-none p-0 m-0 border-t border-dashed border-ink/20">
                  {delPase.map((item, i) => {
                    const receta = porId.get(item.receta_id);
                    if (!receta) return null;
                    return (
                      <MenuFila
                        key={item.receta_id}
                        receta={receta}
                        item={item}
                        comensales={menu.comensales}
                        esPrimera={i === 0}
                        esUltima={i === delPase.length - 1}
                        onMover={(d) => void mover(item.receta_id, d)}
                        onCambiarPase={(p) => void cambiarPase(item.receta_id, p)}
                        onFijarRaciones={(r) => void fijarRaciones(item.receta_id, r)}
                        onQuitar={() => void quitar(item.receta_id)}
                      />
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        <div className="mt-10">
          <MenuSelectorRecetas
            recipes={recipes}
            enMenu={enMenu}
            onAnadir={(r) => void anadir(r.id, paseSegunCategoria(r.categoria))}
          />
        </div>

        <div className="mt-12">
          <MenuCompra comensales={menu.comensales} hayRecetas={items.length > 0} lista={lista} despensa={despensa} />
        </div>
      </div>

      <MenuImprimible menu={menu} items={items} recipes={recipes} lista={lista} />
    </>
  );
}
