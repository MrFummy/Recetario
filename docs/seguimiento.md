# Seguimiento del proyecto

Panel de control para ir anotando qué se toca, por qué y qué queda. No
duplica [CLAUDE.md](../CLAUDE.md) (el "qué es verdad hoy") ni
[ideas.md](ideas.md) (el "qué podría hacerse"): este documento es el "qué se
ha movido y qué está abierto ahora mismo". Se actualiza en cada sesión de
trabajo, no solo al cerrar algo.

Grafo de referencia: `graphify-out/` (579 nodos, 1200 aristas, 52 comunidades
tras `graphify update .` del 1 nov 2026). Antes de tocar un área, conviene
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
| El Laboratorio, Pasaporte, para hacer | `LaboratorioSection.tsx`, `PasaporteSection.tsx`, `useParaHacer` | Cruza Interfaz y Arquitectura |
| Búsqueda semántica | `supabase/functions/`, `IngredientSearch.tsx` | Arquitectura, servicios y seguridad |
| Migraciones RLS | `supabase/migrations/*.sql` | Migración de RLS |
| Tooling | `vite.config.ts`, `tsconfig*.json`, `eslint.config.js` | Config TypeScript / Vite / ESLint / npm |

Servicios externos: **Supabase** (datos + auth + Storage, con RLS como
autorización real) y **n8n** (webhooks con validación de JWT propia; alta y
borrado exigen además que el email sea el del admin). No hay backend propio.

---

## Estado por área (1 nov 2026)

| Área | Estado | Última verificación | Ver |
|---|---|---|---|
| Autorización (RLS + n8n) | Endurecida, sin huecos conocidos | 11 oct 2026 (RLS simuladas por rol) | [CLAUDE.md § Estado actual](../CLAUDE.md) |
| Ingredientes estructurados | Hecho, recetas migradas | 23 ago 2026 | [migración](../supabase/migrations/20260823_estructurar_ingredientes.sql) |
| Despensa y router | Hecho | 31 ago 2026 | `DespensaSection.tsx`, `rutas.ts` |
| `base` combinados | Partidos; prompt de Vertex corregido el 14 oct | 14 oct 2026 | [CLAUDE.md § Pendiente](../CLAUDE.md) |
| Lista de la compra | Hecho, cálculo en el cliente | 10 oct 2026 | `ListaCompraSection.tsx` |
| `tiempo`/`porciones`/`dificultad` | Hecho, sin backfill de antiguas | 14 oct 2026 | [CLAUDE.md § Tiempo, porciones y dificultad](../CLAUDE.md) |
| Para hacer, realizaciones y muro | Hecho | 11 oct 2026, en producción | [migración](../supabase/migrations/20261011_para_hacer_y_realizaciones.sql) |
| Modo cocina y temporizadores | Hecho; sonido probado en móvil | 13 oct 2026 | `ModoCocina.tsx`, `tiempos.ts` |
| Búsqueda semántica | Hecha, con tope de 20 por hora | 13 oct 2026 | `buscar-recetas`, `indexar-recetas` |
| Recetas «sin hacer» | Hecho | 14 oct 2026 | [migración](../supabase/migrations/20261014_sin_hacer.sql) |
| El Laboratorio (candidatas) | Hecho, reels por Apify; Instagram aparcada | 15 oct 2026 | [candidatas.md](candidatas.md) |
| Mi Pasaporte | Fases 1-3 hechas; admin verificada con sesión | 21 oct 2026 | [pasaporte.md](pasaporte.md) |
| Mirón y registrado | Hecho; probado solo como visitante | 30 oct 2026 | [CLAUDE.md § Mirón y registrado](../CLAUDE.md) |
| Despliegue | `npm run deploy:mac` al NAS, con gzip en el portal | 1 nov 2026 | [README](../README.md) |
| Leaked password protection | No aplicable (requiere plan Pro) | 2026 | aviso permanente del linter |

---

## Pendientes

Del plan original del 10 de octubre ya no queda nada: lista de la compra, campos
de receta, para hacer, modo cocina y búsqueda semántica están hechos (ver el
registro de abajo).

### Propuesto
1. ~~**Porciones de cada receta**~~ **Hecho el 7 nov 2026**: columna
   `porciones_num` con 74 recetas (raciones de plato, no piezas); ver
   [CLAUDE.md](../CLAUDE.md). **Siguiente: el menú semanal** (paso 2 del plan de
   menús), que escalará por comensales. Diseño cerrado en [menus.md](menus.md); **fase 1 (base de datos) hecha el 7 nov**, falta el frontend (fases 2-4).
2. **Detección de duplicados al dar de alta**, comparando el vector de la receta
   nueva con `recetas_embeddings`. Es lo más barato que queda.

