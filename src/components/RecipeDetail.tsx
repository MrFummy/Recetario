import { useState, useRef, useEffect } from 'react';
import { X, ExternalLink, Edit2, Save, Upload, Trash2, Mail, Send, Loader2 } from 'lucide-react';
import type { Recipe } from '../types';
import { StarRating } from './StarRating';
import { supabase } from '../lib/supabase';
import placeholderImg from '../assets/placeholder.jpg';

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
  isAdmin?: boolean;
  user?: any;
  onUpdateNotes?: (notas: string) => void;
  onUpdatePhoto?: (file: File) => void;
  onUpdateRating?: (rating: number) => void;
  onDelete?: (recipe: Recipe) => void;
  onShareByEmail?: (recipe: Recipe, email: string) => Promise<void>;
}

// ── Lista de ingredientes con checkboxes locales (no persiste) ──
function IngredientsList({ data }: { data: any }) {
  const items = normalizeIngredients(data);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  if (items.length === 0) {
    return <p className="text-ink-soft italic font-mono text-sm">sin ingredientes</p>;
  }

  return (
    <ul className="list-none p-0 m-0">
      {items.map((item, idx) => {
        const done = !!checked[idx];
        return (
          <li
            key={idx}
            className={`grid grid-cols-[20px_auto_1fr] gap-2.5 py-2 text-[14.5px] leading-snug items-baseline border-b border-dashed border-ink/15 last:border-0 cursor-pointer select-none ${done ? 'opacity-40' : ''}`}
            onClick={() => setChecked((c) => ({ ...c, [idx]: !c[idx] }))}
          >
            <span
              className={`relative w-4 h-4 border-[1.6px] border-ink rounded-[3px] self-center transition-colors ${done ? 'bg-ink' : 'bg-white'}`}
              aria-hidden
            >
              {done && (
                <span className="absolute -top-1 left-px font-script text-[22px] leading-none text-hot">✓</span>
              )}
            </span>
            <span className={`font-mono text-[12.5px] font-medium text-accent whitespace-nowrap ${done ? 'line-through decoration-hot decoration-[1.5px]' : ''}`}>
              {item.qty || '—'}
            </span>
            <span className={`text-ink ${done ? 'line-through decoration-hot decoration-[1.5px]' : ''}`}>
              {item.name}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ── Lista de pasos numerados (números circulados) ──
function StepsList({ data }: { data: any }) {
  const steps = normalizeSteps(data);
  if (steps.length === 0) {
    return <p className="text-ink-soft italic font-mono text-sm">sin pasos</p>;
  }
  return (
    <ol className="list-none p-0 m-0">
      {steps.map((text, idx) => (
        <li
          key={idx}
          className="grid grid-cols-[56px_1fr] gap-[18px] py-4 items-start border-b border-dashed border-ink/15 last:border-0"
        >
          <div className="relative w-12 h-12 grid place-items-center font-display font-black text-[28px] text-ink leading-none">
            <span className="absolute inset-0 border-[2.2px] border-ink rounded-full -rotate-[4deg] scale-x-[1.05] scale-y-[0.92]" />
            <span className="absolute inset-[3px] border border-ink/40 rounded-full rotate-[6deg] scale-x-100 scale-y-[0.96]" />
            <span className="relative">{idx + 1}</span>
          </div>
          <div className="pt-2.5 text-[15px] leading-relaxed text-ink">{text}</div>
        </li>
      ))}
    </ol>
  );
}

// ── Normalizadores para JSONB ──
function normalizeIngredients(data: any): { qty: string; name: string }[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map((it) => {
      if (typeof it === 'string') return { qty: '', name: it };
      return { qty: it.cantidad || '', name: it.nombre || String(it) };
    });
  }
  if (typeof data === 'object') {
    return Object.values(data).flatMap((v) => normalizeIngredients(v));
  }
  return [{ qty: '', name: String(data) }];
}

function normalizeSteps(data: any): string[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map((it) => (typeof it === 'string' ? it : it.texto || it.paso || String(it)));
  }
  if (typeof data === 'object') {
    return Object.values(data).flatMap((v) => normalizeSteps(v));
  }
  return [String(data)];
}

function hasNotas(notas: any): boolean {
  if (notas == null) return false;
  if (typeof notas === 'string') return notas.trim().length > 0;
  if (Array.isArray(notas)) return notas.length > 0;
  if (typeof notas === 'object') return Object.keys(notas).length > 0;
  return true;
}

function renderNotas(notas: any) {
  if (typeof notas === 'string') return notas;
  if (Array.isArray(notas)) return notas.join(' ');
  if (typeof notas === 'object') return Object.values(notas).join(' ');
  return String(notas);
}

export function RecipeDetail({ recipe, onClose, isAdmin, user, onUpdateNotes, onUpdatePhoto, onUpdateRating, onDelete, onShareByEmail }: RecipeDetailProps) {
  const isAfan = !!user;
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(
    typeof recipe.notas === 'string' ? recipe.notas : JSON.stringify(recipe.notas || '')
  );
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [personalRating, setPersonalRating] = useState<number | null>(null);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageUrl = previewUrl || recipe.foto_url || placeholderImg;
  const showNotas = hasNotas(recipe.notas) || isEditing;

  useEffect(() => {
    if (user) {
      supabase.from('valoraciones').select('puntuacion').eq('receta_id', recipe.id).eq('user_id', user.id).single()
        .then(({ data }) => { if (data) setPersonalRating(data.puntuacion); });
    }
  }, [user, recipe.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onUpdateNotes && editedNotes !== recipe.notas) await onUpdateNotes(editedNotes);
      if (onUpdatePhoto && newPhoto) await onUpdatePhoto(newPhoto);
      setIsEditing(false);
    } catch (e) {
      console.error('Error saving:', e); alert('Error al guardar los cambios');
    } finally { setIsSaving(false); }
  };

  const handleDelete = () => {
    if (window.confirm('¿Seguro que querés borrar esta receta en TODAS las plataformas (Supabase, Notion, Drive)? Esta acción no se puede deshacer.')) {
      if (onDelete) { onDelete(recipe); onClose(); }
    }
  };

  const handleSendEmail = async () => {
    if (!targetEmail || !onShareByEmail) return;
    setIsSendingEmail(true);
    try {
      await onShareByEmail(recipe, targetEmail);
      setEmailSuccess(true);
      setTimeout(() => { setShowEmailInput(false); setEmailSuccess(false); setTargetEmail(''); }, 3000);
    } catch { alert('Error al enviar el email. Comprueba que el flujo de n8n está activo.'); }
    finally { setIsSendingEmail(false); }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setNewPhoto(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-paper w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border-2 border-ink animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Toolbar ──────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-3 border-b border-dashed border-ink/25 bg-paper-2 shrink-0">
          <div className="font-mono text-[11px] text-ink-soft truncate max-w-[60%]">
            ~/recetas/{recipe.categoria.toLowerCase().replace(/[/ ]+/g, '-')}/{recipe.titulo.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.md
          </div>
          <div className="flex items-center gap-1.5">
            {isAdmin && !isEditing && (
              <>
                <button onClick={handleDelete} title="Eliminar"
                  className="p-1.5 rounded-md text-ink-soft hover:text-hot hover:bg-hot-soft transition-colors">
                  <Trash2 size={18} />
                </button>
                <button onClick={() => setIsEditing(true)} title="Editar"
                  className="p-1.5 rounded-md text-ink-soft hover:text-accent hover:bg-accent-soft transition-colors">
                  <Edit2 size={18} />
                </button>
              </>
            )}
            {isEditing && (
              <button onClick={handleSave} disabled={isSaving}
                className="flex items-center gap-1.5 bg-yellow text-ink px-3 py-1.5 text-[13px] font-semibold border-[1.5px] border-ink shadow-brut hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brut-lg transition-all disabled:opacity-60">
                <Save size={14} /> {isSaving ? 'guardando…' : 'guardar'}
              </button>
            )}
            {recipe.pdf_url && (isAfan || isAdmin) && !isEditing && (
              <a href={recipe.pdf_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 bg-paper text-ink px-3 py-1.5 text-[13px] font-semibold border-[1.5px] border-ink hover:shadow-brut hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
                Ver PDF <ExternalLink size={13} />
              </a>
            )}
            {!isEditing && (isAfan || isAdmin) && (
              <div className="relative">
                <button onClick={() => setShowEmailInput(!showEmailInput)} title="Enviar por email"
                  className="p-1.5 rounded-md text-ink-soft hover:text-accent hover:bg-accent-soft transition-colors">
                  <Mail size={18} />
                </button>
                {showEmailInput && (
                  <div className="absolute right-0 top-full mt-2 bg-paper-2 p-3 border-2 border-ink shadow-brut-lg w-72 z-10 animate-in fade-in slide-in-from-top-2">
                    {emailSuccess ? (
                      <div className="text-accent text-sm font-mono text-center py-2">✓ enviada con éxito</div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <label className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">enviar a:</label>
                        <div className="flex gap-2">
                          <input type="email" value={targetEmail} onChange={(e) => setTargetEmail(e.target.value)}
                            placeholder="amigo@email.com"
                            className="w-full text-sm px-2.5 py-1.5 border border-ink bg-paper focus:outline-none focus:border-accent" />
                          <button onClick={handleSendEmail} disabled={isSendingEmail || !targetEmail}
                            className="bg-accent text-paper p-2 hover:opacity-90 disabled:opacity-50">
                            {isSendingEmail ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <button onClick={onClose} className="p-1.5 rounded-md text-ink-soft hover:text-hot transition-colors"><X size={18} /></button>
          </div>
        </div>

        {/* ── Body (scrollable) ────────────────────────────── */}
        <div className="overflow-y-auto px-6 sm:px-12 pt-10 pb-12">

          {/* Hero: polaroid + título */}
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-10 mb-10">
            <div className="relative mt-2 mx-auto md:mx-0 max-w-[300px] w-full">
              <span className="absolute -top-3 left-7 w-24 h-5 rotate-[-7deg] shadow-sm" style={{ background: 'var(--color-tape)' }} />
              <span className="absolute -top-2 right-6 w-24 h-5 rotate-[9deg] shadow-sm" style={{ background: 'var(--color-tape-blue)' }} />
              <div className="bg-white p-3 pb-10 shadow-xl -rotate-2 relative">
                <div className="w-full aspect-[4/5] bg-ink/10 overflow-hidden">
                  <img src={imageUrl} alt={recipe.titulo} className="w-full h-full object-cover" />
                </div>
                {recipe.fecha_clase && (
                  <div className="absolute bottom-3 left-0 right-0 text-center font-script text-[20px] text-ink">
                    {new Date(recipe.fecha_clase).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
                {isEditing && (
                  <button onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-3 bottom-10 bg-ink/70 text-paper flex items-center justify-center gap-2 font-mono text-xs hover:bg-ink/85 transition-colors">
                    <Upload size={16} /> cambiar foto
                  </button>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
              </div>
            </div>

            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-widest uppercase text-accent bg-accent-soft px-2.5 py-1 mb-4">
                <span className="opacity-60">#</span>{recipe.categoria}
              </div>
              <h2 className="font-display font-black text-4xl sm:text-5xl leading-[0.98] tracking-tight text-ink mb-4">
                {recipe.titulo}
              </h2>
              <div className="flex items-center gap-3 mb-1">
                <StarRating
                  rating={personalRating || recipe.rating || 0}
                  onRate={(r) => { if (onUpdateRating) onUpdateRating(r); setPersonalRating(r); }}
                  readonly={!isAfan}
                  size={20}
                />
                <span className="font-mono text-[11px] text-ink-soft">
                  {personalRating
                    ? `tu voto: ${personalRating} · media: ${recipe.rating || 0}`
                    : isAfan
                      ? `media: ${recipe.rating || 0}`
                      : `media: ${recipe.rating || 0} · iniciá sesión para votar`}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-10">
            <span className="flex-1 border-t border-dashed border-ink/25" />
            <span className="text-accent text-sm">✦</span>
            <span className="flex-1 border-t border-dashed border-ink/25" />
          </div>

          {/* Body: ingredientes + pasos */}
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-12 items-start">
            <section>
              <h3 className="font-display font-bold text-2xl mb-4 relative inline-block">
                <span className="relative z-10">Ingredientes</span>
                <span className="absolute left-[-2px] right-[-4px] bottom-[2px] h-2 bg-yellow -z-0 -skew-x-6" />
              </h3>
              <IngredientsList data={recipe.ingredientes} />
            </section>

            <section>
              <h3 className="font-display font-bold text-2xl mb-4 relative inline-block">
                <span className="relative z-10">Preparación</span>
                <span className="absolute left-[-2px] right-[-4px] bottom-[2px] h-2 bg-yellow -z-0 -skew-x-6" />
              </h3>
              <StepsList data={recipe.pasos} />

              {/* Notas como post-it (solo si hay notas o si estoy editando) */}
              {showNotas && (
                <div className="mt-10 max-w-xl">
                  <div className="relative bg-yellow px-6 pt-6 pb-7 -rotate-[1.4deg] shadow-xl">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rotate-2 w-24 h-5 shadow-sm" style={{ background: 'var(--color-tape)' }} />
                    <div className="font-script text-[26px] leading-none mb-2 text-ink">~ Notas adicionales ~</div>
                    {isEditing ? (
                      <textarea
                        value={editedNotes}
                        onChange={(e) => setEditedNotes(e.target.value)}
                        className="w-full h-28 p-2.5 bg-paper border border-ink/30 font-script text-[18px] leading-snug focus:outline-none focus:border-ink resize-none"
                        placeholder="añadí notas sobre la receta…"
                      />
                    ) : (
                      <div className="font-script text-[19px] leading-snug text-ink whitespace-pre-wrap">
                        {renderNotas(recipe.notas)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
