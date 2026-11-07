# Propuesta de `porciones` (aplicada el 7 nov 2026 en `porciones_num`)

> **Aplicada.** Revisada con el admin y escrita en `recetas.porciones_num` ([migración](../supabase/migrations/20261107_porciones_num.sql)). Cambios respecto a esta tabla: galletas navideñas, orejas y Linzer = 8, y se añadieron las 7 recetas posteriores al 23 oct. Los valores vigentes son los de la base de datos.


**Paso 1 del plan de menús.** Estimación mía a partir de las cantidades de
`recetas.ingredientes` el 23 de octubre de 2026. **No se ha escrito nada en la
base de datos**: corrige lo que no te cuadre y lo aplico.

Criterio: raciones de plato (aperitivos y postres, raciones de reparto). El valor
va como número en texto (`"4"`). Solo una receta lo traía escrito
(*Albóndigas con parmentier*: «4-6 personas»; se propone 5).

Columna *Fiab.*: **A** = hay un dato claro (peso por persona, nº de piezas),
**M** = estimación razonable, **B** = adivinado, revisar primero.

## Aperitivos
| Receta | Porciones | Fiab. |
|---|---|---|
| Blinis con cremoso de soja, manzana y miel | 6 | M |
| Brochetas de Dátil y Bacon y Mermelada de Tomate | 6 | B |
| Escalivada | 6 | M |
| Falso sushi de espinacas con queso y jamón | 6 | B |
| Mini hamburguesa de rulo de cabra y cebolla caramelizada | 4 | M |
| Ratatouille (Versión rápida) | 4 | M |
| Receta Salsa Brava | 4 | B |
| Wok de verduras al curry | 4 | M |

## Arroces y pastas
| Receta | Porciones | Fiab. |
|---|---|---|
| Arroz caldoso de marisco | 6 | A (500 g arroz) |
| Risotto de Calabaza | 4 | M (**ya viene «por persona»**) |
| Fusilli a la Carbonara | 8 | A (800 g pasta) |
| Lasaña de carne | 6 | M |
| Pasta "One Pot" con Chorizo y Hierbas al Limón | 2 | A (200 g pasta) |
| Tallarines con pesto de albahaca | 4 | M (**«por persona»**) |

## Carnes
| Receta | Porciones | Fiab. |
|---|---|---|
| Albóndigas al vino tinto con parmentier de patata | 4 | M |
| Albóndigas con parmentier de patata | 5 | A (receta dice 4-6) |
| Albóndigas de setas y langostinos con salsa de frutos secos y chocolate | 4 | M |
| Cocido gallego | 4 | M |
| Gachas Manchegas | 4 | M |
| Pato a la naranja | 2 | A (1 magret) |
| Pollo lima-limón | 2 | A (2 pechugas) |
| Raxo de la abuela | 4 | A (800 g lomo) |
| Raxo de Pollo con Salsa de Queso | 2 | A (2 pechugas) |
| Solomillo de cerdo al Pedro Ximénez | 4 | M |
| Wok de tallarines con cerdo agridulce | 4 | A (500 g lomo; **«por persona»** en la pasta) |
| Receta de Alitas Buffalo | — | **Sin ingredientes en la BD** |
| Solomillo de cerdo con salsa de castañas | — | **Sin ingredientes en la BD** |

## Pescados y mariscos / Ensaladas
| Receta | Porciones | Fiab. |
|---|---|---|
| Marmitako | 4 | A (700 g) |
| Mejillones con salsa de vino blanco | 4 | M (3 kg) |
| Okonomiyaki | 2 | B |
| Pescado al papillote | 2 | B (**«1 pieza por persona»**) |
| Pimientos de piquillo rellenos de merluza | 4 | M |
| Salmón con miso | 4 | A (4 lomos) |
| Tartar de salmón cocinado con crema de aguacate | 4 | M |
| Tataki de pez mantequilla sobre ajoblanco | 4 | A (400 g, 100 g/persona) |
| Velouté de Pescado | 4 | M |
| Salpicón | 6 | B |

## Sopas y cremas
| Receta | Porciones | Fiab. |
|---|---|---|
| Crema de zanahoria | 6 | M |
| Crema untable de pimientos de piquillo | 6 | B |
| Fabada Asturiana (Versionada) | 4 | M |
| Gazpacho | 6 | M |
| Langostinos en Ajoblanco | 4 | B |
| Minestrone a la milanesa | 6 | M |

## Postres
| Receta | Porciones | Fiab. |
|---|---|---|
| Arroz con Leche | 6 | M |
| Bizcocho de Chocolate Crunchy | 8 | M |
| Bizcocho de chocolate y vino tinto | 8 | M |
| Brownie de chocolate | 6 | B |
| Cannoli de ricotta | 6 | B |
| Cheesecake London Style | 10 | M |
| Coulant de Chocolate | 3 | B |
| Coulant de queso | 4 | M |
| Crema catalana | 6 | M |
| Croissant | 4 | B |
| Galletas Navideñas | 6 | B |
| Magdalena clásica (2 unidades) | 2 | A (título) |
| Orejas | 6 | B |
| Panna Cotta | 6 | M |
| Pastas Linzer | 6 | B |
| Peras caramelizadas con vino blanco | 2 | B (**«1 por persona»**) |
| Sabayon | 6 | M (8 yemas; soletilla **«por persona»**) |
| Tarta 3 chocolates | 10 | M |
| Tarta de dulce de leche | 10 | M |
| Tarta de limón con merengue italiano | 8 | M |
| Tarta de Queso (2 mini tartas) | 2 | A (título) |
| Tarta de Santiago | 8 | M |
| Tarta flan de castañas | 8 | M |
| Tarta fría de crema de plátano sobre base de galleta | 8 | M |
| Tartaletas de Manzana | 4 | B |
| Tiramisú | 8 | M |

## Hallazgos que afectan al diseño
- **Seis recetas ya expresan alguna cantidad «por persona»** (risotto, tallarines
  con pesto, wok de tallarines, pescado al papillote, peras, sabayon). Si el menú
  multiplica todo por comensales/porciones, esas líneas se multiplicarían dos
  veces. Hay que tratarlas aparte al escalar.
- **Dos recetas no tienen ingredientes en la BD** (alitas buffalo, solomillo con
  castañas): no pueden entrar en una lista de la compra hasta rellenarlos.
- Los valores **B** son los que más conviene que corrijas tú, que sabes cuánta
  gente comió de cada plato.
