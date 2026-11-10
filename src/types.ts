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
  /** Nombre de quien sugirió la receta desde el buzón, si se incorporó y quiso que lo citaran. */
  sugerida_por?: string | null;
  /** Código ISO alfa-2 del país de «Mi pasaporte» (`PT`); `null` si no tiene. */
  pais?: string | null;
  /**
   * Vertex ya las extrae al dar de alta, pero hasta el 10 de octubre de 2026
   * se descartaban: `null` en recetas anteriores a esa fecha.
   */
  tiempo?: string | null;
  porciones?: string | null;
  /** Raciones de plato como número, para escalar menús; `null` si no se ha estimado. */
  porciones_num?: number | null;
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

/** Los pases de un menú, en el orden en que se sirven. */
export type Pase = 'aperitivo' | 'entrante' | 'principal' | 'postre' | 'otro';

/** Quién puede ver un menú: solo su autor, cualquier usuario con sesión, o cualquiera con el enlace. */
export type Visibilidad = 'privado' | 'afans' | 'enlace';

/** Un menú: recetas para una ocasión, con comensales (tabla `menus`). */
export interface Menu {
  id: string;
  user_id: string;
  visibilidad: Visibilidad;
  nombre: string;
  ocasion: string | null;
  fecha: string | null;
  comensales: number;
  notas: string | null;
  created_at: string;
}

/** Una receta dentro de un menú (tabla `menu_recetas`). */
export interface MenuReceta {
  menu_id: string;
  receta_id: string;
  pase: Pase;
  orden: number;
  /** `null` significa «las del menú», es decir, los comensales. */
  raciones: number | null;
}

/**
 * Lo que devuelve `ver_menu_compartido`: un menú ajeno (o el propio, si está compartido) sin
 * `user_id` —quien abre un enlace no debe saber de quién es la cuenta—, con el nombre del autor
 * solo si quien pregunta tiene sesión.
 */
export interface MenuCompartido {
  menu: Omit<Menu, 'user_id'>;
  es_mio: boolean;
  autor: string | null;
  recetas: Omit<MenuReceta, 'menu_id'>[];
}
