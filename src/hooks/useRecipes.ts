import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { N8N_WEBHOOKS, postToWebhook } from '../lib/n8n';
import { errorMessage, idUnico } from '../lib/errors';
import type { Json, Recipe } from '../types';

export function useRecipes(user?: User | null) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reloadToken, setReloadToken] = useState(0);

  // Las RLS pueden devolver filas o columnas distintas según el rol, así que el
  // catálogo se recarga cuando cambia la sesión (login / logout).
  const userId = user?.id;

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    // `active` descarta la respuesta de una carga que ya quedó obsoleta (p. ej.
    // el usuario inicia sesión mientras la petición anónima sigue en vuelo).
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('recetas')
        .select('*')
        .order('created_at', { ascending: false });

      if (!active) return;

      if (error) {
        setError(errorMessage(error, 'No se pudieron cargar las recetas.'));
      } else {
        setRecipes(data || []);
      }
      setLoading(false);
    }

    void load();

    return () => { active = false; };
  }, [userId, reloadToken]);

  const updateRecipeNotes = async (id: string, notas: Json) => {
    const { error } = await supabase
      .from('recetas')
      .update({ notas })
      .eq('id', id);
    if (error) throw error;
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, notas } : r));
  };

  const updateRecipeDate = async (id: string, fecha: string) => {
    const { error } = await supabase
      .from('recetas')
      .update({ fecha_clase: fecha })
      .eq('id', id);
    if (error) throw error;
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, fecha_clase: fecha } : r));
  };

  const updateRecipeRating = async (id: string, rating: number) => {
    if (!user) {
      throw new Error('Debes iniciar sesión para votar.');
    }

    const { error } = await supabase
      .from('valoraciones')
      .upsert({ receta_id: id, user_id: user.id, puntuacion: rating }, { onConflict: 'receta_id,user_id' });

    if (error) throw error;

    // Recargar la media calculada por el trigger
    const { data } = await supabase.from('recetas').select('rating').eq('id', id).single();
    if (data) {
       setRecipes(prev => prev.map(r => r.id === id ? { ...r, rating: data.rating } : r));
    }
  };

  const updateRecipePhoto = async (id: string, newPhoto: File, oldPhotoUrl?: string) => {
    // 1. Upload new photo
    const fileExt = newPhoto.name.split('.').pop();
    const filePath = `fotos/${idUnico()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('fotos-recetas')
      .upload(filePath, newPhoto);
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('fotos-recetas')
      .getPublicUrl(filePath);

    // 2. Delete old photo if exists
    if (oldPhotoUrl) {
      const oldPathMatch = oldPhotoUrl.match(/fotos-recetas\/(.*)$/);
      if (oldPathMatch && oldPathMatch[1]) {
        await supabase.storage
          .from('fotos-recetas')
          .remove([oldPathMatch[1]]);
      }
    }

    // 3. Update database
    const { error: updateError } = await supabase
      .from('recetas')
      .update({ foto_url: publicUrl })
      .eq('id', id);

    if (updateError) throw updateError;
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, foto_url: publicUrl } : r));
  };

  const deleteRecipe = async (recipe: Recipe) => {
    // Llamar al webhook de n8n. Si falla, `postToWebhook` lanza y la receta
    // sigue en pantalla: nunca la quitamos de la vista sin confirmación.
    await postToWebhook(
      N8N_WEBHOOKS.eliminarReceta,
      JSON.stringify({
        supabase_id: recipe.id,
        titulo: recipe.titulo,
        foto_url: recipe.foto_url,
        pdf_url: recipe.pdf_url,
        notion_id: recipe.notion_id,
      }),
      'borrado',
      true
    );

    setRecipes(prev => prev.filter(r => r.id !== recipe.id));
  };

  const shareRecipeByEmail = async (recipe: Recipe, email_destino: string) => {
    await postToWebhook(
      N8N_WEBHOOKS.compartirReceta,
      JSON.stringify({
        email_destino,
        recipe: {
          id: recipe.id,
          titulo: recipe.titulo,
          foto_url: recipe.foto_url,
          pdf_url: recipe.pdf_url,
          notion_id: recipe.notion_id,
        },
      }),
      'envío por email',
      true
    );
  };

  return {
    recipes,
    loading,
    error,
    refetch,
    updateRecipeNotes,
    updateRecipeRating,
    updateRecipePhoto,
    updateRecipeDate,
    deleteRecipe,
    shareRecipeByEmail
  };
}
