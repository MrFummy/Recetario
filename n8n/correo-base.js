// Plantilla común de los correos de El Recetario (rediseño «Mercado y azulejo»).
// Es JavaScript sin dependencias para poder pegarlo tal cual en un nodo Code de n8n; los nodos
// Gmail con la plantilla en una expresión se generan con n8n/generar-correos.mjs.
// Todos los textos que se le pasan son HTML ya escapado por quien llama.
//
// Pensado para clientes de correo: tablas, estilos en línea, sin conic-gradient ni SVG. La cenefa
// es una fila de triángulos de texto; la sombra dura de los botones, un borde inferior y derecho.
const SITIO = 'https://recetario.orballo.link/';
const LOGO = SITIO + 'icon-256.png';
const TINTA = '#2a2118', PAPEL = '#f4ecdd', PAPEL2 = '#faf5e8', SUAVE = '#6d5f50', TERRA = '#c2452a', COBALTO = '#1c4fd6', AMARILLO = '#f4b623';
const COLORES = {
  aperitivos: ['#f4b623', TINTA], postres: ['#e58a74', TINTA], carnes: [TERRA, PAPEL], pescados: [COBALTO, PAPEL],
  sopas: ['#0e5b46', PAPEL], ensaladas: ['#5d6b3a', PAPEL], arroces: ['#b8862b', TINTA], pastas: ['#e0802c', TINTA], otro: [TINTA, PAPEL],
};
const PREFIJOS = [['aperit', 'aperitivos'], ['postre', 'postres'], ['carne', 'carnes'], ['pescad', 'pescados'], ['sopa', 'sopas'],
  ['crema', 'sopas'], ['ensal', 'ensaladas'], ['arroz', 'arroces'], ['pasta', 'pastas']];
function colorCategoria(categoria) {
  const c = String(categoria || '').trim().toLowerCase();
  const hallado = PREFIJOS.find(([p]) => c.startsWith(p));
  return COLORES[hallado ? hallado[1] : 'otro'];
}

const SERIF = "'Fraunces',Georgia,'Times New Roman',serif";
const SANS = "'Schibsted Grotesk',-apple-system,'Helvetica Neue',Arial,sans-serif";
const MONO = "'JetBrains Mono','SFMono-Regular',Consolas,monospace";

function boton(texto, url, fondo, letra) {
  return '<a href="' + url + '" style="display:inline-block;background-color:' + (fondo || AMARILLO) + ';color:' + (letra || TINTA)
    + ';font-family:' + SANS + ';font-weight:700;font-size:15px;text-decoration:none;padding:11px 26px;border:1.5px solid ' + TINTA
    + ';border-right:4px solid ' + TINTA + ';border-bottom:4px solid ' + TINTA + ';border-radius:999px;">' + texto + '</a>';
}

function tarjeta(t, k, kt) {
  const foto = t.foto
    ? '<tr><td align="center" style="padding:0 0 18px;"><img src="' + t.foto + '" alt="" width="300" style="display:block;width:300px;max-width:100%;height:auto;border:1.5px solid ' + TINTA
      + ';border-radius:300px 300px 3px 3px;background-color:#e9dfc9;" /></td></tr>'
    : '';
  const etiquetas = (t.etiquetas || []).map(function (e, i) {
    return '<span style="display:inline-block;margin:0 4px 6px;padding:4px 12px;border:1.5px solid ' + TINTA + ';border-radius:999px;font-family:' + SANS
      + ';font-weight:800;font-size:11px;letter-spacing:.02em;text-transform:uppercase;background-color:' + (i === 0 ? k : PAPEL2) + ';color:' + (i === 0 ? kt : TINTA) + ';">' + e + '</span>';
  }).join('');
  return '<tr><td align="center" style="padding:6px 36px 6px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">'
    + foto
    + '<tr><td align="center" style="font-family:' + SERIF + ';font-size:28px;font-weight:500;line-height:1.12;letter-spacing:-.01em;color:' + TINTA + ';padding:0 8px 10px;">' + t.titulo + '</td></tr>'
    + (etiquetas ? '<tr><td align="center" style="padding:0 0 4px;">' + etiquetas + '</td></tr>' : '')
    + '</table></td></tr>';
}

// Cenefa de azulejo: dos filas de celdas de color en damero. Antes eran triángulos de texto y no llenaban el ancho
// (dependían de la fuente) ni se recortaban en todos los clientes; las celdas con bgcolor van en todos. Las columnas
// salen iguales por `table-layout:fixed`, así que llenan el ancho sea cual sea.
function cenefa() {
  const fila = function (empieza) {
    let celdas = '';
    for (let n = 0; n < 60; n++) celdas += '<td bgcolor="' + ((n + empieza) % 2 ? PAPEL : COBALTO) + '" height="6"></td>';
    return '<tr>' + celdas + '</tr>';
  };
  return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;font-size:0;line-height:0;">' + fila(0) + fila(1) + '</table>';
}

