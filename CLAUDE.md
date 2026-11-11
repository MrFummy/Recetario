# Mi Recetario — contexto del proyecto

SPA estática de React + TypeScript para organizar recetas. **No hay backend propio**:
el navegador habla directo con Supabase (datos, auth, Storage) y delega las
operaciones pesadas en webhooks de n8n. Se compila a estáticos y se sirve desde
un Synology.

Las convenciones de código (TS estricto sin `any`, ficheros por debajo de 300
líneas, credenciales solo en `.env`) están en [AGENTS.md](AGENTS.md). El
despliegue está en el [README](README.md).

## Empieza por el grafo

`graphify-out/` contiene un grafo de conocimiento del proyecto: 748 nodos y 1638
aristas sobre 148 ficheros, en 69 comunidades (10 nov 2026). **Es estructural**: sale
del código (AST), de los documentos y de las dependencias de `package.json`. **No tiene
capa semántica** —decisiones, servicios externos, roles, RLS, webhooks—: la hubo hasta
julio y se perdió en la reconstrucción del 5 de agosto, y desde entonces
`graphify update .` (sin coste, solo AST) no la regenera. Para recuperarla hace falta
`/graphify --update`, que extrae con un modelo y sí cuesta. Lo que el grafo no dice
—por qué hay una RLS, qué trampa tiene n8n— está en este fichero y en `docs/`.

Las comunidades se nombran por su fichero central (`MenuEditor.tsx`, `recipeContent.ts`,
`DespensaSection.tsx`…), así que es más útil preguntar que navegarlas a mano:

```bash
graphify query "¿qué ficheros intervienen en los menús?"
```

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

Lo produce el prompt del nodo `Vertex AI` (que pese al nombre llama a la API de
Google AI Studio, no a Vertex; ver *Búsqueda semántica*), y `Limpia respuesta` añade el `id` y
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
con sesión iniciada. El bucket quedó sin huérfanas —`Raxo_de_la_abuela.jpg` y
`Wok_de_verduras_al_curry.jpeg` borradas— y `_default.jpg` sigue donde tiene que
estar.

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
  a una fila por condimento. **El prompt de Vertex se corrigió el 14 de
  octubre** (la regla ya estaba escrita desde el 10, pero en una clave que n8n
  ignoraba; ver *Trampa de n8n* más abajo), así que una receta nueva ya no debería
  generar un `base` combinado. El PDF, Notion y Sheets sí notan el cambio:
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

## Mirón y registrado

**Hecho el 30 de octubre de 2026.** El catálogo y el modo cocina son públicos; el
resto es de quien tiene sesión. Despensa, Compra y Pasaporte se ocultan en la nav
([NavPrincipal.tsx](src/components/NavPrincipal.tsx)) y sus rutas pasan por
`SoloLogueados` ([Avisos.tsx](src/components/Avisos.tsx)), que enseña «esto es
para quien se registra» con botón al login. Como `SoloAdmin`, solo decide qué se
pinta.

**En el servidor, solo el Pasaporte necesitaba cambio**
([la migración](supabase/migrations/20261030_pasaporte_solo_logueados.sql)): la
lectura de `paises` y `fotos_pais` pasó de `anon` a `authenticated`. Despensa y
para hacer ya eran `authenticated`. **El bucket `fotos-paises` sigue público a
propósito**: se protegen las filas, no las imágenes; pasar a URLs firmadas
complicaba la carga por poco.

- **El registro está abierto**, así que esto es un incentivo para crear cuenta,
  no un filtro de acceso.
- **El modo cocina queda público a propósito**: es solo lectura, no toca datos, y
  es el mejor gancho para el visitante. Restringirlo es cambiar la condición del
  botón en `RecipeDetail` a `isAfan || isAdmin`.
- Un enlace `#/pasaporte` o `#/despensa` abierto sin sesión enseña el aviso, no un 404.
- Verificado como visitante en producción; con sesión, sin probar.

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

## Recetas «sin hacer»

**Hecho el 14 de octubre de 2026** ([la migración](supabase/migrations/20261014_sin_hacer.sql)).
`recetas.sin_hacer` es una marca **manual**, a propósito y no derivada de que no
haya realizaciones: una receta sin ninguna puede estar hecha pero sin registrar.
Se pinta como etiqueta amarilla arriba a la izquierda de `RecipeCard`, hay un
filtro en `FilterBar` y el admin la alterna con el icono de etiqueta de la ficha.

Un trigger `SECURITY DEFINER` (`quitar_sin_hacer`) la apaga al insertar una
realización y **nunca la vuelve a poner**; borrar la realización no la devuelve.
Tiene que ser `DEFINER` por lo mismo que la media: el `UPDATE` de `recetas` es del
admin, y con `INVOKER` afectaría a 0 filas sin error. Como la apaga la base de
datos, `refrescarRating` relee también `sin_hacer`. La carga inicial marcó las 12
recetas sin foto. Ese mismo día se vaciaron las 3 valoraciones antiguas para
empezar de cero con las realizaciones.

## El Laboratorio (recetas candidatas)

**Hecho el 14 de octubre de 2026**; el plan y lo aprendido están en
[docs/candidatas.md](docs/candidatas.md). Recetas que se quieren *probar* antes de decidir
si entran al recetario. Entran por un bot de Telegram (flujo de n8n «El Laboratorio -
entrada por Telegram»: YouTube, reel de Instagram —vídeo vía Apify, o solo el pie si falla—, web o texto pegado, todo
convertido con Gemini) y se guardan en la tabla `candidatas`, **aparte de `recetas`**: esta
es de lectura pública y alimenta PDF, Notion y embeddings. Solo el admin las lee y escribe
(RLS con `es_admin()`); n8n escribe con `service_role`.

