# Mi pasaporte — plan

**Estado (15 oct 2026): fases 1 y 2 hechas.** La fase 2 (mapa, sellos y página de país) está
al final de este bloque.

**Fase 1 — datos y etiquetado.**
Aplicada en producción: [la migración](../supabase/migrations/20261015_pasaporte.sql)
(`recetas.pais`, `paises`, `fotos_pais`, bucket `fotos-paises`). RLS verificadas simulando
roles en una transacción revertida: el admin inserta, etiqueta una receta y el borrado de un
país arrastra sus fotos; `anon` y un usuario autenticado que no es admin ven los países pero no
insertan ni etiquetan (el `UPDATE` de `recetas` afecta a 0 filas); `pais` en minúscula se
rechaza. Tras la prueba no quedó nada (0 países, 0 fotos, 0 recetas con país).

**Etiquetado inicial (15 oct 2026, hecho a mano con SQL, sin migración):** Japón (`JP`) con
Okonomiyaki y Salmón con miso; Italia (`IT`) con Cannoli de ricotta. Los dos países se dieron de
alta en `paises` solo con el nombre; falta contexto, fecha y fotos (fase 3). Las otras 58 recetas
no tienen país.

En la web (solo esa parte de la fase 1): selector de país en la ficha en modo edición y etiqueta
con bandera ([PaisEtiqueta.tsx](../src/components/PaisEtiqueta.tsx)); lista de 244 países con
nombres de `Intl.DisplayNames` en [paises.ts](../src/lib/paises.ts). **Sin probar en el
navegador con sesión de admin.** Las banderas son emoji: no se ven en Windows con Chrome.

Una sección donde las recetas del catálogo se presentan por **países en los que he estado**:
un mapamundi con los países visitados iluminados, y una página por país con mis fotos, un
texto de contexto y las recetas de allí. Metáfora: un pasaporte, con un sello por país.

Nombre de trabajo: **Mi pasaporte** (ruta `#/pasaporte`). Alternativas descartadas por ahora:
*El Mundo*, *Cuaderno de viaje*, *Sellos*.

**Fase 2 — mapa y página de país (15 oct 2026).** Rutas `#/pasaporte` y `#/pasaporte/<ISO>`
(las dos funciones de `rutas.ts`), enlace «Pasaporte» en la cabecera para todos y
`SeccionPasaporte` con vista de **mapa** y de **sellos** (tarjetas con bandera y nº de recetas).
Cada país tiene su página (`PaisPagina`): portada, fecha, contexto, galería y sus recetas con
`RecipeGrid`. Los países visitados son los de la tabla `paises` **más** los que tienen alguna
receta etiquetada aunque no estén dados de alta ([pasaporte.ts](../src/lib/pasaporte.ts)).
- **El mapa** es un SVG propio ([MapaMundi.tsx](../src/components/MapaMundi.tsx)), sin
  librería: contornos de Natural Earth 1:50m generados con
  [scripts/generar-mapamundi.mjs](../scripts/generar-mapamundi.mjs) a `src/assets/mapamundi.json`
  (727 KB, **79 KB comprimido**, 235 países). Se carga con `import()` dinámico: no pesa en la app
  hasta que se abre el pasaporte. Sin la Antártida. Faltan 13 territorios diminutos (Gibraltar,
  Reunión…): se alcanzan desde los sellos. Zoom con botones y arrastre, sin rueda.
- **Zona de clic ampliada**: los visitados llevan un trazo transparente de 10 px; sin eso, Japón
  o Italia eran casi imposibles de acertar a escala de mundo.
- En escritorio arranca en mapa y en móvil en sellos (decidido al montar, no se adapta si se
  redimensiona). Las banderas son emoji.
- Verificado en el navegador con datos reales: mapa, clic en Japón, página con sus 2 recetas,
  país sin datos (`#/pasaporte/FR`) y móvil. **Sin probar**: pasar el ratón (el panel no lo
  dispara) y el zoom con arrastre.
- Pendiente de la fase 3: dar de alta países, escribir el contexto y subir fotos. De momento la
  página muestra portada, contexto y galería **si existen**, pero no hay forma de crearlos desde la web.

## Decisiones tomadas

1. **Las recetas son las del catálogo actual** (`recetas`), no una colección aparte. La
   sección es otra forma de verlas; conservan PDF, despensa, lista de la compra, modo cocina
   y búsqueda semántica.
2. **Visible para todos**, también sin sesión (igual que el catálogo). Escribir es solo del
   admin.
3. **Granularidad: país.** Una receta pertenece a **un** país; un país tiene **varias**
   recetas. Sin ciudad por ahora (columna opcional más adelante si hiciera falta).
4. **Escritorio primero.** En móvil el mapa se sustituye por una lista de tarjetas con bandera.

## Datos

