-- Plato estrella de cada país en «Mi pasaporte»: una receta elegida a mano por el admin.
-- Opcional: sin elección la web usa la mejor valorada del país. `on delete set null` evita que
-- un país apunte a una receta borrada. Las policies de `paises` ya cubren la columna nueva.
alter table public.paises
  add column if not exists plato_estrella uuid references public.recetas(id) on delete set null;
