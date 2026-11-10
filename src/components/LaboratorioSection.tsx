import { useMemo, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { Candidata, EstadoCandidata } from '../types';
import { useCandidatas } from '../hooks/useCandidatas';
import { CATEGORIAS } from '../lib/categorias';
import { CandidataCard } from './CandidataCard';
import { CandidataDetail } from './CandidataDetail';
import { PromoverModal } from './PromoverModal';

type FiltroEstado = 'todas' | EstadoCandidata;

const FILTROS: { valor: FiltroEstado; etiqueta: string }[] = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'por_probar', etiqueta: 'Por probar' },
  { valor: 'probada', etiqueta: 'Probadas' },
];

/**
 * El Laboratorio: las recetas que se quieren probar antes de decidir si entran
 * al recetario. Llegan por el bot de Telegram (n8n las convierte con Gemini y las
 * guarda en `candidatas`); aquí se ven, se corrigen, se marcan como probadas o se
 * borran. Pasarlas al recetario queda para una segunda fase.
 */
export function SeccionLaboratorio({ onRecetaCreada }: { onRecetaCreada: () => void }) {
  const { candidatas, loading, error, actualizar, borrar, promover } = useCandidatas();
  const [estado, setEstado] = useState<FiltroEstado>('todas');
  const [categoria, setCategoria] = useState('');
  const [abiertaId, setAbiertaId] = useState<string | null>(null);
  // Guardamos la candidata entera y no su id: al crearse la receta desaparece de la
  // lista, y el aviso de «ya está en el recetario» tiene que seguir en pantalla.
  const [promoviendo, setPromoviendo] = useState<Candidata | null>(null);

  const visibles = useMemo(
    () => candidatas.filter((c) =>
      (estado === 'todas' || c.estado === estado) && (!categoria || c.categoria === categoria)),
    [candidatas, estado, categoria],
  );
  const abierta = candidatas.find((c) => c.id === abiertaId) ?? null;
  // El número de muestra sale de la antigüedad (la más antigua es la 1) y no del puesto en pantalla.
  const numeros = useMemo(() => {
    const porAntiguedad = [...candidatas].sort((a, b) => a.created_at.localeCompare(b.created_at));
    return new Map(porAntiguedad.map((c, i) => [c.id, i + 1]));
  }, [candidatas]);
  const cuenta = (e: FiltroEstado) => (e === 'todas' ? candidatas.length : candidatas.filter((c) => c.estado === e).length);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <div className="kicker mb-4">{candidatas.length} candidatas</div>
        <h2 className="mb-3 font-display text-4xl font-light leading-[0.98] tracking-[-0.035em] text-ink sm:text-6xl">
          El <span className="hl-mark">Laboratorio</span>
        </h2>
        <p className="text-base leading-relaxed text-ink-soft">
          Recetas que quieres probar antes de meterlas al recetario. Mándale un enlace
          (YouTube, reel, web) o el texto de la receta al bot de Telegram y aparecen aquí.
        </p>
      </header>

      {error && (
        <div className="flex items-start gap-2 bg-hot-soft border-[1.5px] border-hot text-hot p-4 mb-6 font-mono text-sm">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-8">
        {FILTROS.map((f) => {
          const activo = estado === f.valor;
          return (
            <button key={f.valor} onClick={() => setEstado(f.valor)} aria-pressed={activo}
              className={`whitespace-nowrap rounded-full border-[1.5px] border-ink px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200 ${activo ? '-translate-x-px -translate-y-px bg-ink text-paper shadow-[2px_2px_0_var(--color-accent)]' : 'bg-transparent text-ink hover:bg-ink/5'}`}>
              {f.etiqueta} <span className="font-mono text-[11px] opacity-70">{cuenta(f.valor)}</span>
            </button>
          );
        })}
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Filtrar por categoría"
          className="campo-sello ml-auto !mt-0 !w-auto rounded-full !px-4 !py-1.5 text-[13px] font-semibold">
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-24 text-ink-soft font-mono text-sm">
          <Loader2 size={18} className="animate-spin" /> Cargando el laboratorio…
        </div>
      ) : visibles.length === 0 ? (
        <div className="py-16 text-center">
          <div className="sello mx-auto mb-6 h-28 w-28 px-3 text-[13px]" data-k="otro">sin muestras todavía</div>
          <p className="mb-2 font-display text-3xl font-medium tracking-tight text-ink">
            {candidatas.length === 0 ? 'Aquí todavía no hay nada.' : 'Ninguna candidata con ese filtro.'}
          </p>
          <p className="font-mono text-sm text-ink-soft">
            {candidatas.length === 0
              ? 'Mándale el enlace de una receta al bot de Telegram.'
              : 'Prueba a quitar el filtro de estado o de categoría.'}
          </p>
        </div>
      ) : (
        <div className="mosaico">
          {visibles.map((c) => (
            <CandidataCard key={c.id} candidata={c} numero={numeros.get(c.id) ?? 0} onClick={() => setAbiertaId(c.id)} />
          ))}
        </div>
      )}

      {abierta && (
        <CandidataDetail
          candidata={abierta}
          onClose={() => setAbiertaId(null)}
          onActualizar={(cambios) => actualizar(abierta.id, cambios)}
          onBorrar={() => borrar(abierta)}
          onPromover={() => setPromoviendo(abierta)}
        />
      )}

      {promoviendo && (
        <PromoverModal
          candidata={promoviendo}
          onCerrar={() => setPromoviendo(null)}
          onPromover={async (opciones) => {
            const id = await promover(promoviendo, opciones);
            if (id) onRecetaCreada();
            return id;
          }}
        />
      )}
    </div>
  );
}
