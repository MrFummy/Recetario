import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { StarRating } from './StarRating';
import { errorMessage } from '../lib/errors';
import type { DatosRealizacion } from '../hooks/useRealizaciones';

interface Props {
  /** Valores de partida al editar una realización propia. */
  inicial?: DatosRealizacion;
  /** Si el usuario aún no tiene nombre de pila, el formulario se lo pide. */
  pedirNombre: boolean;
  onGuardar: (datos: DatosRealizacion, nombre: string | null) => Promise<void>;
  onCancelar: () => void;
}

/**
 * Marcar una receta como "ya hecha": solo la fecha es obligatoria y la pone el
 * servidor, así que nota y estrellas pueden quedarse vacías. Si fueran
 * obligatorias, la pereza haría que se dejara de marcar.
 */
export function RealizacionForm({ inicial, pedirNombre, onGuardar, onCancelar }: Props) {
  const [notas, setNotas] = useState(inicial?.notas ?? '');
  const [puntuacion, setPuntuacion] = useState<number | null>(inicial?.puntuacion ?? null);
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const falta = pedirNombre && nombre.trim() === '';

  const enviar = async () => {
    setGuardando(true);
    setError(null);
    try {
      await onGuardar({ notas, puntuacion }, pedirNombre ? nombre.trim() : null);
    } catch (err) {
      setError(errorMessage(err, 'No se pudo guardar.'));
      setGuardando(false);
    }
  };

  return (
    <div className="border-2 border-ink bg-paper-2 p-4 mb-6 max-w-xl shadow-brut">
      {pedirNombre && (
        <label className="block mb-3">
          <span className="font-mono text-[11px] uppercase tracking-wider text-accent">
            Tu nombre (firmará tus notas)
          </span>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={40}
            className="mt-1 w-full p-2 bg-paper border border-ink/30 text-[14px] focus:outline-none focus:border-ink"
          />
        </label>
      )}

      <div className="flex items-center gap-3 mb-3">
        <StarRating rating={puntuacion ?? 0} votoPropio={puntuacion} onRate={(n) => setPuntuacion(n === 0 ? null : n)} readonly={false} size={22} />
        <span className="font-mono text-[11px] text-ink-soft">
          {puntuacion ? `${puntuacion}/5` : 'sin puntuar (opcional)'}
        </span>
      </div>

      <textarea
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        maxLength={1000}
        placeholder="¿Qué tal salió? ¿Cambiaste algo? (opcional)"
        className="w-full h-24 p-2.5 bg-paper border border-ink/30 font-script text-[18px] leading-snug focus:outline-none focus:border-ink resize-none"
      />

      {error && <p className="mt-2 font-mono text-[11px] text-hot">{error}</p>}

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => void enviar()}
          disabled={guardando || falta}
          className="flex items-center gap-1.5 bg-yellow text-ink px-3 py-1.5 text-[13px] font-semibold border-[1.5px] border-ink shadow-brut disabled:opacity-60"
        >
          {guardando && <Loader2 size={13} className="animate-spin" />}
          {inicial ? 'guardar cambios' : 'ya la hice'}
        </button>
        <button onClick={onCancelar} disabled={guardando} className="font-mono text-[12px] text-ink-soft underline decoration-dotted hover:text-hot">
          cancelar
        </button>
      </div>
    </div>
  );
}