### Sin verificar
- En un móvil real: la vibración de los temporizadores, que la pantalla siga
  encendida con uno en marcha y el manejo con el pulgar del modo cocina.
- Con sesión de admin: subir una foto real al Pasaporte, guardar el contexto de
  un país y quitar un país con recetas.
- Mirón y registrado, con sesión iniciada (solo se probó como visitante).

### Abierto en El Laboratorio
- Crear el bot de Telegram (BotFather) y obtener el `chat_id` propio.
- Retomar o no la entrada por Instagram (publicar la app de Meta, política de
  privacidad).

### Ideas sin desarrollar ([ideas.md](ideas.md))
Favoritos, sugerencia semanal por correo, copia de seguridad a Drive, auditoría
de huérfanos del bucket, alta desde una URL o Telegram, rellenar las recetas sin
foto, enlace a la web en el correo de compartir, filtrar por tiempo y
ordenar por dificultad, y backfill de `tiempo`/`porciones`/`dificultad` de las
antiguas.

### Deuda conocida
- Receta *Carbonara Udon* (31 oct): `base` incoherentes (`yema de huevo` en vez de
  `huevo`, `queso parmesano`), `tiempo` y `dificultad` guardados como `""` y
  cantidades con aclaraciones entre paréntesis. Se decidió dejarla así; el prompt
  de `Vertex AI` seguirá generando lo mismo en altas nuevas.
- El catálogo se carga entero en el cliente y se filtra en memoria; pedirá
  paginación o búsqueda en servidor cuando crezca.

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
| 10 oct 2026 | Lista de la compra, campos de receta, despliegue al NAS | `fc5a374`, `300960b`, `201cbb6` | Ver filas anteriores |
| 11 oct 2026 | Para hacer, realizaciones y muro de notas | `37b6cfd`, `d9f602d`, `bca061e`, `62ee2ee` | `recetas.rating` pasa a `numeric(2,1)`; el trigger de la media sigue `SECURITY DEFINER` |
| 13 oct 2026 | Modo cocina con temporizadores, búsqueda semántica (tope de 20 por hora), barra unificada, iconos | `d81d85c`, `629ce39`, `6d266eb`, `a417e0a`, `00669ef` | Edge Functions `buscar-recetas` e `indexar-recetas` |
| 14 oct 2026 | Marca «sin hacer»; El Laboratorio (candidatas, Telegram, promover al recetario); trampa de n8n con `parameters` anidados | `fb65113`, `0046e53`, `ade589d` | Prompt de Vertex corregido; Instagram aparcada |
| 15 oct 2026 | Mi Pasaporte, fases 1-3; reels por Apify | `bcee786`, `1f80309`, `4550f21` | `recetas.pais` sin clave foránea |
| 17 oct 2026 | Pasaporte: acento desde la bandera, lema y cabecera con pocas fotos | `e247b64`, `cf9e9d6` | |
| 21 oct 2026 | Pasaporte: sello, plato estrella y datos de ficha; gzip del NAS; fotos comprimidas antes de subir | `14a3811`, `f4ad992`, `171df86`, `9eaefb2`, `a3aea42` | Pasaporte verificado con sesión de admin |
| 23 oct 2026 | Propuesta de porciones (sin escribir en BD) | — | [porciones-propuesta.md](porciones-propuesta.md) |
| 30 oct 2026 | Mirón y registrado: despensa, compra y pasaporte solo con sesión | `e0bcca5` | Lectura de `paises` y `fotos_pais` pasa a `authenticated` |
| 1 nov 2026 | Cantidades largas de ingredientes ya no se salen de su columna; push y despliegue; panel de seguimiento actualizado | `401633c` | Detectado con la receta Carbonara Udon |
| 7 nov 2026 | Columna `porciones_num` (raciones de plato) con 74 recetas | — | Migración `20261107_porciones_num.sql`; 2 recetas sin ingredientes quedan a `null` |
| 7 nov 2026 | Menús, fase 1: tablas `menus` y `menu_recetas` con RLS, y diseño en `docs/menus.md` | — | Migración `20261107_menus.sql`; RLS verificadas simulando roles |

---

## Cómo mantener esto

- Al cerrar algo de **Pendientes priorizados**, tacharlo aquí y en
  [ideas.md](ideas.md), y mover la fila correspondiente de la tabla de estado.
- Al terminar una sesión con cambios de código: añadir fila al registro,
  `graphify update .`, y si el cambio afecta a una de las "dos trampas" u
  otras reglas de [CLAUDE.md](../CLAUDE.md), actualizar esa sección también.
- Si una decisión se revisita (p. ej. "cantidades en la despensa"), enlazar al
  razonamiento ya escrito en vez de reabrir el debate desde cero.