- **`recetas.pais`**: `text` nullable, código ISO 3166-1 alfa-2 (`PT`, `JP`…). Sin clave
  foránea dura al principio: una receta puede quedarse sin país. Las 61 existentes se
  etiquetan a mano o con una migración revisada, como se hizo con `base`.
- **`paises`**: `codigo` (PK, ISO), `nombre`, `fecha_viaje` (texto o fecha), `contexto`
  (texto largo: la temática del país en mis palabras), `portada_url`, `created_at`. Un país
  existe aunque no tenga recetas aún (visitado ≠ cocinado).
- **`fotos_pais`**: `id`, `pais` (FK a `paises`, `ON DELETE CASCADE`), `url`, `pie`, `orden`.
- **Bucket `fotos-paises`**, público de lectura, escritura solo admin.
- **RLS**: `SELECT` público en `paises` y `fotos_pais`; `INSERT/UPDATE/DELETE` solo con
  `es_admin()`. `recetas.pais` lo cubre la policy de `UPDATE` de `recetas` que ya es del admin.

## Interfaz

- **Ruta** `#/pasaporte` (mapa) y `#/pasaporte/<ISO>` (país). Añadir a **las dos funciones**
  de `rutas.ts`, como dice CLAUDE.md.
- **Mapa**: un SVG del mundo con cada país como `<path>` con su código; los visitados en
  color, el resto en gris; contador de recetas al pasar el ratón; resumen arriba («12 países ·
  31 recetas»). Sin librería de mapas: la app solo tiene React, Tailwind y Supabase, y un SVG
  propio encaja con el estilo. Zoom y arrastre con una función pequeña propia. Fuente del
  SVG: Natural Earth simplificado (dominio público).
- **Países diminutos** (Singapur, Mónaco…) no se ven en un mapamundi: marcador aparte o
  se accede desde la lista.
- **Página de país**: portada con mi foto, contexto, galería y la rejilla de recetas
  reutilizando `RecipeCard`/`RecipeGrid` filtrada por `pais`.
- **Lista alternativa**: tarjetas con bandera, nombre y nº de recetas. Es la vista de móvil
  y también una opción en escritorio.
- **Sellos**: cada país visitado como un sello con su fecha, en un estilo de pasaporte.
  Aquí está el carácter visual de la sección; conviene decidir el estilo antes de construir.
- Ficheros por debajo de 300 líneas (el mapa, la página de país y el formulario de admin
  van en componentes separados). Hook propio de la sección (`usePaises`), local como
  `useCandidatas`: nadie más usa esos datos.

## Administración (solo admin)

- **Añadir país**: selector con la lista ISO, contexto, fecha y portada.
- **Subir fotos**: desde el navegador, **comprimidas antes de subir** como las de recetas.
- **Quitar país**: borra sus fotos de Storage **por la API**, no por SQL (Storage prohíbe el
  borrado directo y exige policy de `SELECT` además de la de `DELETE`: ya pasó con
  `fotos-candidatas`). Las recetas no se borran: solo pierden el país.
- **Etiquetar receta**: selector de país en la ficha y en el formulario de edición.

## Cosas a tener en cuenta

- **El alta pasa por n8n** y responde «Workflow was started» antes de guardar, así que el
  navegador no puede escribir `pais` en una receta que aún no existe. Dos salidas: (a) etiquetar
  desde la ficha después del alta (simple, la que recomiendo), o (b) mandar `pais` en el
  webhook y escribirlo en `Guardar en Supabase`, con cuidado con la **trampa de n8n** (claves
  anidadas ignoradas y versión sin publicar; ver CLAUDE.md).
- **Las candidatas** (`El Laboratorio`) podrían llevar país desde el principio, y Gemini
  podría proponerlo. Secundario; se decide después.
- **Búsqueda semántica**: si se incluye el país en el texto indexado, hay que reindexar. No
  es necesario para la primera versión.
- Como la sección es pública, las fotos personales son visibles para cualquiera con el enlace:
  revisar qué se sube (ubicaciones, personas).

## Fases

1. **Datos y etiquetado**: migración (`recetas.pais`, `paises`, `fotos_pais`, bucket y RLS),
   verificar las RLS simulando roles, selector de país en la receta y etiquetar las existentes.
   Sin mapa todavía.
2. **Mapa y país**: ruta, SVG, página de país y lista alternativa.
3. **Administración y contenido**: alta de países, contexto, portada y galería.
4. **Extras (opcionales)**: sellos con fecha, línea temporal de viajes, estadísticas
   («país más cocinado»), «destino sorpresa», país en las candidatas.

## Preguntas abiertas

- Estilo de los sellos y paleta (¿pasaporte antiguo, minimalista?).
- ¿Una receta puede pertenecer a más de un país (platos fronterizos)? Por ahora no: uno.
- ¿Qué países hay ya y cuántas recetas tendría cada uno? Sirve para probar el diseño con datos
  reales.
