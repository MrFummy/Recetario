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

**Modo cocina.** Pasos a tamaño grande y pantalla que no se apaga (Wake Lock
API), para usarlo con las manos pringadas. Los pasos ya mencionan tiempos
("cocínalo 5 minutos"): se pueden detectar y ofrecer un temporizador pulsable.
Es 100 % frontend, sin backend ni n8n, y probablemente lo que más se nota en el
uso diario.

~~**Marcar "lo he cocinado"**, con fecha.~~ Desarrollada en
*Para hacer, realizaciones y el muro de notas*, más abajo.

~~**Persistir los checkboxes de ingredientes.**~~ **Hecho el 23 de agosto**, y
mejor de lo planteado: no se guardan por receta sino por usuario e ingrediente.
Ver la sección de la despensa más abajo.

---

## Para hacer, realizaciones y el muro de notas

> **10 oct 2026 — diseño cerrado, sin implementar.** Conecta tres piezas
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

**Búsqueda semántica.** Hoy se busca por subcadena de ingrediente con lógica Y
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
Sale casi gratis si antes se hace lo de los embeddings.

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

## Orden sugerido

~~1. Estructurar los ingredientes.~~ **Hecho el 23 de agosto.**

~~2. El router.~~ ~~3. Sección de despensa.~~ **Ambos hechos el 31 de agosto.**

~~1. Lista de la compra.~~ ~~2. Rescatar `tiempo`, `porciones` y
`dificultad`.~~ **Ambos hechos el 10 de octubre de 2026.**

1. **Para hacer, realizaciones y el muro de notas.** Diseño ya cerrado (ver
   más arriba) — **siguiente en atacarse**, decidido el 10 de octubre de 2026.
2. **Modo cocina.** Solo frontend, y lo que más se agradece con la sartén puesta.
3. **Búsqueda semántica.** La más vistosa, pero mejor con las anteriores ya
   asentadas.

---

## Dos avisos de realidad

- El catálogo carga las 58 recetas de golpe en el cliente y filtra en memoria.
  Funciona bien hoy; pedirá paginación o búsqueda en servidor cuando crezca.
- Cada tabla nueva en Supabase trae sus policies de RLS. Es justo la parte que
  más guerra ha dado: conviene leer antes la sección de seguridad de
  [CLAUDE.md](../CLAUDE.md) y las migraciones de `supabase/migrations/`.
