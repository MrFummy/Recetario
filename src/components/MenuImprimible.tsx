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
 * Alto útil de una hoja, en px: entre la cabecera y el pie quedan 969, menos un margen de 7
 * por si una estimación se queda corta. Los pesos de `ALTO` están medidos sobre la hoja ya
 * pintada y aciertan al píxel o casi, así que el margen puede ser pequeño.
 */
const ALTO_UTIL = 962;

/**
 * Altura de cada bloque, en px, con sus márgenes. Si se cambian tamaños de letra o rellenos
 * en `.hoja*` hay que volver a medirlas, o el contenido se saldría de la hoja.
 */
const ALTO = {
  paso: 61, // número circulado, título y detalle
  linea: 18, // cada línea más que se parta en un paso
  seccion: 67, // título de sección, con su margen superior e inferior
  ingrediente: 28, // fila de la lista, de una línea
  ingredienteLargo: 45, // y de dos
  categoria: 33,
  titulo: 38, // por línea
  chips: 25, // primera fila
  filaChips: 31, // cada fila más
  ornamento: 48,
  nota: 80, // post-it sin texto, con su margen
  lineaNota: 22,
} as const;

/** `31/10/2026`, como en los PDF de recetas. */
const fecha = (d: Date) => d.toLocaleDateString('es-ES');

/**
 * La hoja que sale al imprimir o guardar como PDF, con el aspecto de los PDF de recetas: el
 * menú por pases, con los platos numerados, y, en páginas aparte, la lista de la compra.
 * En pantalla está oculta; el resto de la web se oculta al imprimir (`print:hidden`). Cada
 * página es una hoja (`HojaImpresa`) y el contenido se reparte entre ellas con `paginar`.
 */
export function MenuImprimible({ menu, items, recipes, lista }: Props) {
  const porId = new Map(recipes.map((r) => [r.id, r]));
  const hoy = fecha(new Date());
  const comensales = `${menu.comensales} ${menu.comensales === 1 ? 'comensal' : 'comensales'}`;
  const fechaMenu = menu.fecha ? new Date(`${menu.fecha}T12:00:00`) : null;
  const fechaLarga = fechaMenu?.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const chips = [menu.ocasion, comensales, fechaLarga].filter((c): c is string => !!c);

  const lineasTitulo = Math.ceil(menu.nombre.length / 30);
  const filasChips = Math.ceil(chips.join('').length / 70);
  const bloquesMenu: Bloque<ReactNode>[] = [
    {
      // El margen de 10 px bajo el título se funde con el de 8 px sobre los chips.
      peso: ALTO.categoria + lineasTitulo * ALTO.titulo + 10 + ALTO.chips + (filasChips - 1) * ALTO.filaChips + ALTO.ornamento,
      contenido: (
        <div key="cabeza">
          <div className="hoja-categoria">menú</div>
          <h1 className="hoja-titulo">{menu.nombre}</h1>
          <div className="hoja-chips">
            {chips.map((c) => <span key={c} className="hoja-chip">{c}</span>)}
          </div>
          <div className="hoja-ornamento" aria-hidden>
            <span className="hoja-ornamento-linea" />
            <span className="hoja-ornamento-punto">✦</span>
            <span className="hoja-ornamento-linea" />
          </div>
        </div>
      ),
    },
  ];

  // Los platos se numeran de corrido, como los pasos de una receta.
  let numero = 0;
  for (const { id, titulo } of PASES) {
    const delPase = items.filter((i) => i.pase === id).sort((a, b) => a.orden - b.orden);
    if (delPase.length === 0) continue;
    bloquesMenu.push({
      peso: ALTO.seccion,
      pegado: true,
      contenido: (
        <div key={`pase-${id}`} className="hoja-seccion-bloque">
          <h2 className="hoja-seccion">{titulo}</h2>
        </div>
      ),
    });
    for (const item of delPase) {
      const receta = porId.get(item.receta_id);
      if (!receta) continue;
      numero += 1;
      const detalle = [receta.categoria.toLowerCase(), item.raciones != null && `${item.raciones} raciones`]
        .filter(Boolean)
        .join(' · ');
      bloquesMenu.push({
        peso: ALTO.paso + (receta.titulo.length > 90 ? ALTO.linea : 0),
        contenido: (
          <div key={`${id}-${item.receta_id}`} className="hoja-paso">
            <div className="hoja-num"><span>{numero}</span></div>
            <div className="hoja-paso-texto">
              <b>{receta.titulo}</b>
              <span className="hoja-paso-detalle">{detalle}</span>
            </div>
          </div>
        ),
      });
    }
  }

  if (menu.notas) {
    bloquesMenu.push({
      // Unos 60 caracteres por línea en letra script.
      peso: ALTO.nota + Math.ceil(menu.notas.length / 60) * ALTO.lineaNota,
      contenido: (
        <div key="notas" className="hoja-notas-envoltorio">
          <div className="hoja-notas">
            <div className="hoja-notas-titulo">~ Notas del menú ~</div>
            <div className="hoja-notas-texto">{menu.notas}</div>
          </div>
        </div>
      ),
    });
  }

  // La lista va de dos en dos: a ancho completo una sola columna dejaría media hoja vacía.
  const bloquesLista: Bloque<ReactNode>[] = [];
  if (lista.length > 0) {
    bloquesLista.push({
      peso: ALTO.seccion + 26, // y su línea de explicación
      pegado: true,
      contenido: (
        <div key="lista-titulo" className="hoja-seccion-bloque">
          <h2 className="hoja-seccion">Lista de la compra</h2>
          <p className="hoja-nota-pie">Para {comensales}, sin lo que ya hay en la despensa.</p>
        </div>
      ),
    });
    const texto = (i: ItemListaCompra) => `${i.lineas.join(' + ')} ${i.nombre}`;
    for (let i = 0; i < lista.length; i += 2) {
      const par = lista.slice(i, i + 2);
      bloquesLista.push({
        peso: par.some((p) => texto(p).length > 48) ? ALTO.ingredienteLargo : ALTO.ingrediente,
        contenido: (
          <div key={`par-${par[0].base}`} className="hoja-ingredientes">
            {par.map((item) => (
              <div key={item.base} className="hoja-ing">
                <span>◆</span>
                <span>{texto(item)}</span>
              </div>
            ))}
          </div>
        ),
      });
    }
  }

  const paginas = [
    ...paginar(bloquesMenu, [ALTO_UTIL]),
    ...(bloquesLista.length > 0 ? paginar(bloquesLista, [ALTO_UTIL]) : []),
  ];
  const ruta = `~/menus/${menu.nombre.split(' ').slice(0, 4).join(' ')}.md`;
  const etiqueta = (menu.ocasion ?? 'menú').slice(0, 40);

  return (
    <div className="hidden print:block">
      {paginas.map((contenido, i) => (
        <HojaImpresa
          key={i}
          etiqueta={etiqueta}
          fecha={fecha(fechaMenu ?? new Date())}
          ruta={ruta}
          hoy={hoy}
          pagina={i + 1}
          total={paginas.length}
        >
          {contenido}
        </HojaImpresa>
      ))}
    </div>
  );
}
