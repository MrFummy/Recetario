import type { User } from '@supabase/supabase-js';
import type { Preferencias } from '../hooks/usePreferencias';

interface Props {
  user: User;
  preferencias: Preferencias;
}

/**
 * El interruptor de los avisos de recetas nuevas. Siempre empieza apagado y solo lo enciende quien
 * lo pide. El correo es el de la cuenta y solo se escribe a direcciones confirmadas, así que si la
 * de esta cuenta no lo está se dice, en vez de dejar que parezca que funciona.
 */
export function CuentaAvisos({ user, preferencias }: Props) {
  const { cargando, avisosRecetas, error, guardarAvisosRecetas } = preferencias;
  const confirmado = !!user.email_confirmed_at;

  return (
    <section>
      <h3 className="font-mono text-[11px] uppercase tracking-wider text-accent mb-3">Avisos</h3>

      <div className="flex items-start gap-4">
        <button
          type="button"
          role="switch"
          aria-checked={avisosRecetas}
          aria-label="Avisarme por correo de las recetas nuevas"
          disabled={cargando}
          onClick={() => void guardarAvisosRecetas(!avisosRecetas)}
          className={`relative shrink-0 mt-0.5 w-11 h-6 rounded-full border-2 transition-colors disabled:opacity-40 ${avisosRecetas
            ? 'bg-ink border-ink'
            : 'bg-white border-ink/30'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${avisosRecetas
              ? 'translate-x-5 bg-yellow'
              : 'translate-x-0 bg-ink/40'}`}
          />
        </button>
        <div>
          <p className="text-[14.5px] text-ink">Avisarme por correo cuando se añada una receta nueva</p>
          <p className="mt-1 font-mono text-[11.5px] text-ink-soft leading-snug">
            Te escribiremos a <b className="text-ink">{user.email}</b>, un correo por receta. Puedes
            quitarlo aquí cuando quieras.
          </p>
          {!confirmado && (
            <p className="mt-2 font-mono text-[11.5px] text-hot leading-snug">
              Tu correo aún no está confirmado: no recibirás avisos hasta que lo confirmes.
            </p>
          )}
        </div>
      </div>

      {error && <p className="mt-3 font-mono text-[11px] text-hot leading-snug">{error}</p>}
    </section>
  );
}
