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

/** Foto de la receta en arco, con el color de su categoría de sombra, y controles de edición. */
export function RecipePolaroid({
  imageUrl, titulo, fechaClase, isEditing,
  editedFecha, onFechaChange, onPhotoSelected,
  quitarFoto, onQuitarFoto, onDeshacerQuitar, puedeQuitarse,
}: RecipePolaroidProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative mx-auto mt-2 w-full max-w-[300px] md:mx-0">
      <div className="arco relative aspect-[4/5] border-[1.5px] border-ink bg-rule/60 shadow-[6px_6px_0_var(--k)]">
        <img src={imageUrl} alt={titulo} className="h-full w-full object-cover" />

        {isEditing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/70 text-paper">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 font-mono text-xs transition-colors hover:bg-paper/15"
            >
              <Upload size={16} /> {quitarFoto ? 'poner otra foto' : 'cambiar foto'}
            </button>

            {quitarFoto ? (
              <button
                onClick={onDeshacerQuitar}
                className="flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] text-yellow transition-colors hover:bg-paper/15"
              >
                <RotateCcw size={13} /> deshacer
              </button>
            ) : puedeQuitarse ? (
              <button
                onClick={onQuitarFoto}
                className="flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] transition-colors hover:bg-hot/40"
                title="La receta pasará a mostrar la imagen por defecto"
              >
                <ImageOff size={13} /> quitar foto
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Pie manuscrito: la fecha en que se cocinó. */}
      {fechaClase && !isEditing && (
        <div className="mt-4 text-center font-script text-[22px] leading-none text-ink-soft">
          {new Date(fechaClase).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      )}
      {isEditing && (
        <input
          type="date"
          value={editedFecha}
          onChange={(e) => onFechaChange(e.target.value)}
          className="mt-4 w-full rounded-full border-[1.5px] border-ink bg-paper-2 p-1.5 text-center font-mono text-sm focus:outline-none"
        />
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
  );
}
