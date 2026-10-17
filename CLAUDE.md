# Mi Recetario — contexto del proyecto

SPA estática de React + TypeScript para organizar recetas. **No hay backend propio**:
el navegador habla directo con Supabase (datos, auth, Storage) y delega las
operaciones pesadas en webhooks de n8n. Se compila a estáticos y se sirve desde
un Synology.

Las convenciones de código (TS estricto sin `any`, ficheros por debajo de 300
líneas, credenciales solo en `.env`) están en [AGENTS.md](AGENTS.md). El
despliegue está en el [README](README.md).

## Empieza por el grafo

`graphify-out/` contiene un grafo de conocimiento del proyecto: 370 nodos y 712
aristas sobre 69 ficheros, en 29 comunidades. Combina extracción estructural del
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
- `crypto.randomUUID` **no existe** en el nodo Code de n8n Cloud: el id se genera con un
  uuid v4 propio, o la inserción falla con `invalid input syntax for type uuid`.
- La entrada por DM de Instagram quedó **aparcada** (la app de Meta tiene que estar en
  vivo para recibir webhooks reales); detalles en el plan.

## Mi pasaporte

**Fases 1, 2 y 3 hechas el 15 de octubre de 2026** (la 3, administración, sin probar con sesión de
admin); plan y detalles en [docs/pasaporte.md](docs/pasaporte.md).
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
