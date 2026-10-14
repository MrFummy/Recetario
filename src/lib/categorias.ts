import type { Category } from '../types';

/** Las categorías reales de una receta (sin el «Todas» del filtro). */
export const CATEGORIAS: Exclude<Category, 'Todas'>[] = [
  'Sopas/Cremas', 'Carnes', 'Pescados y mariscos',
  'Ensaladas', 'Aperitivos', 'Arroces', 'Pastas', 'Postres',
];
