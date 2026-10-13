/**
 * Detecta en el texto de un paso los tiempos que se pueden cronometrar
 * ("durante 30 minutos", "5-7 minutos", "1 hora y media") para ofrecer un
 * temporizador en el modo cocina.
 *
 * Es una función pura sobre texto: no sabe nada de React ni de recetas.
 */

export type Fragmento =
  | { tipo: 'texto'; texto: string }
  | { tipo: 'tiempo'; texto: string; segundos: number };

/** Más de esto no es algo que se cronometre en la cocina (marinados, reposos de noche). */
const MAX_SEGUNDOS = 6 * 3600;

const NUM = String.raw`\d+(?:[.,]\d+)?`;
const UNIDAD = String.raw`horas?|minutos?|min\b|segundos?|seg\b`;

const NUMEROS_EN_LETRAS: Record<string, number> = {
  un: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6,
  siete: 7, ocho: 8, nueve: 9, diez: 10, quince: 15, veinte: 20,
};
const PALABRAS = Object.keys(NUMEROS_EN_LETRAS).join('|');

/**
 * Las alternativas van de la más específica a la más general: si "1 hora y 30
 * minutos" cayera en la última, solo se reconocería "30 minutos".
 */
const PATRON = new RegExp(
  [
    // 0: rango "5-7 minutos", "1 a 2 horas" → grupos 1, 2, 3
    String.raw`(${NUM})\s*(?:-|–|a)\s*(${NUM})\s*(${UNIDAD})`,
    // 1: "1 hora y media" → grupo 4
    String.raw`(${NUM})\s*horas?\s*y\s*media`,
    // 2: "1 hora y 30 minutos" → grupos 5, 6
    String.raw`(${NUM})\s*horas?\s*y\s*(${NUM})\s*(?:minutos?|min\b)`,
    // 3: "30 minutos" → grupos 7, 8
    String.raw`(${NUM})\s*(${UNIDAD})`,
    // 4: "media hora"
    String.raw`media\s+hora`,
    // 5: "dos minutos", "una hora" (número escrito con letras) → grupos 9, 10
    String.raw`\b(${PALABRAS})\s+(horas?|minutos?|segundos?)\b`,
    // 6: "un par de minutos" → grupo 11
    String.raw`\bun\s+par\s+de\s+(horas?|minutos?)\b`,
  ].map((p) => `(?:${p})`).join('|'),
  'gi',
);

const aNumero = (s: string) => parseFloat(s.replace(',', '.'));

function segundosDe(cantidad: number, unidad: string): number {
  const u = unidad.toLowerCase();
  if (u.startsWith('h')) return cantidad * 3600;
  if (u.startsWith('m')) return cantidad * 60;
  return cantidad;
}

/**
 * Parte el texto en fragmentos de texto corriente y de tiempo. De un rango se
 * toma el valor menor: quien cocina prefiere vigilar antes que pasarse.
 */
export function detectarTiempos(texto: string): Fragmento[] {
  const fragmentos: Fragmento[] = [];
  let cursor = 0;

  for (const m of texto.matchAll(PATRON)) {
    let segundos: number;
    if (m[1] !== undefined) segundos = segundosDe(aNumero(m[1]), m[3]);
    else if (m[4] !== undefined) segundos = aNumero(m[4]) * 3600 + 1800;
    else if (m[5] !== undefined) segundos = aNumero(m[5]) * 3600 + aNumero(m[6]) * 60;
    else if (m[7] !== undefined) segundos = segundosDe(aNumero(m[7]), m[8]);
    else if (m[9] !== undefined) segundos = segundosDe(NUMEROS_EN_LETRAS[m[9].toLowerCase()], m[10]);
    else if (m[11] !== undefined) segundos = segundosDe(2, m[11]);
    else segundos = 1800; // "media hora"

    if (!(segundos > 0) || segundos > MAX_SEGUNDOS) continue;

    const inicio = m.index ?? 0;
    if (inicio > cursor) fragmentos.push({ tipo: 'texto', texto: texto.slice(cursor, inicio) });
    fragmentos.push({ tipo: 'tiempo', texto: m[0], segundos: Math.round(segundos) });
    cursor = inicio + m[0].length;
  }

  if (cursor < texto.length) fragmentos.push({ tipo: 'texto', texto: texto.slice(cursor) });
  return fragmentos;
}

/** 1800 → "30 min", 5400 → "1 h 30 min", 45 → "45 s". */
export function formatearDuracion(segundos: number): string {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  if (h > 0) return m > 0 ? `${h} h ${m} min` : `${h} h`;
  if (m > 0) return s > 0 && m < 10 ? `${m} min ${s} s` : `${m} min`;
  return `${s} s`;
}

/** Cuenta atrás: 125 → "2:05", 3725 → "1:02:05". */
export function formatearReloj(segundos: number): string {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  const dos = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${dos(m)}:${dos(s)}` : `${m}:${dos(s)}`;
}
