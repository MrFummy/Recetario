# Recetas candidatas — plan

**Estado: solo planteamiento (14 oct 2026). No hay código ni migraciones.**

Una sección aparte para las recetas que quiero *probar* antes de decidir si
entran al recetario. Entran mayoritariamente como **vídeo** (YouTube, reels),
por eso el núcleo es «vídeo → receta con Gemini».

Nombre de la sección: **pendiente** (ideas: *El Laboratorio*, *En el horno*,
*El Banquillo*, *Borradores*). En este documento, «candidatas».

## Lo que ya existe y condiciona el diseño

Mirado en n8n el 14 de octubre:

- **«Bot recetas»** tiene un disparador de DMs de Instagram (`instagramTrigger`,
  nodo de la comunidad) y **nada más**. Estaba activo con 0 ejecuciones; **desactivado
  el 14 de octubre** al aparcar la entrada por Instagram (ver más abajo). Aceptaba
  eventos sin verificar la firma.
- **«Recetas con Frontend»**, el flujo de alta, recibe un **fichero** (`receta_pdf`
  o `receta_jpg`) por webhook, se lo pasa a Gemini (`gemini-2.5-flash` por la API
  de AI Studio, con el fichero en `inlineData`) y de ahí cuelga todo: foto,
  PDF con Gotenberg, Notion, Sheets y Supabase. **No acepta datos ya
  estructurados.** Eso afecta al paso «incorporar al recetario» (fase 4).
- El prompt de ese nodo ya define el formato (`ingredientes` como objetos con
  `base`/`valor`/`unidad`, `pasos`, `notas`, `categoria`, `tiempo`, `porciones`,
  `dificultad`) y `Limpia respuesta` lo normaliza y añade los `id`. **Se reutiliza
  tal cual**: las candidatas tienen el mismo formato que las recetas.
- Gemini también acepta enlaces de YouTube (`fileData.fileUri`) y vídeo en
  `inlineData` si cabe en 20 MB; un reel suele caber.

## Decisiones tomadas

1. **Tabla propia `candidatas`**, no filas de `recetas` con una marca. `recetas`
   es de lectura pública y alimenta el PDF, Notion, los embeddings y el contador.
2. **Un solo flujo con adaptadores de entrada**: cada puerta produce
   `{fuente_tipo, url, texto, medio}` y desde ahí todo es común. Así, si más
   adelante se retoma Instagram, es un adaptador más.
3. **Telegram primero**, con YouTube y enlaces de reels (solo el pie). **La entrada
   por DM de Instagram queda aparcada** (14 oct): ver «Instagram, aparcada».
4. **Estados**: `por_probar` → `probada` → se incorpora o se borra. Descartar =
   borrar. *(Por confirmar: si se quieren guardar las descartadas para no volver
   a añadirlas.)*
5. **Solo el admin** ve y toca las candidatas.

## Fase 0 — experimento (media tarde, antes de construir nada)

Decide qué camino usa la entrada de reels. Dos mitades independientes:

**0a. Calidad de Gemini con vídeo** (en AI Studio, sin n8n):
- Un vídeo de YouTube pasado como URL y un reel descargado a mano, con el prompt
  actual del nodo `Vertex AI`.
- Mirar: ¿saca bien pasos e ingredientes? ¿las cantidades son fiables o las
  inventa? ¿cuántos tokens gasta un vídeo típico?
- Criterio: si las cantidades salen mal con frecuencia, hay que marcar toda
  candidata de vídeo como «revisa las cantidades» y diseñar la edición con eso en
  mente.

**0b. Qué llega por Instagram** — *aparcada, ver «Instagram, aparcada»*
(requiere la cuenta profesional y la app de Meta, que son del usuario):
- Compartir un reel al DM de la cuenta y mirar la ejecución de «Bot recetas».
- Preguntas: ¿trae la URL del vídeo (¿accesible desde n8n?, ¿cuánto dura?)? ¿trae
  el pie del post? ¿solo el enlace?
