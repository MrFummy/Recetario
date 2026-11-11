import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { FilterBar } from './components/FilterBar';
import { IngredientSearch } from './components/IngredientSearch';
import { RecipeGrid } from './components/RecipeGrid';
import { RecipeDetail } from './components/RecipeDetail';
import { AddRecipeForm } from './components/AddRecipeForm';
import { LoginModal } from './components/LoginModal';
import { NuevaClaveModal } from './components/NuevaClaveModal';
import { ReindexarBusqueda } from './components/ReindexarBusqueda';
import { RecetaNoEncontrada, SoloAdmin, SoloLogueados } from './components/Avisos';
import { SeccionDespensa } from './components/DespensaSection';
import { SeccionListaCompra } from './components/ListaCompraSection';
import { SeccionLaboratorio } from './components/LaboratorioSection';
import { SeccionPasaporte } from './components/PasaporteSection';
import { SeccionMenus } from './components/MenusSection';
import { SeccionCuenta } from './components/CuentaSection';
import { SeccionBuzon } from './components/BuzonSection';
import { Cabecera } from './components/Cabecera';
import { PortadaCatalogo } from './components/PortadaCatalogo';
import { useRecipes } from './hooks/useRecipes';
import { useDespensa } from './hooks/useDespensa';
import { useParaHacer } from './hooks/useParaHacer';
import { useIngredientSearch } from './hooks/useIngredientSearch';
import { useBusquedaSemantica } from './hooks/useBusquedaSemantica';
import { useRuta, irA, reemplazarPor, volverAtras } from './hooks/useRuta';
import { CATALOGO } from './lib/rutas';
import { supabase, LLEGA_DE_RECUPERACION, ENLACE_CADUCADO } from './lib/supabase';
import { errorMessage } from './lib/errors';
import type { Category } from './types';

const CATEGORIES: Category[] = [
  'Todas', 'Sopas/Cremas', 'Carnes', 'Pescados y mariscos',
  'Ensaladas', 'Aperitivos', 'Arroces', 'Pastas', 'Postres',
];

