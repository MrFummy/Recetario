# Pendientes del rediseño — para retomar

Escrito el 10 de noviembre de 2026, al cerrar la sesión del rediseño «Mercado y azulejo». El sistema, el logo,
el pasaporte, el laboratorio, el PDF y los correos están hechos y en producción; esto es lo que queda.
El detalle de cómo está construido todo está en la sección *Sistema de diseño* de [CLAUDE.md](../CLAUDE.md).

## Estado en producción (para poder volver atrás)

| Qué | Ahora | Anterior |
|---|---|---|
| Web (NAS `/Volumes/web/recetario`) | commit `3c797b1`, bundle `index-CUeSkwVP.js` | commit `0c41176` (`git checkout 0c41176 && npm run deploy:mac`) |
| «Recetas con Frontend» (`bN99xqHFvUTriCKc`) | `9f252cab` | `3a7bfe9f` (y antes `4cd0c01d`, `3a62fac0`) |
| «Aviso de nuevas recetas» (`Zx0jNA5wC2aTu0U1`) | `2cf9905d` | `c9b2b212` (y antes `13aedc94`) |
| «Aviso al autor de una sugerencia» (`8NAHa0mnbcFazLd6`) | `e889ea12` | `df5c2f29` (y antes `25cc2e1f`) |
| Plantilla del PDF en Drive | v3 `1IWUaLVN5ygOmfvBPSSlRl9a3nDuSoOZ7` | v2 de cuaderno `1yLgKKr5VWKjVvH8bHN5WT7egbNkQ1ctH` (cambiar el ID en `Leer plantilla HTML`) |

El nombre de versión de «Aviso de nuevas recetas» salió con las tildes mal escritas: es solo la etiqueta.

## Para hacer, por orden

1. **Borrar a mano la fila de prueba de Google Sheets** (hoja «Recetario»): «Lasaña de carne» con fecha «10 de
   noviembre de 2026» y enlace que termina en `…1nqFcaowrchTLOFFKxQQ79tU1TOYtw-UE`. La de mayo es la buena. Nada
   más de esa prueba queda en Supabase, Notion, Drive ni Storage.
2. ~~**Foto con nombre único en el alta de recetas**~~ **Hecho y probado el 11 de noviembre** (flujo `3a7bfe9f`): `Recupera foto`
   fija `foto_nombre` y el borrado de Sheets busca por enlace. Probado con dos altas (una con foto propia y otra con la
   de por defecto: dos ficheros distintos) y dos borrados: `Buscar receta en Google Sheets` devolvió **una sola fila**
   por borrado y la otra receta conservó foto, PDF y fila hasta que se borró. No quedó nada de la prueba. Matiz: el
   título sale del documento que lee Gemini, no del formulario, así que dos altas con el «mismo» título pueden salir
   con títulos algo distintos; el nombre único protege igualmente.
3. **Plantillas de correo de Supabase Auth**: **generadas el 11 de noviembre** en
   [supabase/plantillas-correo/](../supabase/plantillas-correo/) (confirmar registro, cambiar correo, restablecer
   contraseña y reautenticación), con un [LEEME](../supabase/plantillas-correo/LEEME.md) que dice qué pegar en cada sitio.
   **Pegadas a mano en el panel de Supabase el 11 de noviembre.** Si el logo no sale, es el cliente de correo: Outlook
   bloquea por defecto las imágenes remotas hasta pulsar «Mostrar contenido bloqueado» (comprobado así), y la vista previa
   del panel de Supabase tampoco las carga. La imagen se sirve bien. **Falta volver a pegarlas con la cenefa nueva**
   (`supabase/plantillas-correo/copiar.html`) y probar con un registro real (un alias `+prueba` de Gmail). **La web no
   tiene botón «Olvidé mi contraseña»** (nunca se hizo): la plantilla de restablecer no se envía a nadie hasta que exista.
   La cenefa de los cinco correos de n8n ya es la de celdas de color (11 de noviembre).
4. **Hojas de menús impresas** (`.hoja*` en `index.css`): siguen con la estética de cuaderno. Llevarlas al sistema
   nuevo exige volver a medir `ALTO` y `ALTO_UTIL` en `MenuImprimible.tsx`.
5. **Los 77 PDFs ya generados** siguen en estilo cuaderno. Regenerarlos con «Regenerar PDFs antiguos» (inactivo)
   toca Drive, Notion y Supabase: probar primero con una sola receta y con una copia, no con el catálogo entero.
6. **Decidir Letter o A4** para el PDF de receta (hoy Letter; los menús ya van en A4).

## Sin comprobar a mano

- Los correos nuevos en un cliente real, sobre todo móvil (Gmail ignora la fuente Fraunces; Outlook de escritorio
  no redondea la foto en arco). Solo se ha visto el de error, que llegó a tu bandeja.
- El PDF de una receta larga, para ver cómo parte las páginas (hay `break-inside: avoid` en pasos y notas).
- Editor de menús, muro de notas, buzón, modo cocina con temporizadores y la app con una cuenta que no sea la tuya.
- El mapa del pasaporte arrastrando con el dedo, y la edición real de un país (guardar, subir fotos, quitar país).
- Todo en un móvil real: se midió en el panel del navegador (390–1280 px), no en un teléfono.

## Detalles y mejoras

- Las tarjetas con valoración salen unos 23 px más altas que las demás de su fila: reservar el hueco de las estrellas.
- No hay modo oscuro.
- «El Laboratorio» se mantiene como nombre (ruta y flujo de n8n dependen de él). Si se quiere más calidez, «El Obrador»
  se puede poner solo en el texto visible.
- Si cambia `n8n/correo-base.js`, hay que volver a pegarlo en cinco sitios de n8n (ver CLAUDE.md).
- Tras abrir el detalle de una ejecución de n8n con datos completos salen cabeceras con el token de sesión: no volver
  a pedir `includeData` sin `nodeNames` del nodo que interese.
