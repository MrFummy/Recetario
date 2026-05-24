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
  
  // Email sharing state
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageUrl = previewUrl || recipe.foto_url || placeholderImg;

  useEffect(() => {
    if (user) {
      supabase.from('valoraciones').select('puntuacion').eq('receta_id', recipe.id).eq('user_id', user.id).single()
      .then(({data}) => {
         if (data) setPersonalRating(data.puntuacion);
      });
    }
  }, [user, recipe.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onUpdateNotes && editedNotes !== recipe.notas) {
        await onUpdateNotes(editedNotes);
      }
      if (onUpdatePhoto && newPhoto) {
        await onUpdatePhoto(newPhoto);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres borrar esta receta en todas las plataformas (Supabase, Notion, Drive)? Esta acción no se puede deshacer.')) {
      if (onDelete) {
        onDelete(recipe);
        onClose(); // Cerrar modal después de borrar
      }
    }
  };

  const handleSendEmail = async () => {
    if (!targetEmail || !onShareByEmail) return;
    setIsSendingEmail(true);
    try {
      await onShareByEmail(recipe, targetEmail);
      setEmailSuccess(true);
      setTimeout(() => {
        setShowEmailInput(false);
        setEmailSuccess(false);
        setTargetEmail('');
      }, 3000);
    } catch (error) {
      alert('Error al enviar el email. Comprueba que el flujo de n8n está activo.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPhoto(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Helper to render JSONB ingredients/steps if they exist
  const renderList = (data: any) => {
    if (!data) return null;
    
    if (Array.isArray(data)) {
      return (
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          {data.map((item, idx) => {
            if (typeof item === 'string') return <li key={idx}>{item}</li>;
            if (item.nombre) return <li key={idx}>{item.cantidad ? `${item.cantidad} - ` : ''}{item.nombre}</li>;
            return null;
          })}
        </ul>
      );
    }
    
    if (typeof data === 'object') {
      return (
        <div className="space-y-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <h4 className="font-medium text-[var(--color-primary)] mb-1">{key}</h4>
              {renderList(value)}
            </div>
          ))}
        </div>
      );
    }
    
    return <p className="text-gray-700">{String(data)}</p>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div 
        className="bg-[#FAFAF8] w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64 sm:h-80 w-full shrink-0 group">
          <img src={imageUrl} alt={recipe.titulo} className="w-full h-full object-cover" />
          
          {isEditing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-gray-900 px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors"
              >
                <Upload size={20} /> Cambiar Foto
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </div>
          )}

          <div className="absolute top-4 right-4 flex items-center gap-2">
            {isAdmin && !isEditing && (
              <>
                <button 
                  onClick={handleDelete}
                  className="bg-white/80 backdrop-blur-md p-2 rounded-full text-gray-800 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                  title="Eliminar receta"
                >
                  <Trash2 size={24} />
                </button>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-white/80 backdrop-blur-md p-2 rounded-full text-gray-800 hover:bg-white transition-colors shadow-sm"
                  title="Editar receta"
                >
                  <Edit2 size={24} />
                </button>
              </>
            )}
            <button 
              onClick={onClose}
              className="bg-white/80 backdrop-blur-md p-2 rounded-full text-gray-800 hover:bg-white hover:text-red-500 transition-colors shadow-sm"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-10 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <div>
              <span className="inline-block px-3 py-1 bg-orange-100 text-[var(--color-primary)] text-sm font-semibold rounded-full mb-3">
                {recipe.categoria}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{recipe.titulo}</h2>
              <div className="flex flex-col items-start">
                <StarRating 
                  rating={personalRating || recipe.rating || 0} 
                  onRate={(r) => {
                    if (onUpdateRating) onUpdateRating(r);
                    setPersonalRating(r);
                  }} 
                  readonly={!isAfan} 
                  size={24}
                />
                {personalRating ? (
                  <p className="text-xs text-gray-500 mt-1">Tu voto: {personalRating} ⭐ (Media: {recipe.rating || 0})</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    {isAfan ? `Nota media: ${recipe.rating || 0} ⭐` : `Nota media: ${recipe.rating || 0} ⭐ (Inicia sesión para votar)`}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3 shrink-0">
              <div className="flex items-center gap-3">
                {!isEditing && (isAfan || isAdmin) && (
                  <div className="relative">
                    <button 
                      onClick={() => setShowEmailInput(!showEmailInput)}
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
                      title="Enviar por email"
                    >
                      <Mail size={18} />
                    </button>
                    
                    {showEmailInput && (
                      <div className="absolute right-0 top-full mt-2 bg-white p-3 rounded-xl shadow-xl border border-gray-100 w-72 z-10 animate-in fade-in slide-in-from-top-2">
                        {emailSuccess ? (
                          <div className="text-green-600 text-sm font-medium text-center py-2">
                            ¡Petición enviada con éxito!
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase">Enviar a:</label>
                            <div className="flex gap-2">
                              <input 
                                type="email" 
                                value={targetEmail}
                                onChange={(e) => setTargetEmail(e.target.value)}
                                placeholder="amigo@email.com" 
                                className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                              />
                              <button 
                                onClick={handleSendEmail}
                                disabled={isSendingEmail || !targetEmail}
                                className="bg-[var(--color-primary)] text-white p-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
                              >
                                {isSendingEmail ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {isEditing && (
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70"
                  >
                    <Save size={18} /> {isSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                )}
                {recipe.pdf_url && (isAfan || isAdmin) && (
                  <a 
                    href={recipe.pdf_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-[var(--color-primary)] hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
                  >
                    Ver PDF <ExternalLink size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Ingredientes</h3>
                {renderList(recipe.ingredientes)}
              </div>
            </div>
            
            <div className="md:col-span-2 space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">Preparación</h3>
                <div className="prose prose-orange max-w-none">
                  {renderList(recipe.pasos)}
                </div>
              </div>
              
              <div className="bg-yellow-50/50 p-6 rounded-2xl border border-yellow-100">
                <h3 className="text-lg font-semibold mb-2 text-yellow-800">Notas adicionales</h3>
                {isEditing ? (
                  <textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    className="w-full h-32 p-3 rounded-xl border border-yellow-200 bg-white focus:ring-2 focus:ring-yellow-400 outline-none resize-none"
                    placeholder="Añade notas sobre la receta..."
                  />
                ) : (
                  recipe.notas ? renderList(recipe.notas) : <p className="text-gray-500 italic">No hay notas.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
}
