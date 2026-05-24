export interface Recipe {
  id: string;
  titulo: string;
  categoria: string;
  ingredientes: any; // JSONB
  pasos: any; // JSONB
  notas: any; // JSONB
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
