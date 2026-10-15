import { PlusCircle, ShoppingBasket, ShoppingCart, FlaskConical, Globe2 } from 'lucide-react';
import { aHash, CATALOGO } from '../lib/rutas';

interface NavPrincipalProps {
  enCatalogo: boolean;
  enDespensa: boolean;
  enListaCompra: boolean;
  enLaboratorio: boolean;
  enPasaporte: boolean;
  enNueva: boolean;
  /** Cuántas cosas hay en la despensa, para el contador junto al enlace. */
  totalDespensa: number;
  isAdmin: boolean;
}

/**
 * Los enlaces de la cabecera. Solo el admin ve «Laboratorio» y «Nueva»; quien
 * autoriza de verdad son las RLS de Supabase y la validación de n8n, no esto.
 */
export function NavPrincipal({
  enCatalogo, enDespensa, enListaCompra, enLaboratorio, enPasaporte, enNueva, totalDespensa, isAdmin,
}: NavPrincipalProps) {
  return (
  <nav className="flex items-center gap-1">
    <a
      href={aHash(CATALOGO)}
      className={`px-2.5 sm:px-4 py-2 text-sm font-semibold rounded-md transition-colors ${enCatalogo
        ? 'bg-ink text-paper'
        : 'text-ink hover:bg-ink/5'
        }`}
    >
      Catálogo
    </a>
    <a
      href={aHash({ vista: 'despensa' })}
      className={`px-2.5 sm:px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-1.5 ${enDespensa
        ? 'bg-ink text-paper'
        : 'text-ink hover:bg-ink/5'
        }`}
    >
      <ShoppingBasket size={16} />
      <span className="hidden sm:inline">Despensa</span>
      {totalDespensa > 0 && (
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm bg-yellow text-ink">
          {totalDespensa}
        </span>
      )}
    </a>
    <a
      href={aHash({ vista: 'lista-compra' })}
      className={`px-2.5 sm:px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-1.5 ${enListaCompra
        ? 'bg-ink text-paper'
        : 'text-ink hover:bg-ink/5'
        }`}
    >
      <ShoppingCart size={16} />
      <span className="hidden sm:inline">Compra</span>
    </a>
    <a
      href={aHash({ vista: 'pasaporte' })}
      className={`px-2.5 sm:px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-1.5 ${enPasaporte
        ? 'bg-ink text-paper'
        : 'text-ink hover:bg-ink/5'
        }`}
    >
      <Globe2 size={16} />
      <span className="hidden sm:inline">Pasaporte</span>
    </a>
    {isAdmin && (
      <a
        href={aHash({ vista: 'laboratorio' })}
        className={`px-2.5 sm:px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-1.5 ${enLaboratorio
          ? 'bg-ink text-paper'
          : 'text-ink hover:bg-ink/5'
          }`}
      >
        <FlaskConical size={16} />
        <span className="hidden sm:inline">Laboratorio</span>
      </a>
    )}
    {isAdmin && (
      <a
        href={aHash({ vista: 'nueva' })}
        className={`px-2.5 sm:px-4 py-2 text-sm font-bold rounded-md transition-transform flex items-center gap-1.5 ${enNueva
          ? 'bg-yellow text-ink -rotate-1 shadow-brut'
          : 'text-ink hover:bg-ink/5'
          }`}
      >
        <PlusCircle size={16} />
        <span className="hidden sm:inline">Nueva</span>
      </a>
    )}
  </nav>
  );
}
