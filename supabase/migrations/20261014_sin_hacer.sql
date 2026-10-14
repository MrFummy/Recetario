-- ═══════════════════════════════════════════════════════════════════════════
-- Recetas "sin hacer"
--
-- Marca explícita (no derivada de las realizaciones: una receta sin
-- realizaciones puede estar hecha pero sin registrar). Solo se pone a mano.
--
--   · `recetas.sin_hacer`: false por defecto. Solo la edita el admin, por la
--     policy de UPDATE que ya existe.
--   · Al insertar una realización en `valoraciones`, la receta deja de estar
--     "sin hacer". El trigger nunca la vuelve a marcar: borrar la realización
--     no la devuelve a "sin hacer".
--   · La carga inicial marca las 12 recetas que no tenían foto.
--
-- El trigger es SECURITY DEFINER a propósito: el UPDATE de `recetas` es solo
-- del admin, y con SECURITY INVOKER afectaría a 0 filas (sin error) cuando
-- registrara la realización alguien que no es admin. Misma trampa que
-- update_recipe_average_rating (ver CLAUDE.md).
-- ═══════════════════════════════════════════════════════════════════════════

begin;

alter table public.recetas
  add column if not exists sin_hacer boolean not null default false;

create or replace function public.quitar_sin_hacer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.recetas
     set sin_hacer = false
   where id = new.receta_id
     and sin_hacer;
  return new;
end;
$$;

revoke all on function public.quitar_sin_hacer() from public;
revoke all on function public.quitar_sin_hacer() from anon;
revoke all on function public.quitar_sin_hacer() from authenticated;

drop trigger if exists trg_quitar_sin_hacer on public.valoraciones;
create trigger trg_quitar_sin_hacer
  after insert on public.valoraciones
  for each row execute function public.quitar_sin_hacer();

-- Carga inicial: las recetas sin foto.
update public.recetas
   set sin_hacer = true
 where foto_url is null or foto_url = '' or foto_url ilike '%_default%';

commit;
