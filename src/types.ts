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
