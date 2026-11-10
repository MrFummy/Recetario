import { useState } from 'react';
import { X, ExternalLink, Edit2, Save, Trash2, Loader2, AlertTriangle, Check, Undo2, Clock, Users, Gauge, BookPlus } from 'lucide-react';
import type { Candidata } from '../types';
import type { CambiosCandidata } from '../hooks/useCandidatas';
import { StepsList } from './RecipeContent';
import { ETIQUETA_FUENTE } from '../lib/fuentes';
import { CATEGORIAS } from '../lib/categorias';
import { hasNotas, normalizeIngredients, renderNotas } from '../lib/recipeContent';
import { errorMessage } from '../lib/errors';
import { claveCategoria } from '../lib/colorCategoria';
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
        data-k={claveCategoria(candidata.categoria)}
        className="bg-paper w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border-[1.5px] border-ink rounded-[3px] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 sm:px-8 py-3 border-b-[1.5px] border-ink bg-paper-2 shrink-0">
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">Laboratorio / {ETIQUETA_FUENTE[candidata.fuente_tipo]}</div>
          <div className="flex items-center gap-1.5">
            {!editando && (
              <>
                <button onClick={borrar} disabled={ocupada} title="Borrar"
                  className="p-1.5 rounded-full text-ink-soft hover:text-hot hover:bg-hot-soft transition-colors disabled:opacity-50">
                  <Trash2 size={18} />
                </button>
                <button onClick={() => setEditando(true)} title="Editar"
                  className="p-1.5 rounded-full text-ink-soft hover:text-accent hover:bg-accent-soft transition-colors">
                  <Edit2 size={18} />
                </button>
              </>
            )}
            {editando && (
              <button onClick={guardar} disabled={ocupada}
                className="boton-sello !py-1.5">
                {ocupada ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} guardar
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-full text-ink-soft hover:text-hot transition-colors"><X size={18} /></button>
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
            <div className="arco aspect-[4/5] self-start border-[1.5px] border-ink bg-rule/60 shadow-[6px_6px_0_var(--k)]">
              <img src={candidata.foto_url || placeholderImg} alt={candidata.titulo} className="h-full w-full object-cover" />
            </div>
            <div>
              {editando ? (
                <div className="space-y-3">
                  <input value={titulo} onChange={(e) => setTitulo(e.target.value)} aria-label="Título"
                    className="campo-sello !mt-0 font-display text-3xl font-medium" />
                  <select value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Categoría"
                    className="campo-sello !mt-0 !w-auto font-mono !text-sm">
                    <option value="">sin categoría</option>
                    {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              ) : (
                <>
                  <div className="kicker mb-3">Muestra del laboratorio</div>
                  {candidata.categoria && <span className="etiqueta mb-4">{candidata.categoria}</span>}
                  <h2 className="font-display font-light text-4xl sm:text-5xl leading-[0.97] tracking-[-0.035em] text-ink mb-3">{candidata.titulo}</h2>
                </>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-3">
                {candidata.tiempo && <span className="etiqueta etiqueta-neutra !normal-case !font-mono !font-medium"><Clock size={12} /> {candidata.tiempo}</span>}
                {candidata.porciones && <span className="etiqueta etiqueta-neutra !normal-case !font-mono !font-medium"><Users size={12} /> {candidata.porciones}</span>}
                {candidata.dificultad && <span className="etiqueta etiqueta-neutra !normal-case !font-mono !font-medium"><Gauge size={12} /> {candidata.dificultad}</span>}
              </div>

              {candidata.fuente_url && (
                <a href={candidata.fuente_url} target="_blank" rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 break-all font-mono text-[12px] text-accent underline decoration-dotted underline-offset-4 hover:decoration-solid">
                  Ver la fuente <ExternalLink size={12} />
                </a>
              )}

              <div className="mt-4 space-y-2">
                {candidata.de_video && (
                  <p className="rounded-[3px] border-[1.5px] border-ink bg-yellow-soft px-3 py-2 font-mono text-[11px] leading-snug text-ink">
                    Sacada de un vídeo: revisa las cantidades al cocinarla.
                  </p>
                )}
                {sinPasos && (
                  <p className="rounded-[3px] border-[1.5px] border-ink bg-yellow-soft px-3 py-2 font-mono text-[11px] leading-snug text-ink">
                    Sin pasos: la fuente solo traía el pie. Complétala al probarla.
                  </p>
                )}
              </div>

              {!editando && (
                <button onClick={onPromover} disabled={ocupada}
                  className="boton-sello mr-3 mt-5 !bg-ink !text-paper">
                  <BookPlus size={14} /> Pasar al recetario
                </button>
              )}
              {!editando && (
                <button onClick={alternarEstado} disabled={ocupada}
                  className={`boton-sello mt-5 ${probada ? 'boton-sello-claro' : ''}`}>
                  {probada ? <><Undo2 size={14} /> Volver a «por probar»</> : <><Check size={14} /> Marcar como probada</>}
                </button>
              )}
            </div>
          </div>

          <h3 className="seccion-titulo mb-4 !text-2xl">Ingredientes</h3>
          {ingredientes.length === 0 ? (
            <p className="text-ink-soft italic font-mono text-sm">sin ingredientes</p>
          ) : (
            <ul className="list-none p-0 m-0 mb-8 max-w-xl">
              {ingredientes.map((i, idx) => i.esGrupo ? (
                <li key={i.id ?? `g-${idx}`} className="kicker pb-1 pt-5">{i.name}</li>
              ) : (
                <li key={i.id ?? idx} className="grid grid-cols-[150px_1fr] sm:grid-cols-[220px_1fr] gap-3 py-1.5 text-[14.5px] leading-snug border-b border-rule last:border-0">
                  <span className={`w-fit rounded-full px-2.5 py-0.5 font-sello text-[11px] font-extrabold uppercase ${i.qty ? 'bg-cobalt text-paper' : 'bg-rule text-ink-soft'}`}>{i.qty || '—'}</span>
                  <span>{i.name}</span>
                </li>
              ))}
            </ul>
          )}

          <h3 className="seccion-titulo mb-4 !text-2xl">Preparación</h3>
          <StepsList data={candidata.pasos} />

          {(hasNotas(candidata.notas) || editando) && (
            <>
              <h3 className="seccion-titulo mb-4 mt-8 !text-2xl">Notas</h3>
              {editando ? (
                <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={4} aria-label="Notas"
                  className="campo-sello !mt-0 text-[14.5px]" placeholder="Una nota por línea" />
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
