import { useState, useEffect } from 'react';
import { ChefHat, PlusCircle, LogIn, LogOut } from 'lucide-react';
import { FilterBar } from './components/FilterBar';
import { IngredientSearch } from './components/IngredientSearch';
import { RecipeGrid } from './components/RecipeGrid';
import { RecipeDetail } from './components/RecipeDetail';
import { AddRecipeForm } from './components/AddRecipeForm';
import { LoginModal } from './components/LoginModal';
import { useRecipes } from './hooks/useRecipes';
import { useIngredientSearch } from './hooks/useIngredientSearch';
import { supabase } from './lib/supabase';
import type { Category, Recipe } from './types';

const CATEGORIES: Category[] = [
  'Todas', 'Sopas/Cremas', 'Carnes', 'Pescados y mariscos', 
  'Ensaladas', 'Aperitivos', 'Arroces', 'Pastas', 'Postres'
];

function App() {
  const [activeTab, setActiveTab] = useState<'catalogo' | 'nueva'>('catalogo');
  const [activeCategory, setActiveCategory] = useState<Category>('Todas');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const isAdmin = user?.email === 'marcos.garciafdz@gmail.com';

  const { recipes, loading, error, updateRecipeNotes, updateRecipePhoto, updateRecipeRating, deleteRecipe, shareRecipeByEmail } = useRecipes(user);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  
  // Filter by category first
  const categoryFilteredRecipes = recipes.filter(
    (r) => activeCategory === 'Todas' || r.categoria === activeCategory
  );

  // Then filter by ingredients
  const { searchQuery, setSearchQuery, filteredRecipes, matchCount } = useIngredientSearch(categoryFilteredRecipes);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-10 h-10 bg-[var(--color-primary)] text-white rounded-xl flex items-center justify-center transform -rotate-12 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 shadow-sm">
              <ChefHat size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight hidden sm:block">El Recetario de Markis</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl">
              <button 
                onClick={() => setActiveTab('catalogo')}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === 'catalogo' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Catálogo
              </button>
              <button 
                onClick={() => setActiveTab('nueva')}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${activeTab === 'nueva' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <PlusCircle size={16} /> <span className="hidden sm:inline">Nueva</span>
              </button>
            </nav>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg">
                  {isAdmin ? 'Admin' : 'Afan'}
                </span>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors p-2" title="Cerrar Sesión">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="text-gray-500 hover:text-[var(--color-primary)] transition-colors p-2" title="Entrar / Registrarse">
                <LogIn size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
            Error al cargar recetas: {error}
          </div>
        )}

        {activeTab === 'catalogo' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">¿Qué cocinamos hoy?</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Explora tu colección o busca recetas basadas en los ingredientes que tienes a mano.
              </p>
            </div>

            <IngredientSearch 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              matchCount={matchCount} 
            />

            <FilterBar 
              categories={CATEGORIES} 
              activeCategory={activeCategory} 
              onSelectCategory={setActiveCategory} 
            />

            <RecipeGrid 
              recipes={filteredRecipes} 
              onRecipeClick={setSelectedRecipe} 
              loading={loading} 
            />
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-300 pt-4">
            <AddRecipeForm />
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedRecipe && (
        <RecipeDetail 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)}
          isAdmin={isAdmin}
          user={user}
          onUpdateNotes={(notas) => {
            updateRecipeNotes(selectedRecipe.id, notas);
            setSelectedRecipe({...selectedRecipe, notas});
          }}
          onUpdatePhoto={(file) => {
            updateRecipePhoto(selectedRecipe.id, file, selectedRecipe.foto_url);
          }}
          onUpdateRating={(rating) => {
            updateRecipeRating(selectedRecipe.id, rating);
            setSelectedRecipe({...selectedRecipe, rating});
          }}
          onDelete={(recipe) => {
            deleteRecipe(recipe);
            setSelectedRecipe(null);
          }}
          onShareByEmail={(recipe, email) => shareRecipeByEmail(recipe, email)}
        />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          onLoginSuccess={() => setShowLoginModal(false)} 
        />
      )}
    </div>
  );
}

export default App;