function App() {
  const ruta = useRuta();
  const [activeCategory, setActiveCategory] = useState<Category>('Todas');
  const [soloSinHacer, setSoloSinHacer] = useState(false);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authError, setAuthError] = useState<string | null>(
    ENLACE_CADUCADO ? 'El enlace ha caducado o ya se usó. Pide otro desde «¿Olvidaste tu contraseña?».' : null,
  );
  // Se abre al llegar por el enlace del correo de «restablecer contraseña».
  const [eligiendoClave, setEligiendoClave] = useState(LLEGA_DE_RECUPERACION);
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
    updateRecipeNotes, updateRecipePhoto, removeRecipePhoto, refrescarRating, updateSinHacer, updateRecipeDate, updateRecipePais,
    deleteRecipe, shareRecipeByEmail,
  } = useRecipes(user);

  // Una sola despensa para toda la app: la sección y las listas de ingredientes
  // de cada receta son la misma cosa vista desde dos sitios.
  const despensa = useDespensa(user);
  // Igual que la despensa: la ficha y la lista de la compra comparten la misma.
  const paraHacer = useParaHacer(user);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setSesionCargada(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (evento, session) => {
        setUser(session?.user || null);
        if (evento === 'PASSWORD_RECOVERY') setEligiendoClave(true);
      }
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
    (r) => (activeCategory === 'Todas' || r.categoria === activeCategory)
      && (!soloSinHacer || r.sin_hacer)
  );
  const totalSinHacer = recipes.filter((r) => r.sin_hacer).length;
  const { searchQuery, setSearchQuery, filteredRecipes, matchCount } =
    useIngredientSearch(categoryFilteredRecipes);
  const semantica = useBusquedaSemantica(recipes);

  // La ficha abierta sale de la URL y no de un estado aparte: así un enlace a
  // #/receta/… la abre igual que un clic, y las ediciones se reflejan solas
  // porque `useRecipes` ya mantiene su lista al día tras cada cambio.
  const recetaAbierta = ruta.vista === 'receta'
    ? recipes.find((r) => r.id === ruta.id) ?? null
    : null;
  const enNueva = ruta.vista === 'nueva';
  const enDespensa = ruta.vista === 'despensa';
  const enListaCompra = ruta.vista === 'lista-compra';
  const enLaboratorio = ruta.vista === 'laboratorio';
  const enPasaporte = ruta.vista === 'pasaporte' || ruta.vista === 'pais';
  const enMenus = ruta.vista === 'menus' || ruta.vista === 'menu';
  const enCuenta = ruta.vista === 'cuenta' || ruta.vista === 'buzon';
  // El catálogo queda detrás de la ficha abierta, como hasta ahora.
  const enCatalogo = !enNueva && !enDespensa && !enListaCompra && !enLaboratorio && !enPasaporte && !enMenus && !enCuenta;

  return (
    <div className="min-h-screen pb-20 print:min-h-0 print:pb-0">
      <Cabecera
        nav={{
          enCatalogo, enDespensa, enListaCompra, enLaboratorio, enPasaporte, enMenus, enNueva,
          totalDespensa: despensa.total, isAdmin, logueado: !!user,
        }}
        logueado={!!user}
        enCuenta={enCuenta}
        onLogin={() => setShowLoginModal(true)}
        onLogout={() => void handleLogout()}
      />

      {/* ═════ Main ═══════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 print:mt-0 print:p-0 print:max-w-none">
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
          <SoloLogueados sesionCargada={sesionCargada} logueado={!!user} seccion="tu despensa" onLogin={() => setShowLoginModal(true)}>
            <SeccionDespensa recipes={recipes} despensa={despensa} user={user} />
          </SoloLogueados>
        ) : enListaCompra ? (
          <SoloLogueados sesionCargada={sesionCargada} logueado={!!user} seccion="la lista de la compra" onLogin={() => setShowLoginModal(true)}>
            <SeccionListaCompra recipes={recipes} despensa={despensa} paraHacer={paraHacer} />
          </SoloLogueados>
        ) : ruta.vista === 'buzon' ? (
          <SoloLogueados sesionCargada={sesionCargada} logueado={!!user} seccion="el buzón de sugerencias" onLogin={() => setShowLoginModal(true)}>
            {user && <SeccionBuzon user={user} isAdmin={isAdmin} recipes={recipes} />}
          </SoloLogueados>
        ) : ruta.vista === 'cuenta' ? (
          <SoloLogueados sesionCargada={sesionCargada} logueado={!!user} seccion="tu cuenta" onLogin={() => setShowLoginModal(true)}>
            {user && <SeccionCuenta user={user} isAdmin={isAdmin} onLogout={() => void handleLogout()} />}
          </SoloLogueados>
        ) : ruta.vista === 'menu' ? (
          // Sin SoloLogueados: un menú compartido por enlace se abre sin cuenta. Qué se ve lo decide
          // la base de datos; si no hay nada que enseñar, el propio componente lo dice.
          <SeccionMenus ruta={ruta} recipes={recipes} despensa={despensa} user={user} />
        ) : ruta.vista === 'menus' ? (
          <SoloLogueados sesionCargada={sesionCargada} logueado={!!user} seccion="tus menús" onLogin={() => setShowLoginModal(true)}>
            <SeccionMenus ruta={ruta} recipes={recipes} despensa={despensa} user={user} />
          </SoloLogueados>
        ) : (ruta.vista === 'pasaporte' || ruta.vista === 'pais') ? (
          <SoloLogueados sesionCargada={sesionCargada} logueado={!!user} seccion="el pasaporte" onLogin={() => setShowLoginModal(true)}>
            <SeccionPasaporte ruta={ruta} recipes={recipes} loadingRecetas={loading} isAdmin={isAdmin} onRecetasCambiadas={() => void refetch()} />
          </SoloLogueados>
        ) : enLaboratorio ? (
          <SoloAdmin sesionCargada={sesionCargada} isAdmin={isAdmin} accion="entrar en El Laboratorio">
            <SeccionLaboratorio onRecetaCreada={() => void refetch()} />
          </SoloAdmin>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PortadaCatalogo
              recipes={recipes}
              compacta={!!searchQuery.trim() || !!semantica.resultado || activeCategory !== 'Todas' || soloSinHacer}
            />

            <IngredientSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              matchCount={matchCount}
              semantica={semantica}
              user={user}
            />

            <FilterBar
              categories={CATEGORIES}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              soloSinHacer={soloSinHacer}
              onToggleSinHacer={() => setSoloSinHacer((v) => !v)}
              totalSinHacer={totalSinHacer}
            />

            <RecipeGrid
              recipes={semantica.resultado ?? filteredRecipes}
              onRecipeClick={(recipe) => irA({ vista: 'receta', id: recipe.id })}
              loading={loading}
            />

            {isAdmin && <ReindexarBusqueda />}
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
          paraHacer={paraHacer}
          onUpdateNotes={(notas) => updateRecipeNotes(recetaAbierta.id, notas)}
          onUpdateDate={(fecha) => updateRecipeDate(recetaAbierta.id, fecha)}
          onUpdatePais={(pais) => updateRecipePais(recetaAbierta.id, pais)}
          onUpdatePhoto={(file) => updateRecipePhoto(recetaAbierta.id, file, recetaAbierta.foto_url)}
          onRemovePhoto={() => removeRecipePhoto(recetaAbierta.id, recetaAbierta.foto_url)}
          onToggleSinHacer={() => updateSinHacer(recetaAbierta.id, !recetaAbierta.sin_hacer)}
          onRatingChanged={() => void refrescarRating(recetaAbierta.id)}
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
      {eligiendoClave && <NuevaClaveModal onClose={() => setEligiendoClave(false)} />}
    </div>
  );
}

export default App;
