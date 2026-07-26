# Graph Report - .  (2026-07-26)

## Corpus Check
- 35 files · ~34,341 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 255 nodes · 346 edges · 17 communities (15 shown, 2 thin omitted)
- Extraction: 85% EXTRACTED · 13% INFERRED · 1% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.84)
- Token cost: 70,168 input · 0 output

## Community Hubs (Navigation)
- UI de Catalogo y Detalle
- Dependencias y Scripts NPM
- Receta Lasana (contenido PDF)
- Dependencias de Desarrollo
- Integracion n8n y Supabase
- Config TypeScript App
- Config TypeScript Node/Vite
- Sprite de Iconos SVG
- Reglas de Agente (AGENTS.md)
- Imagen Placeholder de Receta
- Identidad Visual Favicon
- Script Verificacion PDF
- Script Test Supabase
- Componente Upload Progress
- TSConfig Raiz

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 17 edges
2. `compilerOptions` - 16 edges
3. `Recipe` - 10 edges
4. `Lasaña de carne` - 10 edges
5. `Salsa boloñesa` - 10 edges
6. `n8n webhook recipe ingestion` - 10 edges
7. `Icons SVG Sprite Sheet` - 8 edges
8. `Supabase database (direct JS client)` - 8 edges
9. `Bechamel` - 7 edges
10. `Mi Recetario` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Supabase JS client with no backend layer` --semantically_similar_to--> `n8n webhook recipe ingestion`  [INFERRED] [semantically similar]
  graphify-out/memory/query_20260726_092833_por_que_supabase_js_client_with_no_backend_layer_a.md → README.md
- `Secrets policy: no hardcoded credentials` --semantically_similar_to--> `Environment configuration (.env variables)`  [INFERRED] [semantically similar]
  graphify-out/memory/query_20260726_092833_por_que_supabase_js_client_with_no_backend_layer_a.md → README.md
- `/src/main.tsx module entry script` --conceptually_related_to--> `Catalogo module (masonry recipe viewer)`  [AMBIGUOUS]
  index.html → README.md
- `Supabase project gtqqqmethhakpybnuxin` --references--> `Supabase database (direct JS client)`  [INFERRED]
  graphify-out/memory/query_20260726_092833_por_que_supabase_js_client_with_no_backend_layer_a.md → README.md
- `Warm paper theme color #f6f1e4` --conceptually_related_to--> `Tailwind CSS v4 styling`  [INFERRED]
  index.html → AGENTS.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Full n8n webhook surface (ingest, delete, share)** — readme_n8n_webhook, graphify_out_memory_query_20260726_092833_por_que_supabase_js_client_with_no_backend_layer_a_nueva_receta_webhook, graphify_out_memory_query_20260726_092833_por_que_supabase_js_client_with_no_backend_layer_a_eliminar_receta_webhook, graphify_out_memory_query_20260726_092833_por_que_supabase_js_client_with_no_backend_layer_a_compartir_receta_webhook [EXTRACTED 1.00]
