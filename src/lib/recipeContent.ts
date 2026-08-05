import type { Json } from '../types';

export interface Ingredient {
  qty: string;
  name: string;
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
      return [{ qty: asText(data.cantidad), name }];
    }
    // Objeto agrupador: bajamos un nivel.
    return Object.values(data).flatMap(normalizeIngredients);
  }

  const text = asText(data);
  return text ? [{ qty: '', name: text }] : [];
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
