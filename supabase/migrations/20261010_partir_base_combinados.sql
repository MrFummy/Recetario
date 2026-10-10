-- ═══════════════════════════════════════════════════════════════════════════
-- Partir los `base` combinados (10 oct 2026) — REGISTRO, no re-ejecutable
--
-- Desde la migración del 23 de agosto, siete valores de `base` eran en
-- realidad mezclas de condimentos ("sal y pimienta negra", "sal, pimienta
-- negra y nuez moscada"...). Como `base` es la clave con la que la despensa
-- cruza recetas, esas mezclas no casaban con `sal` ni con `pimienta negra`
-- sueltas: 19 veces la despensa decía "te falta: sal y pimienta negra" a
-- alguien que tenía sal y pimienta. Ver docs/ideas.md y CLAUDE.md § Pendiente.
--
-- Localizadas con SQL (no estimadas): 7 valores distintos de `base`, 19 filas
-- de `recetas.ingredientes`, en 19 recetas. Incluye una variante no vista
-- antes, "sal y pimienta" (sin "negra", en Pescado al papillote), mapeada
-- aquí a la `base` ya existente `pimienta negra` para no crear una base
-- redundante.
--
-- Cada fila combinada se sustituye por una fila nueva por condimento, cada
-- una con id propio (gen_random_uuid()) y la misma `cantidad`/`unidad`/
-- `valor` que tenía la fila original (todas eran "al gusto" o "C/S", sin
-- cantidad medible, así que no hay nada que repartir). El nombre y la base de
-- cada condimento usan exactamente la grafía ya presente en el catálogo
-- (`Sal`/`sal`, `Pimienta negra`/`pimienta negra`, etc.), verificada antes de
-- escribir esta migración.
--
-- ── Reversión ──────────────────────────────────────────────────────────────
-- `public.respaldo_ingredientes` ya conserva la forma combinada original de
-- estas 19 filas (son parte de los 454 ingredientes de la migración del 23 de
-- agosto), así que revertir una receta es el mismo UPDATE de siempre:
--
--   update public.recetas r set ingredientes = b.ingredientes
--   from public.respaldo_ingredientes b where b.receta_id = r.id;
--
-- ── Pendiente fuera de esta migración ─────────────────────────────────────
-- El prompt del nodo `Vertex AI` (flujo "Recetas con Frontend") puede volver
-- a generar un `base` combinado en una receta nueva. Hay que ajustarlo para
-- que separe los condimentos desde el alta, o esta migración habrá que
-- repetirla.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1) Gachas Manchegas — "sal y pimienta negra" (cantidad "al gusto")
update public.recetas
set ingredientes = (
  select jsonb_agg(elem) from jsonb_array_elements(ingredientes) elem
  where elem->>'id' <> '22fe3177-d913-4cd8-b8a6-3d5e965f8044'
) || jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Sal', 'cantidad', 'al gusto', 'base', 'sal', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Pimienta negra', 'cantidad', 'al gusto', 'base', 'pimienta negra', 'valor', null, 'unidad', 'al gusto')
)
where id = '34578684-8009-40c1-9443-33e4a7e23564';

-- 2) Ratatouille (Versión rápida) — "sal y pimienta negra" (cantidad "C/S")
update public.recetas
set ingredientes = (
  select jsonb_agg(elem) from jsonb_array_elements(ingredientes) elem
  where elem->>'id' <> 'c42b475e-9de6-4c9b-8ebd-49da849a0e22'
) || jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Sal', 'cantidad', 'C/S', 'base', 'sal', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Pimienta negra', 'cantidad', 'C/S', 'base', 'pimienta negra', 'valor', null, 'unidad', 'al gusto')
)
where id = '4f805917-833b-4c8f-86a6-8fcbc1dc8466';

-- 3) Fabada Asturiana (Versionada) — "sal, pimienta negra y pimentón dulce"
update public.recetas
set ingredientes = (
  select jsonb_agg(elem) from jsonb_array_elements(ingredientes) elem
  where elem->>'id' <> 'da869404-603d-4064-99bd-a447b6152edb'
) || jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Sal', 'cantidad', 'C/S', 'base', 'sal', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Pimienta negra', 'cantidad', 'C/S', 'base', 'pimienta negra', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Pimentón dulce', 'cantidad', 'C/S', 'base', 'pimentón dulce', 'valor', null, 'unidad', 'al gusto')
)
where id = '444c134b-22ad-4d21-867b-b384ab0b1691';

-- 4) Tartar de salmón cocinado con crema de aguacate — "sal y pimienta negra"
update public.recetas
set ingredientes = (
  select jsonb_agg(elem) from jsonb_array_elements(ingredientes) elem
  where elem->>'id' <> 'mud2r1dx-34gie72b'
) || jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Sal', 'cantidad', 'C/S', 'base', 'sal', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Pimienta negra', 'cantidad', 'C/S', 'base', 'pimienta negra', 'valor', null, 'unidad', 'al gusto')
)
where id = '3b57c0b6-5992-4b81-93da-06f8df29b8b5';

