/**
 * El color dominante de una bandera, para dar a cada país su acento.
 *
 * Se dibuja la imagen en un canvas diminuto y se cuentan los colores agrupados;
 * pesan más los saturados, y blancos y negros casi no cuentan (un bloque blanco
 * no es el «color» de Polonia). flagcdn sirve la imagen con CORS abierto, que es
 * lo que permite leer sus píxeles.
 */
export interface AcentoPais {
  /** El color tal cual, para rellenos y bordes. */
  vivo: string;
  /** El mismo tono oscurecido, para texto sobre fondo claro. */
  oscuro: string;
}

function aHsl(r: number, g: number, b: number): [number, number, number] {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / d + 6) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return [h * 60, s, l];
}

/** Calcula el acento a partir de los píxeles RGBA de la bandera reducida. */
export function acentoDePixeles(datos: Uint8ClampedArray): AcentoPais | null {
  const grupos = new Map<number, { peso: number; r: number; g: number; b: number }>();
  for (let i = 0; i < datos.length; i += 4) {
    if (datos[i + 3] < 200) continue;
    const [r, g, b] = [datos[i], datos[i + 1], datos[i + 2]];
    const [, s, l] = aHsl(r, g, b);
    if (l > 0.93 || l < 0.1) continue;
    const clave = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
    const grupo = grupos.get(clave) ?? { peso: 0, r: 0, g: 0, b: 0 };
    const peso = 0.1 + s * s;
    grupo.peso += peso;
    grupo.r += r * peso;
    grupo.g += g * peso;
    grupo.b += b * peso;
    grupos.set(clave, grupo);
  }
  let mejor: { peso: number; r: number; g: number; b: number } | null = null;
  for (const g of grupos.values()) if (!mejor || g.peso > mejor.peso) mejor = g;
  if (!mejor) return null;
  const [h, s] = aHsl(mejor.r / mejor.peso, mejor.g / mejor.peso, mejor.b / mejor.peso);
  const sat = Math.round(Math.min(s, 0.85) * 100);
  return { vivo: `hsl(${Math.round(h)} ${sat}% 50%)`, oscuro: `hsl(${Math.round(h)} ${sat}% 28%)` };
}
