// Genera los cinco correos de la app a partir de n8n/correo-base.js.
//   node n8n/generar-correos.mjs vista <salida.html>   → una página con los cinco correos con datos de ejemplo
//   node n8n/generar-correos.mjs nodos <carpeta>       → los textos listos para pegar en n8n
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const base = fs.readFileSync(path.join(aqui, 'correo-base.js'), 'utf8');
const { correo } = new Function(`${base}\nreturn { correo, boton, colorCategoria };`)();
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const FOTO = 'https://gtqqqmethhakpybnuxin.supabase.co/storage/v1/object/public/fotos-recetas/Marmitako.jpeg';
const SITIO = 'https://recetario.orballo.link/';

// Cada correo recibe los textos dinámicos ya resueltos (vista) o como expresiones de n8n (nodos).
export function correos(v) {
  return {
    compartir: correo({
      preheader: 'Tu receta va adjunta en PDF: ábrela y a cocinar.', kicker: 'receta compartida',
      titulo: 'Una receta <em style="font-style:italic;font-weight:400;color:#c2452a;">para ti</em>',
      texto: 'Alguien ha pensado que esta receta te va a encantar y ha querido compartirla contigo desde <strong>El Recetario de Markis</strong>.',
      tarjeta: { foto: v.foto, titulo: v.titulo },
      nota: { titulo: 'A cocinar', html: 'Tienes el <strong>documento PDF adjunto</strong> a este correo. Ábrelo para ver todos los ingredientes detallados y el paso a paso completo.' },
      pie: '¡Que aproveche!<br />enviado desde <span style="color:#c2452a;">el recetario de markis</span>',
    }),
    anadida: correo({
      preheader: 'Nueva receta guardada en el recetario.', kicker: 'aviso · éxito', categoria: v.categoriaRaw, color: v.color,
      titulo: 'Receta añadida <em style="font-style:italic;font-weight:400;color:#c2452a;">con éxito</em>',
      texto: 'El flujo ha terminado sin errores y la receta ya está en el catálogo, en Notion, en Google Sheets y con su PDF en Drive.',
      tarjeta: { foto: v.foto, titulo: v.titulo, etiquetas: v.etiquetas },
      nota: { titulo: 'Ya está en el recetario', html: 'Fecha de la clase: <strong>' + v.fecha + '</strong>.' + v.enlacePdf },
      pie: '¡Otra más para la colección!<br />enviado desde <span style="color:#c2452a;">n8n · el recetario de markis</span>',
    }),
    error: correo({
      preheader: 'Ha fallado el flujo de alta de recetas.', kicker: 'aviso · error',
      titulo: 'Algo se ha quemado <em style="font-style:italic;font-weight:400;color:#c2452a;">en la cocina</em>',
      texto: 'Una ejecución de <strong>' + v.flujo + '</strong> ha fallado. Puede que la receta haya quedado a medias (PDF, Notion o Sheets sin Supabase, o al revés).',
      bloques: [
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1.5px solid #2a2118;border-radius:4px;background-color:#faf5e8;">'
        + '<tr><td style="padding:12px 18px;border-bottom:1.5px dashed #2a2118;"><div style="font-family:\'JetBrains Mono\',Consolas,monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#6d5f50;">nodo que falló</div><div style="font-family:\'Fraunces\',Georgia,serif;font-size:19px;font-weight:600;color:#2a2118;">' + v.nodo + '</div></td></tr>'
        + '<tr><td style="padding:12px 18px;border-bottom:1.5px dashed #2a2118;"><div style="font-family:\'JetBrains Mono\',Consolas,monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#6d5f50;">mensaje</div><div style="font-family:\'JetBrains Mono\',Consolas,monospace;font-size:13px;line-height:1.5;color:#b3261e;">' + v.mensaje + '</div></td></tr>'
        + '<tr><td style="padding:10px 18px;font-family:\'JetBrains Mono\',Consolas,monospace;font-size:11px;color:#6d5f50;">ejecución: #' + v.ejecucion + ' &nbsp;·&nbsp; modo: ' + v.modo + '</td></tr></table>',
      ],
      nota: { titulo: 'Qué hacer', html: 'Abre la ejecución en n8n para ver los datos del nodo que falló. Antes de reintentar, comprueba que no haya quedado una receta duplicada en Notion o Sheets.' },
      boton: { texto: 'Ver ejecución', url: v.urlEjecucion, fondo: '#c2452a', letra: '#f4ecdd' },
      pie: 'Este aviso se envía solo cuando el flujo falla.<br />enviado desde <span style="color:#c2452a;">n8n · el recetario de markis</span>',
    }),
    nueva: correo({
      preheader: 'Ha entrado una receta nueva en el recetario.', kicker: 'receta nueva', categoria: v.categoriaRaw,
      titulo: 'Receta nueva <em style="font-style:italic;font-weight:400;color:#c2452a;">en el recetario</em>',
      texto: v.hola + ' Acaba de entrar una receta nueva.',
      tarjeta: { foto: v.foto, titulo: v.titulo, etiquetas: v.etiquetas },
      boton: { texto: 'Ver la receta', url: v.enlace },
      pie: 'Recibes este aviso porque lo activaste en «Mi cuenta». Puedes desactivarlo cuando quieras en <a href="' + SITIO + '#/cuenta" style="color:#1c4fd6;">' + SITIO + '#/cuenta</a>.',
    }),
    autor: correo({
      preheader: 'Tu sugerencia ya se ha cocinado.', kicker: 'sugerencia hecha', categoria: v.categoriaRaw,
      titulo: '¡Tu sugerencia ya está <em style="font-style:italic;font-weight:400;color:#c2452a;">en el recetario</em>!',
      texto: v.hola + ' La receta que sugeriste ya se ha cocinado y está en el catálogo. Gracias por proponerla.',
      tarjeta: { foto: v.foto, titulo: v.titulo, etiquetas: v.etiquetas },
      boton: { texto: 'Ver la receta', url: v.enlace },
      pie: 'El Recetario de Markis · <a href="' + SITIO + '" style="color:#1c4fd6;">recetario.orballo.link</a>',
    }),
  };
}

