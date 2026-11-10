# Seguimiento del proyecto

Panel de control para ir anotando qué se toca, por qué y qué queda. No
duplica [CLAUDE.md](../CLAUDE.md) (el "qué es verdad hoy") ni
[ideas.md](ideas.md) (el "qué podría hacerse"): este documento es el "qué se
ha movido y qué está abierto ahora mismo". Se actualiza en cada sesión de
trabajo, no solo al cerrar algo.

Grafo de referencia: `graphify-out/` (658 nodos, 1428 aristas, 61 comunidades tras
`graphify update .` del 10 nov 2026). Es **estructural** —código, documentos y
dependencias—: no tiene capa semántica desde la reconstrucción del 5 ago (ver
[CLAUDE.md](../CLAUDE.md)). Antes de tocar un área, conviene `graphify query "<pregunta>"`
en vez de grep a ciegas.

---

## Mapa del proyecto

| Área | Dónde vive |
|---|---|
| Autorización y seguridad | `supabase/migrations/20260805_endurecer_rls.sql`, `src/lib/n8n.ts` |
| Interfaz y rutas | `src/App.tsx`, `NavPrincipal.tsx`, `rutas.ts`, `useRuta.ts` |
| Catálogo y búsqueda | `RecipeCard`, `RecipeGrid`, `ingredientParser.ts`, `IngredientSearch.tsx` |
| Búsqueda semántica | `supabase/functions/buscar-recetas`, `indexar-recetas` |
| Detalle de receta | `RecipeDetail.tsx`, `recipeContent.ts` |
| Despensa y lista de la compra | `DespensaSection.tsx`, `useDespensa`, `inventario.ts`, `ListaCompraSection.tsx`, `listaCompra.ts` |
| Para hacer y realizaciones | `useParaHacer`, `useRealizaciones`, `MuroRealizaciones.tsx` |
| Menús | `MenusSection.tsx`, `MenuEditor.tsx`, `MenuCompra.tsx`, `MenuImprimible.tsx`, `HojaImpresa.tsx`, `lib/menus.ts`, `escalado.ts`, `paginar.ts` |
| El Laboratorio y Mi Pasaporte | `LaboratorioSection.tsx`, `PasaporteSection.tsx` |
| Migraciones | `supabase/migrations/*.sql` |
| Tooling | `vite.config.ts`, `tsconfig*.json`, `eslint.config.js` |

Servicios externos: **Supabase** (datos + auth + Storage, con RLS como
autorización real) y **n8n** (webhooks con validación de JWT propia; alta y
borrado exigen además que el email sea el del admin). No hay backend propio.

---

## Estado por área (10 nov 2026)

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
| `porciones_num` | Hecho: 74 recetas, y el alta de n8n lo estima y lo guarda desde el 10 nov | 7 nov 2026; el alta, sin probar de punta a punta | [CLAUDE.md § porciones_num](../CLAUDE.md) |
| Menús | Hecho y desplegado: editor por pases, lista de la compra escalada, imprimir como las recetas y compartir (privado, afans, enlace). Plan cerrado | 10 nov 2026, con sesión real en dev; la impresión la revisó el admin | [menus.md](menus.md) |
| Despliegue | `npm run deploy:mac` al NAS; gzip activo con la ruta real del `user.conf` | 10 nov 2026 (170 KB con gzip, 607 KB sin él) | [README](../README.md) |
| Leaked password protection | No aplicable (requiere plan Pro) | 2026 | aviso permanente del linter |

---

## Pendientes

Del plan original del 10 de octubre ya no queda nada: lista de la compra, campos
de receta, para hacer, modo cocina y búsqueda semántica están hechos (ver el
registro de abajo).

### Propuesto
1. ~~**Compartir menús**~~ **Hecho el 10 nov**: tres niveles (privado, afans, enlace); ver
   [menus.md § Compartir](menus.md). Con esto el plan de menús queda cerrado.
2. **Detección de duplicados al dar de alta**, comparando el vector de la receta nueva con
   `recetas_embeddings`. Es lo más barato que queda.
3. ~~**Que el alta rellene `porciones_num`**~~ **Hecho el 10 nov** en el flujo «Recetas con Frontend»
   (ver abajo, «Sin verificar»).
4. **Rellenar las dos recetas sin ingredientes** (*Receta de Alitas Buffalo* y *Solomillo de
   cerdo con salsa de castañas*), que hoy quedan sin `porciones_num` y fuera de las listas.

### Sin verificar
- En un móvil real: la vibración de los temporizadores, que la pantalla siga
  encendida con uno en marcha y el manejo con el pulgar del modo cocina.
- Con sesión de admin: subir una foto real al Pasaporte, guardar el contexto de
  un país y quitar un país con recetas.
