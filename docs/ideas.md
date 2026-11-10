# Ideas para el Recetario

Lluvia de ideas del 9 de agosto de 2026, con lo decidido y lo hecho anotado
encima. Lo que no lleva marca sigue siendo material para elegir, no un plan.

**Hecho el 23 de agosto**: estructurar los ingredientes y la despensa. **El 31**:
el router y la sección de despensa. Ver [CLAUDE.md](../CLAUDE.md) para el estado
real del proyecto.

Muchas se apoyan en n8n antes que en la web, igual que la ingesta actual. Esa es
la forma natural de crecer aquí: la SPA es estática y sin backend propio, así
que cualquier cosa que necesite orquestación, credenciales de terceros o
procesos largos encaja mejor en un flujo.

---

## El punto de partida: datos que ya se pagan y se tiran — hecho

> **23 ago 2026 — hecho a medias.** Los ingredientes ya están estructurados.
> **10 oct 2026 — hecho del todo**, con el alcance de abajo.

Vertex AI **ya extraía** `tiempo`, `porciones` y `dificultad` de cada receta,
pero el nodo `Guardar en Supabase` no los escribía y la tabla no tenía esas
columnas: se calculaban, se pagaban y se descartaban.

Ahora hay tres columnas nuevas (`tiempo`, `porciones`, `dificultad`, todas
`text`) y esa línea en el nodo, y se ven como badges en
[RecipeDetail.tsx](../src/components/RecipeDetail.tsx). **Sin backfill**:
las recetas anteriores al 10 de octubre quedan con esos tres campos en
`null` a propósito —rellenarlas exige volver a pasarlas por Vertex, no solo
regenerar el PDF desde Supabase como hace *Regenerar PDFs antiguos*—, así
que los badges simplemente no aparecen en ellas. Queda como idea suelta si
alguna vez se decide abordarlo:

- Filtrar el catálogo por tiempo y ordenarlo por dificultad.
- Backfill de las recetas antiguas, reprocesando sus PDFs por Vertex.

---

## Cocinar de verdad

