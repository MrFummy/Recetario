import type { ReactNode } from 'react';
import type { Menu, MenuReceta, Recipe } from '../types';
import type { ItemListaCompra } from '../lib/listaCompra';
import { PASES } from '../lib/menus';
import { paginar, type Bloque } from '../lib/paginar';
import { HojaImpresa } from './HojaImpresa';

interface Props {
  menu: Menu;
  items: MenuReceta[];
  recipes: Recipe[];
  lista: ItemListaCompra[];
}

/**
 * Filas que caben en una hoja. Una fila de lista mide 36 px (unos 9,5 mm) y el cuerpo útil
 * de la hoja, entre la cabecera y el pie, unos 935 px: caben 26 y se dejan 25 por margen.
 * Los pesos de los demás bloques (títulos, nota) están medidos en esas mismas filas.
 */
const FILAS_POR_HOJA = 25;

const DASHED = 'border-b border-dashed border-ink/20';

/** `18-05-2026`, como en los PDF de recetas. */
const fechaCorta = (d: Date) =>
  d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).replaceAll('/', '-');

/** `cena-de-nochebuena`: el nombre como ruta, para el pie. */
const aRuta = (nombre: string) =>
  nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * La hoja que sale al imprimir o guardar como PDF: el menú por pases y, en páginas
 * aparte, la lista de la compra. En pantalla está oculta; el resto de la web se oculta
 * al imprimir (`print:hidden`). Cada página es una hoja A4 (`HojaImpresa`) y el contenido
 * se reparte entre ellas con `paginar`.
 */
export function MenuImprimible({ menu, items, recipes, lista }: Props) {
  const porId = new Map(recipes.map((r) => [r.id, r]));
  const comensales = `${menu.comensales} ${menu.comensales === 1 ? 'comensal' : 'comensales'}`;
  const fechaLarga = menu.fecha
    ? new Date(`${menu.fecha}T00:00`).toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;
  const derecha = [menu.ocasion, menu.fecha && fechaCorta(new Date(`${menu.fecha}T00:00`))].filter(Boolean).join(' · ') || 'menú';

  const bloquesMenu: Bloque<ReactNode>[] = [
    {
      peso: 4.5,
      contenido: (
        <div key="titulo" className="mb-1">
          <span className="inline-block bg-accent-soft text-accent font-mono text-[10px] uppercase tracking-wider px-2 py-0.5">
            # menú
          </span>
          <h1 className="font-display font-black text-[38px] leading-[1.05] mt-2">{menu.nombre}</h1>
          <p className="font-mono text-[11px] text-ink-soft mt-2">
            {[menu.ocasion, fechaLarga, comensales].filter(Boolean).join(' · ')}
          </p>
          <div className="flex items-center gap-3 mt-4 text-accent text-[12px]" aria-hidden>
            <span className="flex-1 border-t border-dashed border-ink/25" />✦
            <span className="flex-1 border-t border-dashed border-ink/25" />
          </div>
        </div>
      ),
    },
  ];

  for (const { id, titulo } of PASES) {
    const delPase = items.filter((i) => i.pase === id).sort((a, b) => a.orden - b.orden);
    if (delPase.length === 0) continue;
    bloquesMenu.push({
      peso: 1.5,
      pegado: true,
      contenido: (
        <h2 key={`pase-${id}`} className="font-display font-black text-[22px] mt-4 mb-1">
          <span className="hl-mark">{titulo}</span>
        </h2>
      ),
    });
    for (const item of delPase) {
      const receta = porId.get(item.receta_id);
      if (!receta) continue;
      bloquesMenu.push({
        peso: 1,
        contenido: (
          <div key={`${id}-${item.receta_id}`} className={`flex items-baseline justify-between gap-4 py-[7px] text-[14px] ${DASHED}`}>
            <span>{receta.titulo}</span>
            <span className="font-mono text-[10.5px] text-ink-soft shrink-0">
              {[receta.categoria.toLowerCase(), item.raciones != null && `${item.raciones} raciones`].filter(Boolean).join(' · ')}
            </span>
          </div>
        ),
      });
    }
  }

  if (menu.notas) {
    bloquesMenu.push({
      // Unos 48 caracteres por línea en letra script, a 0,75 filas cada una.
      peso: 3.2 + Math.ceil(menu.notas.length / 48) * 0.75,
      contenido: (
        <div key="notas" className="relative mt-8 bg-yellow px-6 pt-6 pb-6 -rotate-[1deg] max-w-[130mm]">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rotate-2 w-24 h-5" style={{ background: 'var(--color-tape)' }} />
          <div className="font-script text-[26px] leading-none mb-2">~ Notas ~</div>
          <p className="font-script text-[19px] leading-snug whitespace-pre-line">{menu.notas}</p>
        </div>
      ),
    });
  }

  const bloquesLista: Bloque<ReactNode>[] = [];
  if (lista.length > 0) {
    bloquesLista.push({
      peso: 1.8,
      pegado: true,
      contenido: (
        <div key="lista-titulo" className="mb-1">
          <h2 className="font-display font-black text-[28px] leading-tight"><span className="hl-mark">Lista de la compra</span></h2>
          <p className="font-mono text-[10.5px] text-ink-soft mt-1">Para {comensales}, sin lo que ya hay en la despensa.</p>
        </div>
      ),
    });
    for (const item of lista) {
      bloquesLista.push({
        peso: 1,
        contenido: (
          <div key={item.base} className={`flex items-center gap-3 py-[7px] text-[14px] ${DASHED}`}>
            <span className="w-3.5 h-3.5 border-[1.6px] border-ink rounded-[3px] bg-white shrink-0 shadow-[1.5px_1.5px_0_var(--color-ink)]" aria-hidden />
            <span className="flex-1">{item.nombre}</span>
            <span className="font-mono text-[11px] text-ink-soft shrink-0">{item.lineas.join(' + ')}</span>
          </div>
        ),
      });
    }
  }

  const paginas = [
    ...paginar(bloquesMenu, [FILAS_POR_HOJA]),
    ...(bloquesLista.length > 0 ? paginar(bloquesLista, [FILAS_POR_HOJA]) : []),
  ];
  const pie = `~/menus/${aRuta(menu.nombre) || 'menu'}.md`;
  const hoy = fechaCorta(new Date());

  return (
    <div className="hidden print:block">
      {paginas.map((contenido, i) => (
        <HojaImpresa key={i} derecha={derecha} pie={pie} hoy={hoy} pagina={i + 1} total={paginas.length}>
          {contenido}
        </HojaImpresa>
      ))}
    </div>
  );
}
