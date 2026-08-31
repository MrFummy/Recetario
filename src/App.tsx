import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { ChefHat, PlusCircle, LogIn, LogOut, ShoppingBasket } from 'lucide-react';
import { FilterBar } from './components/FilterBar';
import { IngredientSearch } from './components/IngredientSearch';
import { RecipeGrid } from './components/RecipeGrid';
import { RecipeDetail } from './components/RecipeDetail';
import { AddRecipeForm } from './components/AddRecipeForm';
import { LoginModal } from './components/LoginModal';
import { RecetaNoEncontrada, SoloAdmin } from './components/Avisos';
import { SeccionDespensa } from './components/DespensaSection';
import { useRecipes } from './hooks/useRecipes';
import { useDespensa } from './hooks/useDespensa';
import { useIngredientSearch } from './hooks/useIngredientSearch';
import { useRuta, irA, reemplazarPor, volverAtras } from './hooks/useRuta';
import { aHash, CATALOGO } from './lib/rutas';
import { supabase } from './lib/supabase';
import { errorMessage } from './lib/errors';
import type { Category } from './types';

const CATEGORIES: Category[] = [
  'Todas', 'Sopas/Cremas', 'Carnes', 'Pescados y mariscos',
  'Ensaladas', 'Aperitivos', 'Arroces', 'Pastas', 'Postres',
];

function App() {
  const ruta = useRuta();
  const [activeCategory, setActiveCategory] = useState<Category>('Todas');

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  // `getSession` es asíncrono: hasta que resuelve no sabemos si hay admin. Sin
  // esto, entrar directo a #/nueva enseña "acceso denegado" y un instante
  // después el formulario, que parece un fallo de permisos y no lo es.
  const [sesionCargada, setSesionCargada] = useState(false);
  // Ojo: esto solo decide qué botones se pintan. La autorización real vive en
  // las RLS policies de Supabase y en la validación del flujo de n8n.
  const isAdmin = user?.email === 'marcos.garciafdz@gmail.com';

  const {
    recipes, loading, error, refetch,
    updateRecipeNotes, updateRecipePhoto, removeRecipePhoto, updateRecipeRating, updateRecipeDate,
    deleteRecipe, shareRecipeByEmail,
  } = useRecipes(user);

  // Una sola despensa para toda la app: la sección y las listas de ingredientes
  // de cada receta son la misma cosa vista desde dos sitios.
  const despensa = useDespensa(user);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setSesionCargada(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user || null)
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(errorMessage(error, 'No se pudo cerrar la sesión.'));
      return;
    }
    setAuthError(null);
    irA(CATALOGO);
  };

  const categoryFilteredRecipes = recipes.filter(
    (r) => activeCategory === 'Todas' || r.categoria === activeCategory
  );
  const { searchQuery, setSearchQuery, filteredRecipes, matchCount } =
    useIngredientSearch(categoryFilteredRecipes);

  // La ficha abierta sale de la URL y no de un estado aparte: así un enlace a
  // #/receta/… la abre igual que un clic, y las ediciones se reflejan solas
  // porque `useRecipes` ya mantiene su lista al día tras cada cambio.
  const recetaAbierta = ruta.vista === 'receta'
    ? recipes.find((r) => r.id === ruta.id) ?? null
    : null;
  const enNueva = ruta.vista === 'nueva';
  const enDespensa = ruta.vista === 'despensa';
  // El catálogo queda detrás de la ficha abierta, como hasta ahora.
  const enCatalogo = !enNueva && !enDespensa;

  return (
    <div className="min-h-screen pb-20">
      {/* ═════ Header ═════════════════════════════════════ */}
      <header className="bg-paper/85 backdrop-blur-md sticky top-0 z-30 border-b border-dashed border-ink/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <a href={aHash(CATALOGO)} className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-ink text-paper rounded-lg flex items-center justify-center
                            -rotate-3 group-hover:rotate-6 transition-transform duration-300
                            shadow-[3px_3px_0_var(--color-yellow)]">
              <ChefHat size={22} strokeWidth={2.2} />
            </div>
            <h1 className="font-script text-2xl sm:text-3xl leading-none">
              El Recetario de <span className="text-accent font-bold">Markis</span>
            </h1>
          </a>

          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1">
              <a
                href={aHash(CATALOGO)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${enCatalogo
                  ? 'bg-ink text-paper'
                  : 'text-ink hover:bg-ink/5'
                  }`}
              >
                Catálogo
              </a>
              <a
                href={aHash({ vista: 'despensa' })}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-1.5 ${enDespensa
                  ? 'bg-ink text-paper'
                  : 'text-ink hover:bg-ink/5'
                  }`}
              >
                <ShoppingBasket size={16} />
                <span className="hidden sm:inline">Despensa</span>
                {despensa.total > 0 && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm bg-yellow text-ink">
                    {despensa.total}
                  </span>
                )}
              </a>
              {isAdmin && (
                <a
                  href={aHash({ vista: 'nueva' })}
                  className={`px-4 py-2 text-sm font-bold rounded-md transition-transform flex items-center gap-1.5 ${enNueva
                    ? 'bg-yellow text-ink -rotate-1 shadow-brut'
                    : 'text-ink hover:bg-ink/5'
                    }`}
                >
                  <PlusCircle size={16} />
                  <span className="hidden sm:inline">Nueva</span>
                </a>
              )}
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

        {authError && (
          <div className="bg-hot-soft border-2 border-hot text-hot p-4 rounded-md mb-6 font-mono text-sm">
            {authError}
          </div>
        )}

        {enNueva ? (
          <SoloAdmin sesionCargada={sesionCargada} isAdmin={isAdmin}>
            <AddRecipeForm onSuccess={() => void refetch()} />
          </SoloAdmin>
        ) : enDespensa ? (
          <SeccionDespensa recipes={recipes} despensa={despensa} user={user} />
        ) : (
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
                Explora el recetario o busca por ingredientes. Sin algoritmos sospechosos,
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
              onRecipeClick={(recipe) => irA({ vista: 'receta', id: recipe.id })}
              loading={loading}
            />
          </div>
        )}
      </main>

      {/* ═════ Modales ═════════════════════════════════════ */}
      {recetaAbierta && (
        <RecipeDetail
          recipe={recetaAbierta}
          onClose={volverAtras}
          isAdmin={isAdmin}
          user={user}
          despensa={despensa}
          onUpdateNotes={(notas) => updateRecipeNotes(recetaAbierta.id, notas)}
          onUpdateDate={(fecha) => updateRecipeDate(recetaAbierta.id, fecha)}
          onUpdatePhoto={(file) => updateRecipePhoto(recetaAbierta.id, file, recetaAbierta.foto_url)}
          onRemovePhoto={() => removeRecipePhoto(recetaAbierta.id, recetaAbierta.foto_url)}
          onUpdateRating={(rating) => updateRecipeRating(recetaAbierta.id, rating)}
          onDelete={async (recipe) => {
            await deleteRecipe(recipe);
            // Pisamos la entrada del historial: el atrás no debe devolver a una
            // ficha que acabamos de borrar.
            reemplazarPor(CATALOGO);
          }}
          onShareByEmail={(recipe, email) => shareRecipeByEmail(recipe, email)}
        />
      )}

      {/* Enlace a una receta que ya no está, o con el id mal copiado. */}
      {ruta.vista === 'receta' && !recetaAbierta && !loading && <RecetaNoEncontrada />}

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