~~**Modo cocina.** Pasos a tamaño grande y pantalla que no se apaga (Wake Lock
API), para usarlo con las manos pringadas.~~ **Hecho el 13 de octubre de
2026**, con los temporizadores a partir de los tiempos de los pasos ("cocínalo 5
minutos"); ver *Modo cocina* en [CLAUDE.md](../CLAUDE.md).

~~**Marcar "lo he cocinado"**, con fecha.~~ Desarrollada en
*Para hacer, realizaciones y el muro de notas*, más abajo.

~~**Persistir los checkboxes de ingredientes.**~~ **Hecho el 23 de agosto**, y
mejor de lo planteado: no se guardan por receta sino por usuario e ingrediente.
Ver la sección de la despensa más abajo.

---

## Para hacer, realizaciones y el muro de notas

> **11 oct 2026 — implementado** (migración `20261011_para_hacer_y_realizaciones.sql`,
> hooks `useParaHacer`/`useRealizaciones`/`usePerfil`, componente
> `MuroRealizaciones`). Probado en producción el 11 oct.
> *Diseño original, 10 oct 2026:* Conecta tres piezas
> sueltas de esta lista: "marcar lo he cocinado" (arriba), y "comentarios por
> receta" / "notas por usuario" (en *Los afans*, más abajo). Las ocho
> decisiones de aquí salieron de una conversación de diseño; falta llevarlas
> a un plan de implementación.

La idea: marcar una receta como **"para hacer"** añade sus ingredientes a la
lista de la compra, descontando la despensa, igual que hace hoy la selección
manual de `#/lista-compra`. Cuando la cocinas de verdad, la marcas como
**"ya hecha"**: fecha (automática, hoy), nota libre opcional ("cambié las
cantidades del pan de molde y queda guay") y puntuación opcional de esa vez
concreta. El `rating` de la receta deja de ser un voto único editable y pasa
a ser la media de las puntuaciones de todas sus realizaciones. Cada receta
muestra un muro de post-its con las realizaciones de los cuatro afans: fecha,
quién la hizo, la nota y la puntuación.

Las ocho decisiones:

1. **`para_hacer (user_id, receta_id)` en Supabase**, calcada de
   `despensa (user_id, base)`. Sustituye a la selección manual en
   `localStorage` de `#/lista-compra` en vez de convivir con ella: una sola
   fuente de verdad para "qué tengo intención de cocinar", que cruza
   dispositivo y sesión.
2. **La despensa no se toca al marcar "ya hecha"**, solo al comprar (como ya
   funciona). Descontar al cocinar reabriría el problema ya descartado en
   *Decidido: la despensa NO guarda cantidades*, más arriba: un inventario
   que se desactualiza solo.
3. **Nota y puntuación opcionales** al marcar "ya hecha"; solo la fecha es
   obligatoria. Si hay que rellenar nota+estrellas cada vez, es fácil que se
   deje de marcar por pereza.
4. **"Ya hecha" cierra el "para hacer"** correspondiente: sale de la lista
   de la compra. No impide volver a marcar la receta "para hacer" más
   adelante, para repetirla.
5. **Se evoluciona `valoraciones`** añadiéndole `fecha` y `notas`, en vez de
   crear una tabla `realizaciones` nueva y retirar la vieja. Reaprovecha las
   RLS y el trigger `update_recipe_average_rating` que ya existen, aunque
   ese trigger —una de las "dos trampas" de [CLAUDE.md](../CLAUDE.md), por
   su `SECURITY DEFINER`— tiene que pasar a promediar sobre las
   realizaciones de cada receta en vez de sobre un voto único; fácil de
   repetir el mismo error si no se presta atención al migrarlo.
6. **El voto rápido de estrella de hoy desaparece.** Un solo mecanismo en
   vez de dos: puntuar siempre es marcar una realización. Se pierde el voto
   instantáneo sin rellenar nada, a cambio de no mantener dos caminos para
   lo mismo.
7. **Nombre de pila por usuario**, para identificar quién escribió cada nota
   del muro. Hoy la app solo conoce el email (`isAdmin` compara contra uno
   fijo); mostrar el email completo en un post-it público resultaba raro
   entre cuatro personas que se conocen.
8. **El admin puede borrar notas ajenas** del muro (policy de RLS extra +
   botón de borrado visible solo para el admin en notas de otros). Cada
   usuario puede editar o borrar las suyas propias sin restricción.

---

## La despensa y su sección propia — hechas

> **23 ago 2026.** La despensa: tabla `despensa` con clave `(user_id, base)`,
> sus policies de RLS y los checks de la receta guardando contra ella.
> **31 ago 2026.** Su sección propia en `#/despensa`, con todo lo de abajo.

Lo que aporta la sección, por orden de importancia:

- **"Qué puedo cocinar con lo que tengo"**: ordenar el catálogo por *"te faltan
  2 ingredientes"*. Es lo que de verdad la justifica, y era lo que el buscador
  por ingredientes hacía a mano y peor.
- **Quitar lo que se ha acabado** sin buscar una receta que lo contenga. Hoy, si
  se acaba el pimentón, hay que acordarse de en qué receta salía.
- **Ver de un vistazo** todo lo que hay, que hoy solo se descubre receta a receta.
- **Añadir cosas que no están en ninguna receta**: sal, aceite, especias.

Dos requisitos que conviene no descubrir a mitad:

1. ~~**Hace falta el router antes o a la vez.**~~ **Hecho el 31 de agosto**: la
   app enruta por hash (`#/`, `#/nueva`, `#/receta/<id>`). Añadir `#/despensa`
   es un caso más en el tipo `Ruta`.
2. ~~**Añadir a mano necesita autocompletado**~~ sobre los `base` que ya existen.
   Resuelto sugiriendo siempre sobre los existentes y dejando crear uno nuevo
   solo con un segundo clic deliberado, que es lo que hacía falta para meter lo
   que no sale en ninguna receta sin acabar con "cebolla" y "cebollas".

~~**Lo que la sección destapó**: siete `base` son mezclas de condimentos
(`sal y pimienta negra` y compañía, 18 apariciones).~~ **Partidos el 10 de
octubre de 2026** (eran 19 apariciones, no 18 — ver
[CLAUDE.md § Pendiente](../CLAUDE.md)). Sigue pendiente ajustar el prompt de
Vertex para que no vuelva a generarlos en altas nuevas.

### Decidido: la despensa NO guarda cantidades

Se planteó guardar cuánto tienes de cada cosa, porque tener "cebolla" no dice si
llega para la lasaña, que pide 2. **Se descartó**, y conviene no volver a
proponerlo sin releer esto:

- **Un inventario se desactualiza solo.** Si dice "2 cebollas" y cocinas el
  gazpacho, alguien tiene que restar una. Si no, a los tres días el dato es
  falso — y un inventario falso es *peor* que no tenerlo, porque te fías: irías
  al súper sin cebollas creyendo que tienes dos. La casilla booleana no puede
  mentir tanto, porque solo afirma algo que acabas de decir tú.
- **Mantenerlo al día** exigiría descontar automáticamente al marcar "ya lo he
  preparado" —atando una función a otra— o que alguien lo actualice a mano, que
  no lo hace nadie.
- **Las unidades no casan.** La despensa diría "500 g de cebolla" y la receta
  pide "2 unidades". Restar exige saber cuánto pesa una cebolla, por cada uno de
  los 143 ingredientes.

**Dónde sí importan las cantidades: en la lista de la compra**, donde la pregunta
es puntual ("voy a hacer estas tres recetas, ¿cuánto compro?") y no hay estado
que envejezca.

Término medio barato si alguna vez se echa en falta: **una nota de texto libre
por ingrediente** ("media bolsa", "queda poco"). No se usa para calcular nada,
así que no puede mentir.

## Menú semanal y lista de la compra — hecha

**Hecha el 10 de octubre de 2026**, y más barata de lo planteado aquí: sin
webhook ni Vertex. Eliges recetas en `#/lista-compra`, se agregan sus
ingredientes en el cliente, se descuenta la despensa y queda la lista. Ver
[CLAUDE.md § La lista de la compra](../CLAUDE.md) para el detalle.

~~La dificultad no es técnica sino de datos: sumar "2 unidades de cebolla" con
"1 cebolla" exige normalizar cantidades. Encaja bien una llamada a Vertex que
consolide la lista.~~ Se resolvió sin IA: se suma cuando `valor` es numérico y
la `unidad` coincide: en el catálogo real eso cubre casi todo. El resto
—condimentos "al gusto", sobre todo— se lista tal cual viene, una línea por
variante, en vez de inventar una suma entre cosas no comparables. Si el
catálogo crece con datos más sucios y esto deja de bastar, aquí queda la idea
de la llamada a Vertex como siguiente paso, no como necesidad de partida.

---

## Encontrar recetas

~~**Búsqueda semántica.**~~ **Hecha el 13 de octubre de 2026**; ver *Búsqueda
semántica* en [CLAUDE.md](../CLAUDE.md). Planteamiento original: hoy se busca por subcadena de ingrediente con lógica Y
estricta. Con `pgvector` —Supabase lo soporta de serie— y embeddings generados
por Vertex al dar de alta, se podría preguntar *"algo ligero de pescado para
verano"*. Es el mayor salto cualitativo de la lista, y con 58 recetas indexar
cuesta una miseria.

~~**"Me faltan dos ingredientes".**~~ **Hecho el 31 de agosto**, aunque no donde
se planteaba: vive en la sección de despensa, que ordena el catálogo por lo que
te falta. El buscador de la portada sigue con su lógica Y estricta, que para
buscar *"algo con merluza"* es lo que se quiere.

~~**Enlaces a una receta concreta.**~~ **Hecho el 31 de agosto**: `#/receta/<id>`
abre la ficha directamente. Queda una mejora encima, barata: que el correo de
*compartir* lleve además del PDF el enlace a la versión web.

---

## Dar de alta con menos fricción

**Desde una URL.** Pegas el enlace de un blog, n8n lo descarga y Vertex extrae
la receta. Mismo pipeline, sin fabricar un PDF a mano.

**Desde Telegram o WhatsApp.** Mandar la foto de la página de un libro y que
entre sola. Ya existe un flujo *Bot recetas* activo: quizá esté medio hecho.

**Detección de duplicados** al dar de alta, comparando título e ingredientes.
Sale casi gratis ahora que los embeddings existen (13 de octubre de 2026): basta
comparar el vector de la receta nueva con los de `recetas_embeddings`.

**Rellenar las 11 recetas sin foto**, que hoy muestran el placeholder. Un flujo
podría generar o buscar una imagen y quitar esa sensación de catálogo a medias.

---

## Los afans

Sois cuatro, así que lo social tiene sentido a escala pequeña:

- ~~**Comentarios por receta**, con moderación del admin.~~ ~~**Notas por
  usuario.**~~ Ambas resueltas en *Para hacer, realizaciones y el muro de
  notas*, más arriba: las notas de cada realización son justo esto, con
  fecha y puntuación de propina.
- **Favoritos**, separados de la valoración. Sigue sin desarrollar.

---

## Automatismos con n8n

- **Sugerencia semanal por correo**: un cron elige recetas no cocinadas
  últimamente, quizá según temporada, y las manda el jueves para planificar el
  fin de semana. Reaprovecha el nodo de Gmail que ya funciona.
- **Copia de seguridad periódica** del catálogo a Drive.
- **Auditoría de huérfanos** en el bucket, ahora que sabemos que se acumulan.
  Ojo con la trampa: `_default.jpg` no es huérfano, es la plantilla.

---

## Avisos por correo y «Mi cuenta» — decidido el 10 de noviembre de 2026

Que los afans reciban un correo cuando se da de alta una receta, si quieren, y una sección
personal desde donde gestionarlo. **Decidido, sin empezar.** Se evaluó la viabilidad con los datos
reales del día: 7 cuentas, 5 con el correo confirmado, 2 activas en los últimos 30 días y 2 que
nunca han entrado; solo 1 con perfil.

**Decisiones del admin**
- **Un correo por receta**, no un resumen. Un resumen semanal queda como mejora si resulta pesado
  (el 27 de octubre se dieron de alta 4 recetas el mismo día).
- **Contenido:** título, foto, categoría y enlace a la web (`#/receta/<id>`), no el PDF de Drive.
- **Siempre opt-in**: nadie se suscribe sin pedirlo, tampoco las cuentas actuales.
- **El panel de gestión de usuarios (admin) no hace falta por ahora.** Queda descartado de este
  bloque; habría que pensarlo de nuevo si se quiere ver quién se registra o quitar cuentas.

**Diseño propuesto** (aceptado, a confirmar al implementarlo)
- **El correo es el de la cuenta** (`auth.users`, ya verificado por Supabase); no se pide otro ni
  se duplica en ninguna tabla.
- **Preferencia en una tabla aparte**, `preferencias (user_id, avisos_recetas boolean default
  false)`, y no en `perfiles`: allí `nombre` es obligatorio y solo 1 de 7 cuentas tiene fila.
  RLS: cada usuario solo toca la suya.
- **Destinatarios por una función de base de datos que solo pueda llamar n8n** (clave de servicio,
  no `anon` ni `authenticated`): devuelve los correos de quien tiene los avisos activados **y el
  correo confirmado**. El esquema `auth` no se expone por la API normal.
- **Disparador:** un *webhook de base de datos* de Supabase al insertar en `recetas`, que lance un
  flujo pequeño y aparte de n8n («Aviso de nuevas recetas»). Mejor que añadir nodos al flujo de
  alta (45 nodos, y la trampa de las claves anidadas): un fallo de correo no rompe el alta, el
  aviso trae el id de la receta para el enlace (el alta guarda hoy con `return=minimal`, sin
  devolverlo) y se prueba por separado. Cuesta una pieza más y un secreto compartido.
- **Envío:** el mismo nodo Gmail de n8n, **un correo por persona** (sin CC, para no exponer
  direcciones). Se adaptaría `docs/emails/receta-anadida.html`.
- **Baja:** un enlace al pie que lleva a «Mi cuenta». La baja con un solo clic (con token firmado)
  sería una mejora posterior.
- **«Mi cuenta» (`#/cuenta`):** nombre (ya existe `usePerfil`), correo, interruptor de los avisos,
  cambiar correo y contraseña con Supabase Auth, y cerrar sesión. **Borrar la propia cuenta queda
  fuera** de la primera versión: exige la clave de servicio, es decir, una función en el servidor.

**Progreso.** Paso 1, base de datos, **hecho el 10 nov**
([la migración](../supabase/migrations/20261110_avisos_recetas.sql)): tabla `preferencias` con su
RLS y `destinatarios_avisos_recetas()`, que solo puede ejecutar `service_role`. Verificado simulando
roles (autor, otro usuario, anónimo y n8n) incluidos los casos que no deben recibir correo: una
cuenta con el correo sin confirmar y otra que no ha pedido los avisos.
Paso 2, **«Mi cuenta» (`#/cuenta`), hecho el 10 nov**: nombre, correo, contraseña, interruptor de los
avisos y cerrar sesión; probado en el navegador con la base real. **No se despliega hasta que exista el
flujo de n8n**, para que nadie active unos avisos que todavía no llegan. Faltan el webhook de base de
datos y el flujo de n8n.

**A comprobar antes de implementar:** cómo salen hoy los correos de Supabase Auth. Si usan su
servicio por defecto tienen un límite de envíos muy bajo, y cambiar el correo desde «Mi cuenta»
mandaría uno.

---

## Buzón de sugerencias de los afans — decidido el 10 de noviembre de 2026

Que los afans manden una receta que les gustaría ver en el recetario, y que el admin decida si la
cocina y la incorpora. Sirve para que interactúen más con la web: hoy solo 2 de 7 cuentas han
entrado en 30 días. **Decidido, sin empezar**; va después de los avisos por correo porque reutiliza
su infraestructura.

**Decisiones del admin**
- **Privado por ahora**: cada afan ve sus sugerencias y su estado; el admin las ve todas. Votos y
  comentarios entre afans, solo si el buzón se llena.
- **Texto y enlace**, sin fotos ni PDF (añadirían almacenamiento y más superficie de abuso).
- **Aviso al admin** cuando llega una, **por Telegram o por correo** (se elige al implementar; lo
  más simple es Telegram: el bot del Laboratorio está activo y el `chat_id` del admin ya está en su
  lista blanca).
- **Crédito «Sugerida por <nombre>»** en la receta cuando se incorpora, y un correo al autor.

**Diseño propuesto**
- **Tabla aparte, `sugerencias`**, no escribir en `candidatas`: lo que mandan los afans es entrada no
  fiable, y `candidatas` son datos estructurados que solo toca el admin. Campos: autor, enlace y/o
  texto, nota («por qué me gusta»), estado (`pendiente` → `aceptada` / `descartada` → `hecha`).
  RLS: el autor lee y crea las suyas, solo el admin las lee todas y cambia el estado.
- **Se convierte solo después de que el admin acepte**, nunca al enviarla. Hacerlo al enviar gastaría
  cuota de Gemini con cualquier cuenta (el registro es abierto) y haría que el flujo descargue
  enlaces de desconocidos: riesgo de SSRF y de inyección en el prompt.
- **Primera versión sin automatizar la conversión**: el aviso lleva el enlace y el admin lo reenvía
  al bot del Laboratorio, que ya lo convierte en candidata. Un flujo que reciba la sugerencia
  aceptada y la pase solo a candidata queda para después: el flujo actual tiene disparador de
  Telegram y no se puede ejecutar a distancia, así que habría que montar otro con webhook.
- **Límites**: solo cuentas con el correo confirmado y un tope de envíos por día y usuario, con un
  contador como el de `registrar_busqueda`.
- **Aviso** con el mismo patrón que las alertas de recetas: un webhook de base de datos al insertar
  que lance un flujo pequeño de n8n.
- **Crédito:** una columna `recetas.sugerida_por` (nullable) y mostrar el nombre del perfil, solo si
  el autor lo ha puesto. Falta decidir al implementar si se pregunta antes («¿puedo citarte?»).
- **Interfaz:** `#/buzon` («Sugerir una receta» y «Mis sugerencias») para los afans, y una pestaña
  «Buzón» dentro de `#/laboratorio` para el admin.

**Riesgo honesto:** un buzón vacío no cambia nada. Lo que da vida es el bucle de respuesta —crédito
y correo al autor—, y para eso hacen falta antes los avisos.

---

## Bot de Telegram para los afans — decidido el 10 de noviembre de 2026

Ampliar el bot para que un afan consulte y mueva sus cosas desde el móvil, sobre todo en el súper.
**Decidido, sin empezar**; depende de «Mi cuenta» (la vinculación se hace desde allí).

**Decisiones del admin**
- **Para todos los afans desde el inicio**, no solo para el admin.
- **Los tres usos:** el súper (consultar y tachar la lista), la cocina («¿qué cocino hoy?») y los
  recordatorios de menús.
- **Un segundo bot** para los afans. No es solo por abusos: Telegram admite **un único webhook por
  bot**, y dos flujos con disparador de Telegram sobre el mismo bot se pisarían. El bot actual queda
  como el privado del admin (Laboratorio, con Gemini y lista blanca); el nuevo solo consulta.
- **n8n está autoalojado**, así que no hay cuota de ejecuciones al mes: lo que cuenta es la capacidad
  del servidor.
- **Alertas de recetas nuevas por Telegram**: no por ahora, quizá más adelante (iría por correo).

**Diseño propuesto**
- **Vinculación:** en «Mi cuenta» se genera un código de un solo uso con caducidad; el afan manda
  `/vincular CÓDIGO` al bot y se guarda su `chat_id` junto a su cuenta. Sin vincular, el bot no
  responde con datos.
- **La lógica, en funciones de base de datos** (`bot_despensa(chat_id)`…), ejecutables solo con la
  clave de servicio y verificables simulando roles; n8n solo recibe el comando, llama, da formato y
  responde. n8n usa la clave de servicio, que se salta la RLS: si el filtrado por usuario viviera en
  los nodos, un fallo mezclaría la despensa de unos y otros.
- **Duplicación a vigilar:** la lista de la compra y «qué cocino» están hoy en TypeScript
  (`listaCompra.ts`, `escalado.ts`, `inventario.ts`). Portarlas a SQL deja dos versiones que pueden
  desviarse; los comandos que no necesitan esa suma (`/despensa`, `/parahacer`) no tienen el problema.
- **Pruebas:** un flujo con disparador de Telegram no se ejecuta a distancia; cada prueba es un
  mensaje real.
- **Privacidad:** los datos pasan por los servidores de Telegram, sin cifrado de extremo a extremo.
  Los afans deberían saberlo al vincular.

**Fases:** 1) vinculación y consultas (`/despensa`, `/parahacer`, `/compra`) más el recordatorio de
menús el día antes de su fecha; 2) tachar («comprado», con botones para confirmar el ingrediente y no
ensuciar los `base`), «¿qué cocino hoy?» y «ya la he hecho» con estrellas; 3) buzón por Telegram
(`/sugerir <enlace>`), buscar receta por frase y cocinar con avisos de temporizador (lo último, y
dudoso: cada temporizador sería una ejecución en espera, y el modo cocina web ya funciona).

