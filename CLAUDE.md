# Mi Recetario — contexto del proyecto

SPA estática de React + TypeScript para organizar recetas. **No hay backend propio**:
el navegador habla directo con Supabase (datos, auth, Storage) y delega las
operaciones pesadas en webhooks de n8n. Se compila a estáticos y se sirve desde
un Synology.

Las convenciones de código (TS estricto sin `any`, ficheros por debajo de 300
líneas, credenciales solo en `.env`) están en [AGENTS.md](AGENTS.md). El
despliegue está en el [README](README.md).

## Empieza por el grafo

`graphify-out/` contiene un grafo de conocimiento del proyecto: 209 nodos y 316
aristas sobre 36 ficheros, en 14 comunidades. Combina extracción estructural del
código (AST) con una capa semántica que recoge lo que el código no dice por sí
solo: la arquitectura, los servicios externos y el modelo de autorización.

Para orientarte antes de tocar nada:

```bash
graphify query "¿cómo se autoriza el borrado de una receta?"
```

Mapa de comunidades, para saber a cuál preguntar:

| Comunidad | Qué contiene |
|---|---|
| Arquitectura, servicios y seguridad | Capa semántica: decisiones, servicios externos, roles, RLS, webhooks |
| Componentes de interfaz | `App.tsx`, formularios, modales, barra de filtros |
| Catálogo y búsqueda | `RecipeCard`, `RecipeGrid`, `StarRating`, `ingredientParser` |
| Detalle y normalización JSONB | `RecipeDetail`, `RecipeContent`, `recipeContent.ts` |
| Migración de RLS | Policies de Supabase |
| Config TypeScript / Vite / ESLint / npm | Tooling y dependencias |

## Estado actual (8 ago 2026)

**La autorización real no está en el frontend.** El `isAdmin` de
[App.tsx](src/App.tsx) solo decide qué botones se pintan. Quien autoriza de
verdad son dos cosas, y hay que tocar ambas al cambiar permisos:

1. Las **RLS de Supabase** — ver
   [la migración](supabase/migrations/20260805_endurecer_rls.sql). Lectura del
   catálogo pública; `UPDATE` de `recetas` y escritura en Storage solo para quien
   figure en la tabla `admins`; cada usuario solo toca su propia valoración; el
   `DELETE` de recetas no tiene policy, así que queda para el `service_role` de n8n.
2. La **validación de JWT dentro de n8n** — cada webhook verifica el token contra
   `/auth/v1/user` antes de actuar, y alta y borrado exigen además que el email
   sea el del admin.

Dos trampas que ya han mordido y conviene no repetir:

- `update_recipe_average_rating` **debe seguir siendo `SECURITY DEFINER`**. Si se
  revierte a `SECURITY INVOKER`, la policy de `UPDATE` restringida al admin hace
  que el trigger afecte a 0 filas —sin lanzar error— y las medias dejan de
  actualizarse para todo el que no sea admin.
- Cuando n8n corta un flujo antes de su nodo "Respond to Webhook", responde **200
  con cuerpo vacío**, no un 5xx. Por eso borrado y compartir exigen
  `{"success": true}` explícito en [n8n.ts](src/lib/n8n.ts); sin esa comprobación
  la UI da por buena una operación que no ocurrió.
- Los nodos `Verificar sesion (…)` de n8n **no deben llevar credencial de
  Supabase**. Si se les asigna, inyecta `Authorization: Bearer <service_role>`,
  que pisa el token del usuario; ese JWT no tiene claim `sub` y `/auth/v1/user`
  responde `403 bad_jwt`. Su trabajo es solo reenviar las cabeceras de quien llama.
- `_default.jpg` **no es la foto de ninguna receta**: es la plantilla que n8n
  copia cuando un alta llega sin foto. Una auditoría de huérfanos lo señala por
  error. Está protegido en la policy de borrado y también en el código.

### Camino feliz, verificado el 8 ago 2026

Votar, editar notas y fecha, cambiar foto, compartir por email, alta y borrado en
cascada: los seis pasos comprobados de punta a punta contra producción, con
sesión de admin.

### Pendiente

- Activar *Leaked password protection* en el panel de Supabase (Authentication →
  Policies). Es lo único que no se puede hacer por SQL ni por API.
- Limpiar dos fotos huérfanas del bucket: `Raxo_de_la_abuela.jpg` y
  `Wok_de_verduras_al_curry.jpeg`.

## Hacia dónde puede crecer

[docs/ideas.md](docs/ideas.md) recoge una lluvia de ideas de posibles
funcionalidades, con un orden sugerido. Nada de eso está decidido ni
implementado. La primera de la lista es la más barata: Vertex ya extrae
`tiempo`, `porciones` y `dificultad` de cada receta y se descartan al guardar.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
