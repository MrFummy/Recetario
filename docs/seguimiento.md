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
| Lista de la compra | `ListaCompraSection.tsx`, `listaCompra.ts` | — (cruza Interfaz y Detalle/JSONB) |
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
| `base` combinados (sal y pimienta, etc.) | Partidos (19 filas) y prompt de Vertex ajustado | 10 oct 2026 | [migración](../supabase/migrations/20261010_partir_base_combinados.sql) |
| `tiempo`/`porciones`/`dificultad` | Hecho, sin backfill de recetas antiguas | 10 oct 2026 | [CLAUDE.md § Tiempo, porciones y dificultad](../CLAUDE.md) |
| Lista de la compra (`#/lista-compra`) | Hecho, cálculo en el cliente | 10 oct 2026 | [CLAUDE.md § La lista de la compra](../CLAUDE.md) |

---

## Pendientes priorizados

Orden acordado en [ideas.md](ideas.md#orden-sugerido), con el bloqueo de cada
uno:

1. ~~**Partir los `base` combinados**~~ **Hecho el 10 de octubre de 2026**
   (eran 7 bases, 19 apariciones — no 18), incluido el ajuste del prompt de
   Vertex para que no los vuelva a generar.
2. ~~**Lista de la compra**~~ **Hecha el 10 de octubre de 2026** — cálculo
   100% en el cliente, sin webhook ni Vertex (ver CLAUDE.md § La lista de la
   compra).
3. ~~**Rescatar `tiempo`/`porciones`/`dificultad`**~~ **Hecho el 10 de octubre
   de 2026**, sin backfill: las recetas anteriores quedan con esos campos en
   `null` y sin badge. El backfill (reprocesar PDFs antiguos por Vertex)
   queda como idea suelta en ideas.md, sin decidir.
4. **Para hacer, realizaciones y el muro de notas** — **siguiente a
   atacar**, acordado el 10 de octubre de 2026. Diseño cerrado en
   [ideas.md § Para hacer, realizaciones y el muro de notas](ideas.md);
   toca llevarlo a un plan de implementación en la próxima sesión.
5. **Modo cocina** — 100% frontend, sin dependencias pendientes.
6. **Búsqueda semántica (pgvector)** — mejor después de que las anteriores
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
| 10 oct 2026 | Partidos los 7 `base` combinados (19 filas, no 18) en producción | `14caec3` | Migración aplicada vía MCP de Supabase |
| 10 oct 2026 | Ajustado el prompt del nodo Vertex AI en n8n para no generar más `base` combinados | — | Cambio solo en n8n (nueva versión del workflow "Recetas con Frontend"); nada que commitear en este repo |
| 10 oct 2026 | `npm run deploy` (scripts/deploy.ps1): compila, comprueba el `.env` embebido y espeja `dist/` contra `W:\recetario` con `robocopy /MIR` | — | Primer uso purgó 25 ficheros de builds sueltos acumulados en `assets/` desde mayo de 2026 — las opciones A/B del README (zip manual) nunca limpiaban. Solo funciona desde un equipo con esa unidad de red montada |
| 10 oct 2026 | Lista de la compra (`#/lista-compra`) | `fc5a374` | `listaCompra.ts`, `ListaCompraSection.tsx`; `recipeContent.ts` ya expone `valor`/`unidad`. Verificado en el navegador: suma por `base`+`unidad`, descuenta despensa, persiste selección en localStorage |
| 10 oct 2026 | `tiempo`/`porciones`/`dificultad`: columnas + webhook + badges en RecipeDetail | — | Sin backfill de recetas antiguas, a propósito. Columnas y `Guardar en Supabase` aplicados directamente en producción (Supabase MCP, n8n MCP) |
| 10 oct 2026 | Diseño cerrado de "para hacer, realizaciones y muro de notas" (8 decisiones) | — | Solo documentación, sin código. **Prioridad para la próxima sesión**: llevarlo a un plan de implementación |

---

## Cómo mantener esto

- Al cerrar algo de **Pendientes priorizados**, tacharlo aquí y en
  [ideas.md](ideas.md), y mover la fila correspondiente de la tabla de estado.
- Al terminar una sesión con cambios de código: añadir fila al registro,
  `graphify update .`, y si el cambio afecta a una de las "dos trampas" u
  otras reglas de [CLAUDE.md](../CLAUDE.md), actualizar esa sección también.
- Si una decisión se revisita (p. ej. "cantidades en la despensa"), enlazar al
  razonamiento ya escrito en vez de reabrir el debate desde cero.