La web las enseña en `#/laboratorio` ([LaboratorioSection.tsx](src/components/LaboratorioSection.tsx)),
solo con sesión de admin. `useCandidatas` vive dentro de la sección, no en `App`: nadie más
usa esos datos. Se pueden ver, corregir (título, categoría, notas), marcar como probadas y
borrar —borrar también quita la foto de `fotos-candidatas`— y **pasarlas al recetario**
(`PromoverModal`, `lib/promover.ts`): pide categoría, fecha y la foto *de tu plato*, manda
la candidata al webhook de alta y **espera a que la receta aparezca en `recetas`** antes de
borrarla (el alta responde «Workflow was started» al instante; si no aparece en 2,5 min,
la candidata se queda). En n8n es un desvío de dos nodos tras `Solo admin (nueva)` en
«Recetas con Frontend»: `¿Viene de una candidata?` y `Receta de candidata`, que imita la
respuesta de Gemini y reconecta en `Limpia respuesta`, así que PDF, Notion, Sheets y
Supabase son los de siempre. Probado el 14 de octubre.

- **Descartar es borrar**: no se guardan descartadas.
- **Los reels se descargan con Apify** (15 oct 2026; actor `snapinsta~instagram-downloader-api`,
  credencial `Apify` de tipo Header Auth, plan gratuito): el flujo pide el MP4, lo descarga y se lo
  pasa a Gemini como `inlineData` junto con el pie. **Tope de 14 MB** (~20 MB de petición en base64);
  si Apify falla, la descarga falla o el vídeo es mayor, cae al camino de **solo el pie** y la
  candidata nace **parcial**, sin pasos. Detalles y trampas en [docs/candidatas.md](docs/candidatas.md).
- `de_video` marca las que salieron de un vídeo, donde las cantidades son menos fiables.
- **Borrar un objeto de Storage exige también una policy de SELECT**, no solo la de
  DELETE: sin ella `remove()` responde sin error y no borra nada. Pasó con
  `fotos-candidatas`; no se puede arreglar con SQL (Storage prohíbe el borrado directo en
  `storage.objects`): hay que usar su API.
- `crypto.randomUUID` **no existe** en el nodo Code de este n8n (autoalojado): el id se genera con un
  uuid v4 propio, o la inserción falla con `invalid input syntax for type uuid`.
- La entrada por DM de Instagram quedó **aparcada** (la app de Meta tiene que estar en
  vivo para recibir webhooks reales); detalles en el plan.

## Mi pasaporte

**Fases 1, 2 y 3 hechas el 15 de octubre de 2026** (la 3, administración, verificada con sesión de
admin en producción el 21 de octubre, salvo subir una foto real, guardar el contexto y quitar un país
con recetas); plan y detalles en [docs/pasaporte.md](docs/pasaporte.md).
Las recetas del catálogo vistas por países visitados: `#/pasaporte` (mapamundi SVG propio y
sellos) y `#/pasaporte/<ISO>` (página de país). Pública para todos; escribe solo el admin.
`recetas.pais` es el código ISO alfa-2, **sin clave foránea** a `paises` (etiquetar una receta no
exige dar de alta el país). Tablas `paises` y `fotos_pais`, bucket público `fotos-paises`
([la migración](supabase/migrations/20261015_pasaporte.sql)). El país se asigna en la ficha, en
modo edición. El admin da de alta países, escribe el contexto, sube fotos (comprimidas en el
navegador con `lib/imagen.ts`) y elige la portada desde la propia web. **Quitar un país deja sus
recetas sin país**, no las borra.

- El mapa (`src/assets/mapamundi.json`) se **carga con `import()` dinámico**: no importarlo
  estáticamente o entra en el bundle principal (727 KB). Se regenera con
  `scripts/generar-mapamundi.mjs`, cuyas dependencias no están en el proyecto.
- **Cabecera de país (17 oct 2026)**: ya no hay galería debajo; la cabecera enseña como máximo
  3 fotos (`FOTOS_CABECERA`, portada primero) y la gestión de todas vive en `PaisEditor`. Las
  banderas son imágenes de flagcdn.com ([Bandera.tsx](src/components/Bandera.tsx)), no emoji:
  **Windows no dibuja los emoji de bandera** (salen como dos letras). Cae al emoji si la imagen falla.
- **Acento y lema (17 oct 2026)**: cada país toma su color del dominante de la bandera
  ([colorBandera.ts](src/lib/colorBandera.ts), [useAcentoPais.ts](src/hooks/useAcentoPais.ts)):
  lee los píxeles con un canvas, lo que exige el CORS abierto de flagcdn. Si falla, la página
  queda sin acento. `paises.lema` ([la migración](supabase/migrations/20261017_lema_pais.sql))
  es una frase opcional bajo el nombre, editable en «Gestionar país».
- **Sello, plato estrella y datos de ficha (21 oct 2026)**: el sello de entrada
  ([SelloPasaporte.tsx](src/components/SelloPasaporte.tsx)), el plato estrella (elegido a mano en
  `paises.plato_estrella`; sin elección, la mejor valorada) y capital, idioma y moneda escritos a mano
  (`paises.capital/idioma/moneda`). Detalle en [docs/pasaporte.md](docs/pasaporte.md); no queda nada
  pendiente de esa lista.
- Al borrar fotos de `fotos-paises` hay que usar la API de Storage, igual que en
  `fotos-candidatas` (el SQL directo no borra el objeto).
- El alta de recetas pasa por n8n, que no escribe `pais`: se etiqueta después desde la ficha.

## Tiempo, porciones y dificultad

**Hecho el 10 de octubre de 2026.** Vertex ya los extraía de cada receta,
pero el nodo `Guardar en Supabase` de "Recetas con Frontend" no los escribía
y la tabla no tenía columnas para ellos: se calculaban, se pagaban y se
descartaban. Ahora `recetas` tiene `tiempo`/`porciones`/`dificultad` (`text`,
`nullable`) y se ven como badges en
[RecipeDetail.tsx](src/components/RecipeDetail.tsx).

