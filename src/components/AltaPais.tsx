import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import type { Paises } from '../hooks/usePaises';
import { errorMessage } from '../lib/errors';
import { irA } from '../hooks/useRuta';
import { PaisSelect } from './PaisEtiqueta';

/**
 * El alta de un país en el pasaporte (solo admin; la RLS es quien lo exige). Se da de
 * alta solo con el nombre y, si se quiere, la fecha; el contexto y las fotos se añaden
 * después en la página del país, adonde lleva este formulario al terminar.
 */
export function AltaPais({ api }: { api: Paises }) {
  const [codigo, setCodigo] = useState('');
  const [fecha, setFecha] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crear = async () => {
    if (!codigo) return;
    setGuardando(true);
    setError(null);
    try {
      // Solo se escribe la fecha si hay una: si el país ya existía, no se le borra nada.
      await api.guardar(codigo, fecha.trim() ? { fecha_viaje: fecha.trim() } : {});
      irA({ vista: 'pais', codigo });
    } catch (err) {
      setError(errorMessage(err, 'No se pudo añadir el país.'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <details className="max-w-xl mx-auto mb-8 border-[1.5px] border-dashed border-ink/40 bg-paper-2 open:border-ink">
      <summary className="flex items-center gap-2 px-4 py-2.5 cursor-pointer font-mono text-[12px] text-ink-soft select-none">
        <Plus size={14} /> Añadir país
      </summary>
      <div className="px-4 pb-4 flex flex-wrap items-end gap-3">
        <PaisSelect valor={codigo} onChange={setCodigo} textoVacio="Elige un país…" />
        <label className="flex items-center gap-2 mb-4 font-mono text-[11px] text-ink-soft">
          Cuándo
          <input value={fecha} onChange={(e) => setFecha(e.target.value)} placeholder="abril de 2024"
            className="border border-ink/30 bg-paper text-ink px-2 py-1 text-[12px] focus:outline-none focus:border-ink" />
        </label>
        <button onClick={() => void crear()} disabled={!codigo || guardando}
          className="mb-4 flex items-center gap-1.5 bg-yellow text-ink px-3 py-1.5 text-[13px] font-semibold border-[1.5px] border-ink shadow-brut disabled:opacity-50">
          {guardando && <Loader2 className="animate-spin" size={14} />} Añadir
        </button>
        {error && <p role="alert" className="basis-full -mt-2 font-mono text-[12px] text-hot">{error}</p>}
      </div>
    </details>
  );
}
