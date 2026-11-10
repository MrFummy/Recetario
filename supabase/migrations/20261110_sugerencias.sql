-- Buzón de sugerencias: un afan propone una receta (enlace y/o texto) y el admin decide.
-- Diseño en docs/ideas.md. Privado: el autor ve las suyas, el admin todas.
-- Es entrada no fiable: nada se convierte ni se descarga al enviarla.

begin;

create table if not exists public.sugerencias (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  enlace     text        check (enlace is null or (char_length(enlace) <= 500 and enlace ~* '^https?://')),
  texto      text        check (texto is null or char_length(texto) <= 2000),
  nota       text        check (nota is null or char_length(nota) <= 500),
  estado     text        not null default 'pendiente'
                         check (estado in ('pendiente', 'aceptada', 'descartada', 'hecha')),
  created_at timestamptz not null default now(),
  check (coalesce(btrim(enlace), '') <> '' or coalesce(btrim(texto), '') <> '')
);

create index if not exists sugerencias_user_id_idx on public.sugerencias (user_id);

alter table public.sugerencias enable row level security;

drop policy if exists "Ver sugerencias propias o todas el admin" on public.sugerencias;
drop policy if exists "Crear sugerencias propias"                on public.sugerencias;
drop policy if exists "El admin cambia el estado"                on public.sugerencias;
drop policy if exists "Borrar sugerencias"                       on public.sugerencias;

create policy "Ver sugerencias propias o todas el admin"
  on public.sugerencias for select to authenticated
  using ((select auth.uid()) = user_id or (select public.es_admin()));

-- Solo en estado pendiente: nadie se la da ya aceptada.
create policy "Crear sugerencias propias"
  on public.sugerencias for insert to authenticated
  with check ((select auth.uid()) = user_id and estado = 'pendiente');

create policy "El admin cambia el estado"
  on public.sugerencias for update to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

-- El autor puede retirar la suya mientras está pendiente; el admin, cualquiera.
create policy "Borrar sugerencias"
  on public.sugerencias for delete to authenticated
  using ((select public.es_admin()) or ((select auth.uid()) = user_id and estado = 'pendiente'));

-- Límites al crear: correo confirmado y 5 al día por usuario. DEFINER porque lee auth.users.
create or replace function public.limitar_sugerencias()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from auth.users u where u.id = new.user_id and u.email_confirmed_at is not null
  ) then
    raise exception 'Confirma tu correo antes de enviar sugerencias' using errcode = 'P0001';
  end if;
  if (select count(*) from public.sugerencias s
      where s.user_id = new.user_id and s.created_at > now() - interval '1 day') >= 5 then
    raise exception 'Has llegado al máximo de 5 sugerencias al día' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke execute on function public.limitar_sugerencias() from public, anon, authenticated;

drop trigger if exists limitar_sugerencias on public.sugerencias;
create trigger limitar_sugerencias
  before insert on public.sugerencias
  for each row execute function public.limitar_sugerencias();

commit;
