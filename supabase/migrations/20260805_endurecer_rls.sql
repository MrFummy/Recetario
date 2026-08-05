-- ═══════════════════════════════════════════════════════════════════════════
-- Endurecimiento de RLS del Recetario
--
-- Estado que corrige (verificado sobre el proyecto gtqqqmethhakpybnuxin):
--   1. `valoraciones` no tenía RLS y anon conserva los GRANT por defecto, así
--      que cualquiera con la anon key (que viaja en el bundle) podía leer,
--      alterar, borrar o truncar todos los votos.
--   2. La policy de UPDATE de `recetas` era `to authenticated using (true)`:
--      cualquier "afan" registrado podía reescribir cualquier campo de
--      cualquier receta, no solo el admin.
--   3. storage.objects tenía un INSERT `to public` sobre el bucket
--      fotos-recetas: subida anónima de ficheros arbitrarios.
--   4. Los UPDATE/DELETE de storage eran para todo `authenticated`, no solo
--      para el admin.
--
-- No toca el DELETE de `recetas`: no tiene policy y con RLS activa eso ya lo
-- bloquea para anon y authenticated, dejándolo solo en manos del service_role
-- que usa n8n. Es el comportamiento deseado.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- ── 1. Quién es admin ──────────────────────────────────────────────────────
-- En tabla en lugar de comparando el email dentro de cada policy: así se
-- revoca o se añade un admin sin reescribir políticas.

create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  creado_en  timestamptz not null default now()
);

alter table public.admins enable row level security;
-- Deliberadamente sin policies: solo el service_role puede leerla o tocarla.
revoke all on public.admins from anon, authenticated;

insert into public.admins (user_id)
select id from auth.users where email = 'marcos.garciafdz@gmail.com'
on conflict (user_id) do nothing;

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a where a.user_id = (select auth.uid())
  );
$$;

grant execute on function public.es_admin() to anon, authenticated;

-- ── 2. recetas: escritura solo del admin ───────────────────────────────────

drop policy if exists "Actualización por usuarios autenticados" on public.recetas;

create policy "Actualización solo por admin"
  on public.recetas for update
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

-- ── 3. El trigger de la media necesita seguir escribiendo en recetas ───────
-- Sin esto, el paso 2 rompe las valoraciones en silencio: la función no era
-- SECURITY DEFINER, así que corría con los permisos de quien vota y su UPDATE
-- sobre `recetas` afectaría a 0 filas (sin error) para cualquiera que no sea
-- admin. De paso fija el search_path, que era el aviso del linter de Supabase.

create or replace function public.update_recipe_average_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.recetas
  set rating = (
    select round(avg(v.puntuacion), 1)
    from public.valoraciones v
    where v.receta_id = coalesce(new.receta_id, old.receta_id)
  )
  where id = coalesce(new.receta_id, old.receta_id);
  return null;
end;
$$;

-- ── 4. valoraciones: cada usuario solo toca su propio voto ─────────────────
-- La media pública sigue leyéndose desde recetas.rating, así que no hace falta
-- exponer los votos individuales de nadie.

alter table public.valoraciones enable row level security;

drop policy if exists "Cada usuario lee sus votos"       on public.valoraciones;
drop policy if exists "Cada usuario inserta su voto"     on public.valoraciones;
drop policy if exists "Cada usuario actualiza su voto"   on public.valoraciones;
drop policy if exists "Cada usuario borra su voto"       on public.valoraciones;

create policy "Cada usuario lee sus votos"
  on public.valoraciones for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Cada usuario inserta su voto"
  on public.valoraciones for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Cada usuario actualiza su voto"
  on public.valoraciones for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Cada usuario borra su voto"
  on public.valoraciones for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ── 5. storage: bucket fotos-recetas ───────────────────────────────────────

-- Subida anónima. El nombre sugiere un script de migración puntual; los
-- scripts de scratch/ solo hacen SELECT sobre `recetas`, así que no la usan.
drop policy if exists "Subida de fotos desde script" on storage.objects;

-- La app sube la foto desde el navegador al editar una receta, así que el
-- admin necesita INSERT propio (la policy que quedaba era solo service_role).
drop policy if exists "Subida de fotos por admin" on storage.objects;
create policy "Subida de fotos por admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'fotos-recetas' and public.es_admin());

drop policy if exists "Actualizacion de fotos por admin" on storage.objects;
create policy "Actualizacion de fotos por admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'fotos-recetas' and public.es_admin())
  with check (bucket_id = 'fotos-recetas' and public.es_admin());

drop policy if exists "Borrado de fotos por admin" on storage.objects;
create policy "Borrado de fotos por admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'fotos-recetas' and public.es_admin());

commit;

-- ═══════════════════════════════════════════════════════════════════════════
-- PENDIENTE DE EJECUTAR A MANO
--
-- Postgres concede EXECUTE a PUBLIC por defecto, así que las dos funciones
-- SECURITY DEFINER de arriba quedan expuestas como RPC en /rest/v1/rpc/. El
-- linter de Supabase lo marca (lints 0028 y 0029).
--
--   - update_recipe_average_rating es una función de trigger: invocarla por RPC
--     falla igualmente ("can only be called as a trigger"), pero no debe estar
--     expuesta. Comprobado en una transacción con rollback que, tras revocar,
--     el trigger sigue disparándose y recalculando la media: el privilegio se
--     valida al crear el trigger, no en cada disparo.
--   - es_admin sí necesita EXECUTE para `authenticated`, porque las policies de
--     recetas y storage la evalúan con los privilegios de quien consulta. Solo
--     se le retira a anon y a PUBLIC.
--
-- No lo apliqué automáticamente porque el clasificador de permisos bloqueó la
-- operación por tratarse de una retirada de privilegios.
-- ═══════════════════════════════════════════════════════════════════════════

-- revoke all on function public.update_recipe_average_rating() from public, anon, authenticated;
-- revoke all on function public.es_admin() from public, anon;
-- grant execute on function public.es_admin() to authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- Comprobación posterior sugerida:
--   select tablename, rowsecurity from pg_tables where schemaname='public';
--   select tablename, policyname, roles::text, cmd, qual, with_check
--     from pg_policies where schemaname in ('public','storage') order by 1,4;
--
-- Queda pendiente fuera de SQL: activar "Leaked password protection" en
-- Authentication → Policies del panel de Supabase (aviso del linter).
-- ═══════════════════════════════════════════════════════════════════════════