---

## Plan acordado — 10 de noviembre de 2026

Orden en el que se harán las ideas, y por qué.

1. **Avisos por correo y «Mi cuenta»** — *en curso* (paso 1, base de datos, hecho). Va primero porque
   las otras dos dependen de él: «Mi cuenta» aloja la vinculación de Telegram y los ajustes, y los
   avisos dan la infraestructura (webhook de base de datos más flujo de n8n) que reutiliza el buzón.
2. **Copia de seguridad semanal a Drive** — *sugerencia del asistente, pendiente de visto bueno*.
3. **Buzón de sugerencias de los afans.**
4. **Bot de Telegram para los afans**, en las fases de arriba.
5. **Extras sugeridos, sin decidir**, que se intercalan donde convenga: escalado en la ficha de
   receta, favoritos, detección de duplicados al dar de alta y PWA instalable.

---

## Orden sugerido

~~1. Estructurar los ingredientes.~~ **Hecho el 23 de agosto.**

~~2. El router.~~ ~~3. Sección de despensa.~~ **Ambos hechos el 31 de agosto.**

~~1. Lista de la compra.~~ ~~2. Rescatar `tiempo`, `porciones` y
`dificultad`.~~ **Ambos hechos el 10 de octubre de 2026.**

1. ~~**Para hacer, realizaciones y el muro de notas.**~~ **Implementado el 11
   de octubre de 2026** (probado en producción).
2. ~~**Modo cocina.**~~ **Hecho el 13 de octubre de 2026**, con temporizadores.
3. ~~**Búsqueda semántica.**~~ **Hecha el 13 de octubre de 2026.**

---

## Dos avisos de realidad

- El catálogo carga las 58 recetas de golpe en el cliente y filtra en memoria.
  Funciona bien hoy; pedirá paginación o búsqueda en servidor cuando crezca.
- Cada tabla nueva en Supabase trae sus policies de RLS. Es justo la parte que
  más guerra ha dado: conviene leer antes la sección de seguridad de
  [CLAUDE.md](../CLAUDE.md) y las migraciones de `supabase/migrations/`.
