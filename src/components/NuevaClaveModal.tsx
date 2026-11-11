import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { errorMessage } from '../lib/errors';
import { LogoSarten } from './LogoSarten';

/**
 * Sale al abrir el enlace del correo de «restablecer contraseña»: Supabase ya ha abierto una sesión de
 * recuperación con ese enlace, así que basta con `updateUser({ password })`.
 */
export function NuevaClaveModal({ onClose }: { onClose: () => void }) {
  const [clave, setClave] = useState('');
  const [repetida, setRepetida] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hecho, setHecho] = useState(false);
  const [trabajando, setTrabajando] = useState(false);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clave.length < 6) return setError('La contraseña necesita al menos 6 caracteres.');
    if (clave !== repetida) return setError('Las dos contraseñas no coinciden.');
    setTrabajando(true);
    setError(null);
    const { error: fallo } = await supabase.auth.updateUser({ password: clave });
    setTrabajando(false);
    if (fallo) return setError(errorMessage(fallo, 'No se pudo cambiar la contraseña.'));
    setHecho(true);
  };

  const field =
    'w-full px-3.5 py-2.5 bg-paper border-[1.5px] border-ink text-ink focus:outline-none focus:shadow-brut focus:-translate-x-px focus:-translate-y-px transition-all';
  const etiqueta = 'block font-mono text-[10px] uppercase tracking-wider text-ink-soft mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
      <div className="bg-paper w-full max-w-sm border-[1.5px] border-ink shadow-brut-lg overflow-hidden">
        <div className="flex justify-center border-b-[1.5px] border-ink bg-paper-2 pb-4 pt-6">
          <LogoSarten ancho={190} conTexto />
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-ink bg-paper-2">
          <h2 className="font-display font-light text-xl text-ink">Nueva contraseña</h2>
          <button onClick={onClose} className="text-ink-soft hover:text-hot transition-colors" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {hecho ? (
          <div className="p-6 space-y-4">
            <div className="bg-accent-soft border-[1.5px] border-accent text-accent p-3 font-mono text-[12px] leading-snug">
              Contraseña cambiada. Ya tienes la sesión abierta.
            </div>
            <button type="button" onClick={onClose} className="boton-sello w-full">Seguir</button>
          </div>
        ) : (
          <form onSubmit={(e) => void guardar(e)} className="p-6 space-y-4">
            <p className="text-[14px] leading-snug text-ink-soft">Elige la contraseña con la que vas a entrar a partir de ahora.</p>
            {error && (
              <div className="bg-hot-soft border-[1.5px] border-hot text-hot p-3 font-mono text-[12px] leading-snug">{error}</div>
            )}
            <div>
              <label className={etiqueta}>Contraseña nueva</label>
              <input type="password" required minLength={6} value={clave} onChange={(e) => setClave(e.target.value)} className={field} autoFocus />
            </div>
            <div>
              <label className={etiqueta}>Repítela</label>
              <input type="password" required minLength={6} value={repetida} onChange={(e) => setRepetida(e.target.value)} className={field} />
            </div>
            <button type="submit" disabled={trabajando} className="boton-sello w-full">
              {trabajando && <Loader2 className="animate-spin" size={16} />}
              {trabajando ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
