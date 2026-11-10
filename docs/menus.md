# Menús

Diseño del 7 de noviembre de 2026. Es el paso 2 del plan que empezó con
`porciones_num` (ver [CLAUDE.md](../CLAUDE.md)). **Fases 1 y 2 (entregas A y B) hechas el
7 de noviembre de 2026, las 3 y 4 el 9 y la 5 (compartir) el 10; el plan queda cerrado** (tablas y RLS en producción, [la migración](../supabase/migrations/20261107_menus.sql));
el resto es el acuerdo de qué se construye y por qué.

Un menú no es semanal: es una selección de recetas para **una ocasión** (una cena,
un cumpleaños, Nochebuena), con un número de comensales. Del menú sale la lista
de la compra ya escalada.

## Decisiones tomadas

1. **Se organiza por pases**: aperitivo, entrante, principal, postre y otro. Cada
   receta cae en un pase propuesto según su categoría y editable.
   | Categoría | Pase propuesto |
   |---|---|
   | Aperitivos | aperitivo |
   | Sopas/Cremas, Ensaladas | entrante |
   | Arroces, Pastas, Carnes, Pescados y mariscos | principal |
   | Postres | postre |
2. **Escalado proporcional**: factor = raciones deseadas ÷ `porciones_num` de la
   receta, aplicado solo a cantidades numéricas (`valor`). Las de texto («al gusto»)
   no se escalan. Se descartó redondear a tandas enteras: compra de más en todo
   salvo en tartas.
3. **Privado por defecto, y el autor decide si lo comparte** (fase 5, hecha el 10 nov). Tres
   niveles: **privado**, **los afans** (cualquier usuario con sesión) y **enlace** (cualquiera con
   el enlace, también sin cuenta). Volver a privado deja el enlace sin efecto. Quien abre un menú
   ajeno puede ver, imprimir y usar la lista de la compra (escalada, descontando su propia
   despensa si tiene sesión); **no puede guardar una copia**, que se descartó. El nombre del autor
   sale solo con sesión, nunca en el enlace público. Los menús de nivel «afans» se listan en
   `#/menus`; los de «enlace» no.
4. **Del menú sale**: la lista de la compra del menú, una versión para imprimir o
   guardar como PDF, y notas y fecha del evento.

## Modelo de datos (propuesta)

```
menus
  id          uuid pk
  user_id     uuid -> auth.users, on delete cascade
  nombre      text not null
  ocasion     text            -- «Cumpleaños de Ana», libre
  fecha       date            -- opcional
  comensales  smallint not null default 4 check (comensales > 0)
  notas       text            -- alergias, bebidas…
  created_at  timestamptz default now()

menu_recetas
  menu_id     uuid -> menus, on delete cascade
  receta_id   uuid -> recetas, on delete cascade
  pase        text not null check (pase in ('aperitivo','entrante','principal','postre','otro'))
  orden       smallint not null default 0
  raciones    smallint        -- null = las del menú (comensales)
  primary key (menu_id, receta_id)
```

- **`raciones` por receta** resuelve los casos que `porciones_num` no puede: unas
  brochetas (`porciones_num` = 1, ingredientes «por brocheta») se piden como
  «12»; un postre de reparto, como «comensales ÷ 2». Si es `null`, usa los
  comensales.
- **RLS**: solo el autor escribe sus menús, y los lee —desde el 10 nov, también los de nivel
  «afans» de otros, ver «Compartir»—. `menu_recetas` se autoriza mirando el `user_id` de su
  `menus` con un `exists`. Sin policy para el admin: no hace falta.
- Compartir se resolvió con una columna `visibilidad` (ver «Compartir», más abajo).

## Escalado y lista de la compra

Se reutiliza [listaCompra.ts](../src/lib/listaCompra.ts), que hoy recibe un
`Set` de recetas. Pasaría a recibir un `Map<id, factor>` y multiplicaría `valor` por
el factor antes de sumar. Reglas:

- **Sin `porciones_num`** (las dos recetas sin ingredientes, o una receta nueva):
  factor 1 y aviso visible en el menú, no un cálculo en silencio.
- **Líneas «por persona»** (risotto, tallarines con pesto, wok de tallarines,
  pescado al papillote, peras, sabayon): la cantidad ya es por comensal, así que
  **no se divide por `porciones_num`**; se multiplica por las raciones. Se detectan
  por el texto de `cantidad` («por persona», «por brocheta»).
- **Redondeo**: unidades enteras hacia arriba («2,4 huevos» → 3); gramos y
  mililitros con un decimal como mucho.
- Se descuenta la despensa y **tachar añade a la despensa**, como en la lista
  actual. No hay tabla de «comprado».

## Rutas e interfaz

- `#/menus`: lista de menús propios y botón de nuevo.
- `#/menu/<id>`: editor y vista del menú. Comensales, pases con sus recetas, notas,
  fecha, lista de la compra y botón de imprimir.
- Solo con sesión: pasan por `SoloLogueados`, igual que Despensa y Compra, y se
  ocultan en la nav sin ella.
- `useMenus` vive dentro de la sección, no en `App`: nadie más usa esos datos
  (como `useCandidatas`).
- **Imprimir**: CSS de impresión y `window.print()`; «Guardar como PDF» es del
  navegador. Sin n8n ni Vertex.

## Fases

1. ~~**Base de datos**: migración con las dos tablas y sus RLS, verificadas
   simulando roles (otro usuario no ve ni toca el menú ajeno).~~ **Hecha el 7 nov**: 8 policies; el usuario ajeno no ve, edita, borra ni cuelga recetas en un menú que no es suyo, el dueño no puede regalarlo cambiando `user_id`, y los `check` de pase, comensales y raciones saltan.
