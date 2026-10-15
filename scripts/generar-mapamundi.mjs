// Regenera src/assets/mapamundi.json (contornos de Natural Earth 1:50m, dominio público).
// Las dependencias NO están en el proyecto: se instalan aparte, en una carpeta temporal.
//   mkdir /tmp/mapa && cd /tmp/mapa && npm i world-atlas@2 topojson-client@3 d3-geo@3 i18n-iso-countries@7
//   cp <proyecto>/scripts/generar-mapamundi.mjs . && node generar-mapamundi.mjs 50m <proyecto>/src/assets/mapamundi.json
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import iso from 'i18n-iso-countries';

const [res = '110m', salida = 'mapa.json'] = process.argv.slice(2);
const topo = JSON.parse(readFileSync(`node_modules/world-atlas/countries-${res}.json`, 'utf8'));
const fc = feature(topo, topo.objects.countries);

const ANCHO = 960;
const ALTO = 500;
// Sin la Antártida: ocupa toda la parte baja y deforma el encuadre.
const features = fc.features.filter((f) => f.id !== '010');
const proy = geoNaturalEarth1().fitExtent([[4, 4], [ANCHO - 4, ALTO - 4]], { type: 'FeatureCollection', features });
const path = geoPath(proy).digits(0);

const paises = [];
const sinCodigo = [];
for (const f of features) {
  const codigo = f.id ? iso.numericToAlpha2(String(f.id).padStart(3, '0')) : undefined;
  const d = path(f);
  if (!codigo || !d) { sinCodigo.push(f.properties?.name); continue; }
  paises.push([codigo, d]);
}
writeFileSync(salida, JSON.stringify({ ancho: ANCHO, alto: ALTO, paises }));
console.log(res, paises.length, 'países;', 'sin código:', sinCodigo.join(', '));