-- 5) Marmitako — "sal y pimienta negra"
update public.recetas
set ingredientes = (
  select jsonb_agg(elem) from jsonb_array_elements(ingredientes) elem
  where elem->>'id' <> '8f890189-06f9-4ae6-a5c7-5535e46dca09'
) || jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Sal', 'cantidad', 'C/S', 'base', 'sal', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Pimienta negra', 'cantidad', 'C/S', 'base', 'pimienta negra', 'valor', null, 'unidad', 'al gusto')
)
where id = 'f1403085-748b-48f7-a0be-69b071638223';

-- 6) Fusilli a la Carbonara — "sal y pimienta negra"
update public.recetas
set ingredientes = (
  select jsonb_agg(elem) from jsonb_array_elements(ingredientes) elem
  where elem->>'id' <> '379a5b28-9883-43b9-a8f8-22a1c33fd7a6'
) || jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Sal', 'cantidad', 'C/S', 'base', 'sal', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Pimienta negra', 'cantidad', 'C/S', 'base', 'pimienta negra', 'valor', null, 'unidad', 'al gusto')
)
where id = 'c368285e-b64c-4588-a9f6-05a37270bde8';

-- 7) Minestrone a la milanesa — "sal y pimienta negra"
update public.recetas
set ingredientes = (
  select jsonb_agg(elem) from jsonb_array_elements(ingredientes) elem
  where elem->>'id' <> '2851061d-98fd-4a8b-88cd-93a5d114fc2a'
) || jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Sal', 'cantidad', 'C/S', 'base', 'sal', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Pimienta negra', 'cantidad', 'C/S', 'base', 'pimienta negra', 'valor', null, 'unidad', 'al gusto')
)
where id = 'dca2f7a9-ec44-432b-9cb7-969e94b9253e';

-- 8) Pimientos de piquillo rellenos de merluza... — "sal y pimienta negra"
update public.recetas
set ingredientes = (
  select jsonb_agg(elem) from jsonb_array_elements(ingredientes) elem
  where elem->>'id' <> '9a5f20d3-63e8-48c3-9ea7-2c301cb6bba4'
) || jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Sal', 'cantidad', 'C/S', 'base', 'sal', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Pimienta negra', 'cantidad', 'C/S', 'base', 'pimienta negra', 'valor', null, 'unidad', 'al gusto')
)
where id = '28c715e0-fdfc-414b-83a2-79ec87d4a9e5';

-- 9) Crema de zanahoria — "sal y pimienta negra"
update public.recetas
set ingredientes = (
  select jsonb_agg(elem) from jsonb_array_elements(ingredientes) elem
  where elem->>'id' <> '505eb1d8-66fc-4609-88e2-7654624f8818'
) || jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Sal', 'cantidad', 'C/S', 'base', 'sal', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Pimienta negra', 'cantidad', 'C/S', 'base', 'pimienta negra', 'valor', null, 'unidad', 'al gusto')
)
where id = '2b4af6e0-ed36-451e-b45c-e6fdc533426e';

-- 10) Pasta "One Pot" con Chorizo y Hierbas al Limón —
--     "aceite de oliva, sal y pimienta negra" (cantidad original: "")
update public.recetas
set ingredientes = (
  select jsonb_agg(elem) from jsonb_array_elements(ingredientes) elem
  where elem->>'id' <> 'a8ffa86e-ac9a-49d1-9555-e6a55fe7222c'
) || jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Aceite de oliva', 'cantidad', '', 'base', 'aceite de oliva', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Sal', 'cantidad', '', 'base', 'sal', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Pimienta negra', 'cantidad', '', 'base', 'pimienta negra', 'valor', null, 'unidad', 'al gusto')
)
where id = '5516b5e0-8731-4b16-8f26-dd47e225756b';

-- 11) Escalivada — "sal y pimienta negra"
update public.recetas
set ingredientes = (
  select jsonb_agg(elem) from jsonb_array_elements(ingredientes) elem
  where elem->>'id' <> 'a38099c0-11f3-4ed6-8b57-fb7fc8c4237b'
) || jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Sal', 'cantidad', 'C/S', 'base', 'sal', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Pimienta negra', 'cantidad', 'C/S', 'base', 'pimienta negra', 'valor', null, 'unidad', 'al gusto')
)
where id = '0ad4c4d9-f36d-4915-b440-d108961302f5';

-- 12) Raxo de la abuela — "sal y pimienta negra"
update public.recetas
set ingredientes = (
  select jsonb_agg(elem) from jsonb_array_elements(ingredientes) elem
  where elem->>'id' <> 'b36664e5-cae9-419a-87b8-2c7ceda8545b'
) || jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Sal', 'cantidad', 'C/S', 'base', 'sal', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Pimienta negra', 'cantidad', 'C/S', 'base', 'pimienta negra', 'valor', null, 'unidad', 'al gusto')
)
where id = 'b7680153-e567-42cf-af5f-c9f92a648a6a';

