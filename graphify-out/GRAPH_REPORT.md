# Graph Report - Recetario  (2026-10-11)

## Corpus Check
- 59 files · ~54,361 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 320 nodes · 557 edges · 27 communities (24 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `18ca55c0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Arquitectura, servicios y seguridad
- Componentes de interfaz
- Tooling de desarrollo
- Config TypeScript de la app
- Config TypeScript de build
- DespensaSection.tsx
- Dependencias de runtime
- Detalle y normalizacion JSONB
- Scripts de npm
- 20261010_anade_tiempo_porciones_dificultad.sql
- Migracion de RLS
- Mi Recetario — contexto del proyecto
- Q: Por que Supabase JS client with no backend layer aparece semanticamente similar a n8n webhook recipe ingestion?
- 20260808_fotos_en_raiz_visibles.sql
- App.tsx
- Ideas para el Recetario

## God Nodes (most connected - your core abstractions)
1. `errorMessage()` - 21 edges
2. `Recipe` - 17 edges
3. `compilerOptions` - 17 edges
4. `compilerOptions` - 16 edges
5. `normalizeIngredients()` - 14 edges
6. `aHash()` - 13 edges
7. `Ideas para el Recetario` - 12 edges
8. `Mi Recetario (SPA)` - 12 edges
9. `Despensa` - 11 edges
10. `n8n` - 11 edges

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

## Communities (27 total, 3 thin omitted)

### Community 0 - "Arquitectura, servicios y seguridad"
Cohesion: 0.08
Nodes (33): Arquitectura sin backend, Build estatico para Nginx, Despliegue en Synology, Gmail, Google Drive, Google Sheets, Gotenberg, JSONB heterogeneo (+25 more)

### Community 1 - "Componentes de interfaz"
Cohesion: 0.22
Nodes (11): AddRecipeForm(), AddRecipeFormProps, UploadProgress(), UploadProgressProps, UploadStatus, useRecipes(), idUnico(), base (+3 more)

### Community 2 - "Tooling de desarrollo"
Cohesion: 0.08
Nodes (25): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+17 more)

### Community 3 - "Config TypeScript de la app"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+14 more)

### Community 4 - "Config TypeScript de build"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+12 more)

### Community 5 - "DespensaSection.tsx"
Cohesion: 0.13
Nodes (27): AnadirIngrediente(), Props, Props, SeccionDespensa(), Props, SeccionListaCompra(), Props, RecipeCard() (+19 more)

### Community 6 - "Dependencias de runtime"
Cohesion: 0.07
Nodes (27): clsx, lucide-react, dependencies, clsx, lucide-react, react, react-dom, @supabase/supabase-js (+19 more)

### Community 7 - "Detalle y normalizacion JSONB"
Cohesion: 0.19
Nodes (18): IngredientsList(), StepsList(), RecipeDetail(), RecipePolaroid(), RecipePolaroidProps, useIngredientSearch(), extractIngredientsText(), recipeMatchesIngredients() (+10 more)

### Community 8 - "Scripts de npm"
Cohesion: 0.16
Nodes (19): LoginModal(), LoginModalProps, formatearFecha(), GIROS, MuroRealizaciones(), Props, RealizacionForm(), ShareByEmail() (+11 more)

### Community 12 - "Migracion de RLS"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Por que Supabase JS client with no backend layer aparece semanticamente similar a n8n webhook recipe ingestion?, Source Nodes

### Community 14 - "Mi Recetario — contexto del proyecto"
Cohesion: 0.10
Nodes (19): Camino feliz, verificado el 8 ago 2026, Empieza por el grafo, Estado actual (23 ago 2026), graphify, Hacia dónde puede crecer, La despensa, La lista de la compra, Las rutas van por el hash (+11 more)

### Community 20 - "App.tsx"
Cohesion: 0.18
Nodes (18): App(), CATEGORIES, RecetaNoEncontrada(), SoloAdmin(), FilterBar(), FilterBarProps, IngredientSearch(), IngredientSearchProps (+10 more)

### Community 25 - "Ideas para el Recetario"
Cohesion: 0.15
Nodes (13): Automatismos con n8n, Cocinar de verdad, Dar de alta con menos fricción, Decidido: la despensa NO guarda cantidades, Dos avisos de realidad, El punto de partida: datos que ya se pagan y se tiran — hecho, Encontrar recetas, Ideas para el Recetario (+5 more)

## Knowledge Gaps
- **122 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+117 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Tooling de desarrollo` to `Dependencias de runtime`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `errorMessage()` connect `Scripts de npm` to `Componentes de interfaz`, `App.tsx`, `Detalle y normalizacion JSONB`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _122 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Arquitectura, servicios y seguridad` be split into smaller, more focused modules?**
  _Cohesion score 0.07777777777777778 - nodes in this community are weakly interconnected._
- **Should `Tooling de desarrollo` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Config TypeScript de la app` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `Config TypeScript de build` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._