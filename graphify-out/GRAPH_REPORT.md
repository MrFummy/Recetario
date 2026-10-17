# Graph Report - Recetario  (2026-10-17)

## Corpus Check
- 102 files · ~80,026 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .example 1, .ico 1)

## Summary
- 532 nodes · 1115 edges · 40 communities (22 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4550f212`
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
- Ideas para el Recetario
- buscar-recetas/index.ts
- public.despensa
- tsconfig.json
- App.tsx
- types.ts
- public.recetas
- 20261011_para_hacer_y_realizaciones.sql
- public.recetas
- public.busquedas_uso
- 20261014_sin_hacer.sql
- deploy.sh script
- public.recetas
- PaisPagina.tsx
- Mi Recetario — contexto del proyecto
- generar-mapamundi.mjs
- 20261015_pasaporte.sql
- 20261014_laboratorio_candidatas.sql

## God Nodes (most connected - your core abstractions)
1. `errorMessage()` - 47 edges
2. `react` - 36 edges
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

## Communities (40 total, 8 thin omitted)

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
Cohesion: 0.13
Nodes (18): PasoConTiempos(), PasoConTiemposProps, TemporizadoresBarra(), pitar(), Temporizador, Temporizadores, useTemporizadores(), aNumero() (+10 more)

### Community 5 - "Recipe"
Cohesion: 0.13
Nodes (25): AnadirIngrediente(), Props, Props, SeccionDespensa(), Props, ModoCocinaProps, Props, PasaporteSectionProps (+17 more)

### Community 6 - "package.json"
Cohesion: 0.06
Nodes (37): dependencies, clsx, lucide-react, react, react-dom, @supabase/supabase-js, tailwind-merge, tailwindcss (+29 more)

### Community 7 - "indexar-recetas/index.ts"
Cohesion: 0.32
Nodes (6): cors, embeberLote(), json(), Receta, textoDe(), trozos()

### Community 8 - "errorMessage"
Cohesion: 0.08
Nodes (48): lucide-react, react, @supabase/supabase-js, AddRecipeForm(), AddRecipeFormProps, AltaPais(), IngredientSearch(), IngredientSearchProps (+40 more)

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
Cohesion: 0.04
Nodes (42): Abierto, Decisiones tomadas, Después, si apetece, Fase 0 — experimento (media tarde, antes de construir nada), Fase 1 — base de datos (migración) — HECHA el 14 oct 2026, Fase 2 — flujo de entrada en n8n (Telegram + YouTube) — HECHA y probada con YouTube (14 oct 2026), Fase 3 — sección web — HECHA (versión sencilla, 14 oct 2026), Fase 4 — incorporar al recetario — HECHA y probada de punta a punta (14 oct 2026) (+34 more)

### Community 15 - "buscar-recetas/index.ts"
Cohesion: 0.50
Nodes (3): cors, embeber(), json()

### Community 20 - "App.tsx"
Cohesion: 0.15
Nodes (24): App(), CATEGORIES, RecetaNoEncontrada(), SoloAdmin(), FilterBar(), FilterBarProps, SeccionListaCompra(), NavPrincipal() (+16 more)

### Community 24 - "types.ts"
Cohesion: 0.09
Nodes (43): CandidataCard(), Props, CandidataDetail(), ejecutar(), Props, FiltroEstado, FILTROS, SeccionLaboratorio() (+35 more)

### Community 26 - "20261011_para_hacer_y_realizaciones.sql"
Cohesion: 0.33
Nodes (6): public.para_hacer, public.perfiles, auth.users, public.recetas, public.valoraciones, valoraciones_receta_fecha_idx

### Community 29 - "public.busquedas_uso"
Cohesion: 0.60
Nodes (4): busquedas_uso_user_fecha, public.busquedas_uso, public.registrar_busqueda(), auth.users

### Community 34 - "PaisPagina.tsx"
Cohesion: 0.11
Nodes (32): Bandera(), BanderaProps, DatosMapa, MapaMundi(), MapaMundiProps, PaisEditor(), PaisEditorProps, PaisEtiqueta() (+24 more)

### Community 35 - "Mi Recetario — contexto del proyecto"
Cohesion: 0.11
Nodes (19): Búsqueda semántica, Camino feliz, verificado el 8 ago 2026, El Laboratorio (recetas candidatas), Empieza por el grafo, Estado actual (23 ago 2026), graphify, Hacia dónde puede crecer, La despensa (+11 more)

### Community 36 - "generar-mapamundi.mjs"
Cohesion: 0.20
Nodes (9): fc, features, paises, path, proy, [res = '110m', salida = 'mapa.json'], sinCodigo, topo (+1 more)

### Community 37 - "20261015_pasaporte.sql"
Cohesion: 0.47
Nodes (5): fotos_pais_pais_idx, public.fotos_pais, public.paises, recetas_pais_idx, public.recetas

## Knowledge Gaps
- **189 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+184 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 221 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `errorMessage` to `PaisPagina.tsx`, `tiempos.ts`, `Recipe`, `package.json`, `App.tsx`, `types.ts`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `react` connect `errorMessage` to `PaisPagina.tsx`, `tiempos.ts`, `Recipe`, `package.json`, `App.tsx`, `types.ts`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `errorMessage()` connect `errorMessage` to `types.ts`, `PaisPagina.tsx`, `App.tsx`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _189 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Mi Recetario (SPA)` be split into smaller, more focused modules?**
  _Cohesion score 0.07777777777777778 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._