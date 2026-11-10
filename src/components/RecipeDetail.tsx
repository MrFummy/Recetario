import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { X, ExternalLink, Edit2, Save, Trash2, Loader2, AlertTriangle, Clock, Users, Gauge, CookingPot, Tag } from 'lucide-react';
import type { Recipe } from '../types';
import { StarRating } from './StarRating';
import { IngredientsList, StepsList } from './RecipeContent';
import type { Despensa } from '../hooks/useDespensa';
import type { ParaHacer } from '../hooks/useParaHacer';
import { MuroRealizaciones } from './MuroRealizaciones';
import { ShareByEmail } from './ShareByEmail';
import { ModoCocina } from './ModoCocina';
import { RecipePolaroid } from './RecipePolaroid';
import { PaisEtiqueta, PaisSelect } from './PaisEtiqueta';
import { claveCategoria } from '../lib/colorCategoria';
import { hasNotas, renderNotas } from '../lib/recipeContent';
import { errorMessage } from '../lib/errors';
import placeholderImg from '../assets/placeholder.jpg';

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
  isAdmin?: boolean;
  user?: User | null;
  despensa: Despensa;
  paraHacer: ParaHacer;
  onUpdateNotes?: (notas: string) => Promise<void>;
  onUpdatePhoto?: (file: File) => Promise<void>;
  onRemovePhoto?: () => Promise<void>;
  /** Las realizaciones cambian la media vía trigger: hay que volver a leerla. */
  onRatingChanged: () => void;
  onUpdateDate?: (date: string) => Promise<void>;
  /** Asigna o quita (`null`) el país de «Mi pasaporte» (solo admin). */
  onUpdatePais?: (pais: string | null) => Promise<void>;
  /** Alterna la marca "sin hacer" (solo admin). */
  onToggleSinHacer?: () => Promise<void>;
  onDelete?: (recipe: Recipe) => Promise<void>;
  onShareByEmail?: (recipe: Recipe, email: string) => Promise<void>;
}