const modo = process.argv[2];
if (modo === 'vista') {
  const v = { foto: FOTO, titulo: 'Marmitako', categoriaRaw: 'Pescados y mariscos', etiquetas: ['Pescados y mariscos', 'Fácil'], fecha: '2026-02-02', enlacePdf: ' <a href="#" style="color:#2a2118;font-weight:700;">Abrir el PDF</a>',
    flujo: 'Recetas con Frontend', nodo: 'Guardar en Supabase', mensaje: 'The service is receiving too many requests from you', ejecucion: '4821', modo: 'webhook', urlEjecucion: '#', hola: 'Hola, Marta.', enlace: SITIO + '#/receta/abc' };
  const c = correos(v);
  const nombres = { compartir: 'Compartir una receta (con PDF adjunto)', anadida: 'Receta añadida (al admin)', error: 'Error en el flujo (al admin)', nueva: 'Receta nueva (a los afans)', autor: 'Tu sugerencia ya está (al autor)' };
  const trozos = Object.entries(c).map(([k, html]) => `<section><h2>${nombres[k]}</h2><iframe srcdoc="${esc(html)}" loading="eager"></iframe></section>`).join('');
  fs.writeFileSync(process.argv[3], `<!doctype html><meta charset="utf-8"><title>Correos · propuesta</title><style>body{margin:0;background:#222;color:#eee;font-family:system-ui;padding:20px}h2{font:600 14px system-ui;margin:24px 0 8px}iframe{width:100%;max-width:680px;height:980px;border:0;background:#fff;display:block;margin:0 auto}.b{position:sticky;top:0;background:#111;padding:8px;text-align:center;z-index:9}button{margin:0 4px}</style><div class="b"><button onclick="document.querySelectorAll('iframe').forEach(f=>f.style.maxWidth='680px')">Escritorio</button><button onclick="document.querySelectorAll('iframe').forEach(f=>f.style.maxWidth='390px')">Móvil</button></div>${trozos}`);
  console.log('vista escrita');
}

