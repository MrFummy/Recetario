import { useState } from 'react';
import { X, Loader2, Check, AlertTriangle, ImagePlus } from 'lucide-react';
import type { Candidata } from '../types';
import type { OpcionesPromocion } from '../lib/promover';
import { CATEGORIAS } from '../lib/categorias';
import { aHash } from '../lib/rutas';
import { errorMessage } from '../lib/errors';

interface Props {
  candidata: Candidata;
  onCerrar: () => void;
  /** Devuelve el id de la receta creada, o `null` si no apareció a tiempo. */
  onPromover: (opciones: OpcionesPromocion) => Promise<string | null>;
}

type Fase = 'formulario' | 'enviando' | 'hecho' | 'tarde';

/**
 * Pasa una candidata al recetario: elige categoría, fecha y la foto de TU plato.
 *
 * Crear la receta tarda: n8n genera el PDF y la sincroniza con Notion, Drive,
 * Sheets y Supabase. Por eso se espera a que aparezca antes de dar nada por hecho, y
 * la candidata solo se borra cuando la receta ya existe.
 */
export function PromoverModal({ candidata, onCerrar, onPromover }: Props) {
  const [categoria, setCategoria] = useState(candidata.categoria ?? '');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [foto, setFoto] = useState<File | null>(null);
  const [fase, setFase] = useState<Fase>('formulario');
  const [recetaId, setRecetaId] = useState<string | null>(null);
  const [fallo, setFallo] = useState<string | null>(null);

  async function enviar() {
    if (!categoria) {
      setFallo('Elige una categoría.');
      return;
    }
    setFallo(null);
    setFase('enviando');
    try {
      const id = await onPromover({ categoria, fecha, foto });
      setRecetaId(id);
      setFase(id ? 'hecho' : 'tarde');
    } catch (err) {
      setFallo(errorMessage(err, 'No se pudo pasar la receta al recetario.'));
      setFase('formulario');
    }
  }

  const bloqueado = fase === 'enviando';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
      onClick={bloqueado ? undefined : onCerrar}>
      <div className="bg-paper w-full max-w-md border-2 border-ink shadow-brut p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="font-display font-black text-2xl leading-tight">Pasar al recetario</h2>
          {!bloqueado && <button onClick={onCerrar} aria-label="Cerrar" className="text-ink-soft hover:text-hot"><X size={18} /></button>}
        </div>

        {fase === 'hecho' && recetaId ? (
          <div className="space-y-4">
            <p className="flex items-start gap-2 text-[15px]"><Check size={18} className="shrink-0 mt-0.5 text-accent" /> «{candidata.titulo}» ya está en el recetario.</p>
            <div className="flex gap-3">
              <a href={aHash({ vista: 'receta', id: recetaId })} onClick={onCerrar}
                className="px-4 py-2 bg-yellow border-[1.5px] border-ink font-semibold text-[13px] shadow-brut">Ver la receta</a>
              <button onClick={onCerrar} className="px-4 py-2 border-[1.5px] border-ink font-semibold text-[13px]">Cerrar</button>
            </div>
          </div>
        ) : fase === 'tarde' ? (
          <div className="space-y-4">
            <p className="flex items-start gap-2 text-[15px]"><AlertTriangle size={18} className="shrink-0 mt-0.5 text-hot" />
              La receta no ha aparecido todavía. Puede que n8n siga trabajando o que algo haya fallado.
              <strong> La candidata sigue aquí, sin borrar.</strong> Mira el catálogo en un par de minutos y,
              si no está, revisa la ejecución en n8n.</p>
            <button onClick={onCerrar} className="px-4 py-2 border-[1.5px] border-ink font-semibold text-[13px]">Cerrar</button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[14px] text-ink-soft leading-snug">
              Crea la receta con su PDF y la sincroniza con Notion, Drive y Sheets. Tarda cerca de un minuto.
              Sube <strong>la foto de tu plato</strong>: la de ejemplo de la candidata no se usa.
            </p>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-ink-soft">Categoría
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} disabled={bloqueado}
                className="mt-1 w-full bg-white border-2 border-ink px-3 py-1.5 text-[14px] normal-case tracking-normal text-ink">
                <option value="">elige una…</option>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-ink-soft">Fecha en que la cocinaste
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} disabled={bloqueado}
                className="mt-1 w-full bg-white border-2 border-ink px-3 py-1.5 text-[14px] text-ink" />
            </label>
            <label className="flex items-center gap-2 border-2 border-dashed border-ink/40 px-3 py-2.5 cursor-pointer text-[13px] text-ink-soft hover:bg-ink/5">
              <ImagePlus size={16} /> {foto ? foto.name : 'Añadir la foto de tu plato (opcional)'}
              <input type="file" accept="image/*" className="hidden" disabled={bloqueado}
                onChange={(e) => setFoto(e.target.files?.[0] ?? null)} />
            </label>
            {fallo && <p className="flex items-start gap-2 text-hot font-mono text-[12px]"><AlertTriangle size={14} className="shrink-0 mt-0.5" /> {fallo}</p>}
            <button onClick={() => void enviar()} disabled={bloqueado}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow border-[1.5px] border-ink font-semibold shadow-brut disabled:opacity-70">
              {bloqueado ? <><Loader2 size={16} className="animate-spin" /> Creando la receta…</> : 'Pasar al recetario'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
