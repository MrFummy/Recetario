import { Timer } from 'lucide-react';
import { detectarTiempos, formatearDuracion } from '../lib/tiempos';

interface PasoConTiemposProps {
  texto: string;
  onIniciar: (segundos: number, etiqueta: string) => void;
}

/** Texto de un paso en el que cada tiempo ("5-7 minutos") es un botón que lo cronometra. */
export function PasoConTiempos({ texto, onIniciar }: PasoConTiemposProps) {
  return (
    <>
      {detectarTiempos(texto).map((f, i) =>
        f.tipo === 'texto' ? (
          <span key={i}>{f.texto}</span>
        ) : (
          <button
            key={i}
            onClick={() => onIniciar(f.segundos, f.texto.trim())}
            title={`Poner un temporizador de ${formatearDuracion(f.segundos)}`}
            className="inline-flex items-center gap-2 mx-1 px-3 py-0.5 align-baseline bg-yellow text-ink font-semibold rounded-md hover:brightness-95 active:scale-95 transition"
          >
            <Timer size={28} strokeWidth={2.2} className="shrink-0" />
            {f.texto}
          </button>
        ),
      )}
    </>
  );
}
