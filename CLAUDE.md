# Mi Recetario — contexto del proyecto

SPA estática de React + TypeScript para organizar recetas. **No hay backend propio**:
el navegador habla directo con Supabase (datos, auth, Storage) y delega las
operaciones pesadas en webhooks de n8n. Se compila a estáticos y se sirve desde
un Synology.

Las convenciones de código (TS estricto sin `any`, ficheros por debajo de 300
líneas, credenciales solo en `.env`) están en [AGENTS.md](AGENTS.md). El
despliegue está en el [README](README.md).

## Empieza por el grafo

`graphify-out/` contiene un grafo de conocimiento del proyecto: 280 nodos y 462
aristas sobre 50 ficheros, en 21 comunidades. Combina extracción estructural del
código (AST) con una capa semántica que recoge lo que el código no dice por sí
solo: la arquitectura, los servicios externos y el modelo de autorización.

**La capa semántica lleva congelada en 37 nodos desde antes del 13 de agosto**,
mientras la de AST ha pasado de 190 a 243. Todo lo que ha entrado después —la
despensa, el router, `inventario.ts`— está en el grafo como estructura pero sin
una sola descripción. `graphify update .` mantiene eso así: resella el AST y no
toca la capa semántica, que exige la pasada completa y sí gasta API. Para las
partes nuevas, entonces, el grafo localiza pero no explica: lee el código.

Y ojo con las cifras de arriba, que ya se han quedado obsoletas dos veces: el
grafo está sellado en `c67f12e` (`built_at_commit` en `graph.json`), un par de
commits por detrás. Si no cuadran, manda el fichero, no esta nota.

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
- **Auditar huérfanos del bucket tiene dos trampas**, y las dos han mordido ya.
  La primera: comparar con `LIKE '%' || o.name` contra `recetas.foto_url` da
  falsos positivos, porque un fichero llamado `.jpg` casa con *cualquier* URL
  terminada en `.jpg` y aparece como si estuviera en uso — así se escondió uno
  durante meses. Compara la ruta completa y excluye `_default.jpg` a mano.
  La segunda: **borrarlos con `delete from storage.objects` no borra el fichero
  físico**, solo la fila; el fichero se queda ocupando espacio y ya no lo
  encuentra ninguna auditoría, que es peor que no tocarlo. Hay que ir por la
  Storage API: el panel, `supabase storage rm`, o `remove()` con sesión de admin,
  que es quien tiene la policy de borrado.

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

Se toca desde dos sitios: las casillas de cualquier receta y la sección
`#/despensa` ([DespensaSection.tsx](src/components/DespensaSection.tsx)), cuya
función estrella es leerlo al revés —*qué puedo cocinar con lo que tengo*—
ordenando el catálogo por cuántos ingredientes faltan
([inventario.ts](src/lib/inventario.ts)).

**`useDespensa` se monta una sola vez, en `App`, y baja por props.** No es
cosmético: la ficha de una receta se dibuja sobre el catálogo, así que dos
llamadas al hook conviven en pantalla, y con una copia del conjunto por lista lo
marcado en la ficha no se vería en el resto. Si algún día aparece un tercer sitio
que la use, antes que seguir pasándola por props conviene un contexto.

Añadir a mano autocompleta sobre los `base` que ya existen, y solo deja crear uno
nuevo con un segundo clic deliberado. Es el compromiso entre las dos cosas que se
pidieron: que se puedan añadir cosas que no salen en ninguna receta (sal, aceite)
sin que acaben conviviendo "cebolla" y "cebollas". La comparación ignora tildes,
así que escribir `azucar` reconoce `azúcar` en lugar de duplicarlo.

### Camino feliz, verificado el 8 ago 2026

Votar, editar notas y fecha, cambiar foto, compartir por email, alta y borrado en
cascada: los seis pasos comprobados de punta a punta contra producción, con
sesión de admin.

**31 ago 2026**: la despensa persiste entre visitas y entre recetas, comprobado
con sesión iniciada. Se borraron dos huérfanas del bucket —`Raxo_de_la_abuela.jpg`
y `Wok_de_verduras_al_curry.jpeg`— y `_default.jpg` sigue donde tiene que estar,
que era el riesgo real de esa limpieza.

