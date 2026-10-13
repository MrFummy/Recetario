import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { reindexarBusqueda } from '../lib/busquedaSemantica';
import { errorMessage } from '../lib/errors';

/** Solo para admin: recalcula los vectores de las recetas nuevas o editadas. */
export function ReindexarBusqueda() {
  const [trabajando, setTrabajando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [esError, setEsError] = useState(false);

  const lanzar = async () => {
    setTrabajando(true);
    setMensaje(null);
    try {
      const r = await reindexarBusqueda();
      setEsError(false);
      setMensaje(
        r.indexadas === 0
          ? `Todo al día: las ${r.total} recetas ya estaban indexadas.`
          : `${r.indexadas} indexadas de ${r.total}.`,
      );
    } catch (e) {
      setEsError(true);
      setMensaje(errorMessage(e, 'No se pudo reindexar.'));
    } finally {
      setTrabajando(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-6 font-mono text-[11px] text-ink-soft">
      <button
        onClick={() => void lanzar()}
        disabled={trabajando}
        className="flex items-center gap-1.5 border border-dashed border-ink/40 px-3 py-1.5 hover:border-accent hover:text-accent transition-colors disabled:opacity-60"
      >
        {trabajando ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
        {trabajando ? 'indexando…' : 'reindexar búsqueda'}
      </button>
      {mensaje && <span className={esError ? 'text-hot' : ''}>{mensaje}</span>}
    </div>
  );
}
