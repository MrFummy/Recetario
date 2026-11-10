import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import type { MenuReceta, Pase, Recipe } from '../types';
import { PASES } from '../lib/menus';
import { aHash } from '../lib/rutas';

const MAX_RACIONES = 99;

interface Props {
  receta: Recipe;
  item: MenuReceta;
  /** Las raciones del menú, que usa la receta mientras no tenga las suyas. */
  comensales: number;
  esPrimera: boolean;
  esUltima: boolean;
  onMover: (direccion: -1 | 1) => void;
  onCambiarPase: (pase: Pase) => void;
  onFijarRaciones: (raciones: number | null) => void;
  onQuitar: () => void;
}

const BOTON = 'text-ink-soft hover:text-ink transition-colors disabled:opacity-25 disabled:hover:text-ink-soft';

/**
 * Una receta dentro de un menú. En pantallas estrechas el título ocupa su propia
 * línea y los controles pasan debajo: con todo en una fila no cabía en el móvil.
 */
export function MenuFila({
  receta, item, comensales, esPrimera, esUltima, onMover, onCambiarPase, onFijarRaciones, onQuitar,
}: Props) {
  const [raciones, setRaciones] = useState(item.raciones == null ? '' : String(item.raciones));

  function guardarRaciones() {
    // Vacío es «las del menú»; algo que no es un entero válido vuelve a lo guardado.
    if (raciones.trim() === '') {
      if (item.raciones != null) onFijarRaciones(null);
      return;
    }
    const n = Number(raciones);
    if (!Number.isInteger(n) || n < 1) {
      setRaciones(item.raciones == null ? '' : String(item.raciones));
      return;
    }
    const valido = Math.min(n, MAX_RACIONES);
    setRaciones(String(valido));
    if (valido !== item.raciones) onFijarRaciones(valido);
  }

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2 border-b border-ink/15">
      <a
        href={aHash({ vista: 'receta', id: receta.id })}
        className="basis-full sm:basis-0 sm:flex-1 min-w-0 text-ink text-[14.5px] hover:text-accent truncate"
      >
        {receta.titulo}
      </a>

      {receta.porciones_num != null && (
        <span className="font-mono text-[11px] text-ink-soft shrink-0">para {receta.porciones_num}</span>
      )}

      <span className="flex items-center gap-1 ml-auto sm:ml-0 shrink-0">
        <button onClick={() => onMover(-1)} disabled={esPrimera} title="Subir" aria-label={`Subir ${receta.titulo}`} className={BOTON}>
          <ChevronUp size={16} />
        </button>
        <button onClick={() => onMover(1)} disabled={esUltima} title="Bajar" aria-label={`Bajar ${receta.titulo}`} className={BOTON}>
          <ChevronDown size={16} />
        </button>
      </span>

      <label className="flex items-center gap-1 font-mono text-[11px] text-ink-soft shrink-0">
        <input
          inputMode="numeric"
          value={raciones}
          placeholder={String(comensales)}
          onChange={(e) => setRaciones(e.target.value.replace(/\D/g, '').slice(0, 2))}
          onBlur={guardarRaciones}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
          aria-label={`Raciones de ${receta.titulo}`}
          title="Raciones de esta receta; vacío usa las del menú"
          className="w-10 text-center px-1 py-1 bg-paper-2 border border-ink/30 rounded text-[12px] focus:outline-none focus:border-ink"
        />
        raciones
      </label>

      <select
        value={item.pase}
        onChange={(e) => onCambiarPase(e.target.value as Pase)}
        aria-label={`Pase de ${receta.titulo}`}
        className="font-mono text-[11.5px] bg-paper-2 border border-ink/30 rounded px-1.5 py-1 shrink-0"
      >
        {PASES.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
      </select>

      <button
        onClick={onQuitar}
        title="Quitar del menú"
        aria-label={`Quitar ${receta.titulo} del menú`}
        className="text-ink-soft hover:text-hot transition-colors shrink-0"
      >
        <X size={15} />
      </button>
    </li>
  );
}
