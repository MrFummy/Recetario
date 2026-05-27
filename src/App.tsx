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
  'Ensaladas', 'Aperitivos', 'Arroces', 'Pastas', 'Postres',
];

function App() {
  const [activeTab, setActiveTab] = useState<'catalogo' | 'nueva'>('catalogo');
  const [activeCategory, setActiveCategory] = useState<Category>('Todas');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const isAdmin = user?.email === 'marcos.garciafdz@gmail.com';

  const {
    recipes, loading, error,
    updateRecipeNotes, updateRecipePhoto, updateRecipeRating,
    deleteRecipe, shareRecipeByEmail,
  } = useRecipes(user);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user || null)
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const categoryFilteredRecipes = recipes.filter(
    (r) => activeCategory === 'Todas' || r.categoria === activeCategory
  );
  const { searchQuery, setSearchQuery, filteredRecipes, matchCount } =
    useIngredientSearch(categoryFilteredRecipes);

  return (
    <div className="min-h-screen pb-20">
      {/* ═════ Header ═════════════════════════════════════ */}
      <header className="bg-paper/85 backdrop-blur-md sticky top-0 z-30 border-b border-dashed border-ink/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-10 h-10 bg-ink text-paper rounded-lg flex items-center justify-center
                            -rotate-3 group-hover:rotate-6 transition-transform duration-300
                            shadow-[3px_3px_0_var(--color-yellow)]">
              <ChefHat size={22} strokeWidth={2.2} />
            </div>
            <h1 className="font-script text-2xl sm:text-3xl leading-none">
              El Recetario de <span className="text-accent font-bold">Markis</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('catalogo')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'catalogo'
                  ? 'bg-ink text-paper'
                  : 'text-ink hover:bg-ink/5'
                  }`}
              >
                Catálogo
              </button>
              <button
                onClick={() => setActiveTab('nueva')}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-transform flex items-center gap-1.5 ${activeTab === 'nueva'
                  ? 'bg-yellow text-ink -rotate-1 shadow-brut'
                  : 'text-ink hover:bg-ink/5'
                  }`}
              >
                <PlusCircle size={16} />
                <span className="hidden sm:inline">Nueva</span>
              </button>
            </nav>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block px-2 py-1 bg-accent-soft text-accent text-[10px] font-mono uppercase tracking-wider rounded-sm">
                  {isAdmin ? 'admin' : 'afan'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-ink-soft hover:text-hot transition-colors p-2"
                  title="Cerrar sesión"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-ink-soft hover:text-accent transition-colors p-2"
                title="Entrar / Registrarse"
              >
                <LogIn size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ═════ Main ═══════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {error && (
          <div className="bg-hot-soft border-2 border-hot text-hot p-4 rounded-md mb-6 font-mono text-sm">
            Error al cargar recetas: {error}
          </div>
        )}

        {activeTab === 'catalogo' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ── Hero ───────────────────────────────────── */}
            <div className="text-center mb-10 relative">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase text-accent mb-4">
                <span className="w-2 h-2 rounded-full bg-hot dot-blink" />
                cocinando.exe · {recipes.length} recetas en local
              </div>
              <h2 className="font-display font-black text-5xl sm:text-7xl leading-[0.98] tracking-tight text-ink mb-3 max-w-3xl mx-auto">
                ¿Qué cocinamos <span className="hl-mark">hoy?</span>{' '}
                <span className="font-script font-bold text-accent -rotate-2 inline-block text-[0.85em]">
                  by un chef novato
                </span>
              </h2>
              <p className="text-base sm:text-lg text-ink-soft max-w-xl mx-auto leading-relaxed">
                Explorá el recetario o busca por ingredientes. Sin algoritmos sospechosos,
                sin ads, sin "primero te cuento la historia de mi abuela".
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

      {/* ═════ Modales ═════════════════════════════════════ */}
      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          isAdmin={isAdmin}
          user={user}
          onUpdateNotes={(notas) => {
            updateRecipeNotes(selectedRecipe.id, notas);
            setSelectedRecipe({ ...selectedRecipe, notas });
          }}
          onUpdatePhoto={(file) => {
            updateRecipePhoto(selectedRecipe.id, file, selectedRecipe.foto_url);
          }}
          onUpdateRating={(rating) => {
            updateRecipeRating(selectedRecipe.id, rating);
            setSelectedRecipe({ ...selectedRecipe, rating });
          }}
          onDelete={(recipe) => {
            deleteRecipe(recipe);
            setSelectedRecipe(null);
          }}
          onShareByEmail={(recipe, email) => shareRecipeByEmail(recipe, email)}
        />
      )}

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
