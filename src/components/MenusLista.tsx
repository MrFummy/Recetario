import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Trash2, Users } from 'lucide-react';
import { useMenus } from '../hooks/useMenus';
import { irA } from '../hooks/useRuta';
import { aHash } from '../lib/rutas';

/** Los menús del usuario, con un formulario mínimo para crear otro. */
export function MenusLista({ user }: { user: User | null }) {
  const { menus, loading, error, crear, borrar } = useMenus(user);
  const [nombre, setNombre] = useState('');
  const [creando, setCreando] = useState(false);

  async function alCrear(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || creando) return;
    setCreando(true);
    const menu = await crear(nombre, 4);
    setCreando(false);
    if (menu) {
      setNombre('');
      irA({ vista: 'menu', id: menu.id });
    }
  }

  function alBorrar(id: string, titulo: string) {
    if (window.confirm(`¿Borrar el menú «${titulo}»? Las recetas siguen en el catálogo.`)) void borrar(id);
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-accent mb-3">
          <span className="w-2 h-2 rounded-full bg-hot dot-blink" />
          {menus.length} {menus.length === 1 ? 'menú' : 'menús'}
        </div>
        <h2 className="font-display font-black text-4xl sm:text-6xl leading-[0.98] tracking-tight text-ink mb-3">
          Mis <span className="hl-mark">menús</span>
        </h2>
        <p className="text-base text-ink-soft leading-relaxed">
          Elige recetas para una ocasión —una cena, un cumpleaños— y ordénalas por pases.
        </p>
      </header>

      <form onSubmit={alCrear} className="flex gap-2 mb-8">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={80}
          placeholder="Nombre del menú: Nochebuena, cena con Ana…"
          aria-label="Nombre del nuevo menú"
          className="flex-1 min-w-0 px-3 py-2 bg-white border-2 border-ink/30 rounded-md text-[14.5px]
                     focus:outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={!nombre.trim() || creando}
          className="px-4 py-2 bg-ink text-paper text-sm font-semibold rounded-md hover:bg-ink-soft
                     transition-colors disabled:opacity-40"
        >
          Crear menú
        </button>
      </form>

      {error && <p className="mb-4 font-mono text-[11px] text-hot leading-snug">{error}</p>}

      {loading ? (
        <p className="font-mono text-sm text-ink-soft">Cargando…</p>
      ) : menus.length === 0 ? (
        <p className="font-mono text-[12.5px] text-ink-soft leading-relaxed border-2 border-dashed border-ink/20 px-4 py-5">
          Aún no tienes ningún menú. Ponle un nombre arriba para empezar.
        </p>
      ) : (
        <ul className="list-none p-0 m-0 border-t border-dashed border-ink/20">
          {menus.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-3 border-b border-dashed border-ink/15">
              <a href={aHash({ vista: 'menu', id: m.id })} className="min-w-0 flex-1 group">
                <span className="block text-ink text-[16px] font-semibold group-hover:text-accent truncate">
                  {m.nombre}
                </span>
                <span className="block font-mono text-[11.5px] text-ink-soft">
                  {[
                    m.ocasion,
                    m.fecha && new Date(`${m.fecha}T00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
                    `${m.recetas} ${m.recetas === 1 ? 'receta' : 'recetas'}`,
                  ].filter(Boolean).join(' · ')}
                </span>
              </a>
              <span className="flex items-center gap-1 font-mono text-[12px] text-ink-soft shrink-0">
                <Users size={13} /> {m.comensales}
              </span>
              <button
                onClick={() => alBorrar(m.id, m.nombre)}
                title="Borrar menú"
                aria-label={`Borrar el menú ${m.nombre}`}
                className="text-ink-soft hover:text-hot transition-colors shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
