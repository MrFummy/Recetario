# Graph Report - Recetario  (2026-08-31)

## Corpus Check
- 47 files · ~45,853 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 280 nodes · 462 edges · 21 communities (19 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c67f12ec`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Arquitectura, servicios y seguridad
- Componentes de interfaz
- Tooling de desarrollo
- Config TypeScript de la app
- Config TypeScript de build
- Catalogo y busqueda
- Dependencias de runtime
- Detalle y normalizacion JSONB
- Scripts de npm
- Raiz de TypeScript
- Mi Recetario — contexto del proyecto
- Q: Por que Supabase JS client with no backend layer aparece semanticamente similar a n8n webhook recipe ingestion?
- App.tsx

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 17 edges
2. `compilerOptions` - 16 edges
3. `errorMessage()` - 14 edges
4. `Recipe` - 14 edges
5. `aHash()` - 13 edges
6. `Mi Recetario (SPA)` - 12 edges
7. `normalizeIngredients()` - 11 edges
8. `Ideas para el Recetario` - 11 edges
9. `n8n` - 11 edges
10. `App()` - 9 edges

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

## Communities (21 total, 2 thin omitted)

### Community 0 - "Arquitectura, servicios y seguridad"
Cohesion: 0.08
Nodes (33): Arquitectura sin backend, Build estatico para Nginx, Despliegue en Synology, Gmail, Google Drive, Google Sheets, Gotenberg, JSONB heterogeneo (+25 more)

### Community 1 - "Componentes de interfaz"
Cohesion: 0.15
Nodes (19): AddRecipeForm(), AddRecipeFormProps, LoginModal(), LoginModalProps, ShareByEmail(), ShareByEmailProps, UploadProgress(), UploadProgressProps (+11 more)

### Community 2 - "Tooling de desarrollo"
Cohesion: 0.08
Nodes (25): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+17 more)

### Community 3 - "Config TypeScript de la app"
Cohesion: 0.09
Nodes (22): DOM, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib (+14 more)

### Community 4 - "Config TypeScript de build"
Cohesion: 0.10
Nodes (20): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+12 more)

### Community 5 - "Catalogo y busqueda"
Cohesion: 0.15
Nodes (22): AnadirIngrediente(), Props, Props, SeccionDespensa(), RecipeCard(), RecipeCardProps, tiltFor(), RecipeDetailProps (+14 more)

### Community 6 - "Dependencias de runtime"
Cohesion: 0.07
Nodes (26): clsx, lucide-react, dependencies, clsx, lucide-react, react, react-dom, @supabase/supabase-js (+18 more)

### Community 7 - "Detalle y normalizacion JSONB"
Cohesion: 0.19
Nodes (18): IngredientsList(), IngredientsListProps, StepsList(), RecipeDetail(), RecipePolaroid(), RecipePolaroidProps, useIngredientSearch(), extractIngredientsText() (+10 more)

### Community 14 - "Mi Recetario — contexto del proyecto"
Cohesion: 0.08
Nodes (23): Camino feliz, verificado el 8 ago 2026, Empieza por el grafo, Estado actual (23 ago 2026), graphify, Hacia dónde puede crecer, La despensa, Las rutas van por el hash, Los ingredientes son objetos, no cadenas (+15 more)

### Community 15 - "Q: Por que Supabase JS client with no backend layer aparece semanticamente similar a n8n webhook recipe ingestion?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Por que Supabase JS client with no backend layer aparece semanticamente similar a n8n webhook recipe ingestion?, Source Nodes

### Community 20 - "App.tsx"
Cohesion: 0.19
Nodes (17): App(), CATEGORIES, RecetaNoEncontrada(), SoloAdmin(), FilterBar(), FilterBarProps, IngredientSearch(), IngredientSearchProps (+9 more)

## Knowledge Gaps
- **110 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+105 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Tooling de desarrollo` to `Dependencias de runtime`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `Recipe` connect `Catalogo y busqueda` to `Componentes de interfaz`, `Detalle y normalizacion JSONB`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _110 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Arquitectura, servicios y seguridad` be split into smaller, more focused modules?**
  _Cohesion score 0.07777777777777778 - nodes in this community are weakly interconnected._
- **Should `Componentes de interfaz` be split into smaller, more focused modules?**
  _Cohesion score 0.1455026455026455 - nodes in this community are weakly interconnected._
- **Should `Tooling de desarrollo` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Config TypeScript de la app` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._