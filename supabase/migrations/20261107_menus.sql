-- Menús: una selección de recetas para una ocasión (una cena, un cumpleaños), con
-- comensales, organizada por pases. Diseño en docs/menus.md.
--
-- Privados: solo el autor ve y toca los suyos, como `para_hacer` y `despensa`.
-- Compartirlos (con los afans o por enlace) queda para más adelante y no se
-- adelanta aquí una columna sin semántica.

begin;

create table if not exists public.menus (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users (id) on delete cascade,
  nombre      text        not null check (btrim(nombre) <> '' and char_length(nombre) <= 80),
  ocasion     text        check (ocasion is null or char_length(ocasion) <= 80),
  fecha       date,
  comensales  smallint    not null default 4 check (comensales > 0),
  notas       text        check (notas is null or char_length(notas) <= 2000),
  created_at  timestamptz not null default now()
);

create index if not exists menus_user_id_idx on public.menus (user_id);

-- Como `para_hacer`, hay clave foránea a `recetas`: una receta borrada sale del
-- menú con ella. `raciones` null significa «las del menú» (comensales); sirve para
-- pedir 12 brochetas aunque la receta sea «por brocheta».
create table if not exists public.menu_recetas (
  menu_id    uuid     not null references public.menus (id) on delete cascade,
  receta_id  uuid     not null references public.recetas (id) on delete cascade,
  pase       text     not null check (pase in ('aperitivo', 'entrante', 'principal', 'postre', 'otro')),
  orden      smallint not null default 0,
  raciones   smallint check (raciones is null or raciones > 0),
  primary key (menu_id, receta_id)
);

create index if not exists menu_recetas_receta_id_idx on public.menu_recetas (receta_id);

alter table public.menus        enable row level security;
alter table public.menu_recetas enable row level security;

drop policy if exists "Cada usuario ve sus menús"       on public.menus;
drop policy if exists "Cada usuario crea sus menús"     on public.menus;
drop policy if exists "Cada usuario edita sus menús"    on public.menus;
drop policy if exists "Cada usuario borra sus menús"    on public.menus;

create policy "Cada usuario ve sus menús"
  on public.menus for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Cada usuario crea sus menús"
  on public.menus for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- `with check` además de `using`: sin él, un UPDATE podría cambiar `user_id` y
-- regalar el menú a otro usuario.
create policy "Cada usuario edita sus menús"
  on public.menus for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Cada usuario borra sus menús"
  on public.menus for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Las filas de `menu_recetas` no llevan `user_id`: se autorizan por el dueño de su
-- menú. Hay que comprobarlo también al insertar y actualizar, o se podría colgar
-- una receta de un menú ajeno.
drop policy if exists "Cada usuario ve las recetas de sus menús"      on public.menu_recetas;
drop policy if exists "Cada usuario añade recetas a sus menús"        on public.menu_recetas;
drop policy if exists "Cada usuario edita las recetas de sus menús"   on public.menu_recetas;
drop policy if exists "Cada usuario quita recetas de sus menús"       on public.menu_recetas;

create policy "Cada usuario ve las recetas de sus menús"
  on public.menu_recetas for select
  to authenticated
  using (exists (
    select 1 from public.menus m
    where m.id = menu_recetas.menu_id and m.user_id = (select auth.uid())
  ));

create policy "Cada usuario añade recetas a sus menús"
  on public.menu_recetas for insert
  to authenticated
  with check (exists (
    select 1 from public.menus m
    where m.id = menu_recetas.menu_id and m.user_id = (select auth.uid())
  ));

create policy "Cada usuario edita las recetas de sus menús"
  on public.menu_recetas for update
  to authenticated
  using (exists (
    select 1 from public.menus m
    where m.id = menu_recetas.menu_id and m.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.menus m
    where m.id = menu_recetas.menu_id and m.user_id = (select auth.uid())
  ));

create policy "Cada usuario quita recetas de sus menús"
  on public.menu_recetas for delete
  to authenticated
  using (exists (
    select 1 from public.menus m
    where m.id = menu_recetas.menu_id and m.user_id = (select auth.uid())
  ));

commit;
