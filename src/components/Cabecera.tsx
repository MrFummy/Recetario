import type { ComponentProps } from 'react';
import { LogIn, LogOut, UserRound } from 'lucide-react';
import { NavPrincipal } from './NavPrincipal';
import { aHash, CATALOGO } from '../lib/rutas';

interface CabeceraProps {
  nav: ComponentProps<typeof NavPrincipal>;
  logueado: boolean;
  enCuenta: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

/** Cabecera fija: marca, navegación, cuenta y la cenefa de azulejo que la remata. */
export function Cabecera({ nav, logueado, enCuenta, onLogin, onLogout }: CabeceraProps) {
  return (
    <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href={aHash(CATALOGO)} aria-label="El Recetario de Markis, ir al catálogo" className="group flex shrink-0 items-center gap-3">
          <span className="sello !h-9 !w-9 !rotate-[-8deg] bg-accent !text-paper text-[17px] !shadow-[2px_2px_0_var(--color-ink)] group-hover:!rotate-12 group-hover:scale-110">
            M
          </span>
          {/* Por debajo de `sm` el título no cabe junto a la nav: queda el sello. */}
          <span className="hidden font-display text-[1.65rem] font-semibold italic leading-none tracking-[-0.02em] sm:block">
            El Recetario de <b className="font-extrabold not-italic text-accent">Markis</b>
          </span>
        </a>

        <div className="flex items-center gap-2">
          <NavPrincipal {...nav} />

          {logueado ? (
            <div className="flex items-center gap-0.5">
              <a
                href={aHash({ vista: 'cuenta' })}
                className={`p-1.5 transition-colors ${enCuenta ? 'text-accent' : 'text-ink-soft hover:text-accent'}`}
                title="Mi cuenta"
                aria-label="Mi cuenta"
              >
                <UserRound size={20} />
              </a>
              {/* En pantallas estrechas no cabe junto al icono de la cuenta: cerrar sesión está en «Mi cuenta». */}
              <button onClick={onLogout} className="hidden p-1.5 text-ink-soft transition-colors hover:text-hot sm:block" title="Cerrar sesión">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button onClick={onLogin} className="p-2 text-ink-soft transition-colors hover:text-accent" title="Entrar / Registrarse">
              <LogIn size={20} />
            </button>
          )}
        </div>
      </div>
      <div className="cenefa" />
    </header>
  );
}
