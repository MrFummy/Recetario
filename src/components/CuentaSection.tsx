import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { LogOut } from 'lucide-react';
import { usePerfil } from '../hooks/usePerfil';
import { usePreferencias } from '../hooks/usePreferencias';
import { errorMessage } from '../lib/errors';
import { CuentaAcceso } from './CuentaAcceso';
import { CuentaAvisos } from './CuentaAvisos';

interface Props {
  user: User;
  isAdmin: boolean;
  onLogout: () => void;
}

/** El nombre con el que se firman las notas del muro. */
function FormNombre({ nombre, onGuardar }: { nombre: string | null; onGuardar: (n: string) => Promise<void> }) {
  const [texto, setTexto] = useState(nombre ?? '');
  const [estado, setEstado] = useState<'ok' | string | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    try {
      await onGuardar(texto);
      setEstado('ok');
    } catch (err) {
      setEstado(errorMessage(err, 'No se pudo guardar el nombre.'));
    }
  }

  const limpio = texto.trim();
  return (
    <form onSubmit={(e) => void guardar(e)}>
      <label className="block font-mono text-[11px] uppercase tracking-wider text-ink-soft mb-1" htmlFor="cuenta-nombre">
        Nombre
      </label>
      <div className="flex gap-2">
        <input
          id="cuenta-nombre"
          value={texto}
          maxLength={40}
          onChange={(e) => { setTexto(e.target.value); setEstado(null); }}
          placeholder="Cómo quieres que te llamen"
          className="w-full px-3 py-2 bg-white border-2 border-ink/30 rounded-md text-[14.5px] focus:outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={!limpio || limpio === (nombre ?? '')}
          className="px-4 py-2 bg-ink text-paper text-sm font-semibold rounded-md hover:bg-ink-soft transition-colors disabled:opacity-40"
        >
          Guardar
        </button>
      </div>
      <p className="mt-2 font-mono text-[11.5px] text-ink-soft leading-snug">Con este nombre firmas tus notas en el muro de las recetas.</p>
      {estado && <p className={`mt-1 font-mono text-[11.5px] ${estado === 'ok' ? 'text-accent' : 'text-hot'}`}>{estado === 'ok' ? 'Guardado.' : estado}</p>}
    </form>
  );
}

/** `#/cuenta`: lo que cada usuario puede cambiar de sí mismo. */
export function SeccionCuenta({ user, isAdmin, onLogout }: Props) {
  const { nombre, guardarNombre } = usePerfil(user);
  const preferencias = usePreferencias(user);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-accent mb-3">
          <span className="w-2 h-2 rounded-full bg-hot dot-blink" />
          {isAdmin ? 'admin' : 'afan'}
        </div>
        <h2 className="font-display font-black text-4xl sm:text-6xl leading-[0.98] tracking-tight text-ink">
          Mi <span className="hl-mark">cuenta</span>
        </h2>
      </header>

      <div className="space-y-10">
        <section>
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-accent mb-3">Perfil</h3>
          <FormNombre key={nombre ?? ''} nombre={nombre} onGuardar={guardarNombre} />
        </section>

        <CuentaAcceso user={user} />

        <CuentaAvisos user={user} preferencias={preferencias} />

        <section>
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-accent mb-3">Sesión</h3>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-ink/30 rounded-md text-sm font-semibold text-ink hover:text-hot hover:border-hot transition-colors"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </section>
      </div>
    </div>
  );
}
