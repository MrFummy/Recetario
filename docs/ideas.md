# Ideas para el Recetario

Lluvia de ideas del 9 de agosto de 2026. **Nada de esto está implementado ni
decidido**: es material para elegir, no un plan.

Muchas se apoyan en n8n antes que en la web, igual que la ingesta actual. Esa es
la forma natural de crecer aquí: la SPA es estática y sin backend propio, así
que cualquier cosa que necesite orquestación, credenciales de terceros o
procesos largos encaja mejor en un flujo.

---

## El punto de partida: datos que ya se pagan y se tiran

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

**Persistir los checkboxes de ingredientes.** Hoy se pierden al cerrar el modal;
guardarlos por usuario y receta es barato.

---

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

**"Me faltan dos ingredientes".** Mejora barata sobre lo existente: en vez de
exigir que estén todos, ordenar por cuántos faltan. Se toca solo
`ingredientParser.ts` y `hooks/useIngredientSearch.ts`.

**Enlaces a una receta concreta.** No hay router: todo vive en `/` y no se puede
enviar el enlace de una receta. Compartir hoy significa mandar un PDF por email;
con rutas, ese correo podría llevar además el enlace a la versión web.

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

1. **Rescatar `tiempo`, `porciones` y `dificultad`.** Una tarde, e información
   que ya se está pagando.
2. **Modo cocina.** Solo frontend, y lo que más se agradece con la sartén
   puesta.
3. **Menú semanal y lista de la compra.** La funcionalidad grande, y la que
   mejor encaja con tener n8n detrás.
4. **Enlaces por receta.** Barato, y arregla algo que hoy no se puede hacer.
5. **Búsqueda semántica.** La más vistosa, pero mejor con las anteriores ya
   asentadas.

---

## Dos avisos de realidad

- El catálogo carga las 58 recetas de golpe en el cliente y filtra en memoria.
  Funciona bien hoy; pedirá paginación o búsqueda en servidor cuando crezca.
- Cada tabla nueva en Supabase trae sus policies de RLS. Es justo la parte que
  más guerra ha dado: conviene leer antes la sección de seguridad de
  [CLAUDE.md](../CLAUDE.md) y las migraciones de `supabase/migrations/`.
