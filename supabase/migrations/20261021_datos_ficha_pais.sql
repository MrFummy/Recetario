-- Datos de ficha de cada país en «Mi pasaporte»: capital, idioma y moneda, escritos a mano.
-- Opcionales: sin valor no se pinta nada. A mano y no desde una API porque `Intl` no da
-- capitales y son pocos países; así tampoco hay huecos de cobertura. Las policies de `paises`
-- ya cubren las columnas nuevas.
alter table public.paises
  add column if not exists capital text,
  add column if not exists idioma text,
  add column if not exists moneda text;

update public.paises set capital = 'Tokio', idioma = 'Japonés', moneda = 'Yen (JPY)' where codigo = 'JP' and capital is null;
update public.paises set capital = 'Roma', idioma = 'Italiano', moneda = 'Euro (EUR)' where codigo = 'IT' and capital is null;
