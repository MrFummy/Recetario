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
