-- Avisos por correo de las recetas nuevas (docs/ideas.md § «Avisos por correo y Mi cuenta»).
--
-- La preferencia vive en una tabla propia y no en `perfiles`: allí `nombre` es obligatorio y solo
-- una de las cuentas tiene fila, así que quien no hubiera puesto nombre no podría tener ajustes.
-- Siempre opt-in: `avisos_recetas` nace en false y nadie se suscribe sin pedirlo.
-- El correo NO se copia aquí: es el de la cuenta (`auth.users`), ya verificado por Supabase.

create table if not exists public.preferencias (
  user_id        uuid        primary key references auth.users (id) on delete cascade,
  avisos_recetas boolean     not null default false,
  actualizado_en timestamptz not null default now()
);

alter table public.preferencias enable row level security;

drop policy if exists "Cada usuario ve sus preferencias"   on public.preferencias;
drop policy if exists "Cada usuario crea sus preferencias" on public.preferencias;
drop policy if exists "Cada usuario edita sus preferencias" on public.preferencias;

create policy "Cada usuario ve sus preferencias"
  on public.preferencias for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Cada usuario crea sus preferencias"
  on public.preferencias for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- `with check` además de `using`: sin él, un UPDATE podría pasar la fila a otro usuario.
create policy "Cada usuario edita sus preferencias"
  on public.preferencias for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Cuándo se cambió por última vez: sirve de rastro de cuándo alguien pidió (o dejó) los avisos.
create or replace function public.preferencias_marca_cambio()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

drop trigger if exists preferencias_marca_cambio on public.preferencias;
create trigger preferencias_marca_cambio
  before update on public.preferencias
  for each row execute function public.preferencias_marca_cambio();

-- A quién avisar. La llama n8n con la clave de servicio: el esquema `auth` no se expone por la API
-- normal. Solo devuelve cuentas que han pedido los avisos Y tienen el correo confirmado (nunca se
-- escribe a una dirección sin verificar), sin borrar y sin bloquear. Devuelve el nombre del perfil,
-- si lo hay, para el saludo del correo.
-- SECURITY DEFINER porque lee `auth.users`. Ni `anon` ni `authenticated` pueden ejecutarla: Supabase
-- da EXECUTE a todos por defecto en las funciones nuevas, así que se revoca de forma explícita.
create or replace function public.destinatarios_avisos_recetas()
returns table (email text, nombre text)
language sql
stable
security definer
set search_path = public
as $$
  select u.email::text, p.nombre
  from auth.users u
  join public.preferencias pr on pr.user_id = u.id and pr.avisos_recetas
  left join public.perfiles p on p.user_id = u.id
  where u.email is not null
    and u.email_confirmed_at is not null
    and u.deleted_at is null
    and (u.banned_until is null or u.banned_until < now());
$$;

revoke all on function public.destinatarios_avisos_recetas() from public, anon, authenticated;
grant execute on function public.destinatarios_avisos_recetas() to service_role;
