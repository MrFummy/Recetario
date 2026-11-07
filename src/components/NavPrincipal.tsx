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

/**
 * Los enlaces de la cabecera. Solo el admin ve «Laboratorio» y «Nueva»; quien
 * autoriza de verdad son las RLS de Supabase y la validación de n8n, no esto.
 */
export function NavPrincipal({
  enCatalogo, enDespensa, enListaCompra, enLaboratorio, enPasaporte, enMenus, enNueva, totalDespensa, isAdmin, logueado,
}: NavPrincipalProps) {
  return (
  <nav className="flex items-center gap-1">
    <a
      href={aHash(CATALOGO)}
      className={`px-2 lg:px-3 xl:px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center ${enCatalogo
        ? 'bg-ink text-paper'
        : 'text-ink hover:bg-ink/5'
        }`}
      aria-label="Catálogo"
      title="Catálogo"
    >
      <BookOpen size={16} className="lg:hidden" />
      <span className="hidden lg:inline">Catálogo</span>
    </a>
    {logueado && (
      <>
    <a
      href={aHash({ vista: 'despensa' })}
      aria-label="Despensa"
      title="Despensa"
      className={`px-2 lg:px-3 xl:px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-1.5 ${enDespensa
        ? 'bg-ink text-paper'
        : 'text-ink hover:bg-ink/5'
        }`}
    >
      <ShoppingBasket size={16} />
      <span className="hidden lg:inline">Despensa</span>
      {totalDespensa > 0 && (
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm bg-yellow text-ink">
          {totalDespensa}
        </span>
      )}
    </a>
    <a
      href={aHash({ vista: 'lista-compra' })}
      aria-label="Compra"
      title="Compra"
      className={`px-2 lg:px-3 xl:px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-1.5 ${enListaCompra
        ? 'bg-ink text-paper'
        : 'text-ink hover:bg-ink/5'
        }`}
    >
      <ShoppingCart size={16} />
      <span className="hidden lg:inline">Compra</span>
    </a>
    <a
      href={aHash({ vista: 'menus' })}
      aria-label="Menús"
      title="Menús"
      className={`px-2 lg:px-3 xl:px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-1.5 ${enMenus
        ? 'bg-ink text-paper'
        : 'text-ink hover:bg-ink/5'
        }`}
    >
      <UtensilsCrossed size={16} />
      <span className="hidden lg:inline">Menús</span>
    </a>
    <a
      href={aHash({ vista: 'pasaporte' })}
      aria-label="Pasaporte"
      title="Pasaporte"
      className={`px-2 lg:px-3 xl:px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-1.5 ${enPasaporte
        ? 'bg-ink text-paper'
        : 'text-ink hover:bg-ink/5'
        }`}
    >
      <Globe2 size={16} />
      <span className="hidden lg:inline">Pasaporte</span>
    </a>
      </>
    )}
    {isAdmin && (
      <a
        href={aHash({ vista: 'laboratorio' })}
      aria-label="Laboratorio"
      title="Laboratorio"
        className={`px-2 lg:px-3 xl:px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-1.5 ${enLaboratorio
          ? 'bg-ink text-paper'
          : 'text-ink hover:bg-ink/5'
          }`}
      >
        <FlaskConical size={16} />
        <span className="hidden xl:inline">Laboratorio</span>
      </a>
    )}
    {isAdmin && (
      <a
        href={aHash({ vista: 'nueva' })}
      aria-label="Nueva receta"
      title="Nueva receta"
        className={`px-2 lg:px-3 xl:px-4 py-2 text-sm font-bold rounded-md transition-transform flex items-center gap-1.5 ${enNueva
          ? 'bg-yellow text-ink -rotate-1 shadow-brut'
          : 'text-ink hover:bg-ink/5'
          }`}
      >
        <PlusCircle size={16} />
        <span className="hidden xl:inline">Nueva</span>
      </a>
    )}
  </nav>
  );
}