export function RecipeDetail({ recipe, onClose, isAdmin, user, despensa, paraHacer, onUpdateNotes, onUpdatePhoto, onRemovePhoto, onRatingChanged, onUpdateDate, onUpdatePais, onToggleSinHacer, onDelete, onShareByEmail }: RecipeDetailProps) {
  const isAfan = !!user;
  const initialNotes = renderNotas(recipe.notas);

  const [isEditing, setIsEditing] = useState(false);
  const [cocinando, setCocinando] = useState(false);
  const [editedNotes, setEditedNotes] = useState(initialNotes);
  const [editedFecha, setEditedFecha] = useState(
    recipe.fecha_clase ? recipe.fecha_clase.split('T')[0] : ''
  );
  const [editedPais, setEditedPais] = useState(recipe.pais ?? '');
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quitarFoto, setQuitarFoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const imageUrl = quitarFoto ? placeholderImg : (previewUrl || recipe.foto_url || placeholderImg);
  const tieneFoto = !!recipe.foto_url || !!previewUrl;
  const showNotas = hasNotas(recipe.notas) || isEditing;

  const handleSave = async () => {
    setIsSaving(true);
    setActionError(null);
    try {
      if (onUpdateNotes && editedNotes !== initialNotes) await onUpdateNotes(editedNotes);
      if (onRemovePhoto && quitarFoto) await onRemovePhoto();
      else if (onUpdatePhoto && newPhoto) await onUpdatePhoto(newPhoto);
      if (onUpdateDate && editedFecha !== (recipe.fecha_clase?.split('T')[0] || '')) await onUpdateDate(editedFecha);
      if (onUpdatePais && editedPais !== (recipe.pais ?? '')) await onUpdatePais(editedPais || null);
      setIsEditing(false);
      setNewPhoto(null);
      setPreviewUrl(null);
      setQuitarFoto(false);
    } catch (err) {
      console.error('Error saving:', err);
      setActionError(errorMessage(err, 'No se pudieron guardar los cambios.'));
    } finally {
      setIsSaving(false);
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

  const handlePhotoSelected = (file: File) => {
    setNewPhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
    setQuitarFoto(false); // elegir una foto cancela el quitarla
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div
        data-k={claveCategoria(recipe.categoria)}
        className="bg-paper w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border-[1.5px] border-ink rounded-[3px] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Toolbar ──────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-3 border-b-[1.5px] border-ink bg-paper-2 shrink-0">
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft truncate max-w-[55%]">
            Catálogo / {recipe.categoria ?? 'sin categoría'}
          </div>
          <div className="flex items-center gap-1.5">
            {isAdmin && !isEditing && (
              <>
                {onToggleSinHacer && (
                  <button
                    onClick={() => onToggleSinHacer().catch((err) => setActionError(errorMessage(err, 'No se pudo cambiar la marca.')))}
                    title={recipe.sin_hacer ? 'Quitar la marca "sin hacer"' : 'Marcar como sin hacer'}
                    aria-pressed={!!recipe.sin_hacer}
                    className={`p-1.5 rounded-full transition-colors ${recipe.sin_hacer
                      ? 'bg-yellow text-ink'
                      : 'text-ink-soft hover:text-accent hover:bg-accent-soft'}`}>
                    <Tag size={18} />
                  </button>
                )}
                <button onClick={handleDelete} title="Eliminar" disabled={isDeleting}
                  className="p-1.5 rounded-full text-ink-soft hover:text-hot hover:bg-hot-soft transition-colors disabled:opacity-50">
                  {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                </button>
                <button onClick={() => setIsEditing(true)} title="Editar"
                  className="p-1.5 rounded-full text-ink-soft hover:text-accent hover:bg-accent-soft transition-colors">
                  <Edit2 size={18} />
                </button>
              </>
            )}
            {isEditing && (
              <button onClick={handleSave} disabled={isSaving}
                className="boton-sello !py-1.5">
                <Save size={14} /> {isSaving ? 'guardando…' : 'guardar'}
              </button>
            )}
            {!isEditing && (
              <button onClick={() => setCocinando(true)}
                className="boton-sello !py-1.5">
                <CookingPot size={14} /> Cocinar
              </button>
            )}
            {recipe.pdf_url && (isAfan || isAdmin) && !isEditing && (
              <a href={recipe.pdf_url} target="_blank" rel="noreferrer" aria-label="Ver PDF"
                className="boton-sello boton-sello-claro !py-1.5">
                <span className="hidden sm:inline">Ver PDF</span> <ExternalLink size={13} />
              </a>
            )}
            {!isEditing && (isAfan || isAdmin) && onShareByEmail && (
              <ShareByEmail
                onShare={(email) => onShareByEmail(recipe, email)}
                onError={setActionError}
              />
            )}
            <button onClick={onClose} className="p-1.5 rounded-full text-ink-soft hover:text-hot transition-colors" aria-label="Cerrar"><X size={18} /></button>
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
            <RecipePolaroid
              imageUrl={imageUrl}
              titulo={recipe.titulo}
              fechaClase={recipe.fecha_clase}
              isEditing={isEditing}
              editedFecha={editedFecha}
              onFechaChange={setEditedFecha}
              onPhotoSelected={handlePhotoSelected}
              quitarFoto={quitarFoto}
              onQuitarFoto={() => { setQuitarFoto(true); setNewPhoto(null); setPreviewUrl(null); }}
              onDeshacerQuitar={() => setQuitarFoto(false)}
              puedeQuitarse={tieneFoto && !!onRemovePhoto}
            />
            <div className="pt-2">
              <div className="kicker mb-4">Receta</div>
              <span className="etiqueta mb-4">{recipe.categoria}</span>
              {isEditing ? (onUpdatePais && <PaisSelect valor={editedPais} onChange={setEditedPais} />) : <PaisEtiqueta codigo={recipe.pais} />}
              <h2 className="font-display font-light text-5xl sm:text-6xl leading-[0.95] tracking-[-0.035em] text-ink mb-5">
                {recipe.titulo}
              </h2>
              {recipe.sugerida_por && (
                <p className="font-mono text-[11.5px] text-accent mb-3">💡 Sugerida por {recipe.sugerida_por}</p>
              )}
              {(recipe.tiempo || recipe.porciones || recipe.dificultad) && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {recipe.tiempo && (
                    <span className="etiqueta etiqueta-neutra !normal-case !font-mono !font-medium">
                      <Clock size={12} /> {recipe.tiempo}
                    </span>
                  )}
                  {recipe.porciones && (
                    <span className="etiqueta etiqueta-neutra !normal-case !font-mono !font-medium">
                      <Users size={12} /> {recipe.porciones}
                    </span>
                  )}
                  {recipe.dificultad && (
                    <span className="etiqueta etiqueta-neutra !normal-case !font-mono !font-medium">
                      <Gauge size={12} /> {recipe.dificultad}
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-3 mb-1">
                <StarRating rating={recipe.rating || 0} size={20} />
                <span className="font-mono text-[11px] text-ink-soft">
                  media: {recipe.rating || 'sin valorar'}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="cenefa mb-10" />

          {/* Body: ingredientes + pasos */}
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-12 items-start">
            <section>
              <h3 className="seccion-titulo mb-5">Ingredientes</h3>
              <IngredientsList data={recipe.ingredientes} user={user} despensa={despensa} />
            </section>

            <section>
              <h3 className="seccion-titulo mb-5">Preparación</h3>
              <StepsList data={recipe.pasos} />

              {/* Notas como post-it (solo si hay notas o si estoy editando) */}
              {showNotas && (
                <div className="mt-10 max-w-xl">
                  <div className="relative rounded-[3px] border-[1.5px] border-ink bg-yellow-soft px-6 pt-5 pb-6 shadow-[5px_5px_0_var(--color-ink)]">
                    <div className="kicker mb-3">Notas adicionales</div>
                    {isEditing ? (
                      <textarea
                        value={editedNotes}
                        onChange={(e) => setEditedNotes(e.target.value)}
                        className="w-full h-28 p-2.5 bg-paper border-[1.5px] border-ink/40 font-script text-[19px] leading-snug focus:outline-none focus:border-ink resize-none"
                        placeholder="añade notas sobre la receta…"
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

          <MuroRealizaciones
            recetaId={recipe.id}
            user={user}
            isAdmin={!!isAdmin}
            paraHacer={paraHacer}
            onCambio={onRatingChanged}
          />
        </div>
      </div>
      {cocinando && <ModoCocina recipe={recipe} onClose={() => setCocinando(false)} />}
    </div>
  );
}
