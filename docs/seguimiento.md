# Seguimiento del proyecto

Panel de control para ir anotando qué se toca, por qué y qué queda. No
duplica [CLAUDE.md](../CLAUDE.md) (el "qué es verdad hoy") ni
[ideas.md](ideas.md) (el "qué podría hacerse"): este documento es el "qué se
ha movido y qué está abierto ahora mismo". Se actualiza en cada sesión de
trabajo, no solo al cerrar algo.

Grafo de referencia: `graphify-out/` (280 nodos, 461 aristas, 23 comunidades
tras `graphify update .` del 10 oct 2026). Antes de tocar un área, conviene
`graphify query "<pregunta>"` en vez de grep a ciegas.

---

## Mapa del proyecto

| Área | Dónde vive | Comunidad del grafo |
|---|---|---|
| Autorización y seguridad | `supabase/migrations/20260805_endurecer_rls.sql`, `src/lib/n8n.ts` | Arquitectura, servicios y seguridad |
| Interfaz / formularios | `src/App.tsx`, modales, barra de filtros | Componentes de interfaz |
| Catálogo y búsqueda | `RecipeCard`, `RecipeGrid`, `StarRating`, `ingredientParser.ts` | Catálogo y búsqueda |
| Detalle de receta | `RecipeDetail.tsx`, `recipeContent.ts` | Detalle y normalización JSONB |
| Despensa | `DespensaSection.tsx`, `useDespensa`, `inventario.ts`, tabla `despensa` | — (cruza Interfaz y Arquitectura) |
| Enrutado | `rutas.ts`, `useRuta.ts` | — (cruza Interfaz) |
| Migraciones RLS | `supabase/migrations/*.sql` | Migración de RLS |
| Tooling | `vite.config.ts`, `tsconfig*.json`, `eslint.config.js` | Config TypeScript / Vite / ESLint / npm |

Servicios externos: **Supabase** (datos + auth + Storage, con RLS como
autorización real) y **n8n** (webhooks con validación de JWT propia; alta y
borrado exigen además que el email sea el del admin). No hay backend propio.

---

## Estado por área (10 oct 2026)

| Área | Estado | Última verificación | Ver |
|---|---|---|---|
| Autorización (RLS + n8n) | Endurecida, sin huecos conocidos | 8 ago 2026 (camino feliz) | [CLAUDE.md § Estado actual](../CLAUDE.md) |
| Ingredientes estructurados | Hecho, 56 recetas migradas | 23 ago 2026 | [migración](../supabase/migrations/20260823_estructurar_ingredientes.sql) |
| Despensa (tabla + checks) | Hecho | 23 ago 2026 | `DespensaSection.tsx` |
| Router por hash | Hecho | 31 ago 2026 | `rutas.ts`, `useRuta.ts` |
| Sección despensa (`#/despensa`) | Hecho, verificado con sesión real | 31 ago 2026 | `DespensaSection.tsx` |
| Bucket Storage | Sin huérfanas, `_default.jpg` protegido | 31 ago 2026 | — |
| Leaked password protection | No aplicable (requiere plan Pro) | 2026 | aviso permanente del linter |
| `base` combinados (sal y pimienta, etc.) | Partidos (19 filas); falta ajustar el prompt de Vertex | 10 oct 2026 | [migración](../supabase/migrations/20261010_partir_base_combinados.sql) |
| `tiempo`/`porciones`/`dificultad` | Se calculan en Vertex y se descartan | — | [ideas.md § punto de partida](ideas.md) |
| Lista de la compra | No empezado | — | [CLAUDE.md § Siguiente paso](../CLAUDE.md) |

---

## Pendientes priorizados

Orden acordado en [ideas.md](ideas.md#orden-sugerido), con el bloqueo de cada
uno:

1. ~~**Partir los `base` combinados**~~ **Hecho el 10 de octubre de 2026**
   (eran 7 bases, 19 apariciones — no 18). Queda ajustar el prompt de Vertex
   para que no vuelva a generarlos en altas nuevas.
2. **Lista de la compra** — cae sobre la despensa; ya no bloqueada por el
   punto 1; falta normalizar cantidades (candidato a llamada a Vertex).
3. **Rescatar `tiempo`/`porciones`/`dificultad`** — una tarde: tres columnas +
   una línea en `Guardar en Supabase` + reprocesar 58 PDFs con *Regenerar PDFs
   antiguos*.
4. **Modo cocina** — 100% frontend, sin dependencias pendientes.
5. **Búsqueda semántica (pgvector)** — mejor después de que las tres de arriba
   estén asentadas.

---

## Registro de cambios

Añadir una fila por sesión de trabajo relevante (no por commit). Fecha en
formato absoluto.

| Fecha | Cambio | Commit(s) | Notas |
|---|---|---|---|
| 31 ago 2026 | Router por hash + sección despensa | `c67f12e`, `d707632` | Dos pendientes del plan del 23 ago |
| 31 ago 2026 | Corrección nota leaked password protection | `8ef7174` | Es de plan Pro, no una tarea |
| 31 ago 2026 | Cierre: despensa verificada en producción, bucket sin huérfanas | `f4917c6` | Último commit en `main` |
| 10 oct 2026 | `graphify update .` (280 nodos / 461 aristas / 23 comunidades) + creación de este panel | `50e4ac8`, `793d5e5` | Sin cambios de código; solo grafo y seguimiento |
| 10 oct 2026 | Partidos los 7 `base` combinados (19 filas, no 18) en producción | — | Migración aplicada vía MCP de Supabase, aún sin commitear el fichero. Pendiente: prompt de Vertex |

---

## Cómo mantener esto

- Al cerrar algo de **Pendientes priorizados**, tacharlo aquí y en
  [ideas.md](ideas.md), y mover la fila correspondiente de la tabla de estado.
- Al terminar una sesión con cambios de código: añadir fila al registro,
  `graphify update .`, y si el cambio afecta a una de las "dos trampas" u
  otras reglas de [CLAUDE.md](../CLAUDE.md), actualizar esa sección también.
- Si una decisión se revisita (p. ej. "cantidades en la despensa"), enlazar al
  razonamiento ya escrito en vez de reabrir el debate desde cero.
