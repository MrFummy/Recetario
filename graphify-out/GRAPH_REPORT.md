# Graph Report - Recetario  (2026-08-08)

## Corpus Check
- 37 files · ~38,610 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 227 nodes · 330 edges · 19 communities (18 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c477ff3e`
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

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 17 edges
2. `compilerOptions` - 16 edges
3. `errorMessage()` - 12 edges
4. `Mi Recetario (SPA)` - 12 edges
5. `Recipe` - 11 edges
6. `n8n` - 11 edges
7. `normalizeIngredients()` - 8 edges
8. `Json` - 8 edges
9. `normalizeSteps()` - 6 edges
10. `supabase` - 6 edges

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

## Communities (19 total, 1 thin omitted)

### Community 0 - "Arquitectura, servicios y seguridad"
Cohesion: 0.08
Nodes (33): Arquitectura sin backend, Build estatico para Nginx, Despliegue en Synology, Gmail, Google Drive, Google Sheets, Gotenberg, JSONB heterogeneo (+25 more)

### Community 1 - "Componentes de interfaz"
Cohesion: 0.12
Nodes (24): App(), CATEGORIES, AddRecipeForm(), AddRecipeFormProps, FilterBar(), FilterBarProps, IngredientSearch(), IngredientSearchProps (+16 more)

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
Cohesion: 0.23
Nodes (10): RecipeCard(), RecipeCardProps, tiltFor(), RecipeDetailProps, RecipeGrid(), RecipeGridProps, SKELETON_TILTS, StarRating() (+2 more)

### Community 6 - "Dependencias de runtime"
Cohesion: 0.12
Nodes (17): clsx, lucide-react, dependencies, clsx, lucide-react, react, react-dom, @supabase/supabase-js (+9 more)

### Community 7 - "Detalle y normalizacion JSONB"
Cohesion: 0.20
Nodes (17): IngredientsList(), StepsList(), RecipeDetail(), RecipePolaroid(), RecipePolaroidProps, useIngredientSearch(), extractIngredientsText(), normalizeString() (+9 more)

### Community 8 - "Scripts de npm"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 14 - "Mi Recetario — contexto del proyecto"
Cohesion: 0.29
Nodes (6): Camino feliz, verificado el 8 ago 2026, Empieza por el grafo, Estado actual (8 ago 2026), graphify, Mi Recetario — contexto del proyecto, Pendiente

### Community 15 - "Q: Por que Supabase JS client with no backend layer aparece semanticamente similar a n8n webhook recipe ingestion?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Por que Supabase JS client with no backend layer aparece semanticamente similar a n8n webhook recipe ingestion?, Source Nodes

## Knowledge Gaps
- **94 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+89 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Tooling de desarrollo` to `Scripts de npm`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Dependencias de runtime` to `Scripts de npm`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _94 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Arquitectura, servicios y seguridad` be split into smaller, more focused modules?**
  _Cohesion score 0.07777777777777778 - nodes in this community are weakly interconnected._
- **Should `Componentes de interfaz` be split into smaller, more focused modules?**
  _Cohesion score 0.11587301587301588 - nodes in this community are weakly interconnected._
- **Should `Tooling de desarrollo` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Config TypeScript de la app` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._