- Resultado → vía de reels: **(1)** el vídeo viene en el mensaje; **(2)** `yt-dlp`
  en n8n (solo si está autoalojado y puede ejecutarlo; frágil); **(3)** mandarlo a
  mano por Telegram. Antes de elegir (2), comprobar que n8n lo permite.

### Resultado de 0a con YouTube (14 oct 2026)

Un Short de «Rigatoni al Vodka» (`youtube.com/shorts/oX2plZjL1eQ`) con el prompt
mejorado y `gemini-2.5-flash`, pasando la URL como `fileData.fileUri` (el Short
hay que convertirlo a `watch?v=<id>`).

- **Funciona a la primera**: JSON válido con el esquema exacto, 17 ingredientes,
  15 pasos, `Sal` y `Pimienta negra` ya separados, categoría `Pastas`.
- **Coste**: 18 177 tokens de entrada (16 306 de vídeo, 984 de audio, 887 de
  texto), 1 363 de salida y 2 652 de «pensamiento»: ~22 k en total, 19 s. Un
  Short sale por un par de céntimos (a las tarifas que recuerdo; conviene
  confirmarlas). Un vídeo largo escala casi linealmente.
- **Fallos de fondo, no de formato**:
  - Duplica alternativas: «chalotas (o media cebolla)» sale como dos ingredientes
    obligatorios (`Chalotas picadas` y `Cebolla 0.5`).
  - Cantidades inventadas o redondeadas sin avisar: `Butifarra o salchichas 1
    unidad`, `Rigatoni C/S`. No distingue «lo dice el vídeo» de «lo supongo».
  - `tiempo` y `porciones` probablemente estimados; no se pueden comprobar sin ver
    el vídeo.
- **Consecuencia**: `de_video` en la tabla es necesario, y el prompt de vídeo
  debería pedir que, si una cantidad no se dice ni se ve, la deje vacía en vez de
  inventarla, y que no convierta alternativas («o») en ingredientes distintos.
- **Descubierto de paso**: el nodo `Vertex AI` de «Recetas con Frontend» tiene
  **dos copias del prompt**. n8n ejecuta la de nivel superior (`jsonBody`), que
  **no lleva** la regla de condimentos combinados; la versión mejorada está en
  una copia anidada (`parameters.jsonBody`) que n8n ignora. La tarea pendiente
  del CLAUDE.md sobre los `base` combinados no estaba resuelta en producción.
  **Corregido y publicado el 14 de octubre** (también `Guardar en Supabase`, que
  tenía el mismo defecto con `tiempo`/`porciones`/`dificultad`). El flujo de
  candidatas debe copiar el prompt **ya corregido**.
- **n8n es Cloud** (`n8n.emtel.cloud`): no es autoalojado, así que `yt-dlp` desde
  el propio n8n probablemente no es una opción para los reels.
### Resultado de 0a con un reel público (14 oct 2026)

Reel de `chef.clems` («Duck Breast and Peach Gastrique»), solo con el enlace.

- **Enlace directo a Gemini: no sirve.** `fileData.fileUri` con la URL del reel
  devuelve `400 Unsupported MIME type: text/html`. Gemini solo entiende vídeo por
  URL en YouTube.
- **La página pública sí da el pie del post y la portada, sin sesión.** Un `curl`
  normal recibe `og:title`, `og:description` (el pie, hasta ~430 caracteres en este
  caso) y `og:image` (miniatura de 640 px en `cdninstagram.com`). **No** hay
  `og:video`, `video_versions`, `.mp4` ni JSON-LD: la URL del vídeo no sale de aquí.
- **Pasar solo el pie a Gemini** (1 034 tokens de entrada, 11 s) da título,
  categoría e ingredientes con cantidades —las del pie—, pero **`pasos: []`**,
  `tiempo` y `porciones` vacíos: la preparación va en el vídeo. Además deja los
  nombres en inglés (`Duck breast`, `Peaches`); el `base` sí lo traduce. El prompt
  de candidatas debe pedir expresamente **español**.
