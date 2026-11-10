import type { ReactNode } from 'react';
import { BookOpen, PlusCircle, ShoppingBasket, ShoppingCart, FlaskConical, Globe2, UtensilsCrossed } from 'lucide-react';
import { aHash, CATALOGO } from '../lib/rutas';

interface NavPrincipalProps {
  enCatalogo: boolean;
  enDespensa: boolean;
  enListaCompra: boolean;
  enLaboratorio: boolean;
  enPasaporte: boolean;
  enMenus: boolean;
  enNueva: boolean;
  /** Cuántas cosas hay en la despensa, para el contador junto al enlace. */
  totalDespensa: number;
  isAdmin: boolean;
  /** Despensa, compra, menús y pasaporte solo se enseñan a quien tiene sesión. */
  logueado: boolean;
}

interface EnlaceProps {
  href: string;
  etiqueta: string;
  icono: ReactNode;
  activo: boolean;
  /** Por debajo de este ancho solo se ve el icono: la cabecera no da para más. */
  textoDesde?: 'lg' | 'xl';
  extra?: ReactNode;
}

// El subrayado terracota se dibuja al pasar el ratón y se queda en el enlace activo.
const BASE = 'relative flex items-center gap-1.5 px-2 py-2 text-sm font-semibold text-ink transition-colors sm:px-1.5 lg:px-2.5 xl:px-3.5 '
  + 'after:absolute after:inset-x-2 after:bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-accent '
  + 'after:transition-transform after:duration-300 hover:after:scale-x-100 ';

function Enlace({ href, etiqueta, icono, activo, textoDesde = 'lg', extra }: EnlaceProps) {
  const texto = textoDesde === 'xl' ? 'hidden xl:inline' : 'hidden lg:inline';
  return (
    <a
      href={href}
      aria-label={etiqueta}
      title={etiqueta}
      aria-current={activo ? 'page' : undefined}
      className={BASE + (activo ? 'text-accent after:scale-x-100' : '')}
    >
      {icono}
      <span className={texto}>{etiqueta}</span>
      {extra}
    </a>
  );
}

/**
 * Los enlaces de la cabecera. Solo el admin ve «Laboratorio» y «Nueva»; quien
 * autoriza de verdad son las RLS de Supabase y la validación de n8n, no esto.
 */
export function NavPrincipal({
  enCatalogo, enDespensa, enListaCompra, enLaboratorio, enPasaporte, enMenus, enNueva, totalDespensa, isAdmin, logueado,
}: NavPrincipalProps) {
  return (
    <nav className="flex items-center">
      <Enlace href={aHash(CATALOGO)} etiqueta="Catálogo" icono={<BookOpen size={16} className="lg:hidden" />} activo={enCatalogo} />
      {logueado && (
        <>
          <Enlace
            href={aHash({ vista: 'despensa' })} etiqueta="Despensa" icono={<ShoppingBasket size={16} />} activo={enDespensa}
            extra={totalDespensa > 0 && (
              <span className="rounded-full border border-ink bg-yellow px-1.5 font-mono text-[10px] leading-4 text-ink">
                {totalDespensa}
              </span>
            )}
          />
          <Enlace href={aHash({ vista: 'lista-compra' })} etiqueta="Compra" icono={<ShoppingCart size={16} />} activo={enListaCompra} />
          <Enlace href={aHash({ vista: 'menus' })} etiqueta="Menús" icono={<UtensilsCrossed size={16} />} activo={enMenus} />
          <Enlace href={aHash({ vista: 'pasaporte' })} etiqueta="Pasaporte" icono={<Globe2 size={16} />} activo={enPasaporte} />
        </>
      )}
      {isAdmin && (
        <Enlace href={aHash({ vista: 'laboratorio' })} etiqueta="Laboratorio" icono={<FlaskConical size={16} />} activo={enLaboratorio} textoDesde="xl" />
      )}
      {isAdmin && (
        <a
          href={aHash({ vista: 'nueva' })}
          aria-label="Nueva receta"
          title="Nueva receta"
          className={`boton-sello ml-1.5 !px-3 !py-1.5 ${enNueva ? '-rotate-2' : '!bg-paper'}`}
        >
          <PlusCircle size={16} />
          <span className="hidden xl:inline">Nueva</span>
        </a>
      )}
    </nav>
  );
}
