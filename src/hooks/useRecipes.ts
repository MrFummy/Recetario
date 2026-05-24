import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Recipe } from '../types';

export function useRecipes(user?: any) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('recetas')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setRecipes(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []);

  const updateRecipeNotes = async (id: string, notas: any) => {
    const { error } = await supabase
      .from('recetas')
      .update({ notas })
      .eq('id', id);
    if (error) throw error;
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, notas } : r));
  };

  const updateRecipeRating = async (id: string, rating: number) => {
    if (!user) {
      alert("Debes iniciar sesión para votar");
      return;
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
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `fotos/${fileName}`;

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
    // LLamar al webhook de n8n
    const response = await fetch('https://n8n.emtel.cloud/webhook/eliminar-receta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supabase_id: recipe.id,
        titulo: recipe.titulo,
        foto_url: recipe.foto_url,
        pdf_url: recipe.pdf_url,
        notion_id: recipe.notion_id
      })
    });

    if (!response.ok && response.type !== 'opaque') {
      throw new Error('Error al conectar con la automatización de borrado.');
    }

    // Borrar localmente del estado para que desaparezca de la vista inmediatamente
    setRecipes(prev => prev.filter(r => r.id !== recipe.id));
  };

  const shareRecipeByEmail = async (recipe: Recipe, email_destino: string) => {
    const response = await fetch('https://n8n.emtel.cloud/webhook/compartir-receta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_destino,
        recipe: {
          id: recipe.id,
          titulo: recipe.titulo,
          foto_url: recipe.foto_url,
          pdf_url: recipe.pdf_url,
          notion_id: recipe.notion_id
        }
      })
    });

    if (!response.ok && response.type !== 'opaque') {
      throw new Error('Error al conectar con la automatización de envío por email.');
    }
  };

  return { 
    recipes, 
    loading, 
    error, 
    updateRecipeNotes, 
    updateRecipeRating, 
    updateRecipePhoto,
    deleteRecipe,
    shareRecipeByEmail
  };
}
