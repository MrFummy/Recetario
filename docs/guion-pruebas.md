# Guion de pruebas a mano

Lo que no se ha podido comprobar desde el entorno de desarrollo. Marca cada casilla; si algo falla, anota qué viste.
Web: https://recetario.orballo.link/

## A. Con tu cuenta de admin, en el ordenador (15 min)

### A1. Hoja impresa del menú «Navidad»
- [ ] Entra en `#/menus` → «Navidad» → botón Imprimir.
- [ ] En el diálogo, destino «Guardar como PDF», márgenes «Ninguno», activa «Gráficos de fondo».
- [ ] Cada página es una hoja A4 completa, sin la URL ni la fecha del navegador arriba o abajo.
- [ ] Los sellos numerados llevan el color de la categoría de cada plato.
- [ ] No hay ninguna página en blanco.
- [ ] Repite en Safari (si lo usas) y fíjate en cuántas páginas salen.

### A2. Editor de menús
- [ ] Crea un menú nuevo con 4 comensales.
- [ ] Añade una receta; entra en el pase que le toca por su categoría.
- [ ] Sube y baja una receta: el orden cambia y persiste al recargar.
- [ ] Cambia las raciones de una receta y mira que la lista de la compra del menú escala.
- [ ] Cambia la visibilidad a «enlace», abre el enlace en una ventana privada: se ve en solo lectura.
- [ ] Borra el menú de prueba.

### A3. Pasaporte
- [ ] En `#/pasaporte/<ISO>` de un país: «Gestionar país» → guarda el contexto.
- [ ] Sube una foto real y elígela como portada.
- [ ] Quita la foto. Comprueba que desaparece de verdad (Storage).
- [ ] Da de alta un país de prueba, asígnalo a una receta, quítalo: la receta se queda sin país, no se borra.

## B. Con una cuenta que no sea la tuya (10 min)
Usa una ventana privada y registra una cuenta con otro correo.

- [ ] Despensa, Compra y Pasaporte aparecen en la nav y abren.
- [ ] El Laboratorio y los botones de admin **no** aparecen.
- [ ] Un enlace `#/laboratorio` abierto con esa cuenta no enseña datos.
- [ ] Cocina una receta (realización con nota): la nota sale en el muro firmada con el nombre de la cuenta.
- [ ] `#/buzon`: envía una sugerencia con enlace. Debe aparecer en tu lista como «pendiente».
- [ ] `#/cuenta`: activa los avisos de recetas nuevas y recarga: sigue activado.
- [ ] Desde tu cuenta de admin: ves la sugerencia en el buzón, la marcas «hecha» y eliges receta. A la otra cuenta le llega el correo.
- [ ] Borra la cuenta de prueba y sus datos (Supabase → Authentication).

## C. Correos (5 min)
- [ ] Abre el correo de «Restablecer contraseña» en Gmail móvil y en Outlook: la cenefa llena el ancho (no sale cortada).
- [ ] Si sale cortada, repega las 4 plantillas de Auth desde `supabase/plantillas-correo/copiar.html`.
- [ ] El correo de «receta nueva» (cuando des de alta una) se ve bien en móvil; Gmail ignora Fraunces, es normal.

## D. En el móvil de verdad (10 min)
- [ ] Todas las secciones sin desborde horizontal.
- [ ] Modo cocina: la pantalla **no se apaga** mientras corre un temporizador.
- [ ] Modo cocina con el pulgar: Anterior/Siguiente cómodos.
- [ ] La vibración al acabar el temporizador (en iPhone/Safari no existe `navigator.vibrate`: se espera que no vibre).
- [ ] Mapa del pasaporte: arrastrar con un dedo y hacer zoom con dos.
- [ ] Imprimir un menú desde el móvil: cuántas páginas salen.

## Al terminar
Pásame lo que haya fallado y lo que dejaste sin probar, y lo anoto en `docs/pendientes.md`.
