import type { Recipe } from '../types';

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
 * Extracts a flat array of ingredient names from the JSONB field
 * Supports various formats: array of strings, array of objects, nested objects
 */
export const extractIngredientsText = (ingredientes: any): string[] => {
  if (!ingredientes) return [];
  
  let flatList: string[] = [];

  const processItem = (item: any) => {
    if (typeof item === 'string') {
      flatList.push(item);
    } else if (Array.isArray(item)) {
      item.forEach(processItem);
    } else if (typeof item === 'object' && item !== null) {
      if (item.nombre) {
        flatList.push(item.nombre);
      } else {
        // Nested object (e.g. { "Para la salsa": [...] })
        Object.values(item).forEach(processItem);
      }
    }
  };

  processItem(ingredientes);
  return flatList;
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
