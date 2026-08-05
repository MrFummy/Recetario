import { useState, useRef, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { X, ExternalLink, Edit2, Save, Upload, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import type { Recipe } from '../types';
import { StarRating } from './StarRating';
import { IngredientsList, StepsList } from './RecipeContent';
import { ShareByEmail } from './ShareByEmail';
import { hasNotas, renderNotas } from '../lib/recipeContent';
import { errorMessage } from '../lib/errors';
import { supabase } from '../lib/supabase';
import placeholderImg from '../assets/placeholder.jpg';

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
  isAdmin?: boolean;
  user?: User | null;
  onUpdateNotes?: (notas: string) => Promise<void>;
  onUpdatePhoto?: (file: File) => Promise<void>;
  onUpdateRating?: (rating: number) => Promise<void>;
  onUpdateDate?: (date: string) => Promise<void>;
  onDelete?: (recipe: Recipe) => Promise<void>;
  onShareByEmail?: (recipe: Recipe, email: string) => Promise<void>;
}

export function RecipeDetail({ recipe, onClose, isAdmin, user, onUpdateNotes, onUpdatePhoto, onUpdateRating, onUpdateDate, onDelete, onShareByEmail }: RecipeDetailProps) {
  const isAfan = !!user;
  const initialNotes = renderNotas(recipe.notas);

  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(initialNotes);
  const [editedFecha, setEditedFecha] = useState(
    recipe.fecha_clase ? recipe.fecha_clase.split('T')[0] : ''
  );
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [personalRating, setPersonalRating] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageUrl = previewUrl || recipe.foto_url || placeholderImg;
  const showNotas = hasNotas(recipe.notas) || isEditing;

  useEffect(() => {
    if (!user) return;
    // maybeSingle: la mayoría de recetas no tienen voto de este usuario y
    // `single()` devolvía un 406 por cada una.
    supabase
      .from('valoraciones')
      .select('puntuacion')
      .eq('receta_id', recipe.id)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => { if (data) setPersonalRating(data.puntuacion); });
  }, [user, recipe.id]);

  const handleSave = async () => {
    setIsSaving(true);
    setActionError(null);
    try {
      if (onUpdateNotes && editedNotes !== initialNotes) await onUpdateNotes(editedNotes);
      if (onUpdatePhoto && newPhoto) await onUpdatePhoto(newPhoto);
      if (onUpdateDate && editedFecha !== (recipe.fecha_clase?.split('T')[0] || '')) await onUpdateDate(editedFecha);
      setIsEditing(false);
      setNewPhoto(null);
    } catch (err) {
      console.error('Error saving:', err);
      setActionError(errorMessage(err, 'No se pudieron guardar los cambios.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRate = async (rating: number) => {
    if (!onUpdateRating) return;
    const previous = personalRating;
    setPersonalRating(rating); // optimista: se revierte si el guardado falla
    setActionError(null);
    try {
      await onUpdateRating(rating);
    } catch (err) {
      setPersonalRating(previous);
      setActionError(errorMessage(err, 'No se pudo guardar tu voto.'));
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!window.confirm('¿Seguro que querés borrar esta receta en TODAS las plataformas (Supabase, Notion, Drive)? Esta acción no se puede deshacer.')) return;

    setIsDeleting(true);
    setActionError(null);
    try {
      await onDelete(recipe); // el modal se cierra desde App solo si el borrado confirma
    } catch (err) {
      setActionError(errorMessage(err, 'No se pudo borrar la receta.'));
    } finally {
      setIsDeleting(false);
    }
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
            ~/recetas/{(recipe.categoria ?? 'sin-categoria').toLowerCase().replace(/[/ ]+/g, '-')}/{(recipe.titulo ?? 'sin-titulo').toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.md
          </div>
          <div className="flex items-center gap-1.5">
            {isAdmin && !isEditing && (
              <>
                <button onClick={handleDelete} title="Eliminar" disabled={isDeleting}
                  className="p-1.5 rounded-md text-ink-soft hover:text-hot hover:bg-hot-soft transition-colors disabled:opacity-50">
                  {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
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
            {!isEditing && (isAfan || isAdmin) && onShareByEmail && (
              <ShareByEmail
                onShare={(email) => onShareByEmail(recipe, email)}
                onError={setActionError}
              />
            )}
            <button onClick={onClose} className="p-1.5 rounded-md text-ink-soft hover:text-hot transition-colors"><X size={18} /></button>
          </div>
        </div>

        {/* ── Aviso de error de acción ─────────────────────── */}
        {actionError && (
          <div className="shrink-0 flex items-start gap-2.5 px-5 sm:px-8 py-2.5 bg-hot-soft border-b-2 border-hot text-hot font-mono text-[12px] leading-snug animate-in slide-in-from-top-1">
            <AlertTriangle size={15} className="shrink-0 mt-px" />
            <span className="flex-1">{actionError}</span>
            <button onClick={() => setActionError(null)} className="shrink-0 hover:opacity-70" aria-label="Descartar error">
              <X size={14} />
            </button>
          </div>
        )}

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
                {recipe.fecha_clase && !isEditing && (
                  <div className="absolute bottom-3 left-0 right-0 text-center font-script text-[20px] text-ink">
                    {new Date(recipe.fecha_clase).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
                {isEditing && (
                  <div className="absolute bottom-2 left-2 right-2 text-center">
                    <input
                      type="date"
                      value={editedFecha}
                      onChange={(e) => setEditedFecha(e.target.value)}
                      className="w-full bg-white/90 border border-ink/50 text-center font-mono text-sm p-1 focus:outline-none"
                    />
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
                  onRate={handleRate}
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
