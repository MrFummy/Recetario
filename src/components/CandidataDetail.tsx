import { useState } from 'react';
import { X, ExternalLink, Edit2, Save, Trash2, Loader2, AlertTriangle, Check, Undo2, Clock, Users, Gauge, BookPlus } from 'lucide-react';
import type { Candidata } from '../types';
import type { CambiosCandidata } from '../hooks/useCandidatas';
import { StepsList } from './RecipeContent';
import { ETIQUETA_FUENTE } from '../lib/fuentes';
import { CATEGORIAS } from '../lib/categorias';
import { hasNotas, normalizeIngredients, renderNotas } from '../lib/recipeContent';
import { errorMessage } from '../lib/errors';
import placeholderImg from '../assets/placeholder.jpg';

interface Props {
  candidata: Candidata;
  onClose: () => void;
  onActualizar: (cambios: CambiosCandidata) => Promise<void>;
  onBorrar: () => Promise<void>;
  onPromover: () => void;
}

/** Ficha de una candidata: se lee, se corrige lo básico, se marca como probada o se borra. */
export function CandidataDetail({ candidata, onClose, onActualizar, onBorrar, onPromover }: Props) {
  const ingredientes = normalizeIngredients(candidata.ingredientes);
  const sinPasos = !candidata.pasos || (Array.isArray(candidata.pasos) && candidata.pasos.length === 0);
  const probada = candidata.estado === 'probada';

  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState(candidata.titulo);
  const [categoria, setCategoria] = useState(candidata.categoria ?? '');
  const [notas, setNotas] = useState(renderNotas(candidata.notas));
  const [ocupada, setOcupada] = useState(false);
  const [fallo, setFallo] = useState<string | null>(null);

  async function ejecutar(accion: () => Promise<void>, mensaje: string) {
    setOcupada(true);
    setFallo(null);
    try {
      await accion();
    } catch (err) {
      setFallo(errorMessage(err, mensaje));
    } finally {
      setOcupada(false);
    }
  }

  const guardar = () => ejecutar(async () => {
    const limpio = titulo.trim();
    if (!limpio) throw new Error('El título no puede quedar vacío.');
    const lineas = notas.split('\n').map((l) => l.trim()).filter(Boolean);
    await onActualizar({ titulo: limpio, categoria: categoria || null, notas: lineas.length ? lineas : null });
    setEditando(false);
  }, 'No se pudieron guardar los cambios.');

  const alternarEstado = () => ejecutar(
    () => onActualizar({ estado: probada ? 'por_probar' : 'probada' }),
    'No se pudo cambiar el estado.',
  );

  const borrar = () => {
    if (!window.confirm('¿Borrar esta candidata? No se puede deshacer.')) return;
    void ejecutar(async () => {
      await onBorrar();
      onClose();
    }, 'No se pudo borrar la candidata.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-paper w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border-2 border-ink animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 sm:px-8 py-3 border-b border-dashed border-ink/25 bg-paper-2 shrink-0">
          <div className="font-mono text-[11px] text-ink-soft">~/laboratorio/{ETIQUETA_FUENTE[candidata.fuente_tipo].toLowerCase()}</div>
          <div className="flex items-center gap-1.5">
            {!editando && (
              <>
                <button onClick={borrar} disabled={ocupada} title="Borrar"
                  className="p-1.5 rounded-md text-ink-soft hover:text-hot hover:bg-hot-soft transition-colors disabled:opacity-50">
                  <Trash2 size={18} />
                </button>
                <button onClick={() => setEditando(true)} title="Editar"
                  className="p-1.5 rounded-md text-ink-soft hover:text-accent hover:bg-accent-soft transition-colors">
                  <Edit2 size={18} />
                </button>
              </>
            )}
            {editando && (
              <button onClick={guardar} disabled={ocupada}
                className="flex items-center gap-1.5 bg-yellow text-ink px-3 py-1.5 text-[13px] font-semibold border-[1.5px] border-ink shadow-brut disabled:opacity-60">
                {ocupada ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} guardar
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-md text-ink-soft hover:text-hot transition-colors"><X size={18} /></button>
          </div>
        </div>

        {fallo && (
          <div className="shrink-0 flex items-start gap-2.5 px-5 sm:px-8 py-2.5 bg-hot-soft border-b-2 border-hot text-hot font-mono text-[12px]">
            <AlertTriangle size={15} className="shrink-0 mt-px" />
            <span className="flex-1">{fallo}</span>
          </div>
        )}

        <div className="overflow-y-auto px-6 sm:px-10 pt-8 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 mb-8">
            <div className="bg-white p-2.5 pb-3.5 shadow-md self-start">
              <img src={candidata.foto_url || placeholderImg} alt={candidata.titulo} className="w-full aspect-[4/3] object-cover bg-ink/10" />
            </div>
            <div>
              {editando ? (
                <div className="space-y-3">
                  <input value={titulo} onChange={(e) => setTitulo(e.target.value)} aria-label="Título"
                    className="w-full font-display font-black text-3xl bg-white border-2 border-ink px-3 py-1.5" />
                  <select value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Categoría"
                    className="bg-white border-2 border-ink px-3 py-1.5 font-mono text-sm">
                    <option value="">sin categoría</option>
                    {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              ) : (
                <>
                  {candidata.categoria && (
                    <div className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-widest uppercase text-accent bg-accent-soft px-2.5 py-1 mb-3">
                      <span className="opacity-60">#</span>{candidata.categoria}
                    </div>
                  )}
                  <h2 className="font-display font-black text-3xl sm:text-4xl leading-[1] tracking-tight text-ink mb-3">{candidata.titulo}</h2>
                </>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-3">
                {candidata.tiempo && <span className="flex items-center gap-1 font-mono text-[11px] text-ink-soft border border-ink/25 px-2 py-1"><Clock size={12} /> {candidata.tiempo}</span>}
                {candidata.porciones && <span className="flex items-center gap-1 font-mono text-[11px] text-ink-soft border border-ink/25 px-2 py-1"><Users size={12} /> {candidata.porciones}</span>}
                {candidata.dificultad && <span className="flex items-center gap-1 font-mono text-[11px] text-ink-soft border border-ink/25 px-2 py-1"><Gauge size={12} /> {candidata.dificultad}</span>}
              </div>

              {candidata.fuente_url && (
                <a href={candidata.fuente_url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 font-mono text-[12px] text-accent hover:underline break-all">
                  Ver la fuente <ExternalLink size={12} />
                </a>
              )}

              <div className="mt-4 space-y-2">
                {candidata.de_video && (
                  <p className="border-2 border-dashed border-ink/30 bg-yellow/25 px-3 py-2 font-mono text-[11px] leading-snug text-ink">
                    Sacada de un vídeo: revisa las cantidades al cocinarla.
                  </p>
                )}
                {sinPasos && (
                  <p className="border-2 border-dashed border-ink/30 bg-yellow/25 px-3 py-2 font-mono text-[11px] leading-snug text-ink">
                    Sin pasos: la fuente solo traía el pie. Complétala al probarla.
                  </p>
                )}
              </div>

              {!editando && (
                <button onClick={onPromover} disabled={ocupada}
                  className="mt-5 mr-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold border-[1.5px] border-ink bg-ink text-paper disabled:opacity-60">
                  <BookPlus size={14} /> Pasar al recetario
                </button>
              )}
              {!editando && (
                <button onClick={alternarEstado} disabled={ocupada}
                  className={`mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold border-[1.5px] border-ink transition-all disabled:opacity-60 ${probada ? 'bg-paper text-ink' : 'bg-yellow text-ink shadow-brut'}`}>
                  {probada ? <><Undo2 size={14} /> Volver a «por probar»</> : <><Check size={14} /> Marcar como probada</>}
                </button>
              )}
            </div>
          </div>

          <h3 className="font-display font-black text-xl mb-2">Ingredientes</h3>
          {ingredientes.length === 0 ? (
            <p className="text-ink-soft italic font-mono text-sm">sin ingredientes</p>
          ) : (
            <ul className="list-none p-0 m-0 mb-8 max-w-xl">
              {ingredientes.map((i, idx) => i.esGrupo ? (
                <li key={i.id ?? `g-${idx}`} className="pt-4 pb-1 font-mono text-[11px] uppercase tracking-wider text-accent">{i.name}</li>
              ) : (
                <li key={i.id ?? idx} className="grid grid-cols-[150px_1fr] sm:grid-cols-[220px_1fr] gap-3 py-1.5 text-[14.5px] leading-snug border-b border-dashed border-ink/15 last:border-0">
                  <span className="font-mono text-ink-soft">{i.qty || '—'}</span>
                  <span>{i.name}</span>
                </li>
              ))}
            </ul>
          )}

          <h3 className="font-display font-black text-xl mb-2">Preparación</h3>
          <StepsList data={candidata.pasos} />

          {(hasNotas(candidata.notas) || editando) && (
            <>
              <h3 className="font-display font-black text-xl mt-8 mb-2">Notas</h3>
              {editando ? (
                <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={4} aria-label="Notas"
                  className="w-full bg-white border-2 border-ink px-3 py-2 text-[14.5px]" placeholder="Una nota por línea" />
              ) : (
                <p className="whitespace-pre-line text-[14.5px] leading-relaxed">{renderNotas(candidata.notas)}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
