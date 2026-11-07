import type { Pase } from '../types';

/** Los pases en el orden en que se sirven, con el título de su sección. */
export const PASES: { id: Pase; titulo: string }[] = [
  { id: 'aperitivo', titulo: 'Aperitivos' },
  { id: 'entrante', titulo: 'Entrantes' },
  { id: 'principal', titulo: 'Platos principales' },
  { id: 'postre', titulo: 'Postres' },
  { id: 'otro', titulo: 'Otros' },
];

/** El pase que se propone al añadir una receta; el usuario puede cambiarlo. */
export function paseSegunCategoria(categoria: string): Pase {
  switch (categoria) {
    case 'Aperitivos':
      return 'aperitivo';
    case 'Sopas/Cremas':
    case 'Ensaladas':
      return 'entrante';
    case 'Arroces':
    case 'Pastas':
    case 'Carnes':
    case 'Pescados y mariscos':
      return 'principal';
    case 'Postres':
      return 'postre';
    default:
      return 'otro';
  }
}
