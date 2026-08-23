-- ═══════════════════════════════════════════════════════════════════════════
-- La despensa: qué ingredientes tiene cada usuario en casa
--
-- Es la misma idea que "marcar los ingredientes que ya tengo" dentro de una
-- receta, pero guardada UNA sola vez: si marcas cebolla, la tienes para las 19
-- recetas que la llevan, no solo para la que estabas mirando. Modelarlo por
-- receta habría obligado a sincronizar dos tablas que dicen lo mismo, y ese es
-- justo el motivo de que comprar algo en la lista de la compra pueda reflejarse
-- solo sobre los ingredientes de cualquier receta.
--
-- Se indexa por `base` —el ingrediente genérico que dejó en cada elemento del
-- JSONB la migración 20260823_estructurar_ingredientes— y no por receta. No hay
-- clave foránea a `recetas` a propósito: la despensa sobrevive a que se borre
-- una receta, porque la cebolla sigue estando en la nevera.
--
-- Verificado tras aplicarla, simulando los dos roles:
--   escribir en la despensa de otro usuario -> rechazado por la RLS
--   un afan consultando la despensa del admin -> 0 filas
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.despensa (
  user_id         uuid        not null references auth.users (id) on delete cascade,
  base            text        not null check (btrim(base) <> ''),
  actualizado_en  timestamptz not null default now(),
  primary key (user_id, base)
);

alter table public.despensa enable row level security;

drop policy if exists "Cada usuario ve su despensa"       on public.despensa;
drop policy if exists "Cada usuario añade a su despensa"  on public.despensa;
drop policy if exists "Cada usuario quita de su despensa" on public.despensa;

create policy "Cada usuario ve su despensa"
  on public.despensa for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Cada usuario añade a su despensa"
  on public.despensa for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Cada usuario quita de su despensa"
  on public.despensa for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Sin policy de UPDATE: marcar y desmarcar son INSERT y DELETE, y no hay ningún
-- campo que tenga sentido modificar en una fila existente.