- **Backendless read/write data flow around one Supabase database** — readme_catalogo_module, graphify_out_memory_query_20260726_092833_por_que_supabase_js_client_with_no_backend_layer_a_supabase_js_client_no_backend_layer, readme_supabase_database, readme_anadir_receta_module, readme_n8n_webhook, graphify_out_memory_query_20260726_092833_por_que_supabase_js_client_with_no_backend_layer_a_n8n_as_de_facto_backend_layer [INFERRED 0.85]
- **Split credential handling: env vars for Supabase, literals for n8n** — graphify_out_memory_query_20260726_092833_por_que_supabase_js_client_with_no_backend_layer_a_secrets_policy_no_hardcoded_credentials, readme_env_configuration, graphify_out_memory_query_20260726_092833_por_que_supabase_js_client_with_no_backend_layer_a_hardcoded_n8n_webhook_urls, readme_supabase_database [INFERRED 0.85]
- **Supabase credential configuration across rules and setup docs** — agents_secrets_policy, agents_supabase_env_vars, agents_supabase_project, readme_env_configuration [EXTRACTED 1.00]
- **Flujo de elaboración de la salsa boloñesa** — lasa_a_de_carne___markis_cebolla, lasa_a_de_carne___markis_carne_picada, lasa_a_de_carne___markis_vino_tinto, lasa_a_de_carne___markis_tomate_pera, lasa_a_de_carne___markis_tomate_cherry, lasa_a_de_carne___markis_escaldado_de_tomates, lasa_a_de_carne___markis_bolonesa [EXTRACTED 1.00]
- **Flujo de elaboración de la bechamel** — lasa_a_de_carne___markis_mantequilla, lasa_a_de_carne___markis_harina, lasa_a_de_carne___markis_roux, lasa_a_de_carne___markis_leche_entera, lasa_a_de_carne___markis_leche_caliente_sin_hervir, lasa_a_de_carne___markis_sal_pimienta_negra_nuez_moscada, lasa_a_de_carne___markis_bechamel [EXTRACTED 1.00]
- **Montaje final y horneado de la lasaña** — lasa_a_de_carne___markis_placas_para_lasana, lasa_a_de_carne___markis_bechamel, lasa_a_de_carne___markis_bolonesa, lasa_a_de_carne___markis_queso_rallado, lasa_a_de_carne___markis_montaje_por_capas, lasa_a_de_carne___markis_horneado_gratinado [EXTRACTED 1.00]
- **Recetario Visual Identity System** — public_favicon_appicon, public_favicon_chef_hat_glyph, public_favicon_sage_green_brand_color, public_favicon_rounded_square_badge, public_favicon_line_icon_style [INFERRED 0.85]
- **Brand Social Platform Glyph Set (solid, #08060d)** — public_icons_bluesky_icon, public_icons_discord_icon, public_icons_github_icon, public_icons_x_icon, public_icons_solid_glyph_style [INFERRED 0.85]
- **Purple Outline UI Icon Set** — public_icons_documentation_icon, public_icons_social_icon, public_icons_brand_purple_stroke_token, public_icons_outline_icon_style [INFERRED 0.85]
- **All symbols participate in the single-file sprite** — public_icons_sprite, public_icons_bluesky_icon, public_icons_discord_icon, public_icons_documentation_icon, public_icons_github_icon, public_icons_social_icon, public_icons_x_icon, public_icons_svg_symbol_sprite_pattern [EXTRACTED 1.00]
- **Placeholder Visual Identity System** — src_assets_placeholder_image, src_assets_placeholder_food_photography_style, src_assets_placeholder_earthy_palette, src_assets_placeholder_square_aspect_ratio [INFERRED 0.85]
- **Missing Recipe Image Fallback Flow** — src_assets_placeholder_image, src_assets_placeholder_fallback_recipe_image, src_assets_placeholder_recipe_card_thumbnail [INFERRED 0.75]

## Communities (17 total, 2 thin omitted)

### Community 0 - "UI de Catalogo y Detalle"
Cohesion: 0.08
Nodes (35): App(), CATEGORIES, AddRecipeForm(), FilterBar(), FilterBarProps, IngredientSearch(), IngredientSearchProps, LoginModal() (+27 more)

### Community 1 - "Dependencias y Scripts NPM"
Cohesion: 0.07
Nodes (26): clsx, lucide-react, dependencies, clsx, lucide-react, react, react-dom, @supabase/supabase-js (+18 more)

### Community 2 - "Receta Lasana (contenido PDF)"
Cohesion: 0.11
Nodes (26): Bechamel, Salsa boloñesa, Carne picada (500 gr), Categoría PASTAS, Cebolla (2 unidades), El Recetario de Markis, Escaldado de tomates con corte en cruz, Ficha de receta del recetario (cabecera, tags, ingredientes, pasos numerados) (+18 more)

### Community 3 - "Dependencias de Desarrollo"
Cohesion: 0.08
Nodes (25): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+17 more)