if (modo === 'nodos') {
  const carpeta = process.argv[3];
  const E = (s) => '{{ ' + s + ' }}';
  const R = "$('Obtener receta real').item.json";
  const L = "$('Limpia respuesta').item.json";
  const tituloSeguro = E(`String(${R}.titulo).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')`);
  const terra = ['#c2452a', '#f4ecdd'];
  const comun = {
    categoriaRaw: undefined, flujo: E('$json.workflow.name'), nodo: E('$json.execution.lastNodeExecuted'), mensaje: E('$json.execution.error.message'),
    ejecucion: E('$json.execution.id'), modo: E('$json.execution.mode'), urlEjecucion: E('$json.execution.url'), hola: '', enlace: SITIO, color: terra,
  };
  // «Compartir» vive en la rama del webhook Mail (nodo «Obtener receta real»); «añadida» y el error, en la del alta.
  const tituloAlta = E(`String(${L}.titulo).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')`);
  const fotoAlta = E(`$('Guardar en Supabase').item.json.foto_url ?? ('https://gtqqqmethhakpybnuxin.supabase.co/storage/v1/object/public/fotos-recetas/' + ${L}.titulo.replace(/[^a-zA-Z0-9\\-_\\.]/g, '_') + '.jpg')`);
  const cComp = correos({ ...comun, foto: E(`${R}.foto_url`), titulo: tituloSeguro, etiquetas: [], fecha: '', enlacePdf: '' });
  const cAlta = correos({
    ...comun, foto: fotoAlta, titulo: tituloAlta,
    etiquetas: [E(`${L}.categoria ?? '—'`), 'tiempo: ' + E(`${L}.tiempo ?? '—'`), 'porciones: ' + E(`${L}.porciones ?? '—'`), 'dificultad: ' + E(`${L}.dificultad ?? '—'`)],
    fecha: E(`${L}.fecha_iso ?? '—'`),
    enlacePdf: E(`$('Subir pdf').item.json.webViewLink ? ' <a href="' + $('Subir pdf').item.json.webViewLink + '" style="color:#2a2118;font-weight:700;">Abrir el PDF</a>' : ''`),
  });
  const c = { compartir: cComp.compartir, anadida: cAlta.anadida, error: cAlta.error };
  // Los correos con expresiones no conocen la categoría al generarse: la píldora y la sombra llevan el terracota de la marca.
  const fijaColor = (html) => html;
  const salida = {
    compartir: '=' + fijaColor(c.compartir),
    anadida: '=' + fijaColor(c.anadida),
    error: '=' + fijaColor(c.error),
  };
  const colorBase = `\nconst COLOR_FIJO = ${JSON.stringify(terra)};\n`;
  const codigoNueva = base + `
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const recetas = $('Reclamar receta').all().map((i) => i.json).filter((r) => r && r.id);
const personas = $input.all().map((i) => i.json).filter((p) => p && p.email);
const out = [];
for (const r of recetas) {
  const enlace = SITIO + '#/receta/' + r.id;
  const etiquetas = [esc(r.categoria || '—')].concat(r.dificultad ? [esc(r.dificultad)] : []);
  for (const p of personas) {
    const hola = p.nombre ? 'Hola, ' + esc(p.nombre) + '.' : 'Hola.';
    const html = correo({
      preheader: 'Ha entrado una receta nueva en el recetario.', kicker: 'receta nueva', categoria: r.categoria,
      titulo: 'Receta nueva <em style="font-style:italic;font-weight:400;color:#c2452a;">en el recetario</em>',
      texto: hola + ' Acaba de entrar una receta nueva.',
      tarjeta: { foto: r.foto_url ? esc(r.foto_url) : '', titulo: esc(r.titulo), etiquetas },
      boton: { texto: 'Ver la receta', url: esc(enlace) },
      pie: 'Recibes este aviso porque lo activaste en «Mi cuenta». Puedes desactivarlo cuando quieras en <a href="' + SITIO + '#/cuenta" style="color:#1c4fd6;">' + SITIO + '#/cuenta</a>.',
    });
    out.push({ json: { to: p.email, subject: 'Receta nueva: ' + r.titulo, html } });
  }
}
return out;
`;
  const codigoAutor = base + `
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const reclamadas = new Set($input.all().map((i) => i.json.id));
const filas = $('Autores sin avisar').all().map((i) => i.json).filter((f) => reclamadas.has(f.sugerencia_id));
return filas.map((f) => {
  const enlace = SITIO + '#/receta/' + f.receta_id;
  const hola = f.nombre ? 'Hola, ' + esc(f.nombre) + '.' : 'Hola.';
  const html = correo({
    preheader: 'Tu sugerencia ya se ha cocinado.', kicker: 'sugerencia hecha', color: [TERRA, PAPEL],
    titulo: '¡Tu sugerencia ya está <em style="font-style:italic;font-weight:400;color:#c2452a;">en el recetario</em>!',
    texto: hola + ' La receta que sugeriste ya se ha cocinado y está en el catálogo. Gracias por proponerla.',
    tarjeta: { foto: f.receta_foto ? esc(f.receta_foto) : '', titulo: esc(f.receta_titulo) },
    boton: { texto: 'Ver la receta', url: esc(enlace) },
    pie: 'El Recetario de Markis · <a href="' + SITIO + '" style="color:#1c4fd6;">recetario.orballo.link</a>',
  });
  return { json: { to: f.email, subject: 'Tu sugerencia ya está en el recetario: ' + f.receta_titulo, html } };
});
`;
  fs.mkdirSync(carpeta, { recursive: true });
  fs.writeFileSync(path.join(carpeta, 'mensajes.json'), JSON.stringify(salida));
  fs.writeFileSync(path.join(carpeta, 'codigo-nueva.js'), codigoNueva);
  fs.writeFileSync(path.join(carpeta, 'codigo-autor.js'), codigoAutor);
  console.log(Object.fromEntries(Object.entries(salida).map(([k, v]) => [k, v.length])), codigoNueva.length, codigoAutor.length);
}
