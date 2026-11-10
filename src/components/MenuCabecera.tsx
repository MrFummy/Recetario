import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import type { Menu } from '../types';
import type { CambiosMenu } from '../hooks/useMenu';

const MAX_COMENSALES = 99;

const CAMPO = 'w-full px-3 py-2 bg-paper-2 border-[1.5px] border-ink/30 rounded-[3px] text-[14.5px] focus:outline-none focus:border-ink';
const ETIQUETA = 'block font-mono text-[11px] uppercase tracking-wider text-accent mb-1';

interface Props {
  menu: Menu;
  onCambiar: (cambios: CambiosMenu) => void;
}

/**
 * Nombre, ocasión, fecha, comensales y notas del menú. Los textos guardan al
 * salir del campo, no en cada tecla: cada guardado es una petición a Supabase.
 */
export function MenuCabecera({ menu, onCambiar }: Props) {
  const [nombre, setNombre] = useState(menu.nombre);
  const [ocasion, setOcasion] = useState(menu.ocasion ?? '');
  const [notas, setNotas] = useState(menu.notas ?? '');
  const [comensales, setComensales] = useState(String(menu.comensales));

  function guardarNombre() {
    const limpio = nombre.trim();
    // Un menú sin nombre no tiene sentido, y la tabla lo rechaza: se vuelve al anterior.
    if (!limpio) setNombre(menu.nombre);
    else if (limpio !== menu.nombre) onCambiar({ nombre: limpio });
  }

  function guardarTexto(valor: string, actual: string | null, campo: 'ocasion' | 'notas') {
    const limpio = valor.trim() || null;
    if (limpio !== actual) onCambiar({ [campo]: limpio });
  }

  function fijarComensales(n: number) {
    if (!Number.isInteger(n) || n < 1) {
      setComensales(String(menu.comensales));
      return;
    }
    const valido = Math.min(n, MAX_COMENSALES);
    setComensales(String(valido));
    if (valido !== menu.comensales) onCambiar({ comensales: valido });
  }

  const actuales = Number(comensales) || menu.comensales;

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className={ETIQUETA} htmlFor="menu-nombre">Nombre</label>
        <input
          id="menu-nombre"
          value={nombre}
          maxLength={80}
          onChange={(e) => setNombre(e.target.value)}
          onBlur={guardarNombre}
          className={`${CAMPO} font-display font-black text-2xl`}
        />
      </div>

      <div>
        <label className={ETIQUETA} htmlFor="menu-ocasion">Ocasión</label>
        <input
          id="menu-ocasion"
          value={ocasion}
          maxLength={80}
          placeholder="Cumpleaños de Ana, Nochebuena…"
          onChange={(e) => setOcasion(e.target.value)}
          onBlur={() => guardarTexto(ocasion, menu.ocasion, 'ocasion')}
          className={CAMPO}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={ETIQUETA} htmlFor="menu-fecha">Fecha</label>
          <input
            id="menu-fecha"
            type="date"
            value={menu.fecha ?? ''}
            onChange={(e) => onCambiar({ fecha: e.target.value || null })}
            className={CAMPO}
          />
        </div>
        <div>
          <label className={ETIQUETA} htmlFor="menu-comensales">Comensales</label>
          <div className="flex items-stretch">
            <button
              type="button"
              onClick={() => fijarComensales(actuales - 1)}
              disabled={actuales <= 1}
              aria-label="Un comensal menos"
              className="px-2 border-[1.5px] border-r-0 border-ink/30 rounded-l-md hover:bg-ink/5 disabled:opacity-30"
            >
              <Minus size={14} />
            </button>
            <input
              id="menu-comensales"
              inputMode="numeric"
              value={comensales}
              onChange={(e) => setComensales(e.target.value.replace(/\D/g, '').slice(0, 2))}
              onBlur={() => fijarComensales(Number(comensales))}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
              className="w-full min-w-0 text-center px-1 py-2 bg-paper-2 border-[1.5px] border-ink/30 text-[14.5px]
                         focus:outline-none focus:border-ink"
            />
            <button
              type="button"
              onClick={() => fijarComensales(actuales + 1)}
              disabled={actuales >= MAX_COMENSALES}
              aria-label="Un comensal más"
              className="px-2 border-[1.5px] border-l-0 border-ink/30 rounded-r-md hover:bg-ink/5 disabled:opacity-30"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="sm:col-span-2">
        <label className={ETIQUETA} htmlFor="menu-notas">Notas</label>
        <textarea
          id="menu-notas"
          value={notas}
          maxLength={2000}
          rows={2}
          placeholder="Alergias, bebidas, quién trae qué…"
          onChange={(e) => setNotas(e.target.value)}
          onBlur={() => guardarTexto(notas, menu.notas, 'notas')}
          className={`${CAMPO} resize-y`}
        />
      </div>
    </section>
  );
}
