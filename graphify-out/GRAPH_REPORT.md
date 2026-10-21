# Graph Report - Recetario  (2026-10-21)

## Corpus Check
- 106 files · ~81,815 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .example 1, .ico 1)

## Summary
- 549 nodes · 1144 edges · 52 communities (31 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `33f2e4f3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Mi Recetario (SPA)
- compilerOptions
- devDependencies
- compilerOptions
- tiempos.ts
- Recipe
- package.json
- indexar-recetas/index.ts
- errorMessage
- 20260805_endurecer_rls.sql
- Q: Por que Supabase JS client with no backend layer aparece semanticamente similar a n8n webhook recipe ingestion?
- public.recetas_embeddings
- Recetas candidatas — plan
- buscar-recetas/index.ts
- public.despensa
- tsconfig.json
- App.tsx
- RecipeDetail.tsx
- public.recetas
- 20261011_para_hacer_y_realizaciones.sql
- public.recetas
- public.busquedas_uso
- 20261014_sin_hacer.sql
- deploy.sh script
- public.recetas
- types.ts
- Mi Recetario — contexto del proyecto
- generar-mapamundi.mjs
- 20261015_pasaporte.sql
- 20261014_laboratorio_candidatas.sql
- Ideas para el Recetario
- Mi pasaporte — plan
- Estado actual (23 ago 2026)
- Seguimiento del proyecto
- public.paises
- LaboratorioSection.tsx
- dependencies
- scripts
- Fase 0 — experimento (media tarde, antes de construir nada)
- vite.config.ts

## God Nodes (most connected - your core abstractions)
1. `errorMessage()` - 47 edges
2. `react` - 38 edges
3. `lucide-react` - 32 edges
4. `Recipe` - 25 edges
5. `aHash()` - 23 edges
6. `normalizeIngredients()` - 19 edges
7. `compilerOptions` - 17 edges
8. `compilerOptions` - 16 edges
9. `@supabase/supabase-js` - 14 edges
10. `irA()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Mi Recetario (SPA)` --incluye--> `Valoraciones`  [EXTRACTED]
  README.md → src/components/StarRating.tsx
- `Modelo de seguridad` --es_consecuencia_de--> `Arquitectura sin backend`  [INFERRED]
  supabase/migrations/20260805_endurecer_rls.sql → AGENTS.md
- `Mi Recetario (SPA)` --incluye--> `Detalle de receta`  [EXTRACTED]
  README.md → src/components/RecipeDetail.tsx
- `n8n` --expone--> `Webhook compartir-receta`  [EXTRACTED]
  README.md → src/lib/n8n.ts
- `n8n` --expone--> `Webhook eliminar-receta`  [EXTRACTED]
  README.md → src/lib/n8n.ts

## Import Cycles
- None detected.

## Communities (52 total, 9 thin omitted)

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

### Community 4 - "tiempos.ts"
Cohesion: 0.21
Nodes (12): PasoConTiempos(), PasoConTiemposProps, aNumero(), detectarTiempos(), formatearDuracion(), Fragmento, NUM, NUMEROS_EN_LETRAS (+4 more)

### Community 5 - "Recipe"
Cohesion: 0.12
Nodes (28): AnadirIngrediente(), Props, Props, SeccionDespensa(), Props, Props, RecipeCard(), RecipeCardProps (+20 more)

### Community 6 - "package.json"
Cohesion: 0.12
Nodes (18): name, private, type, version, clsx, eslint, @eslint/js, eslint-plugin-react-hooks (+10 more)

### Community 7 - "indexar-recetas/index.ts"
Cohesion: 0.32
Nodes (6): cors, embeberLote(), json(), Receta, textoDe(), trozos()

### Community 8 - "errorMessage"
Cohesion: 0.07
Nodes (49): lucide-react, react, @supabase/supabase-js, AddRecipeForm(), AddRecipeFormProps, ejecutar(), IngredientSearch(), IngredientSearchProps (+41 more)

### Community 10 - "20260805_endurecer_rls.sql"
Cohesion: 0.40
Nodes (5): public.admins, public.es_admin(), public.update_recipe_average_rating(), auth.users, public.valoraciones

### Community 12 - "Q: Por que Supabase JS client with no backend layer aparece semanticamente similar a n8n webhook recipe ingestion?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Por que Supabase JS client with no backend layer aparece semanticamente similar a n8n webhook recipe ingestion?, Source Nodes

### Community 13 - "public.recetas_embeddings"
Cohesion: 0.50
Nodes (4): public, public.buscar_recetas_semantico(), public.recetas_embeddings, public.recetas

### Community 14 - "Recetas candidatas — plan"
Cohesion: 0.20
Nodes (10): Abierto, Decisiones tomadas, Después, si apetece, Fase 1 — base de datos (migración) — HECHA el 14 oct 2026, Fase 2 — flujo de entrada en n8n (Telegram + YouTube) — HECHA y probada con YouTube (14 oct 2026), Fase 3 — sección web — HECHA (versión sencilla, 14 oct 2026), Fase 4 — incorporar al recetario — HECHA y probada de punta a punta (14 oct 2026), Fase 5 — entrada de reels (aparcada) (+2 more)

### Community 15 - "buscar-recetas/index.ts"
Cohesion: 0.50
Nodes (3): cors, embeber(), json()

### Community 20 - "App.tsx"
Cohesion: 0.15
Nodes (26): App(), CATEGORIES, AltaPais(), RecetaNoEncontrada(), SoloAdmin(), FilterBar(), FilterBarProps, SeccionListaCompra() (+18 more)

### Community 24 - "RecipeDetail.tsx"
Cohesion: 0.11
Nodes (29): CandidataCard(), CandidataDetail(), ModoCocina(), ModoCocinaProps, IngredientsList(), IngredientsListProps, StepsList(), RecipeDetail() (+21 more)

### Community 26 - "20261011_para_hacer_y_realizaciones.sql"
Cohesion: 0.33
Nodes (6): public.para_hacer, public.perfiles, auth.users, public.recetas, public.valoraciones, valoraciones_receta_fecha_idx

### Community 29 - "public.busquedas_uso"
Cohesion: 0.60
Nodes (4): busquedas_uso_user_fecha, public.busquedas_uso, public.registrar_busqueda(), auth.users

### Community 34 - "types.ts"
Cohesion: 0.09
Nodes (38): Bandera(), BanderaProps, DatosMapa, MapaMundi(), MapaMundiProps, PaisEditor(), PaisEditorProps, PaisEtiqueta() (+30 more)

### Community 35 - "Mi Recetario — contexto del proyecto"
Cohesion: 0.15
Nodes (13): Búsqueda semántica, El Laboratorio (recetas candidatas), Empieza por el grafo, graphify, Hacia dónde puede crecer, La lista de la compra, Mi pasaporte, Mi Recetario — contexto del proyecto (+5 more)

### Community 36 - "generar-mapamundi.mjs"
Cohesion: 0.20
Nodes (9): fc, features, paises, path, proy, [res = '110m', salida = 'mapa.json'], sinCodigo, topo (+1 more)

### Community 37 - "20261015_pasaporte.sql"
Cohesion: 0.47
Nodes (5): fotos_pais_pais_idx, public.fotos_pais, public.paises, recetas_pais_idx, public.recetas

### Community 40 - "Ideas para el Recetario"
Cohesion: 0.15
Nodes (13): Automatismos con n8n, Cocinar de verdad, Dar de alta con menos fricción, Decidido: la despensa NO guarda cantidades, Dos avisos de realidad, El punto de partida: datos que ya se pagan y se tiran — hecho, Encontrar recetas, Ideas para el Recetario (+5 more)

### Community 41 - "Mi pasaporte — plan"
Cohesion: 0.18
Nodes (11): Administración (solo admin), Cambios del 17 de octubre de 2026, Cambios del 21 de octubre de 2026, Cosas a tener en cuenta, Datos, Decisiones tomadas, Fases, Interfaz (+3 more)

### Community 42 - "Estado actual (23 ago 2026)"
Cohesion: 0.33
Nodes (6): Camino feliz, verificado el 8 ago 2026, Estado actual (23 ago 2026), La despensa, Las rutas van por el hash, Los ingredientes son objetos, no cadenas, Pendiente

### Community 43 - "Seguimiento del proyecto"
Cohesion: 0.33
Nodes (6): Cómo mantener esto, Estado por área (10 oct 2026), Mapa del proyecto, Pendientes priorizados, Registro de cambios, Seguimiento del proyecto

### Community 47 - "LaboratorioSection.tsx"
Cohesion: 0.17
Nodes (17): Props, Props, FiltroEstado, FILTROS, SeccionLaboratorio(), Fase, Props, CambiosCandidata (+9 more)

### Community 48 - "dependencies"
Cohesion: 0.22
Nodes (9): dependencies, clsx, lucide-react, react, react-dom, @supabase/supabase-js, tailwind-merge, tailwindcss (+1 more)

### Community 49 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, deploy, deploy:mac, dev, lint, preview

### Community 50 - "Fase 0 — experimento (media tarde, antes de construir nada)"
Cohesion: 0.40
Nodes (5): Fase 0 — experimento (media tarde, antes de construir nada), Instagram, aparcada (14 oct 2026), Reels con Apify — HECHO y probado el 15 oct 2026, Resultado de 0a con un reel público (14 oct 2026), Resultado de 0a con YouTube (14 oct 2026)

### Community 51 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): @tailwindcss/vite, vite, @vitejs/plugin-react

## Knowledge Gaps
- **193 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+188 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 227 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `errorMessage` to `types.ts`, `tiempos.ts`, `Recipe`, `package.json`, `LaboratorioSection.tsx`, `App.tsx`, `RecipeDetail.tsx`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `react` connect `errorMessage` to `types.ts`, `Recipe`, `package.json`, `LaboratorioSection.tsx`, `App.tsx`, `RecipeDetail.tsx`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `errorMessage()` connect `errorMessage` to `RecipeDetail.tsx`, `types.ts`, `App.tsx`, `LaboratorioSection.tsx`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _193 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Mi Recetario (SPA)` be split into smaller, more focused modules?**
  _Cohesion score 0.07777777777777778 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._