# Graph Report - Recetario  (2026-11-11)

## Corpus Check
- 160 files · ~98,263 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .css 2, .example 1)

## Summary
- 827 nodes · 1800 edges · 81 communities (49 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9654964d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Mi Recetario (SPA)
- compilerOptions
- devDependencies
- compilerOptions
- types.ts
- DespensaSection.tsx
- package.json
- indexar-recetas/index.ts
- App.tsx
- 20260805_endurecer_rls.sql
- Q: Por que Supabase JS client with no backend layer aparece semanticamente similar a n8n webhook recipe ingestion?
- public.recetas_embeddings
- Recetas candidatas — plan
- buscar-recetas/index.ts
- public.despensa
- tsconfig.json
- tiempos.ts
- rellenar-html.js
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
- Ideas para el Recetario
- Mi pasaporte — plan
- Pendientes
- Propuesta de `porciones` (aplicada el 7 nov 2026 en `porciones_num`)
- Menús
- Recipe
- dependencies
- scripts
- 20261107_menus.sql
- vite.config.ts
- public.paises
- public.paises
- public.paises
- react
- public.recetas
- public.autores_sugerencias_hechas
- 20261110_avisos_recetas.sql
- 20261110_sugerencias.sql
- public.ver_menu_compartido
- public.recetas
- public.sugerencias
- errorMessage
- errors.ts
- @supabase/supabase-js
- MuroRealizaciones.tsx
- supabase.ts
- BuzonSection.tsx
- useMenus.ts
- Pendientes del rediseño — para retomar
- correo-base.js
- generar-correos.mjs
- generar.mjs
- Fase 0 — experimento (media tarde, antes de construir nada)

## God Nodes (most connected - your core abstractions)
1. `errorMessage()` - 73 edges
2. `react` - 63 edges
3. `Recipe` - 49 edges
4. `lucide-react` - 43 edges
5. `aHash()` - 41 edges
6. `@supabase/supabase-js` - 24 edges
7. `Despensa` - 21 edges
8. `supabase` - 20 edges
9. `normalizeIngredients()` - 19 edges
10. `Mi Recetario — contexto del proyecto` - 19 edges

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

## Communities (81 total, 14 thin omitted)

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

### Community 4 - "types.ts"
Cohesion: 0.08
Nodes (51): lucide-react, CandidataCard(), Props, CandidataDetail(), Props, FilterBar(), FilterBarProps, FiltroEstado (+43 more)

### Community 5 - "DespensaSection.tsx"
Cohesion: 0.20
Nodes (15): AnadirIngrediente(), Props, SeccionDespensa(), MenuSelectorRecetas(), Props, useIngredientSearch(), extractIngredientsText(), normalizeString() (+7 more)

### Community 6 - "package.json"
Cohesion: 0.12
Nodes (18): name, private, type, version, clsx, eslint, @eslint/js, eslint-plugin-react-hooks (+10 more)

### Community 7 - "indexar-recetas/index.ts"
Cohesion: 0.32
Nodes (6): cors, embeberLote(), json(), Receta, textoDe(), trozos()

### Community 8 - "App.tsx"
Cohesion: 0.08
Nodes (42): App(), CATEGORIES, AltaPais(), RecetaNoEncontrada(), SoloAdmin(), SoloLogueados(), Cabecera(), CabeceraProps (+34 more)

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

### Community 20 - "tiempos.ts"
Cohesion: 0.13
Nodes (18): PasoConTiempos(), PasoConTiemposProps, TemporizadoresBarra(), pitar(), Temporizador, Temporizadores, useTemporizadores(), aNumero() (+10 more)

### Community 24 - "rellenar-html.js"
Cohesion: 0.21
Nodes (14): categoria, chips, COLORES, esc(), esCabecera(), fecha, html, ingHtml (+6 more)

### Community 26 - "20261011_para_hacer_y_realizaciones.sql"
Cohesion: 0.33
Nodes (6): public.para_hacer, public.perfiles, auth.users, public.recetas, public.valoraciones, valoraciones_receta_fecha_idx

### Community 29 - "public.busquedas_uso"
Cohesion: 0.60
Nodes (4): busquedas_uso_user_fecha, public.busquedas_uso, public.registrar_busqueda(), auth.users

### Community 34 - "PaisPagina.tsx"
Cohesion: 0.06
Nodes (58): Bandera(), BanderaProps, DATOS, FichaPais(), GIROS, ListaVisados(), Visado(), VisadoProps (+50 more)

### Community 35 - "Mi Recetario — contexto del proyecto"
Cohesion: 0.08
Nodes (26): Avisos por correo y «Mi cuenta», Buzón de sugerencias, Búsqueda semántica, Camino feliz, verificado el 8 ago 2026, El Laboratorio (recetas candidatas), Empieza por el grafo, Estado actual (23 ago 2026), graphify (+18 more)

### Community 36 - "generar-mapamundi.mjs"
Cohesion: 0.20
Nodes (9): fc, features, paises, path, proy, [res = '110m', salida = 'mapa.json'], sinCodigo, topo (+1 more)

### Community 37 - "20261015_pasaporte.sql"
Cohesion: 0.47
Nodes (5): fotos_pais_pais_idx, public.fotos_pais, public.paises, recetas_pais_idx, public.recetas

### Community 40 - "Ideas para el Recetario"
Cohesion: 0.12
Nodes (17): Automatismos con n8n, Avisos por correo y «Mi cuenta» — decidido el 10 de noviembre de 2026, Bot de Telegram para los afans — decidido el 10 de noviembre de 2026, Buzón de sugerencias de los afans — decidido el 10 de noviembre de 2026, Cocinar de verdad, Dar de alta con menos fricción, Decidido: la despensa NO guarda cantidades, Dos avisos de realidad (+9 more)

### Community 41 - "Mi pasaporte — plan"
Cohesion: 0.18
Nodes (11): Administración (solo admin), Cambios del 17 de octubre de 2026, Cambios del 21 de octubre de 2026, Cosas a tener en cuenta, Datos, Decisiones tomadas, Fases, Interfaz (+3 more)

### Community 42 - "Pendientes"
Cohesion: 0.18
Nodes (11): Abierto en El Laboratorio, Cómo mantener esto, Deuda conocida, Estado por área (10 nov 2026), Ideas sin desarrollar ([ideas.md](ideas.md)), Mapa del proyecto, Pendientes, Propuesto (+3 more)

### Community 43 - "Propuesta de `porciones` (aplicada el 7 nov 2026 en `porciones_num`)"
Cohesion: 0.25
Nodes (8): Aperitivos, Arroces y pastas, Carnes, Hallazgos que afectan al diseño, Pescados y mariscos / Ensaladas, Postres, Propuesta de `porciones` (aplicada el 7 nov 2026 en `porciones_num`), Sopas y cremas

### Community 45 - "Menús"
Cohesion: 0.25
Nodes (8): Compartir, Decisiones tomadas, Escalado y lista de la compra, Fases, Menús, Modelo de datos (propuesta), Preguntas abiertas, Rutas e interfaz

### Community 47 - "Recipe"
Cohesion: 0.08
Nodes (46): Props, HojaImpresa(), Props, Props, MenuCabecera(), Props, MenuCompartir(), Props (+38 more)

### Community 48 - "dependencies"
Cohesion: 0.22
Nodes (9): dependencies, clsx, lucide-react, react, react-dom, @supabase/supabase-js, tailwind-merge, tailwindcss (+1 more)

### Community 49 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, deploy, deploy:mac, dev, lint, preview

### Community 50 - "20261107_menus.sql"
Cohesion: 0.43
Nodes (6): menu_recetas_receta_id_idx, menus_user_id_idx, public.menu_recetas, public.menus, auth.users, public.recetas

### Community 51 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 58 - "react"
Cohesion: 0.33
Nodes (6): react, LoginModal(), LoginModalProps, LogoSarten(), LogoSartenProps, NuevaClaveModal()

### Community 61 - "public.autores_sugerencias_hechas"
Cohesion: 0.22
Nodes (7): public.acreditar_sugerencia, acreditar_sugerencia, public.autores_sugerencias_hechas(), auth.users, public.perfiles, public.recetas, public.sugerencias

### Community 62 - "20261110_avisos_recetas.sql"
Cohesion: 0.32
Nodes (6): public.preferencias_marca_cambio, preferencias_marca_cambio, public.destinatarios_avisos_recetas(), public.preferencias, auth.users, public.perfiles

### Community 63 - "20261110_sugerencias.sql"
Cohesion: 0.33
Nodes (5): public.limitar_sugerencias, limitar_sugerencias, public.sugerencias, auth.users, sugerencias_user_id_idx

### Community 64 - "public.ver_menu_compartido"
Cohesion: 0.40
Nodes (4): public.menu_recetas, public.menus, public.ver_menu_compartido(), public.perfiles

### Community 69 - "errorMessage"
Cohesion: 0.13
Nodes (20): ejecutar(), CuentaAcceso(), cambiarClave(), cambiarCorreo(), FormNombre(), guardar(), PromoverModal(), enviar() (+12 more)

### Community 70 - "errors.ts"
Cohesion: 0.18
Nodes (13): AddRecipeForm(), AddRecipeFormProps, UploadProgress(), UploadProgressProps, UploadStatus, useRecipes(), load(), idUnico() (+5 more)

### Community 71 - "@supabase/supabase-js"
Cohesion: 0.33
Nodes (6): @supabase/supabase-js, CuentaAvisos(), Props, Props, usePerfil(), Preferencias

### Community 72 - "MuroRealizaciones.tsx"
Cohesion: 0.30
Nodes (9): formatearFecha(), MuroRealizaciones(), Props, Props, RealizacionForm(), DatosRealizacion, Realizacion, useRealizaciones() (+1 more)

### Community 73 - "supabase.ts"
Cohesion: 0.19
Nodes (9): Mensaje, ReindexarBusqueda(), MenuCompartidoCargado, reindexarBusqueda(), ResultadoIndexacion, ENLACE_CADUCADO, LLEGA_DE_RECUPERACION, supabase (+1 more)

### Community 74 - "BuzonSection.tsx"
Cohesion: 0.21
Nodes (9): ETIQUETA, Fila(), Props, SeccionBuzon(), onSubmit(), EstadoSugerencia, NuevaSugerencia, Sugerencia (+1 more)

### Community 75 - "useMenus.ts"
Cohesion: 0.29
Nodes (6): aResumen(), Fila, MenuDeOtro, MenuResumen, Menus, cargar()

### Community 76 - "Pendientes del rediseño — para retomar"
Cohesion: 0.25
Nodes (6): Detalles y mejoras, Estado en producción (para poder volver atrás), Para hacer, por orden, Pendientes del rediseño — para retomar, Sin comprobar a mano, Plantillas de correo de Supabase Auth

### Community 77 - "correo-base.js"
Cohesion: 0.39
Nodes (7): boton(), cenefa(), colorCategoria(), COLORES, correo(), PREFIJOS, tarjeta()

### Community 78 - "generar-correos.mjs"
Cohesion: 0.33
Nodes (3): aqui, base, { correo }

### Community 79 - "generar.mjs"
Cohesion: 0.33
Nodes (4): aqui, base, { correo }, PLANTILLAS

### Community 80 - "Fase 0 — experimento (media tarde, antes de construir nada)"
Cohesion: 0.40
Nodes (5): Fase 0 — experimento (media tarde, antes de construir nada), Instagram, aparcada (14 oct 2026), Reels con Apify — HECHO y probado el 15 oct 2026, Resultado de 0a con un reel público (14 oct 2026), Resultado de 0a con YouTube (14 oct 2026)

## Knowledge Gaps
- **254 isolated node(s):** `COLORES`, `PREFIJOS`, `aqui`, `base`, `{ correo }` (+249 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 330 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `PaisPagina.tsx`, `types.ts`, `DespensaSection.tsx`, `errors.ts`, `package.json`, `App.tsx`, `supabase.ts`, `BuzonSection.tsx`, `@supabase/supabase-js`, `MuroRealizaciones.tsx`, `errorMessage`, `useMenus.ts`, `Recipe`, `tiempos.ts`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `types.ts` to `PaisPagina.tsx`, `DespensaSection.tsx`, `errors.ts`, `package.json`, `App.tsx`, `@supabase/supabase-js`, `BuzonSection.tsx`, `MuroRealizaciones.tsx`, `supabase.ts`, `errorMessage`, `Recipe`, `tiempos.ts`, `react`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `errorMessage()` connect `errorMessage` to `PaisPagina.tsx`, `types.ts`, `errors.ts`, `@supabase/supabase-js`, `App.tsx`, `supabase.ts`, `BuzonSection.tsx`, `MuroRealizaciones.tsx`, `useMenus.ts`, `Recipe`, `react`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `COLORES`, `PREFIJOS`, `aqui` to the rest of the system?**
  _254 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Mi Recetario (SPA)` be split into smaller, more focused modules?**
  _Cohesion score 0.07777777777777778 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._