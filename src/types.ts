/** Valor arbitrario proveniente de una columna JSONB de Supabase */
export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

export interface Recipe {
  id: string;
  titulo: string;
  categoria: string;
  ingredientes: Json; // JSONB
  pasos: Json; // JSONB
  notas: Json; // JSONB
  rating?: number;
  /** Marca manual del admin; la quita un trigger al registrar una realización. */
  sin_hacer?: boolean;
  /** Código ISO alfa-2 del país de «Mi pasaporte» (`PT`); `null` si no tiene. */
  pais?: string | null;
  /**
   * Vertex ya las extrae al dar de alta, pero hasta el 10 de octubre de 2026
   * se descartaban: `null` en recetas anteriores a esa fecha.
   */
  tiempo?: string | null;
  porciones?: string | null;
  dificultad?: string | null;
  fecha_clase: string;
  foto_url: string;
  pdf_url: string;
  notion_id: string;
  created_at: string;
}

export type Category =
  | 'Todas'
  | 'Sopas/Cremas'
  | 'Carnes'
  | 'Pescados y mariscos'
  | 'Ensaladas'
  | 'Aperitivos'
  | 'Arroces'
  | 'Pastas'
  | 'Postres';

/** Un país visitado de «Mi pasaporte» (tabla `paises`). */
export interface Pais {
  codigo: string;
  nombre: string;
  fecha_viaje: string | null;
  contexto: string | null;
  /** Frase corta bajo el nombre del país en su cabecera. */
  lema: string | null;
  portada_url: string | null;
  /** Receta elegida a mano como plato estrella; `null` usa la mejor valorada. */
  plato_estrella: string | null;
  /** Datos de ficha, escritos a mano; cada uno es opcional. */
  capital: string | null;
  idioma: string | null;
  moneda: string | null;
}

/** Una foto de la galería de un país (tabla `fotos_pais`). */
export interface FotoPais {
  id: string;
  pais: string;
  url: string;
  pie: string | null;
  orden: number;
}

export type FuenteTipo = 'youtube' | 'instagram' | 'web' | 'texto';
export type EstadoCandidata = 'por_probar' | 'probada';

/**
 * Una receta que se quiere probar antes de decidir si entra al recetario (tabla
 * `candidatas`, «El Laboratorio»). Mismo formato JSONB que `Recipe`.
 */
export interface Candidata {
  id: string;
  created_at: string;
  titulo: string;
  categoria: string | null;
  ingredientes: Json;
  pasos: Json;
  notas: Json | null;
  tiempo: string | null;
  porciones: string | null;
  dificultad: string | null;
  fuente_url: string | null;
  fuente_tipo: FuenteTipo;
  estado: EstadoCandidata;
  foto_url: string | null;
  /** Salió de un vídeo, donde las cantidades son menos fiables. */
  de_video: boolean;
}