**Trampa de n8n (descubierta el 14 de octubre de 2026).** Ese cambio del nodo
`Guardar en Supabase` **no llegó a ejecutarse hasta el 14**: se había escrito en
`parameters.parameters.jsonBody`, una clave anidada que n8n ignora, y además el
borrador del 10 de octubre nunca se publicó (la versión activa seguía siendo la del
31 de agosto). Lo mismo le pasó a la regla de condimentos del nodo `Vertex AI`.
Prueba: las 4 recetas dadas de alta el 13 de octubre tienen los tres campos a
`null`. Se movió todo al `jsonBody` de nivel superior y se publicó el 14.
**Al editar nodos de n8n por MCP, comprobar después que `parameters` no tiene una
clave `parameters` anidada y que `activeVersionId` es la versión editada**; un
`updateNodeParameters` sin `replace: true` o con la ruta equivocada falla en
silencio. Las recetas dadas de alta entre el 10 y el 14 de octubre quedan sin
`tiempo`/`porciones`/`dificultad`, igual que las anteriores.

**Sin backfill, a propósito**: las recetas anteriores a esa fecha quedan con
los tres campos en `null` y simplemente no muestran los badges. Rellenarlas
exige volver a pasarlas por Vertex —no solo regenerar el PDF desde Supabase,
que es lo que hace el flujo *Regenerar PDFs antiguos*—, y es trabajo aparte,
no decidido todavía.

### `porciones_num`: raciones como número

**Hecho el 7 de noviembre de 2026** ([la migración](supabase/migrations/20261107_porciones_num.sql)).
`recetas.porciones_num` (`smallint`, nullable) es lo que escalará el plan de menús y la
lista de la compra por comensales. **Es aparte de `porciones`**, el texto libre que se
ve en la ficha («2 personas», «1 brocheta»), que no se toca ni se sustituye.

**Mide raciones de plato, no piezas**: unas galletas que salen 30 son ~8, no 30; si
no, un menú para 4 pediría 4/30 de tanda. Los valores son estimaciones mías revisadas
con el admin (la tabla y su fiabilidad A/M/B están en
[docs/porciones-propuesta.md](docs/porciones-propuesta.md)): 74 recetas con valor.
**Quedan en `null` las alitas buffalo y el solomillo de cerdo con castañas**, que no
tienen ingredientes en la BD. **El alta la rellena desde el 10 de noviembre de 2026** (flujo «Recetas con Frontend», versión
`3a62fac0`): el prompt del nodo `Vertex AI` pide `porciones_num` con sus reglas (raciones de plato,
no piezas; nunca `null`), `Limpia respuesta` lo normaliza a un entero de 1 a 99 —y lo saca de
`porciones` si el modelo no lo da, que es lo que pasa con las candidatas del Laboratorio; un rango
dio su punto medio— y `Guardar en Supabase` lo escribe. **Sin probar de punta a punta**: el webhook
exige sesión de admin y un alta real crea receta, PDF, Notion y correo; se comprobará con la próxima
receta que se dé de alta (`select titulo, porciones, porciones_num from recetas order by created_at
desc limit 3`). Para revertir, restaurar en n8n la versión `4397ffb8`. Antes de escalar, hay que
tratar aparte las 6 recetas que ya llevan alguna cantidad «por persona» (risotto,
tallarines con pesto, wok de tallarines, pescado al papillote, peras y sabayon) y la
Brochetas Caprese, cuyos ingredientes ya van «por brocheta»: multiplicarlas sin más
contaría dos veces.

## Menús

**Fases 1 y 2 el 7 de noviembre de 2026; las 3 (lista de la compra escalada) y 4 (imprimir), el 9**: base de datos y el frontend en
`#/menus` y `#/menu/<id>` (crear, comensales, recetas por pase, subir/bajar y `raciones` por receta) ([MenusSection.tsx](src/components/MenusSection.tsx)),
solo con sesión. Y el 10, **compartirlos**: el plan de menús queda cerrado.
Un menú es una selección de recetas para una ocasión (no una semana), con comensales y
organizada por pases; del menú saldrá la lista de la compra escalada. Diseño y fases en
[docs/menus.md](docs/menus.md); tablas `menus` y `menu_recetas`
([la migración](supabase/migrations/20261107_menus.sql)).

- **Privados**: solo el autor los ve y toca. `menu_recetas` no lleva `user_id`: se
  autoriza por el dueño de su menú con un `exists`, **también al insertar y actualizar**;
  sin eso se podría colgar una receta de un menú ajeno. El `UPDATE` de `menus` lleva
  `with check` además de `using`, o se podría regalar un menú cambiando `user_id`.
- `menu_recetas.raciones` a `null` significa «las del menú» (comensales). Existe para
  pedir 12 brochetas aunque la receta sea «por brocheta».
- Subir/bajar intercambia los `orden` de dos filas con **un solo `upsert`** (atómico); el
  `upsert` lleva las filas enteras porque también es un INSERT posible y `pase` es obligatorio.
- `useMenus` (lista) y `useMenu` (uno) viven dentro de la sección, no en `App`; el editor
  se monta con `key={id}` y por eso `useMenu` no reinicia su estado al cambiar de id.
  Una receta entra en el pase que le toca por su categoría ([menus.ts](src/lib/menus.ts)).
- **La lista de la compra del menú** ([MenuCompra.tsx](src/components/MenuCompra.tsx)) reutiliza
  `listaDeLaCompra` con un `Map<id, Escala>` y escala cada línea con
  [escalado.ts](src/lib/escalado.ts): `valor × raciones ÷ porciones_num`, con raciones =
  `menu_recetas.raciones ?? menu.comensales`. **Las líneas «por X»** (13 en el catálogo: «por
  persona», «por brocheta», «por rollito»…) ya son por ración, así que se multiplican por las
  raciones **sin dividir** (`esPorRacion` mira el texto de `cantidad`). Sin `porciones_num`
  la receta no se escala. **Se redondea sobre la suma de todas las recetas**, no línea a línea:
  unidades enteras (unidad, diente, yema…) hacia arriba, g y ml sin decimales (con uno por
  debajo de 10), el resto con dos. Sin `escalas` la función se comporta como siempre, que es
  lo que usa la lista de «para hacer». Lo que no es numérico («al gusto») no se escala.
