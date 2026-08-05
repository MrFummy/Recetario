import type { Json, Recipe } from '../types';
import { normalizeIngredients } from './recipeContent';

/**
 * Normalizes a string for search (lowercase, removes accents)
 */
export const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

/**
 * Extracts a flat array of ingredient names from the JSONB field.
 * Delega en `normalizeIngredients` para que el buscador y el detalle de receta
 * interpreten el JSONB exactamente igual.
 */
export const extractIngredientsText = (ingredientes: Json): string[] => {
  return normalizeIngredients(ingredientes).map((item) => item.name);
};

/**
 * Checks if a recipe matches ALL the given search terms
 */
export const recipeMatchesIngredients = (recipe: Recipe, searchTerms: string[]): boolean => {
  if (searchTerms.length === 0) return true;

  const recipeIngredients = extractIngredientsText(recipe.ingredientes);
  const normalizedRecipeIngredients = recipeIngredients.map(normalizeString).join(' ');

  return searchTerms.every(term =>
    normalizedRecipeIngredients.includes(normalizeString(term))
  );
};
