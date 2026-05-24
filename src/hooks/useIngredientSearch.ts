import { useState, useMemo } from 'react';
import type { Recipe } from '../types';
import { recipeMatchesIngredients } from '../lib/ingredientParser';

export function useIngredientSearch(recipes: Recipe[]) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return recipes;

    // Split by comma and clean up terms
    const searchTerms = searchQuery
      .split(',')
      .map(term => term.trim())
      .filter(term => term.length > 0);

    return recipes.filter(recipe => recipeMatchesIngredients(recipe, searchTerms));
  }, [recipes, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredRecipes,
    matchCount: filteredRecipes.length
  };
}
