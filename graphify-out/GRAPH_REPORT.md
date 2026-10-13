# Graph Report - Recetario  (2026-10-13)

## Corpus Check
- 69 files · ~58,491 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 370 nodes · 712 edges · 29 communities (16 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `20f4e631`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Mi Recetario (SPA)
- compilerOptions
- devDependencies
- compilerOptions
- useBusquedaSemantica.ts
- Recipe
- package.json
- indexar-recetas/index.ts
- errorMessage
- 20260805_endurecer_rls.sql
- Q: Por que Supabase JS client with no backend layer aparece semanticamente similar a n8n webhook recipe ingestion?
- public.recetas_embeddings
- Ideas para el Recetario
- buscar-recetas/index.ts
- public.despensa
- tsconfig.json
- App.tsx
- public.recetas
- 20261011_para_hacer_y_realizaciones.sql
- public.recetas

## God Nodes (most connected - your core abstractions)
1. `errorMessage()` - 31 edges
2. `react` - 25 edges
3. `lucide-react` - 20 edges
4. `Recipe` - 20 edges
5. `compilerOptions` - 17 edges
6. `compilerOptions` - 16 edges
7. `normalizeIngredients()` - 15 edges
8. `aHash()` - 15 edges
9. `@supabase/supabase-js` - 13 edges
10. `App()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Mi Recetario (SPA)` --incluye--> `Valoraciones`  [EXTRACTED]
  README.md → src/components/StarRating.tsx
- `Modelo de seguridad` --es_consecuencia_de--> `Arquitectura sin backend`  [INFERRED]
  supabase/migrations/20260805_endurecer_rls.sql → AGENTS.md
- `Mi Recetario (SPA)` --incluye--> `Detalle de receta`  [EXTRACTED]
  README.md → src/components/RecipeDetail.tsx
- `Validacion de JWT en n8n` --verifica_contra--> `Supabase`  [EXTRACTED]
  src/lib/n8n.ts → AGENTS.md
- `n8n` --expone--> `Webhook compartir-receta`  [EXTRACTED]
  README.md → src/lib/n8n.ts

## Import Cycles
- None detected.

## Communities (29 total, 4 thin omitted)

### Community 0 - "Mi Recetario (SPA)"
Cohesion: 0.08
Nodes (33): Arquitectura sin backend, Build estatico para Nginx, Despliegue en Synology, Gmail, Google Drive, Google Sheets, Gotenberg, JSONB heterogeneo (+25 more)

### Community 1 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 2 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/node, @types/react (+5 more)

### Community 3 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 4 - "useBusquedaSemantica.ts"
Cohesion: 0.26
Nodes (8): BusquedaSemantica(), BusquedaSemanticaProps, ReindexarBusqueda(), BusquedaSemantica, useBusquedaSemantica(), buscarSemantico(), reindexarBusqueda(), ResultadoIndexacion

### Community 5 - "Recipe"
Cohesion: 0.08
Nodes (41): AnadirIngrediente(), Props, Props, FilterBar(), FilterBarProps, Props, ModoCocina(), ModoCocinaProps (+33 more)

### Community 6 - "package.json"
Cohesion: 0.06
Nodes (36): dependencies, clsx, lucide-react, react, react-dom, @supabase/supabase-js, tailwind-merge, tailwindcss (+28 more)

### Community 7 - "indexar-recetas/index.ts"
Cohesion: 0.32
Nodes (6): cors, embeberLote(), json(), Receta, textoDe(), trozos()

### Community 8 - "errorMessage"
Cohesion: 0.09
Nodes (43): lucide-react, react, @supabase/supabase-js, AddRecipeForm(), AddRecipeFormProps, LoginModal(), LoginModalProps, formatearFecha() (+35 more)

### Community 10 - "20260805_endurecer_rls.sql"
Cohesion: 0.40
Nodes (5): public.admins, public.es_admin(), public.update_recipe_average_rating(), auth.users, public.valoraciones

### Community 12 - "Q: Por que Supabase JS client with no backend layer aparece semanticamente similar a n8n webhook recipe ingestion?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Por que Supabase JS client with no backend layer aparece semanticamente similar a n8n webhook recipe ingestion?, Source Nodes

### Community 13 - "public.recetas_embeddings"
Cohesion: 0.50
Nodes (4): public, public.buscar_recetas_semantico(), public.recetas_embeddings, public.recetas

### Community 14 - "Ideas para el Recetario"
Cohesion: 0.06
Nodes (34): Búsqueda semántica, Camino feliz, verificado el 8 ago 2026, Empieza por el grafo, Estado actual (23 ago 2026), graphify, Hacia dónde puede crecer, La despensa, La lista de la compra (+26 more)

### Community 15 - "buscar-recetas/index.ts"
Cohesion: 0.50
Nodes (3): cors, embeber(), json()

### Community 20 - "App.tsx"
Cohesion: 0.18
Nodes (20): App(), CATEGORIES, RecetaNoEncontrada(), SoloAdmin(), SeccionDespensa(), IngredientSearch(), IngredientSearchProps, SeccionListaCompra() (+12 more)

### Community 26 - "20261011_para_hacer_y_realizaciones.sql"
Cohesion: 0.33
Nodes (6): public.para_hacer, public.perfiles, auth.users, public.recetas, public.valoraciones, valoraciones_receta_fecha_idx

## Knowledge Gaps
- **133 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+128 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 157 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `errorMessage` to `useBusquedaSemantica.ts`, `App.tsx`, `Recipe`, `package.json`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `errorMessage` to `useBusquedaSemantica.ts`, `App.tsx`, `Recipe`, `package.json`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _133 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Mi Recetario (SPA)` be split into smaller, more focused modules?**
  _Cohesion score 0.07777777777777778 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._