2. **Lista y editor**: rutas, crear menú, comensales, añadir y quitar recetas por
   pase, orden. **Entrega A hecha el 7 nov** (`#/menus`, `#/menu/<id>`, cambiar de
   pase, aviso de recetas sin `porciones_num`; probada con sesión real en dev: crear,
   añadir, cambiar pase, quitar, borrar con cascada). **Entrega B hecha el 7 nov**: subir y bajar dentro de un pase
   (los `orden` de las dos filas se intercambian en un solo `upsert`, para que no
   quede a medias) y `raciones` por receta (vacío = las del menú). Probado con sesión
   real.
3. ~~**Lista de la compra escalada**: factor por receta, líneas «por persona»,
   `raciones` por receta, avisos.~~ **Hecha el 9 nov.** `lib/escalado.ts` (`multiplicador`,
   `esPorRacion`, `redondear`) y `listaDeLaCompra` con un `Map` de escalas opcional;
   sección «Lista de la compra» al final del menú (`MenuCompra.tsx`). Probada con sesión
   real: 6 y 7 comensales, líneas «por persona» y brochetas con raciones propias.
4. ~~**Imprimir.**~~ **Hecha el 9 nov, y rehecha el 10 como réplica de la plantilla de los PDF de
   recetas de n8n** (el HTML del Drive que rellena el nodo `Rellenar HTML`). Botón «Imprimir»
   (desactivado sin recetas) que llama a `window.print()`. `MenuImprimible.tsx` es una hoja que
   solo se ve al imprimir (`hidden print:block`); la cabecera y el editor llevan `print:hidden`.
   Cada página es una **hoja A4 exacta** (`HojaImpresa.tsx`) con los estilos de la plantilla
   copiados en `index.css` (`.hoja*`): cuadrícula de fondo, logo «M», título en Fraunces, chips
   manuscritos (ocasión, comensales, fecha), subrayado amarillo inclinado, platos con **número
   circulado** como los pasos de una receta, la lista de la compra con ◆ y la cantidad delante,
   la nota como post-it con cinta y el pie `~/menus/<nombre>.md · marca · fecha · página`.
   La página va **sin márgenes** (`@page { margin: 0 }`, global) para que el navegador no añada
   su URL y su fecha, y el contenido se reparte a mano entre hojas con `lib/paginar.ts`, con pesos
   en px medidos sobre la hoja pintada. Un título de sección no se queda solo al final y la lista
   empieza en página nueva. Verificada emulando el estilo de impresión con 25 recetas: 5 hojas,
   sin desborde. **Diferencias con la plantilla**: A4 y no Letter, y sombra sólida en la nota.
   *(Notas y fecha ya estaban desde la fase 2.)*
5. ~~**Compartir** con los afans y por enlace.~~ **Hecha el 10 nov**, ver «Compartir».

## Preguntas abiertas

- **Brochetas y recetas «por unidad»**: por ahora `raciones` a mano en el menú; sigue
  abierto si conviene marcarlas en la receta.
- **Orden dentro de un pase**: se hizo con botones subir/bajar. Arrastrar exigiría
  una librería; se retoma solo si estorba.
- ~~**Recetas nuevas sin `porciones_num`**~~ **Resuelto el 10 nov**: el alta de n8n lo estima y lo
  guarda (ver [CLAUDE.md](../CLAUDE.md)). Falta confirmarlo con la próxima receta que se dé de alta.

## Compartir

Hecho el 10 de noviembre de 2026 ([la migración](../supabase/migrations/20261110_compartir_menus.sql)).
`menus.visibilidad` (`privado` por defecto, `afans`, `enlace`).

**El enlace no se abre con una policy de lectura pública.** Con ella, cualquiera con la clave
anónima —que va en el bundle— podría listar todos los menús compartidos por enlace y el enlace
dejaría de ser secreto. En su lugar, `ver_menu_compartido(id)` (`SECURITY DEFINER`) devuelve **un
solo menú por su id**, o `null` si no existe, es privado o es «afans» y quien pregunta no tiene
sesión: no distingue entre «no existe» y «no es tuyo». No devuelve `user_id`, y el nombre del
autor solo sale con sesión. Por eso el linter avisa de que `anon` y `authenticated` pueden
ejecutarla: es intencionado.

**Los menús «afans» sí se abren a la lectura de la tabla** (una policy más en `menus` y otra en
`menu_recetas`, solo `select` y solo para `authenticated`), porque los afans los listan. Las
policies de escritura siguen siendo las del autor: nadie más edita, borra ni cambia la
visibilidad de un menú compartido. **Consecuencia que ya mordió al diseñar**: como ahora la
tabla devuelve también los menús «afans» de otros, «Mis menús» tiene que filtrar por
`user_id` (`useMenus`); antes bastaba la RLS.

En la web: el autor ve el control de compartir en el editor (`MenuCompartir`, con el enlace y un
botón de copiar). `#/menu/<id>` ya no exige sesión: `MenuPagina` pregunta a la función y, si el
menú es de otro y está compartido con quien mira, enseña `MenuVista` (solo lectura); si es propio
o no hay nada que enseñar, va al editor, que lo pide a la tabla y dice «no existe» si no. `#/menus`
sí sigue exigiendo sesión. Se comparten también las notas del menú, y el editor lo avisa.

**Verificado** simulando roles (autor, otro usuario con sesión y anónimo) en una transacción que
se revierte, y en el navegador con sesión y sin ella. Sin sesión: el enlace abre el menú sin
autor ni editor; en privado, o con un id inventado, sale el mismo «no existe». Solo se probó con
menús propios, así que ver el menú de otro usuario, y la sección «Menús de los afans» con datos
ajenos, se comprobó desactivando temporalmente los dos filtros de «no es mío» (ya revertidos).
