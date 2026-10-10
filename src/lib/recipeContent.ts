import type { Json } from '../types';

export interface Ingredient {
  qty: string;
  name: string;
  /** Identificador estable del ingrediente dentro de la receta, si lo trae. */
  id?: string;
  /**
   * Ingrediente genérico en minúsculas ("cebolla" para "2 unidades Cebolla
   * morada"). Es la clave con la que la despensa reconoce el mismo ingrediente
   * en recetas distintas. Las recetas anteriores a agosto de 2026 no lo traían;
   * la migración `20260823_estructurar_ingredientes` lo añadió.
   */
  base?: string;
  /** Cabecera de sección ("— Para la salsa —"), no un ingrediente marcable. */
  esGrupo?: boolean;
  /**
   * Cantidad como número, o `null` si no es numérica ("al gusto", "C/S"...).
   * Solo la usa la lista de la compra, para sumar cuando se puede.
   */
  valor?: number | null;
  /** Unidad normalizada (g, ml, unidad, al gusto...), o `null` si no la trae. */
  unidad?: string | null;
}

/** Las cabeceras de sección llegan como cadenas sueltas entre guiones largos. */
function esCabeceraDeGrupo(texto: string): boolean {
  const t = texto.trim();
  return t.length > 2 && t.startsWith('—') && t.endsWith('—');
}

/** Convierte un escalar JSONB a texto; devuelve '' para objetos y arrays. */
function asText(value: Json | undefined): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function isRecord(value: Json): value is { [key: string]: Json } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Convierte a número aceptando coma decimal; `null` si no es numérico. */
function asNumero(value: Json | undefined): number | null {
  if (typeof value === 'number' && isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = parseFloat(value.replace(',', '.'));
    if (isFinite(n)) return n;
  }
  return null;
}

/**
 * Aplana el JSONB de ingredientes. n8n entrega formatos distintos según la
 * receta: array de strings, array de `{ nombre, cantidad }`, u objetos
 * agrupados por sección (`{ "Para la salsa": [...] }`).
 *
 * Mismo criterio que `ingredientParser.extractIngredientsText`, para que el
 * buscador y el detalle nunca discrepen sobre qué cuenta como ingrediente.
 */
export function normalizeIngredients(data: Json): Ingredient[] {
  if (data == null) return [];

  if (Array.isArray(data)) {
    return data.flatMap(normalizeIngredients);
  }

  if (isRecord(data)) {
    const name = asText(data.nombre);
    if (name) {
      const base = asText(data.base).trim().toLowerCase();
      return [{
        qty: asText(data.cantidad),
        name,
        id: asText(data.id) || undefined,
        // Sin `base` explícito, el propio nombre sirve de clave: peor para
        // cruzar recetas, pero permite marcarlo igualmente.
        base: base || name.trim().toLowerCase(),
        valor: asNumero(data.valor),
        unidad: asText(data.unidad).trim().toLowerCase() || null,
      }];
    }
    // Objeto agrupador: bajamos un nivel.
    return Object.values(data).flatMap(normalizeIngredients);
  }

  const text = asText(data);
  if (!text) return [];
  if (esCabeceraDeGrupo(text)) {
    return [{ qty: '', name: text.replace(/^—\s*|\s*—$/g, '').trim(), esGrupo: true }];
  }
  return [{ qty: '', name: text, base: text.trim().toLowerCase() }];
}

/** Aplana el JSONB de pasos a una lista de textos. */
export function normalizeSteps(data: Json): string[] {
  if (data == null) return [];

  if (Array.isArray(data)) {
    return data.flatMap(normalizeSteps);
  }

  if (isRecord(data)) {
    const step = asText(data.texto) || asText(data.paso);
    if (step) return [step];
    return Object.values(data).flatMap(normalizeSteps);
  }

  const text = asText(data);
  return text ? [text] : [];
}

export function hasNotas(notas: Json): boolean {
  if (notas == null) return false;
  if (typeof notas === 'string') return notas.trim().length > 0;
  if (Array.isArray(notas)) return notas.length > 0;
  if (typeof notas === 'object') return Object.keys(notas).length > 0;
  return true;
}

/**
 * Notas a texto plano editable.
 *
 * La columna es JSONB pero la app siempre las ha mostrado aplanadas, así que
 * el editor trabaja sobre el mismo texto que ve el usuario en lugar de sobre
 * un `JSON.stringify` con llaves y comillas.
 */
export function renderNotas(notas: Json): string {
  if (notas == null) return '';
  if (typeof notas === 'string') return notas;
  if (Array.isArray(notas)) return notas.map(renderNotas).filter(Boolean).join('\n');
  if (typeof notas === 'object') {
    return Object.values(notas).map(renderNotas).filter(Boolean).join('\n');
  }
  return String(notas);
}
