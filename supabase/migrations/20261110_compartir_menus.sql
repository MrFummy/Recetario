-- Compartir menús (docs/menus.md, fase 5). Tres niveles de visibilidad:
--   privado  solo su autor (como hasta ahora; es el valor por defecto)
--   afans    cualquier usuario con sesión
--   enlace   cualquiera que tenga el enlace, también sin cuenta
--
-- Los menús de nivel «afans» se abren a la lectura de la propia tabla, porque los afans
-- los listan. El nivel «enlace» NO: una policy de lectura pública sobre `menus` dejaría a
-- cualquiera con la clave anónima —que va en el bundle— listar todos los menús compartidos
-- por enlace, y el enlace dejaría de ser secreto. En su lugar se sirve por una función que
-- devuelve un solo menú por su id (un uuid, que no se adivina).

alter table public.menus
  add column if not exists visibilidad text not null default 'privado'
  check (visibilidad in ('privado', 'afans', 'enlace'));

-- Solo se añade lectura. Las policies de escritura siguen siendo las del autor, así que
-- nadie más puede cambiar un menú compartido, ni cambiar su visibilidad.
drop policy if exists "Los afans ven los menús compartidos con ellos"           on public.menus;
drop policy if exists "Los afans ven las recetas de los menús compartidos"      on public.menu_recetas;

create policy "Los afans ven los menús compartidos con ellos"
  on public.menus for select
  to authenticated
  using (visibilidad = 'afans');

create policy "Los afans ven las recetas de los menús compartidos"
  on public.menu_recetas for select
  to authenticated
  using (exists (
    select 1 from public.menus m
    where m.id = menu_recetas.menu_id and m.visibilidad = 'afans'
  ));

-- Un menú, por su id, si está compartido con quien lo pide. Devuelve null si no existe, es
-- privado o es «afans» y quien pregunta no tiene sesión: no distingue entre «no existe» y
-- «no es tuyo», para no confirmar qué ids existen.
--   · quita `user_id`: quien abre un enlace no debe saber de quién es la cuenta;
--   · `autor` (el nombre del perfil) solo sale si quien pregunta tiene sesión;
--   · `es_mio` deja a la web decidir entre el editor y la vista de solo lectura.
-- SECURITY DEFINER a propósito: lee `menus` saltándose su RLS, que es justo lo que se quiere.
-- Por eso el linter avisa de que `anon` puede ejecutarla: es intencionado.
create or replace function public.ver_menu_compartido(p_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'menu',   to_jsonb(m) - 'user_id',
    'es_mio', coalesce(m.user_id = (select auth.uid()), false),
    'autor',  case when (select auth.uid()) is not null
                   then (select p.nombre from public.perfiles p where p.user_id = m.user_id) end,
    'recetas', coalesce(
      (select jsonb_agg(to_jsonb(r) - 'menu_id' order by r.orden)
         from public.menu_recetas r where r.menu_id = m.id),
      '[]'::jsonb)
  )
  from public.menus m
  where m.id = p_id
    and (m.visibilidad = 'enlace'
         or (m.visibilidad = 'afans' and (select auth.uid()) is not null));
$$;

revoke all on function public.ver_menu_compartido(uuid) from public;
grant execute on function public.ver_menu_compartido(uuid) to anon, authenticated;
