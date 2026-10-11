-- recetas.rating era smallint, así que la media que calcula
-- update_recipe_average_rating (round(avg(...), 1)) se truncaba al entero al
-- guardarse: una media de 3,5 quedaba en 4. Con numeric(2,1) se conserva el
-- decimal. Los valores actuales son enteros y se mantienen tal cual.
--
-- El trigger no cambia: ya redondeaba a un decimal.

alter table public.recetas
  alter column rating type numeric(2,1) using rating::numeric(2,1);
