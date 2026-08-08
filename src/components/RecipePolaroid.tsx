import { useRef } from 'react';
import { Upload, ImageOff, RotateCcw } from 'lucide-react';

interface RecipePolaroidProps {
  imageUrl: string;
  titulo: string;
  fechaClase?: string;
  isEditing: boolean;
  /** Fecha en edición, en formato yyyy-mm-dd. */
  editedFecha: string;
  onFechaChange: (fecha: string) => void;
  onPhotoSelected: (file: File) => void;
  /** La foto queda marcada para quitarse; se aplica al guardar. */
  quitarFoto: boolean;
  onQuitarFoto: () => void;
  onDeshacerQuitar: () => void;
  /** Solo se ofrece quitarla si hay foto propia y el padre sabe hacerlo. */
  puedeQuitarse: boolean;
}

/** Foto de la receta con su marco polaroid, washi tape y controles de edición. */
export function RecipePolaroid({
  imageUrl, titulo, fechaClase, isEditing,
  editedFecha, onFechaChange, onPhotoSelected,
  quitarFoto, onQuitarFoto, onDeshacerQuitar, puedeQuitarse,
}: RecipePolaroidProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative mt-2 mx-auto md:mx-0 max-w-[300px] w-full">
      <span className="absolute -top-3 left-7 w-24 h-5 rotate-[-7deg] shadow-sm" style={{ background: 'var(--color-tape)' }} />
      <span className="absolute -top-2 right-6 w-24 h-5 rotate-[9deg] shadow-sm" style={{ background: 'var(--color-tape-blue)' }} />

      <div className="bg-white p-3 pb-10 shadow-xl -rotate-2 relative">
        <div className="w-full aspect-[4/5] bg-ink/10 overflow-hidden">
          <img src={imageUrl} alt={titulo} className="w-full h-full object-cover" />
        </div>

        {fechaClase && !isEditing && (
          <div className="absolute bottom-3 left-0 right-0 text-center font-script text-[20px] text-ink">
            {new Date(fechaClase).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        )}

        {isEditing && (
          <>
            <div className="absolute bottom-2 left-2 right-2 text-center">
              <input
                type="date"
                value={editedFecha}
                onChange={(e) => onFechaChange(e.target.value)}
                className="w-full bg-white/90 border border-ink/50 text-center font-mono text-sm p-1 focus:outline-none"
              />
            </div>

            <div className="absolute inset-3 bottom-10 bg-ink/70 flex flex-col items-center justify-center gap-2 text-paper">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 hover:bg-paper/15 transition-colors"
              >
                <Upload size={16} /> {quitarFoto ? 'poner otra foto' : 'cambiar foto'}
              </button>

              {quitarFoto ? (
                <button
                  onClick={onDeshacerQuitar}
                  className="flex items-center gap-1.5 font-mono text-[11px] px-3 py-1 text-yellow hover:bg-paper/15 transition-colors"
                >
                  <RotateCcw size={13} /> deshacer
                </button>
              ) : puedeQuitarse ? (
                <button
                  onClick={onQuitarFoto}
                  className="flex items-center gap-1.5 font-mono text-[11px] px-3 py-1 hover:bg-hot/40 transition-colors"
                  title="La receta pasará a mostrar la imagen por defecto"
                >
                  <ImageOff size={13} /> quitar foto
                </button>
              ) : null}
            </div>
          </>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onPhotoSelected(file);
          }}
        />
      </div>
    </div>
  );
}
