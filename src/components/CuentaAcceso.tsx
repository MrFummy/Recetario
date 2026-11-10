import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { errorMessage } from '../lib/errors';

const CAMPO = 'w-full px-3 py-2 bg-paper-2 border-[1.5px] border-ink/30 rounded-[3px] text-[14.5px] focus:outline-none focus:border-ink';
const ETIQUETA = 'block font-mono text-[11px] uppercase tracking-wider text-ink-soft mb-1';
const BOTON = 'px-4 py-2 bg-ink text-paper text-sm font-semibold rounded-full hover:bg-ink-soft transition-colors disabled:opacity-40';

type Mensaje = { tipo: 'ok' | 'error'; texto: string } | null;

function Aviso({ mensaje }: { mensaje: Mensaje }) {
  if (!mensaje) return null;
  return (
    <p className={`mt-2 font-mono text-[11.5px] leading-snug ${mensaje.tipo === 'ok' ? 'text-accent' : 'text-hot'}`}>
      {mensaje.texto}
    </p>
  );
}

/**
 * Correo y contraseña de la cuenta, por Supabase Auth. Cambiar el correo manda un enlace de
 * confirmación: hasta que se abre, la cuenta sigue con el correo de antes.
 */
export function CuentaAcceso({ user }: { user: User }) {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [repetida, setRepetida] = useState('');
  const [trabajando, setTrabajando] = useState<'correo' | 'clave' | null>(null);
  const [msgCorreo, setMsgCorreo] = useState<Mensaje>(null);
  const [msgClave, setMsgClave] = useState<Mensaje>(null);

  async function cambiarCorreo(e: React.FormEvent) {
    e.preventDefault();
    const nuevo = correo.trim();
    if (!/^\S+@\S+\.\S+$/.test(nuevo)) return setMsgCorreo({ tipo: 'error', texto: 'Ese correo no parece válido.' });
    if (nuevo.toLowerCase() === user.email?.toLowerCase()) return setMsgCorreo({ tipo: 'error', texto: 'Es el mismo que ya tienes.' });
    setTrabajando('correo');
    const { error } = await supabase.auth.updateUser({ email: nuevo });
    setTrabajando(null);
    if (error) return setMsgCorreo({ tipo: 'error', texto: errorMessage(error, 'No se pudo cambiar el correo.') });
    setCorreo('');
    setMsgCorreo({ tipo: 'ok', texto: `Te hemos enviado un enlace de confirmación a ${nuevo}. Hasta que lo abras sigues con el correo actual.` });
  }

  async function cambiarClave(e: React.FormEvent) {
    e.preventDefault();
    if (clave.length < 6) return setMsgClave({ tipo: 'error', texto: 'La contraseña necesita al menos 6 caracteres.' });
    if (clave !== repetida) return setMsgClave({ tipo: 'error', texto: 'Las dos contraseñas no coinciden.' });
    setTrabajando('clave');
    const { error } = await supabase.auth.updateUser({ password: clave });
    setTrabajando(null);
    if (error) return setMsgClave({ tipo: 'error', texto: errorMessage(error, 'No se pudo cambiar la contraseña.') });
    setClave('');
    setRepetida('');
    setMsgClave({ tipo: 'ok', texto: 'Contraseña cambiada.' });
  }

  return (
    <section className="space-y-8">
      <div>
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-accent mb-3">Correo</h3>
        <p className="text-[14.5px] text-ink mb-3">
          Tu correo actual es <b>{user.email}</b>.
        </p>
        <form onSubmit={(e) => void cambiarCorreo(e)}>
          <label className={ETIQUETA} htmlFor="cuenta-correo">Cambiar por</label>
          <div className="flex gap-2">
            <input
              id="cuenta-correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="nuevo@correo.com"
              autoComplete="email"
              className={CAMPO}
            />
            <button type="submit" disabled={!correo.trim() || trabajando !== null} className={BOTON}>Cambiar</button>
          </div>
          <Aviso mensaje={msgCorreo} />
        </form>
      </div>

      <div>
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-accent mb-3">Contraseña</h3>
        <form onSubmit={(e) => void cambiarClave(e)} className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={ETIQUETA} htmlFor="cuenta-clave">Nueva contraseña</label>
            <input id="cuenta-clave" type="password" value={clave} onChange={(e) => setClave(e.target.value)}
                   autoComplete="new-password" className={CAMPO} />
          </div>
          <div>
            <label className={ETIQUETA} htmlFor="cuenta-repetida">Repítela</label>
            <input id="cuenta-repetida" type="password" value={repetida} onChange={(e) => setRepetida(e.target.value)}
                   autoComplete="new-password" className={CAMPO} />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={!clave || !repetida || trabajando !== null} className={BOTON}>
              Cambiar contraseña
            </button>
            <Aviso mensaje={msgClave} />
          </div>
        </form>
      </div>
    </section>
  );
}
