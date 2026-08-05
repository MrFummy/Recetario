import { useState, useRef } from 'react';
import type { FormEvent } from 'react';
import { FileText, Image as ImageIcon, Send, Loader2 } from 'lucide-react';
import { UploadProgress } from './UploadProgress';
import type { UploadStatus } from './UploadProgress';
import { N8N_WEBHOOKS, postToWebhook } from '../lib/n8n';
import { errorMessage } from '../lib/errors';

interface AddRecipeFormProps {
  /** Se dispara cuando n8n acepta la receta, para recargar el catálogo. */
  onSuccess?: () => void;
}

export function AddRecipeForm({ onSuccess }: AddRecipeFormProps) {
  const [nombre, setNombre] = useState('');
  const [fechaClase, setFechaClase] = useState(new Date().toISOString().split('T')[0]);
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
    formData.append('fecha_clase', fechaClase);
    // Mantenemos el nombre de campo 'receta_pdf' para no romper el webhook si espera este nombre,
    // aunque ahora puede ser un PDF o una imagen.
    formData.append('receta_pdf', recetaFile);
    if (fotoFile) {
      formData.append('foto_plato', fotoFile);
    }

    try {
      // El estado 'done' se marca cuando n8n responde de verdad, no tras un
      // temporizador: antes se mostraba éxito aunque el flujo hubiese fallado.
      await postToWebhook(N8N_WEBHOOKS.nuevaReceta, formData, 'nueva receta');

      setStatus('done');
      setNombre('');
      setRecetaFile(null);
      setFotoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (photoInputRef.current) photoInputRef.current.value = '';
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(errorMessage(err, 'Hubo un problema de conexión con el webhook.'));
    }
  };

  const isBusy = status === 'uploading';

  const dropzone = (active: boolean) =>
    `relative flex flex-col items-center justify-center p-6 border-2 border-dashed transition-all cursor-pointer ${
      active
        ? 'border-accent bg-accent-soft text-accent'
        : 'border-ink/40 text-ink-soft hover:border-ink hover:bg-ink/5'
    }`;

  return (
    <div className="max-w-2xl mx-auto bg-paper-2 p-8 sm:p-10 border-2 border-ink shadow-brut-lg">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-accent mb-3">
          <span className="w-2 h-2 rounded-full bg-hot dot-blink" />
          nueva-receta.n8n
        </div>
        <h2 className="font-display font-black text-4xl leading-[0.98] tracking-tight text-ink mb-3">
          Añadir <span className="hl-mark">receta</span>
        </h2>
        <p className="text-ink-soft text-[15px] leading-relaxed max-w-md mx-auto">
          Sube el documento (PDF o imagen) y el flujo lo procesa e incluye en el catálogo solo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-soft mb-2">
              Nombre de la receta *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-paper border-2 border-ink text-ink placeholder:text-ink-soft/70 focus:outline-none focus:shadow-brut focus:-translate-x-px focus:-translate-y-px transition-all"
              placeholder="Ej. Lasaña de carne tradicional"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-soft mb-2">
              Fecha de elaboración *
            </label>
            <input
              type="date"
              required
              value={fechaClase}
              onChange={(e) => setFechaClase(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-paper border-2 border-ink text-ink font-mono text-sm focus:outline-none focus:shadow-brut focus:-translate-x-px focus:-translate-y-px transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Documento de la receta */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-soft mb-2">
              Archivo (PDF o imagen) *
            </label>
            <div className={dropzone(!!recetaFile)} onClick={() => fileInputRef.current?.click()}>
              <FileText size={30} strokeWidth={1.8} />
              <span className="mt-2 font-mono text-[12px] text-center truncate max-w-full">
                {recetaFile ? recetaFile.name : 'seleccionar archivo'}
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

          {/* Foto del plato */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-soft mb-2">
              Foto del plato (opcional)
            </label>
            <div className={dropzone(!!fotoFile)} onClick={() => photoInputRef.current?.click()}>
              <ImageIcon size={30} strokeWidth={1.8} />
              <span className="mt-2 font-mono text-[12px] text-center truncate max-w-full">
                {fotoFile ? fotoFile.name : 'seleccionar foto'}
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
          disabled={isBusy || !nombre || !recetaFile}
          className="w-full mt-2 bg-yellow text-ink py-3.5 font-display font-bold text-[17px] border-2 border-ink shadow-brut hover:-translate-x-px hover:-translate-y-px hover:shadow-brut-lg active:translate-x-0 active:translate-y-0 active:shadow-brut transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-brut disabled:translate-x-0 disabled:translate-y-0"
        >
          {isBusy ? (
            <>Enviando… <Loader2 className="animate-spin" size={18} /></>
          ) : (
            <>Enviar receta <Send size={18} /></>
          )}
        </button>
      </form>

      <UploadProgress status={status} errorMessage={errorMsg} />
    </div>
  );
}