**10 sep 2026**: el bucket queda limpio del todo. Faltaba una tercera huérfana,
la más pesada —un objeto llamado literalmente `.jpg`, de 1.429 kB, del 24 de
mayo, con pinta de subida con el nombre vacío—, que se escapó de la limpieza
anterior por la primera de las dos trampas de arriba. Borrada desde el panel y
verificado después: 48 objetos, 54 MB, y el único fichero sin referencia en
`recetas.foto_url` es `_default.jpg`, como debe ser.

### Pendiente

- ~~Activar *Leaked password protection*.~~ **No se puede: es de plan Pro y la
  organización `Orballo` está en el gratuito.** Se queda como aviso permanente
  del linter de Supabase; no es una tarea pendiente. Vive en *Authentication →
  Sign In / Providers → Email*, no en *Policies* como decía esta nota antes.
  Lo que sí se puede tocar en gratuito, en esa misma pantalla, es la longitud
  mínima de contraseña y los tipos de carácter exigidos.
- ~~Los `base` combinados.~~ **Partidos el 10 de octubre de 2026** — ver
  [la migración](supabase/migrations/20261010_partir_base_combinados.sql).
  Eran 7 valores distintos (no 7 recetas: una variante nueva, `sal y
  pimienta` sin "negra", apareció al consultar con SQL en vez de contar a
  ojo) en 19 filas de `recetas.ingredientes`, no 18. Cada fila combinada pasó
  a una fila por condimento. **Sigue pendiente ajustar el prompt de Vertex**:
  sin eso, una receta nueva puede volver a generar un `base` combinado y esta
  migración habría que repetirla. El PDF, Notion y Sheets sí notan el cambio:
  donde antes salía una línea "Sal y pimienta negra" ahora salen dos, "Sal" y
  "Pimienta negra" — correcto, pero distinto a como estaba.

### Las rutas van por el hash

Desde el 31 de agosto la app enruta: `#/` el catálogo, `#/nueva` el alta y
`#/receta/<id>` una ficha concreta, que ya se puede enlazar y compartir.

Es un router propio de dos ficheros —[rutas.ts](src/lib/rutas.ts) define el tipo
`Ruta` y lo traduce a hash y de vuelta, [useRuta.ts](src/hooks/useRuta.ts) lo
escucha— en vez de `react-router`, porque son tres rutas planas sin anidamiento
ni parámetros de búsqueda.

**Va por el hash a propósito**, no por comodidad: los estáticos se sirven desde
un Synology sin reescritura, así que `/receta/123` devolvería un 404 —no existe
ese fichero— y el enlace compartido no abriría nada. Con hash, esa parte no se le
pide nunca al servidor. Para pasar a rutas limpias hay que tocar las dos
funciones de `rutas.ts` **y** configurar el `try_files` de Nginx; una sin la otra
rompe los enlaces.

Dos detalles que parecen menores y no lo son:

- **La ficha abierta se deriva de la URL**, no de un `useState` aparte. Por eso
  desapareció el `setSelectedRecipe({ ...receta, campo })` que había tras cada
  edición: `useRecipes` ya mantiene su lista al día y la ficha lee de ahí.
- **Cerrar la ficha llama a `volverAtras`**, que hace un `history.back()` solo si
  esta pestaña ha navegado antes. Quien llega por un enlace compartido no tiene
  nada nuestro detrás, y un `back()` ahí lo sacaría de la web. Tras borrar una
  receta se usa `reemplazarPor`, que pisa la entrada del historial para que el
  atrás no devuelva a una ficha que ya no existe.

## La lista de la compra

**Hecha el 10 de octubre de 2026** — tercer y último punto del plan del 23 de
agosto (router, sección de despensa, lista de la compra). Vive en
`#/lista-compra` ([ListaCompraSection.tsx](src/components/ListaCompraSection.tsx)),
con la agregación en [listaCompra.ts](src/lib/listaCompra.ts).

