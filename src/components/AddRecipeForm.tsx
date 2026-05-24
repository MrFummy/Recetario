import { useState, useRef } from 'react';
import type { FormEvent } from 'react';
import { FileText, Image as ImageIcon, Send, Loader2 } from 'lucide-react';
import { UploadProgress } from './UploadProgress';
import type { UploadStatus } from './UploadProgress';
const WEBHOOK_URL = 'https://n8n.emtel.cloud/webhook/nueva-receta';

export function AddRecipeForm() {
  const [nombre, setNombre] = useState('');
  const [recetaFile, setRecetaFile] = useState<File | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!nombre || !recetaFile) return;

    setStatus('uploading');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('nombre', nombre);
    // Mantenemos el nombre de campo 'receta_pdf' para no romper el webhook si espera este nombre,
    // aunque ahora puede ser un PDF o una imagen.
    formData.append('receta_pdf', recetaFile);
    if (fotoFile) {
      formData.append('foto_plato', fotoFile);
    }

    try {
      // Simulate processing time UX or handle real fetch
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData,
        // mode: 'no-cors' // if n8n doesn't return CORS headers, we might need this, but we won't get a readable response. Let's assume CORS is setup or we rely on standard fetch.
      });

      setStatus('processing');
      
      if (!response.ok && response.type !== 'opaque') {
        throw new Error('El servidor respondió con un error');
      }

      // Simulate a small delay for "processing" UX before showing done
      setTimeout(() => {
        setStatus('done');
        setNombre('');
        setRecetaFile(null);
        setFotoFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (photoInputRef.current) photoInputRef.current.value = '';
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Añadir nueva receta</h2>
        <p className="text-gray-500">Sube el documento de la receta (PDF o Imagen) y automáticamente se procesará e incluirá en tu catálogo.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la receta *</label>
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            placeholder="Ej. Lasaña de carne tradicional"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Document Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Archivo (PDF o Imagen) *</label>
            <div 
              className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-colors cursor-pointer
                ${recetaFile ? 'border-[var(--color-primary)] bg-orange-50' : 'border-gray-300 hover:border-[var(--color-primary)] hover:bg-gray-50'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className={recetaFile ? "text-[var(--color-primary)]" : "text-gray-400"} size={32} />
              <span className="mt-2 text-sm font-medium text-center text-gray-600 truncate max-w-full">
                {recetaFile ? recetaFile.name : 'Seleccionar Archivo'}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                required
                className="hidden"
                onChange={(e) => setRecetaFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* Photo Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Foto del plato (Opcional)</label>
            <div 
              className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-colors cursor-pointer
                ${fotoFile ? 'border-[var(--color-primary)] bg-orange-50' : 'border-gray-300 hover:border-[var(--color-primary)] hover:bg-gray-50'}`}
              onClick={() => photoInputRef.current?.click()}
            >
              <ImageIcon className={fotoFile ? "text-[var(--color-primary)]" : "text-gray-400"} size={32} />
              <span className="mt-2 text-sm font-medium text-center text-gray-600 truncate max-w-full">
                {fotoFile ? fotoFile.name : 'Seleccionar Foto'}
              </span>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFotoFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={status === 'uploading' || status === 'processing' || !nombre || !recetaFile}
          className="w-full mt-4 bg-[var(--color-text)] hover:bg-black text-white py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'uploading' || status === 'processing' ? (
            <>Procesando... <Loader2 className="animate-spin" size={18} /></>
          ) : (
            <>Enviar Receta <Send size={18} /></>
          )}
        </button>
      </form>

      <UploadProgress status={status} errorMessage={errorMsg} />
    </div>
  );
}
