import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Loader2 } from 'lucide-react';
import { errorMessage } from '../lib/errors';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function LoginModal({ onClose, onLoginSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // Si el proyecto exige confirmación por email, signUp no abre sesión.
        if (!data.session) {
          setNotice('Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.');
          return;
        }
      }
      onLoginSuccess();
    } catch (err) {
      setError(errorMessage(err, 'Error de autenticación'));
    } finally {
      setLoading(false);
    }
  };

  const tab = (active: boolean) =>
    `flex-1 py-3 text-sm font-semibold transition-colors ${
      active ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-ink/5'
    }`;

  const field =
    'w-full px-3.5 py-2.5 bg-paper border-2 border-ink text-ink focus:outline-none focus:shadow-brut focus:-translate-x-px focus:-translate-y-px transition-all';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-paper w-full max-w-sm border-2 border-ink shadow-brut-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-ink bg-paper-2">
          <h2 className="font-display font-black text-xl text-ink">
            {mode === 'login' ? 'Acceso' : 'Nuevo Afan'}
          </h2>
          <button
            onClick={onClose}
            className="text-ink-soft hover:text-hot transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b-2 border-ink">
          <button className={tab(mode === 'login')} onClick={() => switchMode('login')}>
            Iniciar sesión
          </button>
          <button className={tab(mode === 'register')} onClick={() => switchMode('register')}>
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-hot-soft border-2 border-hot text-hot p-3 font-mono text-[12px] leading-snug">
              {error}
            </div>
          )}

          {notice && (
            <div className="bg-accent-soft border-2 border-accent text-accent p-3 font-mono text-[12px] leading-snug">
              {notice}
            </div>
          )}

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-soft mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-soft mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              className={field}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-yellow text-ink font-display font-bold text-[16px] border-2 border-ink shadow-brut hover:-translate-x-px hover:-translate-y-px hover:shadow-brut-lg active:translate-x-0 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:translate-x-0 disabled:translate-y-0"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            {loading ? 'Procesando…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}