function correo(o) {
  // `color` fija el par [fondo, texto] cuando la categoría no se conoce al generar el HTML (correos con expresiones).
  const color = o.color || colorCategoria(o.categoria);
  const k = color[0], kt = color[1];
  const filas = [];
  filas.push('<tr><td class="px" style="padding:22px 36px 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
    + '<td width="58" valign="middle"><a href="' + SITIO + '"><img src="' + LOGO + '" alt="El Recetario de Markis" width="52" height="52" style="display:block;border:0;font-family:' + SANS + ';font-size:11px;color:' + SUAVE + ';" /></a></td>'
    + '<td valign="middle" style="padding-left:12px;"><span style="font-family:' + SERIF + ';font-style:italic;font-weight:600;font-size:23px;letter-spacing:-.02em;color:' + TINTA + ';line-height:1.1;">El Recetario de <span style="font-style:normal;font-weight:700;color:' + TERRA + ';">Markis</span></span></td>'
    + '</tr></table></td></tr>');
  filas.push('<tr><td style="border-top:1.5px solid ' + TINTA + ';border-bottom:1.5px solid ' + TINTA + ';font-size:0;line-height:0;">' + cenefa() + '</td></tr>');
  filas.push('<tr><td class="px" style="padding:30px 36px 8px;">'
    + (o.kicker ? '<div style="font-family:' + MONO + ';font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:' + TERRA + ';margin:0 0 14px;">&mdash;&mdash; ' + o.kicker + '</div>' : '')
    + '<div class="titulo" style="font-family:' + SERIF + ';font-weight:300;font-size:36px;line-height:1.02;letter-spacing:-.035em;color:' + TINTA + ';margin:0 0 14px;">' + o.titulo + '</div>'
    + '<div style="font-family:' + SANS + ';font-size:16px;line-height:1.6;color:' + SUAVE + ';">' + o.texto + '</div></td></tr>');
  if (o.tarjeta) filas.push('<tr><td style="padding:14px 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' + tarjeta(o.tarjeta, k, kt) + '</table></td></tr>');
  (o.bloques || []).forEach(function (b) { filas.push('<tr><td class="px" style="padding:10px 36px 0;">' + b + '</td></tr>'); });
  if (o.nota) {
    filas.push('<tr><td class="px" style="padding:20px 36px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#fbe3a0;border:1.5px solid ' + TINTA + ';border-right:4px solid ' + TINTA + ';border-bottom:4px solid ' + TINTA + ';border-radius:3px;padding:14px 20px 16px;">'
      + '<div style="font-family:' + MONO + ';font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:' + TERRA + ';margin:0 0 6px;">' + o.nota.titulo + '</div>'
      + '<div style="font-family:' + SANS + ';font-size:15px;line-height:1.55;color:' + TINTA + ';">' + o.nota.html + '</div></td></tr></table></td></tr>');
  }
  if (o.boton) filas.push('<tr><td align="center" class="px" style="padding:28px 36px 6px;">' + boton(o.boton.texto, o.boton.url, o.boton.fondo, o.boton.letra) + '</td></tr>');
  filas.push('<tr><td class="px" style="padding:30px 36px 26px;"><div style="border-top:1.5px solid ' + TINTA + ';padding-top:16px;font-family:' + MONO + ';font-size:11px;line-height:1.7;color:' + SUAVE + ';text-align:center;">' + o.pie + '</div></td></tr>');

  return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="color-scheme" content="light only" />'
    + '<title>El Recetario de Markis</title>'
    + '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,600&family=JetBrains+Mono:wght@400;500&family=Schibsted+Grotesk:wght@400;500;600;700&display=swap" />'
    + '<style>body,table,td,a{-webkit-text-size-adjust:100%;}body{margin:0;padding:0;width:100%!important;}a{color:' + COBALTO + ';}@media only screen and (max-width:620px){.container{width:100%!important;}.px{padding-left:22px!important;padding-right:22px!important;}.titulo{font-size:30px!important;}}</style></head>'
    + '<body style="margin:0;padding:0;background-color:' + PAPEL + ';">'
    + '<div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:' + PAPEL + ';">' + (o.preheader || '') + '</div>'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:' + PAPEL + ';"><tr><td align="center" style="padding:26px 12px 40px;">'
    + '<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:' + PAPEL2 + ';border:1.5px solid ' + TINTA + ';border-radius:3px;">'
    + filas.join('') + '</table></td></tr></table></body></html>';
}
