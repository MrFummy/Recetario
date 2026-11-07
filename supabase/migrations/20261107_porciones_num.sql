-- Raciones de plato por receta, como número, para poder escalar menús y lista de
-- la compra por comensales. Es aparte de `porciones` (texto libre que se ve en la
-- ficha: «2 personas», «1 brocheta»), que no se toca.
-- Valores de docs/porciones-propuesta.md, revisados el 7 de noviembre de 2026.
-- Sin valor (null): las dos recetas sin ingredientes en la base de datos.

alter table public.recetas
  add column if not exists porciones_num smallint
  check (porciones_num is null or porciones_num > 0);

comment on column public.recetas.porciones_num is
  'Raciones de plato que da la receta, para escalar. No son piezas: unas galletas que salen 30 son ~8 raciones. porciones (texto) es lo que se enseña.';

update public.recetas r
set porciones_num = v.n
from (values
  ('Albóndigas al vino tinto con parmentier de patata', 4),
  ('Albóndigas con parmentier de patata', 5),
  ('Albóndigas de setas y langostinos con salsa picada de frutos secos y chocolate', 4),
  ('Arroz caldoso de marisco', 6),
  ('Arroz con Leche', 6),
  ('Bizcocho de Chocolate Crunchy', 8),
  ('Bizcocho de chocolate y vino tinto', 8),
  ('Blinis con cremoso de soja, manzana y miel', 6),
  ('Brochetas Caprese', 1),
  ('Brochetas de Dátil y Bacon y Mermelada de Tomate', 6),
  ('Brownie de chocolate', 6),
  ('Cannoli de ricotta', 6),
  ('Carbonara Udon', 2),
  ('Champiñones al ajillo con taquitos de jamón', 4),
  ('Cheesecake London Style', 10),
  ('Cheesecake de castañas', 8),
  ('Cocido gallego', 4),
  ('Coulant de Chocolate', 3),
  ('Coulant de queso', 4),
  ('Crema catalana', 6),
  ('Crema de zanahoria', 6),
  ('Crema untable de pimientos de piquillo', 6),
  ('Croissant', 4),
  ('Escalivada', 6),
  ('Fabada Asturiana (Versionada)', 4),
  ('Falso sushi de espinacas con queso y jamón', 6),
  ('Fresas a la pimienta con hilos de chocolate negro', 6),
  ('Fusilli a la Carbonara', 8),
  ('Gachas Manchegas', 4),
  ('Galletas Navideñas', 8),
  ('Gazpacho', 6),
  ('Langostinos en Ajoblanco', 4),
  ('Lasaña de carne', 6),
  ('Magdalena clásica (2 unidades)', 2),
  ('Marmitako', 4),
  ('Mejillones con salsa de vino blanco', 4),
  ('Minestrone a la milanesa', 6),
  ('Mini hamburguesa de rulo de cabra y cebolla caramelizada', 4),
  ('Okonomiyaki', 2),
  ('Orejas', 8),
  ('Panna Cotta', 6),
  ('Pasta "One Pot" con Chorizo y Hierbas al Limón', 2),
  ('Pastas Linzer', 8),
  ('Pato a la naranja', 2),
  ('Peras caramelizadas con vino blanco', 2),
  ('Pescado al papillote', 2),
  ('Pesto de albahaca y almendra', 6),
  ('Pimientos de piquillo rellenos de merluza napados con cremoso de soja', 4),
  ('Pollo lima-limón', 2),
  ('Ratatouille (Versión rápida)', 4),
  ('Raxo de Pollo con Salsa de Queso', 2),
  ('Raxo de la abuela', 4),
  ('Receta Salsa Brava', 4),
  ('Receta de Alitas Buffalo', null),
  ('Risotto de Calabaza', 4),
  ('Sabayon', 6),
  ('Salmón con miso', 4),
  ('Salpicón', 6),
  ('Solomillo de cerdo al Pedro Ximénez', 4),
  ('Solomillo de cerdo con salsa de castañas', null),
  ('Solomillo de pavo con salsa de castañas', 3),
  ('Tallarines con pesto de albahaca', 4),
  ('Tarta 3 chocolates', 10),
  ('Tarta de Queso (2 mini tartas)', 2),
  ('Tarta de Santiago', 8),
  ('Tarta de dulce de leche', 10),
  ('Tarta de limón con merengue italiano', 8),
  ('Tarta flan de castañas', 8),
  ('Tarta fría de crema de plátano sobre base de galleta', 8),
  ('Tartaletas de Manzana', 4),
  ('Tartar de salmón cocinado con crema de aguacate', 4),
  ('Tataki de pez mantequilla sobre ajoblanco con manzana verde', 4),
  ('Tiramisú', 8),
  ('Velouté de Pescado', 4),
  ('Wok de tallarines con cerdo agridulce', 4),
  ('Wok de verduras al curry', 4)
) as v(titulo, n)
where r.titulo = v.titulo;