### Community 4 - "Integracion n8n y Supabase"
Cohesion: 0.18
Nodes (23): compartir-receta webhook (undocumented, useRecipes.ts:129), eliminar-receta webhook (undocumented, useRecipes.ts:108), Hardcoded n8n webhook URLs (secrets-policy violation), n8n as de-facto backend layer, nueva-receta webhook (AddRecipeForm.tsx:6), Secrets policy: no hardcoded credentials, Supabase JS client with no backend layer, Supabase project gtqqqmethhakpybnuxin (+15 more)

### Community 5 - "Config TypeScript App"
Cohesion: 0.09
Nodes (22): DOM, src, vite/client, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib (+14 more)

### Community 6 - "Config TypeScript Node/Vite"
Cohesion: 0.10
Nodes (20): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+12 more)

### Community 7 - "Sprite de Iconos SVG"
Cohesion: 0.32
Nodes (13): bluesky-clip clipPath Definition, bluesky-icon Symbol, Brand Dark Fill Token #08060d, Brand Purple Stroke Token #aa3bff, discord-icon Symbol, documentation-icon Symbol, github-icon Symbol, Outline Icon Style (1.35 round stroke, no fill) (+5 more)

### Community 8 - "Reglas de Agente (AGENTS.md)"
Cohesion: 0.18
Nodes (12): Files under 300 lines, Mi Recetario Agent Rules, Browser screenshot artifact after each major feature, Secrets policy: no hardcoded credentials, Stack: React + TypeScript + Vite SPA, Static build target for Nginx home server, Supabase JS client with no backend layer, VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY env vars (+4 more)

### Community 9 - "Imagen Placeholder de Receta"
Cohesion: 0.48
Nodes (7): Earthy Terracotta and Cream Color Palette, Fallback Recipe Image Asset, Warm Natural-Light Food Photography Style, Recipe Placeholder Photo (placeholder.jpg), Mediterranean Chicken and Couscous Plated Dish, Recipe Card Thumbnail Slot, Square 1:1 Aspect Ratio Crop

### Community 10 - "Identidad Visual Favicon"
Cohesion: 0.60
Nodes (6): Recetario App Favicon, Chef Hat Glyph, Stroke-Only Line Icon Style, Rounded Square Badge Container, Sage Green Brand Color (#81b29a), Scalable Vector Branding Asset

### Community 11 - "Script Verificacion PDF"
Cohesion: 0.33
Nodes (4): __dirname, envPath, __filename, supabase

### Community 12 - "Script Test Supabase"
Cohesion: 0.33
Nodes (4): __dirname, envPath, __filename, supabase

## Ambiguous Edges - Review These
- `Supabase JS client with no backend layer` → `Secrets policy: no hardcoded credentials`  [AMBIGUOUS]
  AGENTS.md · relation: conceptually_related_to
- `/src/main.tsx module entry script` → `Catalogo module (masonry recipe viewer)`  [AMBIGUOUS]
  index.html · relation: conceptually_related_to
- `Lasaña de carne` → `Markis (autor del recetario)`  [AMBIGUOUS]
  Lasaña de carne - Markis.pdf · relation: references
- `Icons SVG Sprite Sheet` → `Brand Purple Stroke Token #aa3bff`  [AMBIGUOUS]
  public/icons.svg · relation: conceptually_related_to
- `Fallback Recipe Image Asset` → `Mediterranean Chicken and Couscous Plated Dish`  [AMBIGUOUS]
  src/assets/placeholder.jpg · relation: conceptually_related_to

## Knowledge Gaps
- **91 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+86 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Supabase JS client with no backend layer` and `Secrets policy: no hardcoded credentials`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `/src/main.tsx module entry script` and `Catalogo module (masonry recipe viewer)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Lasaña de carne` and `Markis (autor del recetario)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Icons SVG Sprite Sheet` and `Brand Purple Stroke Token #aa3bff`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Fallback Recipe Image Asset` and `Mediterranean Chicken and Couscous Plated Dish`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `devDependencies` connect `Dependencias de Desarrollo` to `Dependencias y Scripts NPM`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `index.html SPA shell (El Recetario de Markis)` connect `Integracion n8n y Supabase` to `Reglas de Agente (AGENTS.md)`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._