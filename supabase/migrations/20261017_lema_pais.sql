-- Un lema corto por país para la cabecera de «Mi pasaporte» ("Donde el arroz es religión").
-- Opcional: sin lema no se pinta nada. Las policies de `paises` ya cubren la columna nueva.
alter table public.paises add column if not exists lema text;
