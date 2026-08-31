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

## El punto de partida: datos que ya se pagan y se tiran

> **23 ago 2026 — hecho a medias.** Los ingredientes ya están estructurados:
> cada uno es un objeto con `nombre`, `cantidad`, `base`, `valor` y `unidad`. Lo
> que sigue pendiente es lo de abajo: `tiempo`, `porciones` y `dificultad`.

Vertex AI **ya extrae** `tiempo`, `porciones` y `dificultad` de cada receta. Se
puede ver en cualquier ejecución del flujo, en la salida del nodo
`Recupera foto`:

```json
"tiempo": "Preparación: 15' + 1 h de reposo. Cocción: 20'",
"porciones": "2",
"dificultad": "Fácil"
```

Pero el nodo `Guardar en Supabase` no los escribe y la tabla `recetas` no tiene
esas columnas: se calculan, se pagan y se descartan.

Tres columnas nuevas y una línea en ese nodo desbloquean filtros por tiempo,
badges en las tarjetas y ordenar por dificultad. Las 58 recetas antiguas se
rellenarían reprocesando sus PDFs; ya existe un flujo parecido para eso,
*Regenerar PDFs antiguos*.

Es lo más barato de toda esta lista, con diferencia.

---

## Cocinar de verdad

**Modo cocina.** Pasos a tamaño grande y pantalla que no se apaga (Wake Lock
API), para usarlo con las manos pringadas. Los pasos ya mencionan tiempos
("cocínalo 5 minutos"): se pueden detectar y ofrecer un temporizador pulsable.
Es 100 % frontend, sin backend ni n8n, y probablemente lo que más se nota en el
uso diario.

**Marcar "lo he cocinado"**, con fecha. Da historial por usuario y abre la
puerta a avisos del tipo "hace ocho meses que no haces el marmitako".

~~**Persistir los checkboxes de ingredientes.**~~ **Hecho el 23 de agosto**, y
mejor de lo planteado: no se guardan por receta sino por usuario e ingrediente.
Ver la sección de la despensa más abajo.

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

**Lo que la sección destapó**: siete `base` son mezclas de condimentos
(`sal y pimienta negra` y compañía, 18 apariciones). Quien tiene sal y pimienta
lee "te falta: sal y pimienta negra". Ya no es teórico; conviene partirlos antes
de la lista de la compra.

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

## Menú semanal y lista de la compra

La funcionalidad grande, y donde la arquitectura actual brilla.

Eliges recetas para la semana, un webhook recibe los ids, agrega los
ingredientes de todas y devuelve la lista de la compra. n8n puede mandarla por
email, escribirla en Google Keep, en una hoja de Sheets o en Todoist.

Buena parte del trabajo ya está hecha: `lib/ingredientParser.ts` sabe aplanar el
JSONB heterogéneo que entrega n8n, y lo comparte con el detalle de receta para
que ambos interpreten lo mismo.

La dificultad no es técnica sino de datos: sumar "2 unidades de cebolla" con
"1 cebolla" exige normalizar cantidades. Encaja bien una llamada a Vertex que
consolide la lista, que es justo lo que un LLM hace bien y lo que ya se usa
aquí.

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

- **Comentarios por receta**, con moderación del admin.
- **Favoritos**, separados de la valoración.
- **Notas por usuario.** Hoy `notas` es un campo global que solo edita el admin,
  así que nadie más puede apuntar "yo le pongo menos sal".

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

1. **Lista de la compra**, que cae casi sola encima de la despensa: tachar en el
   súper será añadir a ella.
2. **Rescatar `tiempo`, `porciones` y `dificultad`.** Una tarde, e información
   que ya se está pagando.
3. **Modo cocina.** Solo frontend, y lo que más se agradece con la sartén puesta.
4. **Búsqueda semántica.** La más vistosa, pero mejor con las anteriores ya
   asentadas.

---

## Dos avisos de realidad

- El catálogo carga las 58 recetas de golpe en el cliente y filtra en memoria.
  Funciona bien hoy; pedirá paginación o búsqueda en servidor cuando crezca.
- Cada tabla nueva en Supabase trae sus policies de RLS. Es justo la parte que
  más guerra ha dado: conviene leer antes la sección de seguridad de
  [CLAUDE.md](../CLAUDE.md) y las migraciones de `supabase/migrations/`.
