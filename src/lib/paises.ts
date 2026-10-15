/**
 * Países para «Mi pasaporte» (ver docs/pasaporte.md).
 *
 * Una receta guarda solo el código ISO 3166-1 alfa-2 (`PT`, `JP`…). El nombre en
 * español sale de `Intl.DisplayNames` y la bandera de los dos caracteres
 * regionales, así que no hay tabla de nombres que mantener.
 */

// Todos los códigos asignados salvo los territorios sin población permanente
// (Bouvet, Heard y McDonald, Tierras Australes Francesas, islas menores de EE. UU.
// y Georgia del Sur). La Antártida se queda: es un destino.
const CODIGOS = (
  'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ ' +
  'BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ ' +
  'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ ' +
  'DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR ' +
  'GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY ' +
  'HK HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP ' +
  'KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY ' +
  'MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ ' +
  'NA NC NE NF NG NI NL NO NP NR NU NZ OM ' +
  'PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW ' +
  'SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ ' +
  'TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ ' +
  'UA UG US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'
).split(' ');

const nombres = new Intl.DisplayNames(['es'], { type: 'region' });

/** `PT` → `Portugal`. Si el código no se reconoce, devuelve el propio código. */
export function nombrePais(codigo: string): string {
  try {
    return nombres.of(codigo) ?? codigo;
  } catch {
    return codigo;
  }
}

/** `PT` → 🇵🇹. */
export function banderaPais(codigo: string): string {
  if (!/^[A-Z]{2}$/.test(codigo)) return '';
  return String.fromCodePoint(...[...codigo].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export interface OpcionPais {
  codigo: string;
  nombre: string;
}

/** Todos los países, ordenados por nombre en español. */
export const PAISES: OpcionPais[] = CODIGOS
  .map((codigo) => ({ codigo, nombre: nombrePais(codigo) }))
  .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