- **Consecuencia para el diseño**: un enlace de Instagram da una candidata *parcial*
  (título + ingredientes + foto + enlace) de forma fiable y barata, sin vídeo. Los
  pasos exigen el archivo del vídeo (vías 1–3 de la fase 0b). Merece la pena dejar
  que la candidata nazca así y se complete después. Cuando el pie no trae receta
  (muchos reels la ponen solo en el vídeo), saldrá casi vacía.
- Falta el reel como archivo de vídeo. 0b se aparcó (ver abajo).

### Instagram, aparcada (14 oct 2026)

Se intentó la vía del DM compartido a una cuenta profesional, pero **nunca llegó un
mensaje real a n8n**; solo los de prueba. Lo aprendido, por si se retoma:

- **Lo que sí funciona**: el webhook de n8n responde al handshake de Meta (la URL
  correcta es `…/webhook/<webhookId>/instagram`, no la que muestra el nodo por
  defecto) y el botón *Probar* de Meta llega.
- **Lo que bloquea los mensajes reales**, por orden en que se fueron descubriendo:
  1. La cuenta **receptora** necesita también el rol de *probador de Instagram*
     (sin él, «Rol de desarrollador insuficiente» al generar el token); y la emisora.
  2. La receptora debe tener activado *Permitir acceso a los mensajes* (ajustes de
     Instagram → Herramientas conectadas).
  3. Hay que **agregarla en «Generar tokens de acceso»** y dejar activada su
     *suscripción al webhook*. *Probar* funciona aunque esto esté apagado.
  4. **La app debe estar publicada (modo En vivo)** para recibir webhooks reales;
     el panel lo avisa en el paso 3. Eso exige una **URL de política de privacidad**
     y una categoría, y puede que más trámite. Es donde se paró.
- **Sigue sin saberse** qué trae el mensaje de un reel compartido (¿URL del vídeo?,
  ¿pie?). Era el objetivo del experimento.
- Si se retoma: poner el secreto de la app en la credencial `instagramWebhookApi` y
  desactivar `skipSignatureVerification` en el disparador antes de usarlo, y servir
  una página de privacidad (se hizo una en `public/privacidad.html` y se revirtió).
- **Camino sin Instagram**: Telegram + YouTube + enlaces de reels que solo leen el
  pie. Para los pasos de un reel concreto, mandar el vídeo como archivo por Telegram.

## Fase 1 — base de datos (migración) — HECHA el 14 oct 2026

Aplicada en producción: [la migración](../supabase/migrations/20261014_laboratorio_candidatas.sql).
Verificada simulando roles (en una transacción revertida): el admin inserta y lee;
`fuente_url` duplicada y `estado` inválido se rechazan; un usuario normal ve 0 filas y no
puede insertar ni borrar; `anon` ve 0. **Decisión: nombre de la sección «El Laboratorio»;
descartar = borrar la fila** (no se guardan descartadas).


`candidatas` (RLS solo admin, vía `es_admin()`; n8n escribe con `service_role`):

| Columna | Nota |
|---|---|
| `id`, `created_at` | |
| `titulo`, `categoria`, `ingredientes`, `pasos`, `notas`, `tiempo`, `porciones`, `dificultad` | **El mismo formato que `recetas`** |
| `fuente_url`, `fuente_tipo` (`youtube`/`instagram`/`web`/`texto`) | `UNIQUE` en `fuente_url` para avisar de duplicados |
| `estado` (`por_probar`/`probada`) | `CHECK` |
| `foto_url` | miniatura o fotograma |
| `de_video boolean` | pinta el aviso «revisa las cantidades» |

