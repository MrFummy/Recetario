import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

interface UploadProgressProps {
  status: UploadStatus;
  errorMessage?: string;
}

export function UploadProgress({ status, errorMessage }: UploadProgressProps) {
  if (status === 'idle') return null;

  const tone =
    status === 'error'
      ? 'bg-hot-soft border-hot text-hot'
      : status === 'done'
        ? 'bg-accent-soft border-accent text-accent'
        : 'bg-paper-2 border-ink text-ink';

  return (
    <div className={`mt-6 p-4 border-2 flex items-start gap-3.5 shadow-brut ${tone} animate-in fade-in slide-in-from-bottom-2`}>
      <div className="shrink-0 mt-0.5">
        {status === 'uploading' && <Loader2 className="animate-spin" size={20} />}
        {status === 'done' && <CheckCircle size={20} />}
        {status === 'error' && <AlertCircle size={20} />}
      </div>

      <div>
        <h4 className="font-display font-bold text-[15px] mb-1">
          {status === 'uploading' && 'Enviando a n8n…'}
          {status === 'done' && 'Receta enviada'}
          {status === 'error' && 'No se pudo enviar la receta'}
        </h4>
        <p className="font-mono text-[12px] leading-relaxed opacity-90">
          {status === 'uploading' && 'Subiendo el archivo al webhook, no cierres la pestaña.'}
          {status === 'done' && 'El flujo ha recibido los datos y está extrayendo la información. Puede tardar unos segundos en aparecer en el catálogo.'}
          {status === 'error' && (errorMessage || 'Hubo un problema de conexión con el webhook.')}
        </p>
      </div>
    </div>
  );
}
