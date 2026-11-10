import type { ComponentProps } from 'react';
import { LogIn, LogOut, UserRound } from 'lucide-react';
import { NavPrincipal } from './NavPrincipal';
import { LogoSarten } from './LogoSarten';
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
          <LogoSarten ancho={54} className="shrink-0 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105" />
          {/* Por debajo de `md` el título no cabe junto a la nav (con la sartén ya son 26 px de más a 640): queda solo la sartén. */}
          <span className="hidden font-display text-[1.65rem] font-semibold italic leading-none tracking-[-0.02em] md:block lg:text-[1.35rem] xl:text-[1.65rem]">
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