- **Bucket aparte `fotos-candidatas`.** Las fotos de candidatas no deben mezclarse
  con `fotos-recetas`: la auditoría de huérfanas las señalaría y la policy de
  Storage está pensada para el admin y `_default.jpg`.
- Copiar la foto al bucket en lugar de enlazarla: las miniaturas de Instagram
  caducan.

## Fase 2 — flujo de entrada en n8n (Telegram + YouTube) — HECHA y probada con YouTube (14 oct 2026)

**Estado (14 oct 2026).** Flujo `El Laboratorio - entrada por Telegram` en n8n
(id `J6Rodh1wb7CraxSo`, carpeta *Mis Automatizaciones*), 20 nodos. Lista blanca: solo
el `chat_id` del admin, escrito en el nodo `Entrada`. Probado de punta a punta **solo con
YouTube**: el Short «Rigatoni al Vodka» → fila en `candidatas` (16 ingredientes, 17 pasos,
`de_video`, miniatura copiada al bucket). **Sin probar todavía**: reel de Instagram,
web, texto pegado, duplicados, tope diario y los mensajes de error.

Lo que salió mal por el camino, por si vuelve a pasar:
- **`crypto.randomUUID` no existe en el Code de n8n Cloud.** El id de la candidata
  necesita un uuid válido: se genera con un v4 propio. Un fallback del estilo
  `Date.now().toString(36)` rompe la inserción (`invalid input syntax for type uuid`).
- Un error de nombre de variable (`parts` por `partes`) tumbó el nodo `Preparar Gemini`.
  Un flujo con disparador de Telegram no se puede ejecutar a distancia: cada prueba es
  mandar un mensaje real.
- Una inserción fallida **deja la foto huérfana** en `fotos-candidatas` (ya hay una:
  `mv84xgjm-4m431byy.jpg`). Borrar con SQL no limpia el fichero físico; hacerlo por la
  API de Storage desde la sección o un flujo.

Calidad con las reglas nuevas del prompt, mismo Short que la prueba sin ellas: ya no
duplica «chalotas o media cebolla» (17 → 16 ingredientes), conserva las cantidades como
se dicen («un par», «un poquito», «una cucharada») en vez de redondearlas, y deja
`tiempo` y `porciones` vacíos en lugar de estimarlos. **Aún pone `C/S` en `Rigatoni` y
`Nata para montar`** cuando el vídeo no da cantidad (la regla pide dejarla vacía): los
ejemplos del prompt arrastran ese sesgo.


Flujo nuevo, **sin tocar «Recetas con Frontend»**:

`Telegram Trigger → whitelist de chat_id → detectar tipo (YouTube / web / texto) →
Gemini → Limpia respuesta (misma lógica de normalización) → foto → guardar en
candidatas → responder por Telegram`

- **Whitelist por `chat_id`**: sin ella, cualquiera que encuentre el bot gasta la
  cuota de Gemini.
- **Tope diario** de candidatas nuevas (contando filas de las últimas 24 h antes de
  llamar a Gemini), por la misma razón que el límite de 20 búsquedas por hora: la
  clave se comparte.
- **Duplicado**: si `fuente_url` ya existe, responde «ya la tenías» y no llama a Gemini.
- La respuesta por Telegram incluye el título, el número de ingredientes y pasos y
  el enlace a la sección.
- Reutilizar el prompt. **Antes de copiarlo, ajustar lo pendiente de CLAUDE.md**:
  que no genere `base` combinados («sal y pimienta negra»).
- Webs: leer primero los datos `schema.org/Recipe` del HTML; si no están, el texto
  limpio. Es secundario porque el grueso será vídeo.

## Fase 3 — sección web — HECHA (versión sencilla, 14 oct 2026)

- Ruta `#/<nombre>` en `rutas.ts` (**las dos funciones**, como dice CLAUDE.md), enlace
  en la cabecera solo para el admin, componente propio y un hook `useCandidatas`
  local a la sección (no hace falta montarlo en `App`: solo se usa ahí).