-- 13) Falso sushi de espinacas con queso y jamón —
--     "sal, pimienta negra, orégano y albahaca"
update public.recetas
set ingredientes = (
  select jsonb_agg(elem) from jsonb_array_elements(ingredientes) elem
  where elem->>'id' <> '8d8211c2-6e3d-447a-bb30-ecab523e2055'
) || jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Sal', 'cantidad', 'C/S', 'base', 'sal', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Pimienta negra', 'cantidad', 'C/S', 'base', 'pimienta negra', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Orégano', 'cantidad', 'C/S', 'base', 'orégano', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Albahaca', 'cantidad', 'C/S', 'base', 'albahaca', 'valor', null, 'unidad', 'al gusto')
)
where id = '4f5fb2d0-53ea-435c-af13-6ee840668ed6';

-- 14) Raxo de Pollo con Salsa de Queso — "sal, nuez moscada y pimienta negra"
update public.recetas
set ingredientes = (
  select jsonb_agg(elem) from jsonb_array_elements(ingredientes) elem
  where elem->>'id' <> '323aa9ce-034c-4141-8528-c541df59ee23'
) || jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Sal', 'cantidad', 'C/S', 'base', 'sal', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Nuez moscada', 'cantidad', 'C/S', 'base', 'nuez moscada', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Pimienta negra', 'cantidad', 'C/S', 'base', 'pimienta negra', 'valor', null, 'unidad', 'al gusto')
)
where id = '1c6e92d4-5a2c-4252-a3f8-664dca550b5f';

-- 15) Albóndigas con parmentier de patata — "sal y pimienta negra"
update public.recetas
set ingredientes = (
  select jsonb_agg(elem) from jsonb_array_elements(ingredientes) elem
  where elem->>'id' <> 'f90570ce-6a66-4c6c-856c-a4e72c75f7be'
) || jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Sal', 'cantidad', 'C/S', 'base', 'sal', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Pimienta negra', 'cantidad', 'C/S', 'base', 'pimienta negra', 'valor', null, 'unidad', 'al gusto')
)
where id = '474f4cc5-f989-4cb4-908b-b8d65fbb1c6c';

-- 16) Lasaña de carne — "sal, pimienta negra y nuez moscada"
update public.recetas
set ingredientes = (
  select jsonb_agg(elem) from jsonb_array_elements(ingredientes) elem
  where elem->>'id' <> 'fbaeced7-38a6-41b6-a86e-7369693370ef'
) || jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Sal', 'cantidad', 'C/S', 'base', 'sal', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Pimienta negra', 'cantidad', 'C/S', 'base', 'pimienta negra', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Nuez moscada', 'cantidad', 'C/S', 'base', 'nuez moscada', 'valor', null, 'unidad', 'al gusto')
)
where id = 'f29fbf4c-01ee-42d4-aaa1-f7a6baed856c';

-- 17) Tallarines con pesto de albahaca — "sal y pimienta negra"
update public.recetas
set ingredientes = (
  select jsonb_agg(elem) from jsonb_array_elements(ingredientes) elem
  where elem->>'id' <> '1e4d7f36-5b51-40a7-a344-84b511c4b20e'
) || jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Sal', 'cantidad', 'C/S', 'base', 'sal', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Pimienta negra', 'cantidad', 'C/S', 'base', 'pimienta negra', 'valor', null, 'unidad', 'al gusto')
)
where id = 'd689976f-5f88-4140-92ba-882c48d62ee2';

-- 18) Velouté de Pescado — "sal, pimienta negra y nuez moscada"
update public.recetas
set ingredientes = (
  select jsonb_agg(elem) from jsonb_array_elements(ingredientes) elem
  where elem->>'id' <> '5fb031bf-ac66-46ae-a317-d0a2c32960f1'
) || jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Sal', 'cantidad', 'C/S', 'base', 'sal', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Pimienta negra', 'cantidad', 'C/S', 'base', 'pimienta negra', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Nuez moscada', 'cantidad', 'C/S', 'base', 'nuez moscada', 'valor', null, 'unidad', 'al gusto')
)
where id = '56ca6516-c68a-42e0-a7b8-d55173259113';

-- 19) Pescado al papillote — "sal y pimienta" (sin "negra"; mapeado a la
--     base existente `pimienta negra` para no crear una base redundante)
update public.recetas
set ingredientes = (
  select jsonb_agg(elem) from jsonb_array_elements(ingredientes) elem
  where elem->>'id' <> '0339ac70-9c52-4936-b88a-3bd145a26012'
) || jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Sal', 'cantidad', 'C/S', 'base', 'sal', 'valor', null, 'unidad', 'al gusto'),
  jsonb_build_object('id', gen_random_uuid()::text, 'nombre', 'Pimienta negra', 'cantidad', 'C/S', 'base', 'pimienta negra', 'valor', null, 'unidad', 'al gusto')
)
where id = '8e2038cb-0591-4115-a603-c104d7cfef34';

-- ── Verificación esperada tras aplicar ─────────────────────────────────────
--   0 valores de `base` con ',' o ' y ' en el texto (salvo cabeceras de
--   sección, que son cadenas y no entran en este filtro)
--   19 filas quitadas, 45 filas añadidas → +26 elementos en total sobre las
--   454 originales (454 + 26 = 480)
-- ═══════════════════════════════════════════════════════════════════════════
