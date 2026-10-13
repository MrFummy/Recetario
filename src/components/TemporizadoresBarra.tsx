import { BellRing, Minus, Plus, X } from 'lucide-react';
import type { Temporizadores } from '../hooks/useTemporizadores';
import { formatearReloj } from '../lib/tiempos';

/** Los temporizadores en marcha, pegados bajo la cabecera del modo cocina. */
export function TemporizadoresBarra({ temporizadores, ajustar, parar }: Pick<Temporizadores, 'temporizadores' | 'ajustar' | 'parar'>) {
  if (temporizadores.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 py-2 border-b border-dashed border-paper/25 shrink-0" role="timer" aria-live="off">
      {temporizadores.map((t) => {
        const terminado = t.restante === 0;
        return (
          <div
            key={t.id}
            className={`flex items-center gap-2 pl-3 pr-1 py-1 border-2 ${terminado ? 'bg-yellow text-ink border-yellow animate-pulse' : 'border-paper/50'}`}
          >
            {terminado && <BellRing size={18} />}
            <span className="font-mono text-xl tabular-nums">{terminado ? '¡Listo!' : formatearReloj(t.restante)}</span>
            <span className="hidden sm:inline text-xs opacity-70 max-w-[10ch] truncate">{t.etiqueta}</span>
            <button onClick={() => ajustar(t.id, -60)} title="Quitar un minuto" className="p-1.5 hover:bg-paper/15"><Minus size={16} /></button>
            <button onClick={() => ajustar(t.id, 60)} title="Añadir un minuto" className="p-1.5 hover:bg-paper/15"><Plus size={16} /></button>
            <button onClick={() => parar(t.id)} title={terminado ? 'Parar la alarma' : 'Cancelar'} className="p-1.5 hover:bg-paper/15"><X size={16} /></button>
          </div>
        );
      })}
    </div>
  );
}
