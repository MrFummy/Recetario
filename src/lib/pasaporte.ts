import type { Pais, Recipe } from '../types';
import { nombrePais } from './paises';

/** Un país del pasaporte tal como lo pintan el mapa y la lista. */
export interface PaisVisitado {
  codigo: string;
  nombre: string;
  /** Texto libre («abril de 2024»); `null` si no se ha escrito. */
  fecha: string | null;
  recetas: number;
}

/**
 * Los países del pasaporte: los dados de alta en `paises` más los que tienen alguna
 * receta etiquetada aunque no estén dados de alta (etiquetar una receta no exige
 * crear el país antes). Ordenados por nombre.
 */
export function paisesVisitados(paises: Pais[], recetas: Recipe[]): PaisVisitado[] {
  const mapa = new Map<string, PaisVisitado>();

  for (const p of paises) {
    mapa.set(p.codigo, { codigo: p.codigo, nombre: p.nombre, fecha: p.fecha_viaje, recetas: 0 });
  }
  for (const r of recetas) {
    if (!r.pais) continue;
    const actual = mapa.get(r.pais)
      ?? { codigo: r.pais, nombre: nombrePais(r.pais), fecha: null, recetas: 0 };
    mapa.set(r.pais, { ...actual, recetas: actual.recetas + 1 });
  }

  return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

/** Cuántas fotos ambientan la cabecera de un país; el resto de la galería solo se gestiona. */
export const FOTOS_CABECERA = 3;

/** El plato estrella de un país y si lo eligió el admin o salió del respaldo. */
export interface PlatoEstrella {
  receta: Recipe;
  elegido: boolean;
}

/**
 * La elegida a mano si sigue entre las recetas del país; si no, la mejor valorada y, en
 * empate o sin valoraciones, la de fecha más reciente. `null` si el país no tiene recetas.
 */
export function platoEstrella(recetas: Recipe[], elegidaId: string | null | undefined): PlatoEstrella | null {
  const elegida = elegidaId ? recetas.find((r) => r.id === elegidaId) : undefined;
  if (elegida) return { receta: elegida, elegido: true };

  const mejor = [...recetas].sort((a, b) =>
    (b.rating ?? 0) - (a.rating ?? 0) || b.fecha_clase.localeCompare(a.fecha_clase))[0];
  return mejor ? { receta: mejor, elegido: false } : null;
}