Eliges recetas de una lista con checkboxes (la selección se recuerda en
`localStorage` de ese navegador, no en Supabase: es de la semana, no de la
cuenta), se agregan sus ingredientes por `base`, se descuenta lo que la
despensa dice que tienes, y queda la lista. **Tachar un ítem llama a
`despensa.anadir`** —añadir a la despensa—, así que no hay una tabla de
"comprado" aparte ni dos sitios que sincronizar.

**Todo el cálculo es en el cliente, sin n8n ni Vertex**, al contrario de lo
que proponía la lluvia de ideas original: `valor`/`unidad` son poco fiables
en la BD (muchos condimentos son "al gusto", no numéricos), así que sumar a
ciegas habría sido peor que no sumar. Se suma `valor` solo cuando es numérico
y coincide la `unidad` entre todas las apariciones de un `base`; el resto
se lista tal cual viene, una línea por variante, sin inventar una suma entre
cosas que no se sabe si son comparables. Esto exigió que
[recipeContent.ts](src/lib/recipeContent.ts) dejara de descartar `valor` y
`unidad` del JSONB —hasta ahora `normalizeIngredients()` solo exponía
`qty`/`name`/`base`, aunque la BD ya los traía desde la migración del 23 de
agosto.

Partir los `base` combinados (hecho el mismo 10 de octubre, ver *Pendiente*)
era condición previa: una lista que pidiera "sal y pimienta negra" como un
solo producto habría sido peor que la que ya tienes en la cabeza.

**Decidido que la despensa NO guarda cantidades.** Se planteó, porque tener
"cebolla" no dice si llega para la lasaña que pide 2, y se descartó: un
inventario se desactualiza solo y uno falso es peor que ninguno, porque te fías
de él. Las cantidades importan en la lista de la compra, donde la pregunta es
puntual y no hay estado que envejezca. El razonamiento completo está en
[docs/ideas.md](docs/ideas.md); conviene releerlo antes de volver a proponerlo.

## Para hacer, realizaciones y muro de notas

**Hecho el 11 de octubre de 2026** ([la migración](supabase/migrations/20261011_para_hacer_y_realizaciones.sql);
decisiones en [docs/ideas.md](docs/ideas.md)). `valoraciones` ya no es "un voto
por usuario": cada fila es una vez que se cocinó la receta (`fecha`, `notas`,
`puntuacion` opcional), sin `UNIQUE (receta_id, user_id)`. El voto rápido de
estrellas desapareció; `recetas.rating` sigue siendo la media por trigger (que
sigue siendo `SECURITY DEFINER`) y es `numeric(2,1)` (antes `smallint`, que truncaba la media al entero).
`para_hacer` sustituye a la selección en `localStorage` de la lista de la
compra, y `useParaHacer` se monta una vez en `App`, como la despensa. Marcar
"ya hecha" quita la receta de `para_hacer` desde el cliente. Las notas del
muro solo las ven usuarios con sesión; las firma `perfiles.nombre`. Las RLS se
verificaron simulando roles y el frontend se probó con sesión real en producción
ese mismo día.

## Tiempo, porciones y dificultad

**Hecho el 10 de octubre de 2026.** Vertex ya los extraía de cada receta,
pero el nodo `Guardar en Supabase` de "Recetas con Frontend" no los escribía
y la tabla no tenía columnas para ellos: se calculaban, se pagaban y se
descartaban. Ahora `recetas` tiene `tiempo`/`porciones`/`dificultad` (`text`,
`nullable`) y se ven como badges en
[RecipeDetail.tsx](src/components/RecipeDetail.tsx).

**Sin backfill, a propósito**: las recetas anteriores a esa fecha quedan con
los tres campos en `null` y simplemente no muestran los badges. Rellenarlas
exige volver a pasarlas por Vertex —no solo regenerar el PDF desde Supabase,
que es lo que hace el flujo *Regenerar PDFs antiguos*—, y es trabajo aparte,
no decidido todavía.

## Hacia dónde puede crecer

[docs/ideas.md](docs/ideas.md) recoge una lluvia de ideas de posibles
funcionalidades, con lo hecho y lo decidido anotado encima. Sigue en pie que
Vertex extrae `tiempo`, `porciones` y `dificultad` de cada receta y se descartan
al guardar: es lo más barato que queda por rescatar.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
