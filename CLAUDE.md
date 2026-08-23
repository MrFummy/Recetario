# Mi Recetario — contexto del proyecto

SPA estática de React + TypeScript para organizar recetas. **No hay backend propio**:
el navegador habla directo con Supabase (datos, auth, Storage) y delega las
operaciones pesadas en webhooks de n8n. Se compila a estáticos y se sirve desde
un Synology.

Las convenciones de código (TS estricto sin `any`, ficheros por debajo de 300
líneas, credenciales solo en `.env`) están en [AGENTS.md](AGENTS.md). El
despliegue está en el [README](README.md).

## Empieza por el grafo

`graphify-out/` contiene un grafo de conocimiento del proyecto: 249 nodos y 360
aristas sobre 44 ficheros, en 20 comunidades. Combina extracción estructural del
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

## Estado actual (23 ago 2026)

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

### Los ingredientes son objetos, no cadenas

Desde el 23 de agosto, cada elemento de `recetas.ingredientes` es:

```json
{ "id": "uuid", "nombre": "Cebolla morada", "cantidad": "2 unidades",
  "base": "cebolla", "valor": 2, "unidad": "unidad" }
```

`base` es el ingrediente genérico y **la clave con la que se cruzan recetas**:
huevo aparece en 24, cebolla en 19. De ahí come la despensa y comerá la lista de
la compra. Las cabeceras de sección siguen siendo cadenas (`"— Para la salsa —"`)
para no romper el PDF, Notion ni Sheets; en la web se detectan y se pintan como
sección, sin casilla.

Lo produce el prompt del nodo `Vertex AI`, y `Limpia respuesta` añade el `id` y
normaliza. Las 56 recetas anteriores se migraron a mano, elemento a elemento —ver
[la migración](supabase/migrations/20260823_estructurar_ingredientes.sql)—, con
`respaldo_ingredientes` guardando los originales por si hay que revertir.

**Al tocar el prompt, revisa `Rellenar HTML`**: asume que puede recibir cadenas
u objetos, y si vuelve a asumir solo cadenas, el PDF se rompe.

### La despensa

`despensa` guarda por `(user_id, base)` lo que cada usuario tiene en casa. No es
por receta a propósito: marcar cebolla vale para las 19 que la llevan. Cuando
llegue la lista de la compra, tachar en el súper será añadir a la despensa, sin
dos tablas que sincronizar.

### Camino feliz, verificado el 8 ago 2026

Votar, editar notas y fecha, cambiar foto, compartir por email, alta y borrado en
cascada: los seis pasos comprobados de punta a punta contra producción, con
sesión de admin.

### Pendiente

- Activar *Leaked password protection* en el panel de Supabase (Authentication →
  Policies). Es lo único que no se puede hacer por SQL ni por API.
- Limpiar dos fotos huérfanas del bucket: `Raxo_de_la_abuela.jpg` y
  `Wok_de_verduras_al_curry.jpeg`.
- Confirmar con sesión iniciada que la despensa persiste entre visitas y entre
  recetas. La lógica de interfaz está probada; lo que falta necesita login.
- Once ingredientes son combinados (`"Sal y pimienta negra"`) y su `base` es la
  frase entera, así que no casan con `sal` ni con `pimienta`. Se verá si molesta
  cuando exista la lista de la compra.

## Hacia dónde puede crecer

[docs/ideas.md](docs/ideas.md) recoge una lluvia de ideas de posibles
funcionalidades, con un orden sugerido. La primera —estructurar los
ingredientes— ya está hecha; el resto sigue sin decidir. Sigue en pie que Vertex
extrae `tiempo`, `porciones` y `dificultad` de cada receta y se descartan al
guardar, que es lo más barato que queda por rescatar.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