- **Imprimir** es CSS de impresión, sin librerías ni n8n, y **es una réplica de la plantilla v5 del PDF
  de receta** («Mercado y azulejo», `n8n/receta-pdf.html`; desde el 11 de noviembre de 2026, antes imitaba la
  «v2 cuaderno»): logo de la sartén, cenefa, kicker en mono, titular ligero con la última palabra en cursiva
  terracota, chips de mono, números en sello **del color de la categoría de cada plato** (`data-k`), subrayado
  de sección, casilla redonda en la lista de la compra y nota amarilla con sombra dura. Sus estilos están
  copiados en `index.css` como clases `.hoja*`, con las mismas medidas en px. Si se retoca la plantilla,
  conviene retocar `.hoja*`.
  El botón llama a `window.print()`; [MenuImprimible.tsx](src/components/MenuImprimible.tsx) es
  una hoja `hidden print:block` (invisible en pantalla) y la cabecera de `App` y el editor llevan
  `print:hidden`. Cada página es una **hoja A4 exacta de 210 × 296 mm**
  ([HojaImpresa.tsx](src/components/HojaImpresa.tsx)) que se pinta su propio fondo
  (`print-color-adjust: exact`; 296 y no 297 mm evita una página en blanco por redondeo).
  **`@page { margin: 0 }` es global** (en `index.css`): con márgenes el navegador añade su URL y
  su fecha a cada página, y sin ellos nada parte el contenido, así que
  [paginar.ts](src/lib/paginar.ts) lo reparte a mano entre hojas con **pesos en px medidos sobre
  la hoja pintada** (`ALTO` y `ALTO_UTIL` = 968 en `MenuImprimible.tsx`, remedidos el 11 de noviembre con el estilo nuevo). Si se cambia el tamaño
  de letra o el relleno de algo en `.hoja*`, **hay que volver a medirlos**, o el contenido se
  saldría de la hoja. Pantalla y hoja comparten `listaDelMenu` ([menus.ts](src/lib/menus.ts)).
  **Para volver a medir** (11 nov 2026): una página temporal en la raíz (`medir.html` + `src/_medir.tsx`) que
  renderiza `MenuImprimible` con datos inventados y un estilo `.hidden{display:block!important}`; se mide
  con `getBoundingClientRect` y se comprueba que el último bloque de cada hoja acaba antes que su caja
  (holgura mínima 21 px con 3, 12, 25 y 45 recetas, con y sin notas y con un título muy largo) y, imprimiendo
  esa página con Chrome (`--print-to-pdf`), que salen tantas páginas A4 como hojas y ninguna en blanco.
  Ya no existe: se borra al terminar, hay que recrearla. Revisado a ojo el PDF impreso, no en papel.
- **Compartir** ([la migración](supabase/migrations/20261110_compartir_menus.sql)): `menus.visibilidad`
  es `privado` (por defecto), `afans` (cualquier usuario con sesión) o `enlace` (cualquiera con el
  enlace, sin cuenta). **El enlace NO se abre con una policy de lectura pública sobre `menus`**: con
  ella, cualquiera con la clave anónima —que va en el bundle— listaría todos los menús compartidos.
  Lo sirve `ver_menu_compartido(id)`, `SECURITY DEFINER`: devuelve un menú por su id, sin `user_id`, y
  `null` si no existe, es privado o es «afans» sin sesión (no distingue entre «no existe» y «no es
  tuyo»). El nombre del autor solo sale con sesión. **El linter avisa de que `anon` y `authenticated`
  pueden ejecutarla: es intencionado.** Los menús «afans» sí se abren a `select` de la tabla (una
  policy en `menus` y otra en `menu_recetas`, solo `authenticated`); la escritura sigue siendo del
  autor. **Como la tabla ya devuelve menús ajenos, `useMenus` filtra «Mis menús» por `user_id`**: la
  RLS no basta. `#/menu/<id>` ya no pasa por `SoloLogueados` (`MenuPagina` decide: vista de solo
  lectura, editor o «no existe»); `#/menus` sí. Se comparten también las notas. Detalle en
  [docs/menus.md § Compartir](docs/menus.md).
- Verificado simulando roles (otro usuario, dueño y anónimo) en una transacción que se
  revierte; el linter no añade avisos, salvo los dos de `ver_menu_compartido` descritos arriba.

## Avisos por correo y «Mi cuenta»

