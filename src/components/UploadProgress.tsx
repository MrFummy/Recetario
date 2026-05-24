import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

interface UploadProgressProps {
  status: UploadStatus;
  errorMessage?: string;
}

export function UploadProgress({ status, errorMessage }: UploadProgressProps) {
  if (status === 'idle') return null;

  return (
    <div className="mt-6 p-4 rounded-xl border flex items-start gap-4 transition-all
      ${status === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 
        status === 'done' ? 'bg-green-50 border-green-200 text-green-700' : 
        'bg-blue-50 border-blue-200 text-blue-700'}"
    >
      <div className="shrink-0 mt-0.5">
        {status === 'uploading' && <Loader2 className="animate-spin text-blue-500" size={20} />}
        {status === 'processing' && <Loader2 className="animate-spin text-blue-500" size={20} />}
        {status === 'done' && <CheckCircle className="text-green-500" size={20} />}
        {status === 'error' && <AlertCircle className="text-red-500" size={20} />}
      </div>
      
      <div>
        <h4 className="font-semibold text-sm mb-1">
          {status === 'uploading' && 'Subiendo archivos...'}
          {status === 'processing' && 'Procesando receta en n8n...'}
          {status === 'done' && '¡Receta añadida con éxito!'}
          {status === 'error' && 'Error al subir la receta'}
        </h4>
        <p className="text-sm opacity-80">
          {status === 'uploading' && 'Enviando el formulario, por favor espera.'}
          {status === 'processing' && 'El webhook ha recibido los datos y está extrayendo la información.'}
          {status === 'done' && 'La receta ya debería aparecer en tu catálogo (refresca en unos segundos).'}
          {status === 'error' && (errorMessage || 'Hubo un problema de conexión con el webhook.')}
        </p>
      </div>
    </div>
  );
}
