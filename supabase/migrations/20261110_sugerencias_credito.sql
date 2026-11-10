-- Cerrar el bucle del buzón: cuando el admin incorpora una sugerencia, la receta lleva el
-- crédito «Sugerida por <nombre>» y el autor recibe un correo. Diseño en docs/ideas.md.
--
-- `citar` es la respuesta a «¿puedo citarte?» (por defecto sí; el autor lo desmarca al enviar).
-- `receta_id` lo pone solo el admin (el UPDATE de sugerencias es suyo) y enlaza la sugerencia con
-- la receta creada. `autor_avisado_en` es la marca del correo, mismo patrón que `avisada_en`.

alter table public.sugerencias
  add column if not exists citar boolean not null default true,
  add column if not exists receta_id uuid references public.recetas (id) on delete set null,
  add column if not exists autor_avisado_en timestamptz;

alter table public.recetas add column if not exists sugerida_por text
  check (sugerida_por is null or char_length(sugerida_por) <= 80);

-- Al enlazar la sugerencia con una receta, copia el nombre del autor a `recetas.sugerida_por`
-- (una instantánea: si luego cambia de nombre no se reescribe la historia). DEFINER porque
-- escribe en `recetas`, cuyo UPDATE es del admin, y lee `perfiles`.
create or replace function public.acreditar_sugerencia()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.receta_id is not null and new.citar
     and new.receta_id is distinct from old.receta_id then
    update public.recetas r
    set sugerida_por = (select p.nombre from public.perfiles p where p.user_id = new.user_id)
    where r.id = new.receta_id;
  end if;
  return new;
end;
$$;
revoke execute on function public.acreditar_sugerencia() from public, anon, authenticated;

drop trigger if exists acreditar_sugerencia on public.sugerencias;
create trigger acreditar_sugerencia
  after update of receta_id on public.sugerencias
  for each row execute function public.acreditar_sugerencia();

-- A quién avisar: sugerencias hechas, con receta enlazada, sin avisar y con el correo confirmado.
-- Solo `service_role` (n8n); lee `auth.users`.
create or replace function public.autores_sugerencias_hechas()
returns table (sugerencia_id uuid, email text, nombre text, receta_id uuid, receta_titulo text, receta_foto text)
language sql
security definer
set search_path = ''
as $$
  select s.id, u.email::text, p.nombre, r.id, r.titulo, r.foto_url
  from public.sugerencias s
  join public.recetas r on r.id = s.receta_id
  join auth.users u on u.id = s.user_id
  left join public.perfiles p on p.user_id = s.user_id
  where s.estado = 'hecha'
    and s.autor_avisado_en is null
    and u.email_confirmed_at is not null
    and u.deleted_at is null
    and (u.banned_until is null or u.banned_until < now());
$$;
revoke all on function public.autores_sugerencias_hechas() from public, anon, authenticated;
grant execute on function public.autores_sugerencias_hechas() to service_role;