**Hecho y desplegado el 10 de noviembre de 2026**: la base de datos, la página `#/cuenta` y el flujo de envío.
**El flujo de n8n «Aviso de nuevas recetas» (id `Zx0jNA5wC2aTu0U1`) se publicó el 10 de noviembre**:
sondea cada 5 min las recetas con `aviso_enviado_en` nulo y más de 2 min de antigüedad, las reclama con un
`PATCH` atómico (como mucho un aviso por receta; si no hay destinatarios, se pierde), pide
`destinatarios_avisos_recetas()` y manda un Gmail por receta y persona. No usa webhook de BD porque
`pg_net` no está instalado. Las recetas existentes se marcaron como avisadas
([la migración](supabase/migrations/20261110_recetas_aviso_enviado.sql)). Probado de punta a punta con
una receta de prueba y solo el admin como destinatario (correo recibido); datos de prueba borrados. La web
con «Mi cuenta» aún no se ha desplegado. Que los afans reciban un correo cuando se da de alta una receta, si lo piden; el plan completo
está en [docs/ideas.md](docs/ideas.md#avisos-por-correo-y-mi-cuenta--decidido-el-10-de-noviembre-de-2026).

- `preferencias (user_id, avisos_recetas default false)` ([la migración](supabase/migrations/20261110_avisos_recetas.sql)):
  **siempre opt-in**, y en tabla propia y no en `perfiles`, donde `nombre` es obligatorio y solo una
  cuenta tiene fila. RLS: cada usuario toca solo la suya; el `UPDATE` lleva `with check`. **El correo no
  se copia aquí**: es el de la cuenta.
- `destinatarios_avisos_recetas()` devuelve el correo y el nombre de quien tiene los avisos activados
  **y el correo confirmado** (sin borrar ni bloquear). **Solo `service_role` puede ejecutarla**: es
  `SECURITY DEFINER` porque lee `auth.users`, y Supabase da `EXECUTE` a `anon` y `authenticated` por
  defecto en las funciones nuevas, así que se revoca de forma explícita. Si se recrea la función, hay
  que repetir los `revoke`. `service_role` no puede leer `auth.users` directamente: solo por esta función.
- **`#/cuenta`** ([CuentaSection.tsx](src/components/CuentaSection.tsx)), solo con sesión: nombre (el de
  `perfiles`, con el que se firma el muro; `usePerfil`), correo y contraseña (`auth.updateUser`),
  el interruptor de los avisos (`usePreferencias`, optimista) y cerrar sesión. Cambiar el correo manda
  un enlace de confirmación y la cuenta sigue con el anterior hasta abrirlo.
- **Cambios de cabecera**: un icono «Mi cuenta» junto a cerrar sesión; **por debajo de `sm` cerrar sesión
  solo está dentro de «Mi cuenta»** (no cabía) y se **quitó la insignia admin/afan** (el rol se ve en
  «Mi cuenta»). El relleno de los enlaces de la nav se aprieta entre `sm` y `xl`. Medido sin desborde de
  375 a 1280 px, como admin y como afan: **cualquier icono más en la cabecera obliga a volver a medirlo**.
- Verificado: RLS simulando roles (autor, otro usuario, anónimo y n8n), incluidas cuentas que no deben
  recibir correo; y en el navegador, el interruptor contra la base real (se crea la fila, persiste al
  recargar, n8n vería 1 destinatario) y las validaciones de los formularios. **No se ha ejercitado**
  el cambio real de contraseña ni de correo, para no tocar la cuenta del admin ni mandar correos:
  Supabase puede pedir reautenticación para la contraseña, o limitar los envíos de correo.

## Recuperar la contraseña

**Hecho, desplegado y probado de punta a punta el 11 de noviembre de 2026** (correo real, enlace y contraseña nueva). En el modal de acceso, «¿Olvidaste tu contraseña?»
([LoginModal.tsx](src/components/LoginModal.tsx), modo `olvido`) llama a `resetPasswordForEmail` y enseña siempre el mismo aviso,
exista o no la cuenta. El enlace del correo (plantilla de Supabase Auth «Restablecer contraseña») vuelve a la web con
`#access_token=…&type=recovery`, y [NuevaClaveModal.tsx](src/components/NuevaClaveModal.tsx) pide la contraseña nueva
(`updateUser`; la sesión de recuperación ya la abrió Supabase).

- **El router va por el hash, y Supabase también.** [supabase.ts](src/lib/supabase.ts) lee `type=recovery` y
  `error_code=otp_expired` del hash **antes** de crear el cliente (que lo consume y lo borra) y los exporta como
  `LLEGA_DE_RECUPERACION` y `ENLACE_CADUCADO`: el evento `PASSWORD_RECOVERY` puede dispararse antes de que `App` se suscriba.
- `redirectTo` es la propia web. **Tiene que estar en *Authentication → URL Configuration → Redirect URLs*** de Supabase (o
  ser el *Site URL*); si no, el enlace cae en el *Site URL*. Sin comprobar.
- **Supabase envía por el SMTP de Gmail** (contraseña de aplicación), no por el servicio de serie: ese solo manda unos 2
  correos por hora y solo a miembros del equipo. El tope por hora se ajusta en *Authentication → Rate Limits*.
- Verificado en el navegador de desarrollo (enlace, validación, aviso de caducado) y con un correo real en producción.

## Buzón de sugerencias

**Hecho y desplegado el 10 de noviembre de 2026** (migraciones `20261110_sugerencias*.sql`; diseño y decisiones
en [docs/ideas.md](docs/ideas.md)). `#/buzon` (enlazado desde «Mi cuenta», no hay icono nuevo en la cabecera):
un afan envía un enlace y/o texto con una nota; ve las suyas, el admin todas y cambia el estado
(`pendiente`/`aceptada`/`descartada`/`hecha`). Tabla `sugerencias`: el autor crea (solo `pendiente`) y lee las
suyas; solo el admin actualiza. Un trigger `SECURITY DEFINER` exige correo confirmado y máximo 5 al día.

- **No se convierte nada al enviar** (cuota de Gemini, SSRF): el admin reenvía el enlace al bot del Laboratorio.
- **Tres flujos de n8n por sondeo** (cada 5 min, marca atómica con `PATCH ... is.null`, como mucho un aviso):
  «Aviso de nuevas recetas» (correo a quien activó los avisos), «Aviso de sugerencias» (Telegram al admin,
  `avisada_en`) y «Aviso al autor de una sugerencia» (correo, `autor_avisado_en`). **Sondeo y no webhook de
  BD porque `pg_net` no está instalado.** Los flujos que marcan antes de enviar pierden el aviso si el envío falla.
- **Crédito:** al marcar «hecha» el admin elige la receta creada; un trigger copia el nombre del autor a
  `recetas.sugerida_por` (instantánea, solo si `sugerencias.citar`) y la ficha enseña «Sugerida por…».
  `autores_sugerencias_hechas()` es solo para `service_role`, como `destinatarios_avisos_recetas()`.
- Sin verificar: como afan normal, el mensaje de Telegram en el móvil y el desplegable en el navegador.

## Modo cocina

**Hecho el 13 de octubre de 2026.** Botón *Cocinar* en la barra de la ficha
([RecipeDetail.tsx](src/components/RecipeDetail.tsx)) que abre
[ModoCocina.tsx](src/components/ModoCocina.tsx): pantalla completa oscura, un
paso a la vez en letra grande, Anterior/Siguiente, flechas del teclado y un
conmutador con los ingredientes. Es solo lectura —marcar la despensa se sigue
haciendo en la ficha— y no toca Supabase ni n8n.

La pantalla no se apaga gracias a [useWakeLock.ts](src/hooks/useWakeLock.ts), que
vuelve a pedir el bloqueo al regresar a la pestaña (el navegador lo suelta solo
al ocultarla) y no hace nada si la API no existe.

Dos detalles que no se ven en el código a primera vista:

- **No es una ruta**: es estado local de la ficha. Un enlace `#/receta/<id>`
  abre la ficha, no el modo cocina, y el atrás del navegador sale de la ficha
  entera. Si algún día hace falta compartirlo, habría que añadir una `Ruta`.
- **Esc se captura en fase de captura** y para la propagación: el modo cocina se
  pinta dentro del fondo de la ficha, y sin esto un clic o una tecla cerraría
  también la ficha de debajo.

Verificado en el navegador de escritorio con datos reales (pasos, ingredientes,
Esc, sin errores en consola). En un móvil real solo se ha confirmado el **sonido
de los temporizadores** (13 de octubre de 2026); la pantalla encendida y el manejo
con el pulgar, que es el uso para el que se hizo, siguen sin confirmar.

### Temporizadores

**Hechos el 13 de octubre de 2026.** Los tiempos que aparecen en el texto de un
paso ("durante 30 minutos", "5-7 minutos", "1 hora y media") se pintan como un
botón amarillo que arranca una cuenta atrás, visible bajo la cabecera del modo
cocina. Puede haber varios a la vez, con ±1 minuto y cancelar. Al terminar suena
un pitido (WebAudio, sin ficheros) y vibra, y se repite cada 2,5 s hasta que se
para.

- [tiempos.ts](src/lib/tiempos.ts) es una función pura sobre texto, sin React ni
  recetas: `detectarTiempos`. Se verificó contra los 590 pasos reales: 73 tiempos
  en 72 pasos. **De un rango se toma el valor menor** ("5-7 minutos" → 5), porque
  quien cocina prefiere vigilar antes que pasarse. Ignora lo que pasa de 6 h
  (marinados de noche).
- [useTemporizadores.ts](src/hooks/useTemporizadores.ts) guarda la **hora de fin**
  y no un contador que decrece: los navegadores frenan los `setInterval` de las
  pestañas ocultas y un contador se desviaría. Aun así, **con la pestaña oculta la
  alarma no suena de forma fiable**; por eso importa que el *Wake Lock* mantenga
  la pantalla encendida.
- El `AudioContext` se crea y se despierta en el clic del botón, no cuando suena
  la alarma: los navegadores solo permiten audio tras un gesto del usuario.
- **Salir del modo cocina cancela los temporizadores.** Viven en su estado; no hay
  nada en `localStorage` ni en el servidor.
- Falsos positivos que se dejan a propósito: un paso como *"esperar a que alcance
  70 °C al menos 15 segundos"* es una condición del alimento y no algo que
  cronometrar, pero igualmente ofrece el botón. Ofrecer de más sale más barato que
  perderse el del horno. No se detecta "unos minutos" ni "los que indique el
  envase": no hay número que cronometrar.
- Probado en el navegador de escritorio (alarma, repetición, ±1 min, cancelar,
  persistencia al cambiar de paso). **En un móvil real el sonido funciona**
  (confirmado el 13 de octubre de 2026). Sin confirmar en móvil: la vibración (en
  Safari de iPhone no existe `navigator.vibrate`) y que la pantalla siga encendida
  mientras corre un temporizador.

## Búsqueda semántica

**Hecha el 13 de octubre de 2026.** Acepta una frase libre —*"algo ligero de
pescado para verano"*— y enseña las 12 recetas más parecidas, de más a menos. Solo
con sesión iniciada.

**Es la misma barra que el filtro por ingredientes**
([IngredientSearch.tsx](src/components/IngredientSearch.tsx)), no una caja aparte:
mientras escribes filtra por ingredientes en vivo, como siempre; con Enter o el
botón ✨ manda esa misma frase a la búsqueda por significado
([useBusquedaSemantica.ts](src/hooks/useBusquedaSemantica.ts)). Volver a escribir
la cancela y devuelve el filtro. Antes eran dos barras apiladas, y se unificó por
estética. El botón queda deshabilitado sin sesión, con el motivo en la línea de
ayuda de debajo.

Funciona con embeddings: cada receta se convierte en un vector de 768 números
(`gemini-embedding-001`) y la consulta en otro; las recetas cuyo vector queda más
cerca son el resultado. Dos Edge Functions de Supabase, no n8n:

- [buscar-recetas](supabase/functions/buscar-recetas/index.ts) embebe la consulta
  y llama a la función SQL `buscar_recetas_semantico`.
- [indexar-recetas](supabase/functions/indexar-recetas/index.ts) calcula los
  vectores. Guarda el hash del texto embebido y salta lo que no ha cambiado.

Los vectores viven en `recetas_embeddings`, **tabla aparte** de `recetas`: el
frontend lee `recetas` con `select('*')`, y una columna de 768 floats viajaría a
todos los navegadores en cada carga. Tiene RLS activa y **ninguna policy**, a
propósito: solo la toca `service_role` ([la migración](supabase/migrations/20261013_busqueda_semantica.sql)).
El aviso `rls_enabled_no_policy` del linter sobre ella es esperado, como en `admins`.

Cosas que no son obvias:

- **El nodo "Vertex AI" de n8n no es Vertex.** Llama a
  `generativelanguage.googleapis.com` (Google AI Studio) con una API key. Por eso
  las funciones usan una `GEMINI_API_KEY` en los secretos de Supabase y no hace
  falta cuenta de servicio de Google Cloud.
- **`verify_jwt` no basta para exigir sesión**: acepta también la clave anónima,
  que es pública y va en el bundle. Las dos funciones llaman a `auth.getUser`;
  `indexar-recetas` además comprueba la tabla `admins`.
- **Las similitudes salen muy apretadas** (~0,82 incluso entre recetas lejanas),
  así que no hay umbral: se devuelven siempre las 12 mejores y se confía en el
  orden. Un umbral fijo cortaría resultados buenos o dejaría pasar malos.
- **Indexación de altas nuevas:** el alta pasa por n8n, que responde "Workflow was
  started" antes de guardar la receta, así que el navegador no tiene un momento en
  que indexarla. En su lugar `buscar-recetas` compara el número de recetas con el de
  vectores antes de cada búsqueda y, si faltan, llama a `indexar-recetas` con la
  `service_role` (que nunca sale del servidor). Una receta nueva se indexa en la
  primera búsqueda posterior. Verificado el 13 de octubre borrando el vector de
  una receta: reapareció en la búsqueda siguiente.
- **Las ediciones no se reindexan solas.** Detectarlas exigiría leer y hashear las
  61 recetas en cada búsqueda. Tras editar una (las notas cuentan en el texto
  indexado), el admin pulsa *reindexar búsqueda* al final del catálogo
  ([ReindexarBusqueda.tsx](src/components/ReindexarBusqueda.tsx)); es idempotente.
- **Límite de 20 búsquedas por hora y usuario**, porque el registro está abierto y
  cada búsqueda gasta cuota de Gemini (clave que puede compartirse con n8n).
  Lo aplica `registrar_busqueda` ([la migración](supabase/migrations/20261013_limite_busquedas.sql))
  antes de indexar o llamar a Gemini, y responde 429 con un mensaje que la barra
  de búsqueda enseña tal cual. Los contadores viven en `busquedas_uso`, sin
  policies. Para cambiar el tope, las constantes están al principio de
  `buscar-recetas`. No sustituye a un presupuesto con alertas en Google Cloud.
- Si se cambia el modelo o las 768 dimensiones, hay que reindexar todo (borrar
  `recetas_embeddings` y volver a pulsar el botón).
- Con una búsqueda por frase activa, los filtros de categoría e ingredientes se
  ignoran; escribir de nuevo o la X de la barra devuelven el catálogo normal.
- Sin índice vectorial: con 61 recetas un recorrido completo es instantáneo y un
  HNSW perdería precisión. Se añadiría si el catálogo llegara a miles.

## Sistema de diseño «Mercado y azulejo»

**Aplicado el 10 de noviembre de 2026** (elegido tras comparar maquetas; ver `scratch/direcciones/`, que está
fuera de git). Estructura de revista —papel crema, titulares ligeros y grandes en Fraunces, líneas finas, mosaico
asimétrico— con vocabulario de azulejo por encima: sellos circulares, un color por categoría, fotos en arco y una
cenefa. Todo vive en [sistema.css](src/sistema.css) y en los tokens de `@theme` de `index.css`; **los nombres de
token antiguos se conservan con valores nuevos** (`accent` pasó de azul a terracota, `paper`, `ink`, `yellow`…), así
que las secciones que no se tocaron ya heredan la paleta.

- **El color de categoría** se pone con `data-k` ([colorCategoria.ts](src/lib/colorCategoria.ts), distinto del
  `categorias.ts` de la lógica) y los hijos leen `--k` y `--kt`. Se usa **pequeño**: sello, punto, subrayado.
- **Reglas**: borde de 1,5 px; sombra dura solo en sellos, botones y notas; como mucho dos recursos de azulejo por
  pantalla; nada de inclinar tarjetas. `font-mono` es para datos y rótulos, `font-sello` (Bricolage) para sellos y
  botones, `font-script` solo para anotaciones a mano (fecha de la ficha, pie de foto).
- `.mosaico` es una rejilla **regular** (3 columnas, 2 en móvil; todas las fotos 4/5 en arco; títulos a dos
  líneas). Hubo un mosaico asimétrico y se retiró: en 77 recetas se escanea, no se hojea. La asimetría queda en
  la portada.
- **La marca es una sartén con un huevo frito** ([LogoSarten.tsx](src/components/LogoSarten.tsx)): sartén de
  hierro vista desde arriba, sombra dura terracota y, con `conTexto`, el nombre en el aro. **El texto solo se lee
  por encima de ~100 px**: en la cabecera va la sartén sola, y con aro en el modal de acceso. `public/favicon.svg`
  y `scripts/icono-ios.svg` son copias con los colores fijos; si cambia el dibujo, hay que tocar las tres y
  regenerar `favicon-32.png`, `favicon.ico`, `icon-256.png` y `apple-touch-icon.png`. El nombre de la cabecera
  aparece desde `md` y se encoge en `lg`: con la sartén, más ancha que el sello anterior, a 640 y 1024 px la
  cabecera desbordaba.
- **Pasaporte (10 nov 2026)**: la lista son **visados estampados** con la tinta de la bandera
  ([SelloVisado.tsx](src/components/SelloVisado.tsx), tres formas que se alternan; el color sale de
  `useAcentoPais` por país, de ahí [ListaVisados.tsx](src/components/ListaVisados.tsx)). La página de país es una
  portada: nombre enorme, collage de fotos (arco con sombra del color del país, círculo y arco pequeño), el sello
  de entrada solapando, los datos como un **billete** ([FichaPais.tsx](src/components/FichaPais.tsx)) y el plato
  estrella en banda. **Mientras se está en un país, la cenefa de la cabecera de la app toma el color de su bandera**
  (`PaisPagina` pone y quita `--cenefa` en `<html>`). Los pies de foto de la cabecera ya no se ven (quedan como
  `title`); se editan igual en «Gestionar país». **El mapa** rellena cada país visitado con el color de su bandera
  (`useAcentosPaises`, sobre `lib/cargarAcento.ts`, que comparten el mapa y la página de país) y deja el resto en
  crema con contorno de tinta. Los paneles de admin comparten `.panel-admin`, `.campo-sello` y `.etiqueta-campo`.
- **El Laboratorio (10 nov 2026)** usa el mismo mosaico y la misma foto en arco que el catálogo; lo suyo es el sello
  de la fuente (Instagram, YouTube…) en la esquina, el estado sobre la foto (amarillo «por probar», verde «probada»)
  y un **número de muestra** que sale de la antigüedad y no cambia al filtrar. Nombre, ruta (`#/laboratorio`) y flujo
  de n8n se mantienen: renombrarlo implica tocar los tres.
- **PDF y correos (10 nov 2026)**: las fuentes viven en [n8n/](n8n/) y se copian a n8n a mano (no hay despliegue
  automático). [receta-pdf.html](n8n/receta-pdf.html) es la plantilla del PDF —**subida a Drive como «Receta -
  Plantilla n8n v3 mercado y azulejo.html»** (`1IWUaLVN5ygOmfvBPSSlRl9a3nDuSoOZ7`); la v2 de cuaderno sigue en Drive,
  para volver cambiando el ID de `Leer plantilla HTML`— y [rellenar-html.js](n8n/rellenar-html.js) es el nodo
  `Rellenar HTML` de «Recetas con Frontend» (color por categoría, todo escapado). Los cinco correos salen de
  [correo-base.js](n8n/correo-base.js): `node n8n/generar-correos.mjs vista <html>` los dibuja con datos de ejemplo y
  `nodos <carpeta>` saca los textos para pegar. Los tres de «Recetas con Frontend» (compartir, receta añadida, error)
  llevan la plantilla en una expresión del nodo Gmail; «Aviso de nuevas recetas» y «Aviso al autor» la llevan dentro
  del nodo `Montar correos`. **Si se cambia `correo-base.js`, hay que volver a pegarlo en esos cinco sitios** (el 11 de noviembre se repegó el prefijo `arroc` solo en los dos flujos de avisos, que son los que calculan el color por categoría; los tres del flujo principal llevan terracota fijo). El logo
  de los correos se sirve desde el propio sitio (`recetario.orballo.link/icon-256.png`): no borrarlo del build.
  **Gotenberg y las fuentes (11 nov 2026):** imprime a veces antes de que Google Fonts termine y el PDF sale con fuentes de reserva; el nodo espera `document.fonts` (+2 s) y reintenta. **Los 77 PDF anteriores se regeneraron en A4 el mismo día** sobrescribiendo el fichero de Drive (enlaces intactos; copias en la carpeta «Respaldo PDFs estilo cuaderno (Letter)»; detalle y trampas en [docs/pendientes.md](docs/pendientes.md)). **El PDF de receta es A4 desde el 11 de noviembre de 2026** (plantilla v4 de Drive; el nodo de Gotenberg pasa el papel explícito porque ignora el tamaño del `@page`; ver [docs/pendientes.md](docs/pendientes.md)). Versión previa del flujo principal: `3a62fac0`. **La cenefa es una tabla de 2 × 60 celdas con `bgcolor`** (la de triángulos de texto no llenaba el ancho): en los tres correos del flujo principal se escribe con `{{ '…'.repeat(30) }}` (lo emite `generar-correos.mjs nodos`) para que el texto sea un 40 % más corto; flujo `9f252cab`. **Probado de punta a punta el 10 de noviembre de 2026** con una
  alta real (PDF de Gotenberg, correo de «receta añadida», aviso a los afans y correo de error): todo bien.
  **Trampa que mordió en esa prueba, corregida el 11 de noviembre de 2026** (flujo `3a7bfe9f`; antes `4cd0c01d`):
  el alta nombraba la foto por el título y la subía sobrescribiendo, y el borrado buscaba la fila de Google Sheets
  por título; con un título repetido se pisaba la foto de la receta anterior y el borrado podía llevarse su fila.
  Ahora `Recupera foto` fija **una vez** `foto_nombre` (`<Título>-<6 al azar>.jpg`) y lo leen `Sube foto a Supabase`,
  `Guardar en Supabase`, `Rellenar HTML` y `Mail receta añadida`; y `Buscar receta en Google Sheets` busca por la
  columna **Enlace** con el `pdf_url` (el mismo valor que escribe `Actualizar recetario`). **Las fotos anteriores al
  11 de noviembre siguen con el nombre `<Título>.jpg`**; el borrado lee el nombre de `foto_url`, así que funciona con
  los dos. Si se toca el nombre de la foto, hay cuatro sitios que lo leen.
  Las **plantillas de correo de Supabase Auth** están generadas en [supabase/plantillas-correo/](supabase/plantillas-correo/)
  (se pegan a mano en el panel; ver su LEEME). Pendiente: los PDF ya generados (77) siguen en estilo cuaderno y las hojas
  de menús impresas (`.hoja*`).
- **`sistema.css` va dentro de `@layer components`**: sin capa, el CSS suelto gana siempre a las utilidades de
  Tailwind (un `flex` no podía con un `display: block` de una clase propia). Las utilidades ganan donde coinciden.
- **Hojas impresas de los menús (11 nov 2026)**: ya en el sistema nuevo (ver *Menús › Imprimir*).
- Verificado sin desborde horizontal de 375 a 1280 px en las ocho vistas principales. Sin revisar a mano: el modo
  oscuro (no existe), los temporizadores del modo cocina y el editor de menús.

**Para retomar el rediseño: [docs/pendientes.md](docs/pendientes.md)** (11 nov 2026: lista cerrada y [guion de pruebas a mano](docs/guion-pruebas.md) pasado sin fallos) (estado en producción con las versiones a las
que volver, lo pendiente por orden y lo que no se ha comprobado a mano).

## Hacia dónde puede crecer

[docs/ideas.md](docs/ideas.md) recoge una lluvia de ideas de posibles
funcionalidades, con lo hecho y lo decidido anotado encima. Lo más barato que
queda son la detección de duplicados al dar de alta; el resto está sin
desarrollar (favoritos, menú semanal,
alta desde Telegram; los duplicados salen casi gratis con los embeddings que ya
existen).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