- Rejilla de tarjetas con filtro por categoría y por estado. Ficha que reutiliza
  `RecipeContent` para pasos e ingredientes.
- Acciones: **editar** (empezar por título, categoría, notas y estado; el editor
  completo de pasos e ingredientes es lo más grande y puede ir en una segunda
  pasada), **eliminar**, **marcar como probada**.
- Si `de_video`, aviso visible «extraída de un vídeo: revisa las cantidades».
- Enlace a la fuente original; para YouTube, cuando se pueda, el minuto de cada paso.
- Ficheros por debajo de 300 líneas.

## Fase 4 — incorporar al recetario — IMPLEMENTADA, sin probar de punta a punta (14 oct 2026)

El alta de n8n espera un fichero y llamar a Gemini; aquí los datos ya están. Hay que
añadir una **segunda entrada**:

`Webhook nuevo → Verificar sesión → Solo admin → Set con los datos de la candidata
→ Recupera foto → (el resto del alta igual: PDF, Notion, Sheets, Supabase)`

- **Riesgo**: `Recupera foto` y otros nodos leen del nodo `Webhook` y de
  `Limpia respuesta` *por nombre*. Habrá que hacerlos tolerantes a la entrada nueva.
  Trabajar sobre una copia del flujo y probar con una receta de prueba; el
  historial de versiones de n8n permite volver atrás.
- Al incorporar se sube **la foto propia del plato**; la de ejemplo se descarta.
- Tras el éxito, el cliente borra la candidata. **No fiarse del 200**: como en el borrado
  y en compartir, exigir `{"success": true}` explícito (n8n devuelve 200 vacío si corta
  antes del `Respond to Webhook`).
- Los nodos `Verificar sesion (…)` no llevan credencial de Supabase (ver CLAUDE.md).
- Receta nueva ⇒ indexar embeddings (ya lo hace `buscar-recetas` en la primera búsqueda).

**Cómo quedó (14 oct 2026).** Sin tocar el alta existente: en «Recetas con Frontend», justo
tras `Solo admin (nueva)`, un nodo `¿Viene de una candidata?` mira si el webhook trae el
campo `candidata`. Si sí, `Receta de candidata` imita la respuesta de Gemini y reconecta en
`Limpia respuesta` (que ya normaliza ids, notas y fecha); si no, sigue por `Detecta formato`
como siempre. Solo dependían del arranque `Limpia respuesta` y `Recupera foto`, y solo del
nodo `Webhook`, que se ejecuta igual por los dos caminos. Versión publicada `031c0280`;
**punto de retorno `f7b88b79`**.

El frontend (`PromoverModal`, `lib/promover.ts`) manda `candidata` (JSON), `fecha_clase` y
`foto_plato` por multipart al mismo webhook y **espera a que la receta aparezca en `recetas`**
(el alta responde «Workflow was started» al instante) antes de borrar la candidata. Si no
aparece en 2,5 min, la candidata se queda. Se pide la foto propia: la de ejemplo se descarta.

## Fase 5 — entrada de reels (aparcada)

Sin la vía de Instagram, los reels entran por Telegram: el enlace da una candidata
parcial (pie del post) y, si hace falta, el vídeo se manda como archivo. Si se
retoma el DM de Instagram, sería un segundo adaptador de entrada del flujo de la
fase 2. Verificar la firma `X-Hub-Signature-256` de cada petición y aceptar solo el
usuario de Instagram del admin.

## Después, si apetece

Cruzar candidatas con la despensa («¿qué puedo probar con lo que tengo?»), avisar de
duplicados con los embeddings que ya existen y meter candidatas en la lista de la
compra.

## Abierto

- Crear el bot de Telegram (BotFather) y obtener el `chat_id` propio.
- Retomar o no Instagram (publicar la app de Meta, política de privacidad).
- n8n es Cloud: `yt-dlp` desde n8n probablemente no es posible.