- Mirón y registrado, con sesión iniciada (solo se probó como visitante).
- **El alta con `porciones_num`** (n8n, 10 nov): no se pudo probar de punta a punta, porque el webhook
  exige sesión de admin. Con la próxima receta que se dé de alta, comprobar que `porciones_num` queda
  con un entero razonable; si el alta falla, restaurar la versión `4397ffb8` del flujo.
- Los menús en producción con sesión: se probaron en desarrollo contra la base real, pero el
  navegador del panel no tiene sesión en `recetario.orballo.link`.

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
- Compartir menús: la base de datos avisa en el linter de que `anon` y `authenticated` ejecutan
  `ver_menu_compartido` (`SECURITY DEFINER`): es intencionado. Además, quien abre un menú que no
  existe sin sesión ve el enlace «← Mis menús», que le pide iniciar sesión; es un detalle menor.
- ~~**La cabecera desborda en móvil**~~ **Arreglada el 7 nov.** Medido el desborde a 375 px (408 px de ancho para un afan, 488 para el admin) y a 640 px (hasta 587 px de más para el admin): ya pasaba antes de «Menús». Ahora el título solo sale desde `sm`; las etiquetas del menú desde `lg` (Laboratorio y Nueva, solo admin, desde `xl`, igual que la insignia «admin»); por debajo son iconos con `aria-label` y `title`. Sin desborde en 375, 640, 768, 1024, 1100 y 1280 px, como admin y como afan.
- Receta *Carbonara Udon* (31 oct): `base` incoherentes (`yema de huevo` en vez de
  `huevo`, `queso parmesano`), `tiempo` y `dificultad` guardados como `""` y
  cantidades con aclaraciones entre paréntesis. Se decidió dejarla así; el prompt
  de `Vertex AI` seguirá generando lo mismo en altas nuevas.
- El catálogo se carga entero en el cliente y se filtra en memoria; pedirá
  paginación o búsqueda en servidor cuando crezca.
- **El grafo no tiene capa semántica** (ver arriba). Recuperarla cuesta un
  `/graphify --update` con modelo; mientras tanto, lo que no está en el código vive en
  `CLAUDE.md` y `docs/`.
- La lista de la compra del menú impresa va en dos columnas, en orden alfabético por filas
  (izquierda, derecha, izquierda…), así que se lee en zigzag. Leerla por columnas exigiría
  repartirla de otra forma.
