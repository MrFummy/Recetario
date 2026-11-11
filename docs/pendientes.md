# Pendientes del rediseño — para retomar

Escrito el 10 de noviembre de 2026, al cerrar la sesión del rediseño «Mercado y azulejo». El sistema, el logo,
el pasaporte, el laboratorio, el PDF y los correos están hechos y en producción; esto es lo que queda.
El detalle de cómo está construido todo está en la sección *Sistema de diseño* de [CLAUDE.md](../CLAUDE.md).

## Estado en producción (para poder volver atrás)

| Qué | Ahora | Anterior |
|---|---|---|
| Web (NAS `/Volumes/web/recetario`) | commit `3c797b1`, bundle `index-CUeSkwVP.js` | commit `0c41176` (`git checkout 0c41176 && npm run deploy:mac`) |
| «Recetas con Frontend» (`bN99xqHFvUTriCKc`) | `573d1ad0` | `6cbe04ff` (y antes `9f252cab`, `3a7bfe9f`, `4cd0c01d`, `3a62fac0`) |
| «Aviso de nuevas recetas» (`Zx0jNA5wC2aTu0U1`) | `2cf9905d` | `c9b2b212` (y antes `13aedc94`) |
| «Aviso al autor de una sugerencia» (`8NAHa0mnbcFazLd6`) | `e889ea12` | `df5c2f29` (y antes `25cc2e1f`) |
| Plantilla del PDF en Drive | v4 A4 `1zbidS7zDsJ_72aY1Y0gSPx7EEwjOgWtR` | v3 Letter `1IWUaLVN5ygOmfvBPSSlRl9a3nDuSoOZ7` y v2 de cuaderno `1yLgKKr5VWKjVvH8bHN5WT7egbNkQ1ctH` (cambiar el ID en `Leer plantilla HTML`) |

El nombre de versión de «Aviso de nuevas recetas» salió con las tildes mal escritas: es solo la etiqueta.

## Para hacer, por orden

1. ~~**Borrar a mano la fila de prueba de Google Sheets**~~ **Hecho el 11 de noviembre** (la de «Lasaña de carne» del 10 de noviembre de 2026).
2. ~~**Foto con nombre único en el alta de recetas**~~ **Hecho y probado el 11 de noviembre** (flujo `3a7bfe9f`): `Recupera foto`
   fija `foto_nombre` y el borrado de Sheets busca por enlace. Probado con dos altas (una con foto propia y otra con la
   de por defecto: dos ficheros distintos) y dos borrados: `Buscar receta en Google Sheets` devolvió **una sola fila**
   por borrado y la otra receta conservó foto, PDF y fila hasta que se borró. No quedó nada de la prueba. Matiz: el
   título sale del documento que lee Gemini, no del formulario, así que dos altas con el «mismo» título pueden salir
   con títulos algo distintos; el nombre único protege igualmente.
3. ~~**Plantillas de correo de Supabase Auth**~~ **Hecho el 11 de noviembre.** Generadas en
   [supabase/plantillas-correo/](../supabase/plantillas-correo/) (con su [LEEME](../supabase/plantillas-correo/LEEME.md)) y
   pegadas a mano en el panel. Supabase envía por el SMTP de Gmail (el de serie solo manda ~2 correos/hora a miembros del
   equipo). **Probado de punta a punta:** «¿Olvidaste tu contraseña?» → correo → enlace → contraseña nueva. Si el logo no sale,
   es el cliente: Outlook bloquea las imágenes remotas hasta pulsar «Mostrar contenido bloqueado». **Sin confirmar** que las
   cuatro plantillas pegadas lleven ya la cenefa de celdas (`copiar.html`); si el correo la muestra cortada, hay que repegarlas.
   La cenefa de los cinco correos de n8n ya es la de celdas de color.
4. **Hojas de menús impresas** (`.hoja*` en `index.css`): siguen con la estética de cuaderno. Llevarlas al sistema
   nuevo exige volver a medir `ALTO` y `ALTO_UTIL` en `MenuImprimible.tsx`.
5. **Los 77 PDFs ya generados** siguen en estilo cuaderno y en Letter. **En curso (11 de noviembre).** Se regeneran con el flujo
   «Regenerar PDFs antiguos» (`uLBelHfEjdbxDbaS`, inactivo, manual), reconstruido: lee Supabase, rellena con el **mismo código
   que el alta** (`n8n/regenerar-pdfs.js`, copiado de `rellenar-html.js`), Gotenberg con A4 explícito y **sobrescribe el
   contenido del mismo fichero de Drive** (mismo ID y enlace: Notion, Sheets y Supabase no cambian). Antes copia el PDF antiguo
   a la carpeta de respaldo «Respaldo PDFs estilo cuaderno (Letter)» (`1ypKTHcCDCYhZpWKSaIGCbF03oujWkwE-`); además Drive guarda
   la revisión previa. **Excluidas a propósito** las 2 recetas sin ingredientes en la base (Alitas Buffalo y Solomillo con
   castañas): regenerarlas las dejaría sin ingredientes (`ingredientes=not.is.null` en la URL). **Probado con 1** (Crema de
   zanahoria, ejecución 117500): A4, una página, copia de respaldo hecha. **Ahora el nodo `Obtener recetas` lleva `&id=eq.…`:
   quitar ese filtro para el lote.** Medido en local con las 77: 57 caben en una página, 20 ocupan dos, 3 con la segunda casi
   vacía.
   **Plantilla v5** (`1J829L5djRXW_x05PWS8OaLrF0HEN4CT6`): arregla un fallo de la v4 en las recetas que pasan por poco de una
   página, cuya primera hoja salía **solo con la cabecera** (el `grid` de una fila no se parte entre páginas; ahora columna
   lateral flotante, `flow-root` en `.main`, pie `fixed` repetido en cada página y pasos algo más compactos). **«Recetas con
   Frontend» sigue con la v4** (`1zbidS7z…`): hay que apuntarla a la v5 para que las altas nuevas no tengan ese fallo.
6. ~~**PDF de receta en A4**~~ **Hecho y probado el 11 de noviembre** (flujo `573d1ad0`). Plantilla v4 en Drive (`update_file` no
   cambia contenido, así que es un fichero nuevo) con `@page { size: A4 }` y cuerpo de `210mm × 296mm` (296 y no 297, como las
   hojas de menús, para no generar una página en blanco por redondeo). **Trampa:** Gotenberg respeta los márgenes del `@page`
   pero **ignora su tamaño**: la primera alta salió en Letter (612 × 792) con la hoja A4 dibujada dentro y franjas blancas. Por
   eso el nodo `Crear PDF con Gotenberg` pasa `paperWidth 8.27`, `paperHeight 11.69` y los cuatro márgenes a 0. Con eso, dos
   altas reales dieron `MediaBox` 595,92 × 841,92, una página, a sangre. También se confirmó `porciones_num` en el alta.
   Se borraron las dos de prueba desde la web (Supabase, Storage y Drive a la papelera; el borrado usa un `window.confirm`).
   Vuelta atrás: ID de la v3 Letter en `Leer plantilla HTML` y quitar los cuatro parámetros de papel y márgenes.
   **Sin comprobar a mano:** que Notion y Google Sheets quedaron limpios de esas dos pruebas.

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
