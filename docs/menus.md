# Menús

Diseño del 7 de noviembre de 2026. Es el paso 2 del plan que empezó con
`porciones_num` (ver [CLAUDE.md](../CLAUDE.md)). **Fases 1 y 2 (entregas A y B) hechas el
7 de noviembre de 2026, y la 3 el 9** (tablas y RLS en producción, [la migración](../supabase/migrations/20261107_menus.sql));
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
3. **Privado por defecto, compartir después.** Hoy solo lo ve su autor (mismas RLS
   que `para_hacer` y `despensa`). Hacerlo visible a los afans o por enlace queda
   previsto para más adelante, **fuera de la primera versión**.
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
- **RLS**: solo el autor lee y escribe sus menús. `menu_recetas` se autoriza
  mirando el `user_id` de su `menus` con un `exists`. Sin policy para el admin: no
  hace falta.
- Cuando llegue compartir, será una columna `publico` o una tabla aparte; no se
  añade ahora para no inventar una semántica sin usarla.

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
4. **Imprimir.** *(Notas y fecha ya están desde la fase 2.)*
5. *(Más adelante)* Compartir con los afans y por enlace.

## Preguntas abiertas

- **Brochetas y recetas «por unidad»**: por ahora `raciones` a mano en el menú; sigue
  abierto si conviene marcarlas en la receta.
- **Orden dentro de un pase**: se hizo con botones subir/bajar. Arrastrar exigiría
  una librería; se retoma solo si estorba.
- **Recetas nuevas sin `porciones_num`**: el alta de n8n no la rellena. Si los menús
  se usan mucho, convendrá que Vertex la estime al dar de alta.