- `@page { margin: 0 }` es global: afecta a cualquier página que se imprima de la web, no
  solo a los menús. Hoy no hay otra con hoja propia.

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
| 11 oct 2026 | Para hacer, realizaciones y muro de notas | `37b6cfd`, `d9f602d`, `bca061e`, `62ee2ee` | `recetas.rating` pasa a `numeric(2,1)`; el trigger de la media sigue `SECURITY DEFINER` |
| 13 oct 2026 | Modo cocina con temporizadores, búsqueda semántica (tope de 20 por hora), barra unificada, iconos | `d81d85c`, `629ce39`, `6d266eb`, `a417e0a`, `00669ef` | Edge Functions `buscar-recetas` e `indexar-recetas` |
| 14 oct 2026 | Marca «sin hacer»; El Laboratorio (candidatas, Telegram, promover al recetario); trampa de n8n con `parameters` anidados | `fb65113`, `0046e53`, `ade589d` | Prompt de Vertex corregido; Instagram aparcada |
| 15 oct 2026 | Mi Pasaporte, fases 1-3; reels por Apify | `bcee786`, `1f80309`, `4550f21` | `recetas.pais` sin clave foránea |
| 17 oct 2026 | Pasaporte: acento desde la bandera, lema y cabecera con pocas fotos | `e247b64`, `cf9e9d6` | |
| 21 oct 2026 | Pasaporte: sello, plato estrella y datos de ficha; gzip del NAS; fotos comprimidas antes de subir | `14a3811`, `f4ad992`, `171df86`, `9eaefb2`, `a3aea42` | Pasaporte verificado con sesión de admin |
| 23 oct 2026 | Propuesta de porciones (sin escribir en BD) | — | [porciones-propuesta.md](porciones-propuesta.md) |
| 30 oct 2026 | Mirón y registrado: despensa, compra y pasaporte solo con sesión | `e0bcca5` | Lectura de `paises` y `fotos_pais` pasa a `authenticated` |
| 1 nov 2026 | Cantidades largas de ingredientes ya no se salen de su columna; push y despliegue; panel de seguimiento actualizado | `401633c` | Detectado con la receta Carbonara Udon |
| 7 nov 2026 | Columna `porciones_num` (raciones de plato) con 74 recetas | `ffdf011` | Migración `20261107_porciones_num.sql`; 2 recetas sin ingredientes quedan a `null` |
| 7 nov 2026 | Menús, fase 1: tablas `menus` y `menu_recetas` con RLS, y diseño en `docs/menus.md` | `dfa6e1d` | Migración `20261107_menus.sql`; RLS verificadas simulando roles |
| 7 nov 2026 | Menús, fase 2 (entrega A): `#/menus` y `#/menu/<id>`, hooks `useMenus`/`useMenu`, editor por pases | `ff5f96f` | Probado con sesión real en dev: crear, añadir, cambiar pase, quitar y borrar (en cascada) |
| 7 nov 2026 | Menús, fase 2 (entrega B): subir/bajar dentro de un pase y `raciones` por receta | `a7c6f2b`, `6bf39a4` | Reordenar con un `upsert` atómico. Arreglado de paso: la cabecera desbordaba en móvil y tablet (ver deuda conocida) |
| 9 nov 2026 | Menús, fase 3: lista de la compra escalada (`escalado.ts`, `MenuCompra.tsx`) | `70ec4b6` | Líneas «por X» multiplican por raciones sin dividir; redondeo sobre la suma. Probada con sesión real; además, gzip del NAS arreglado y desplegado |
| 9 nov 2026 | Menús, fase 4: imprimir, con el estilo de los PDF de n8n (`MenuImprimible.tsx`, `HojaImpresa.tsx`, `paginar.ts`) | `da1b00e`, `139e7e1` | Hojas A4 exactas sin márgenes, `@page { margin: 0 }` global. Probado emulando el estilo de impresión con 25 recetas (6 hojas, sin desborde); revisado después por el admin, que lo ve bien |
| 10 nov 2026 | El PDF del menú pasa a ser réplica de la plantilla HTML de los PDF de recetas de n8n (cuadrícula, logo «M», números circulados, ◆, chips, post-it) | `4699913` | Estilos copiados a `index.css` (`.hoja*`); pesos de paginación recalculados en px. Probado emulando la impresión con 25 recetas (5 hojas, sin desborde); revisado después por el admin, que lo ve bien |
| 9 nov 2026 | Gzip del NAS: la carpeta del `user.conf` es la del **servicio** (`9ea3124c-…`), no la del portal (`fe681dc0-…`, que no existe); el README estaba mal | `c97eb5c`, `fda88f7` | El `include` termina en `*` y nginx ignora sin error un fichero ausente, por eso nadie lo notó. Medido: 170 KB con gzip frente a 607 KB sin él |
| 9 nov 2026 | Despliegue de la fase 3, la fase 4 y el PDF con el estilo de las recetas | — | Tres despliegues; la hoja del menú la revisó el admin y la ve bien |
| 10 nov 2026 | Repaso: grafo actualizado (658 nodos), `CLAUDE.md` corregido —el grafo no tiene capa semántica desde el 5 ago—, este panel reordenado y ficha de Notion al día | — | La capa semántica no la perdió ninguna actualización reciente: ya faltaba en la reconstrucción del 5 ago |
| 10 nov 2026 | El alta de n8n rellena `porciones_num`: `Vertex AI` lo pide con reglas, `Limpia respuesta` lo normaliza (y lo saca de `porciones` si falta) y `Guardar en Supabase` lo escribe | — | Versión `3a62fac0` del flujo, publicada y comprobada (parámetros idénticos a lo esperado, sin claves anidadas, `activeVersionId` = la editada). Cambio solo en n8n; sin probar de punta a punta |
| 10 nov 2026 | Menús, fase 5: compartir. `menus.visibilidad` (privado, afans, enlace), `ver_menu_compartido` para el enlace, vista de solo lectura, control en el editor y sección «Menús de los afans» | — | Migración `20261110_compartir_menus.sql`. El enlace NO usa una policy pública (listaría todos los menús): lo sirve una función `SECURITY DEFINER` que devuelve uno por id. RLS verificadas simulando roles; probado con y sin sesión, y desplegado el 10 nov: el flujo anónimo, comprobado también en la web real |

---

## Cómo mantener esto

- Al cerrar algo de **Pendientes**, tacharlo aquí y en
  [ideas.md](ideas.md), y mover la fila correspondiente de la tabla de estado.
- Al terminar una sesión con cambios de código: añadir fila al registro,
  `graphify update .`, y si el cambio afecta a una de las "dos trampas" u
  otras reglas de [CLAUDE.md](../CLAUDE.md), actualizar esa sección también.
- Si una decisión se revisita (p. ej. "cantidades en la despensa"), enlazar al
  razonamiento ya escrito en vez de reabrir el debate desde cero.
