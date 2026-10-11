-- ═══════════════════════════════════════════════════════════════════════════
-- Para hacer, realizaciones y el muro de notas
--
-- Implementa las ocho decisiones de docs/ideas.md ("Para hacer, realizaciones
-- y el muro de notas"). NO APLICADA: pendiente de revisión.
--
--   1. `para_hacer (user_id, receta_id)`, calcada de `despensa`.
--   5. `valoraciones` evoluciona: pasa de "un voto por usuario y receta" a "una
--      fila por vez que se cocina", con `fecha` y `notas`.
--   7. `perfiles`: nombre de pila para firmar las notas del muro.
--   8. El admin puede borrar notas ajenas.
--
-- Lo que NO hace, a propósito:
--   · No toca `update_recipe_average_rating`. Ya promedia por `receta_id` y es
--     SECURITY DEFINER; con varias filas por usuario sigue siendo correcto.
--     Redefinirla sin necesidad sería arriesgarse a la trampa de CLAUDE.md
--     (volver a SECURITY INVOKER y que las medias dejen de actualizarse).
--     `avg()` ignora los NULL, así que las realizaciones sin puntuación no
--     cuentan; si ninguna puntúa, `recetas.rating` queda en NULL.
--   · No cierra el "para hacer" al marcar "ya hecha" (decisión 4): lo hace el
--     cliente borrando su propia fila, que la RLS ya permite.
--   · No toca la despensa (decisión 2).
--
-- Verificar tras aplicar, simulando roles (como en 20260823_despensa.sql):
--   · un afan inserta una realización suya                -> OK, y la media sube
--   · un afan inserta una realización con otro user_id    -> rechazado
--   · un afan borra una nota ajena                        -> 0 filas
--   · el admin borra una nota ajena                       -> OK, y la media baja
--   · un anónimo lee valoraciones o perfiles              -> 0 filas
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- ── 1. valoraciones → realizaciones ────────────────────────────────────────

-- Cocinar la misma receta dos veces son dos filas.
alter table public.valoraciones
  drop constraint if exists valoraciones_receta_id_user_id_key;

alter table public.valoraciones
  add column if not exists fecha date,
  add column if not exists notas text;

-- Las filas que ya existen (3 a fecha de hoy) conservan su día de creación y
-- se quedan sin nota.
update public.valoraciones
set fecha = (created_at at time zone 'Europe/Madrid')::date
where fecha is null;

-- El día lo marca la hora de España, no la del servidor (UTC): una receta
-- marcada a las 00:30 no debe quedar fechada el día anterior.
alter table public.valoraciones
  alter column fecha set default ((now() at time zone 'Europe/Madrid')::date),
  alter column fecha set not null;

-- La puntuación es opcional (decisión 3). El CHECK 1–5 ya admite NULL.
alter table public.valoraciones
  drop constraint if exists valoraciones_notas_check;
alter table public.valoraciones
  add constraint valoraciones_notas_check
  check (notas is null or char_length(notas) <= 1000);

-- Para pintar el muro de una receta, lo más reciente primero.
create index if not exists valoraciones_receta_fecha_idx
  on public.valoraciones (receta_id, fecha desc);

-- ── 2. valoraciones: el muro lo ven los afans, cada uno edita lo suyo ──────

-- Antes cada usuario solo veía su voto. El muro necesita ver todas las
-- realizaciones, pero solo con sesión iniciada: el catálogo es público, las
-- notas de casa no.
drop policy if exists "Cada usuario lee sus votos"        on public.valoraciones;
drop policy if exists "Los afans leen las realizaciones"  on public.valoraciones;
create policy "Los afans leen las realizaciones"
  on public.valoraciones for select
  to authenticated
  using (true);

-- Insert, update y delete propios ya existen (20260805_endurecer_rls.sql) y
-- siguen valiendo tal cual. Se añade el borrado de moderación (decisión 8).
-- Las policies permisivas se suman con OR: la del dueño sigue en pie.
drop policy if exists "El admin borra cualquier realizacion" on public.valoraciones;
create policy "El admin borra cualquier realizacion"
  on public.valoraciones for delete
  to authenticated
  using (public.es_admin());

-- ── 3. perfiles: nombre de pila para firmar las notas ──────────────────────

create table if not exists public.perfiles (
  user_id  uuid primary key references auth.users (id) on delete cascade,
  nombre   text not null check (btrim(nombre) <> '' and char_length(nombre) <= 40)
);

alter table public.perfiles enable row level security;

drop policy if exists "Los afans ven los perfiles"      on public.perfiles;
drop policy if exists "Cada usuario crea su perfil"     on public.perfiles;
drop policy if exists "Cada usuario edita su perfil"    on public.perfiles;

create policy "Los afans ven los perfiles"
  on public.perfiles for select
  to authenticated
  using (true);

create policy "Cada usuario crea su perfil"
  on public.perfiles for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Cada usuario edita su perfil"
  on public.perfiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Sin policy de DELETE: el perfil desaparece con el usuario (ON DELETE CASCADE).

-- ── 4. para_hacer: qué recetas piensa cocinar cada usuario ─────────────────

-- Sustituye a la selección en localStorage de #/lista-compra (decisión 1).
-- A diferencia de `despensa`, aquí SÍ hay clave foránea a `recetas`: un "para
-- hacer" de una receta borrada no significa nada y debe irse con ella.
create table if not exists public.para_hacer (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  receta_id  uuid        not null references public.recetas (id) on delete cascade,
  anadido_en timestamptz not null default now(),
  primary key (user_id, receta_id)
);

alter table public.para_hacer enable row level security;

drop policy if exists "Cada usuario ve su para hacer"        on public.para_hacer;
drop policy if exists "Cada usuario añade a su para hacer"   on public.para_hacer;
drop policy if exists "Cada usuario quita de su para hacer"  on public.para_hacer;

create policy "Cada usuario ve su para hacer"
  on public.para_hacer for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Cada usuario añade a su para hacer"
  on public.para_hacer for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Cada usuario quita de su para hacer"
  on public.para_hacer for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Sin UPDATE, como en la despensa: marcar y desmarcar son INSERT y DELETE.

commit;
