import { useMemo } from 'react';
import { AlertTriangle, ArrowLeft, X } from 'lucide-react';
import type { Recipe, Pase } from '../types';
import { useMenu } from '../hooks/useMenu';
import { PASES, paseSegunCategoria } from '../lib/menus';
import { aHash } from '../lib/rutas';
import { MenuCabecera } from './MenuCabecera';
import { MenuSelectorRecetas } from './MenuSelectorRecetas';

interface Props {
  id: string;
  recipes: Recipe[];
}

/**
 * Un menú por dentro: cabecera, recetas agrupadas por pase y buscador para
 * añadir más. Cada receta entra en el pase que le corresponde por su categoría
 * y se puede cambiar desde la propia fila.
 */
export function MenuEditor({ id, recipes }: Props) {
  const { menu, items, loading, noEncontrado, error, actualizar, anadir, quitar, cambiarPase } = useMenu(id);

  const porId = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);
  const enMenu = useMemo(() => new Set(items.map((i) => i.receta_id)), [items]);

  // Sin `porciones_num` no se sabe cómo escalar: se avisa en vez de callarlo, que
  // luego la lista de la compra saldría corta sin que se entendiera por qué.
  const sinRaciones = items
    .map((i) => porId.get(i.receta_id))
    .filter((r): r is Recipe => !!r && r.porciones_num == null);

  const volver = (
    <a href={aHash({ vista: 'menus' })} className="inline-flex items-center gap-1.5 font-mono text-[12px] text-ink-soft hover:text-accent mb-6">
      <ArrowLeft size={14} /> Mis menús
    </a>
  );

  if (loading) return <p className="max-w-3xl mx-auto font-mono text-sm text-ink-soft">Cargando…</p>;

  if (!menu) {
    return (
      <div className="max-w-3xl mx-auto">
        {volver}
        <p className="font-mono text-[12.5px] text-ink-soft border-2 border-dashed border-ink/20 px-4 py-5">
          {noEncontrado ? 'Este menú no existe, o no es tuyo.' : error}
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      {volver}

      <MenuCabecera key={menu.id} menu={menu} onCambiar={(c) => void actualizar(c)} />

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
          const delPase = items.filter((i) => i.pase === pase);
          if (delPase.length === 0) return null;
          return (
            <section key={pase}>
              <h3 className="font-display font-black text-2xl text-ink mb-2">{titulo}</h3>
              <ul className="list-none p-0 m-0 border-t border-dashed border-ink/20">
                {delPase.map((item) => {
                  const receta = porId.get(item.receta_id);
                  if (!receta) return null;
                  return (
                    <li key={item.receta_id} className="flex items-center gap-3 py-2 border-b border-dashed border-ink/15">
                      <a
                        href={aHash({ vista: 'receta', id: receta.id })}
                        className="min-w-0 flex-1 text-ink text-[14.5px] hover:text-accent truncate"
                      >
                        {receta.titulo}
                      </a>
                      {receta.porciones_num != null && (
                        <span className="hidden sm:inline font-mono text-[11px] text-ink-soft shrink-0">
                          para {receta.porciones_num}
                        </span>
                      )}
                      <select
                        value={item.pase}
                        onChange={(e) => void cambiarPase(item.receta_id, e.target.value as Pase)}
                        aria-label={`Pase de ${receta.titulo}`}
                        className="font-mono text-[11.5px] bg-white border border-ink/30 rounded px-1.5 py-1 shrink-0"
                      >
                        {PASES.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
                      </select>
                      <button
                        onClick={() => void quitar(item.receta_id)}
                        title="Quitar del menú"
                        aria-label={`Quitar ${receta.titulo} del menú`}
                        className="text-ink-soft hover:text-hot transition-colors shrink-0"
                      >
                        <X size={15} />
                      </button>
                    </li>
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
    </div>
  );
}
