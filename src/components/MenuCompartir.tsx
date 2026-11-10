import { useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { Menu, Visibilidad } from '../types';
import { VISIBILIDADES } from '../lib/menus';
import { aHash } from '../lib/rutas';

interface Props {
  menu: Menu;
  onCambiar: (visibilidad: Visibilidad) => void;
}

/**
 * Quién puede ver el menú, y el enlace para pasarlo. El enlace es la dirección de la propia web
 * con el id del menú; que funcione o no depende solo de la visibilidad, así que volver a
 * «Privado» lo deja de golpe sin efecto.
 */
export function MenuCompartir({ menu, onCambiar }: Props) {
  const [copiado, setCopiado] = useState(false);
  const campo = useRef<HTMLInputElement>(null);

  const enlace = `${window.location.origin}${window.location.pathname}${aHash({ vista: 'menu', id: menu.id })}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin HTTPS el portapapeles no existe: se deja el enlace seleccionado para copiarlo a mano.
      campo.current?.select();
    }
  }

  return (
    <section className="border-[1.5px] border-dashed border-ink/25 p-4">
      <h3 className="font-mono text-[11px] uppercase tracking-wider text-accent mb-3">Compartir</h3>

      <div role="radiogroup" aria-label="Quién puede ver este menú" className="grid gap-2 sm:grid-cols-3">
        {VISIBILIDADES.map(({ id, titulo, detalle }) => {
          const activa = menu.visibilidad === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={activa}
              onClick={() => { if (!activa) onCambiar(id); }}
              className={`text-left px-3 py-2 border-[1.5px] rounded-[3px] transition-colors ${activa
                ? 'bg-ink text-paper border-ink'
                : 'bg-paper-2 text-ink border-ink/30 hover:border-ink'}`}
            >
              <span className="block text-sm font-semibold">{titulo}</span>
              <span className={`block font-mono text-[11px] leading-snug ${activa ? 'text-paper/80' : 'text-ink-soft'}`}>{detalle}</span>
            </button>
          );
        })}
      </div>

      {menu.visibilidad !== 'privado' && (
        <div className="mt-4">
          <div className="flex gap-2">
            <input
              ref={campo}
              readOnly
              value={enlace}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Enlace del menú"
              className="flex-1 min-w-0 px-3 py-2 bg-paper-2 border-[1.5px] border-ink/30 rounded-[3px] font-mono text-[12px]"
            />
            <button
              type="button"
              onClick={() => void copiar()}
              className="inline-flex items-center gap-1.5 px-3 py-2 border-[1.5px] border-ink/30 rounded-[3px] font-mono text-[12px] text-ink hover:bg-ink/5 transition-colors"
            >
              {copiado ? <Check size={14} /> : <Copy size={14} />} {copiado ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="mt-2 font-mono text-[11px] text-ink-soft leading-snug">
            {menu.visibilidad === 'afans'
              ? 'Solo lo abre quien tenga sesión. '
              : 'Lo abre cualquiera que tenga el enlace, sin cuenta. '}
            Se comparten también las notas del menú. Para dejar de compartir, vuelve a «Privado»: el enlace deja de funcionar.
          </p>
        </div>
      )}
    </section>
  );
}
