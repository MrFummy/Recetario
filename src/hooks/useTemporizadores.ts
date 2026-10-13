import { useCallback, useEffect, useRef, useState } from 'react';

export interface Temporizador {
  id: number;
  etiqueta: string;
  /** Instante de fin (ms desde epoch). Se guarda el fin, no los segundos que quedan. */
  fin: number;
  /** Segundos que quedan, ya redondeados hacia arriba; 0 = ha sonado. */
  restante: number;
}

/** Pitido de tres notas. WebAudio, sin ficheros de sonido que cargar. */
function pitar(ctx: AudioContext) {
  [0, 0.3, 0.6].forEach((t) => {
    const osc = ctx.createOscillator();
    const ganancia = ctx.createGain();
    const ini = ctx.currentTime + t;
    osc.frequency.value = 880;
    ganancia.gain.setValueAtTime(0.0001, ini);
    ganancia.gain.exponentialRampToValueAtTime(0.4, ini + 0.02);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, ini + 0.25);
    osc.connect(ganancia).connect(ctx.destination);
    osc.start(ini);
    osc.stop(ini + 0.26);
  });
}

/**
 * Cuentas atrás del modo cocina. Pueden convivir varias (la salsa y el horno).
 *
 * Cada temporizador guarda su hora de fin y no un contador que decrece: los
 * navegadores frenan los `setInterval` de las pestañas ocultas, y con un
 * contador el tiempo se desviaría; con la hora de fin, al volver marca lo
 * correcto. Aun así, en segundo plano la alarma no suena de forma fiable.
 */
export function useTemporizadores() {
  const [lista, setLista] = useState<{ id: number; etiqueta: string; fin: number }[]>([]);
  const [ahora, setAhora] = useState(() => Date.now());
  const siguienteId = useRef(1);
  const audio = useRef<AudioContext | null>(null);

  const temporizadores: Temporizador[] = lista.map((t) => ({
    ...t,
    restante: Math.max(0, Math.ceil((t.fin - ahora) / 1000)),
  }));
  const sonando = temporizadores.some((t) => t.restante === 0);

  // El reloj solo corre mientras haya algo que contar.
  const hayAlguno = lista.length > 0;
  useEffect(() => {
    if (!hayAlguno) return;
    const id = setInterval(() => setAhora(Date.now()), 250);
    return () => clearInterval(id);
  }, [hayAlguno]);

  // Mientras alguno haya terminado, se repite el aviso hasta que se pare.
  useEffect(() => {
    if (!sonando) return;
    const avisar = () => {
      if (audio.current) pitar(audio.current);
      navigator.vibrate?.([300, 150, 300, 150, 300]);
    };
    avisar();
    const id = setInterval(avisar, 2500);
    return () => clearInterval(id);
  }, [sonando]);

  const iniciar = useCallback((segundos: number, etiqueta: string) => {
    // Los navegadores solo dejan sonar audio tras un gesto del usuario, y este
    // método se llama desde el clic en el botón del tiempo: se crea y se
    // "despierta" el contexto aquí, no cuando suene la alarma.
    audio.current ??= new AudioContext();
    void audio.current.resume();
    const ahoraMs = Date.now();
    setAhora(ahoraMs);
    setLista((l) => [...l, { id: siguienteId.current++, etiqueta, fin: ahoraMs + segundos * 1000 }]);
  }, []);

  /** Suma o resta segundos. Si ya había sonado, vuelve a contar desde ahora. */
  const ajustar = useCallback((id: number, segundos: number) => {
    const ahoraMs = Date.now();
    setAhora(ahoraMs);
    setLista((l) => l.map((t) => {
      if (t.id !== id) return t;
      const base = Math.max(t.fin, ahoraMs);
      return { ...t, fin: Math.max(base + segundos * 1000, ahoraMs + 1000) };
    }));
  }, []);

  const parar = useCallback((id: number) => {
    setLista((l) => l.filter((t) => t.id !== id));
  }, []);

  return { temporizadores, sonando, iniciar, ajustar, parar };
}

export type Temporizadores = ReturnType<typeof useTemporizadores>;
