// Contenido del nodo Code «Rellenar HTML» del flujo «Recetas con Frontend» (n8n).
// Rellena la plantilla n8n/receta-pdf.html (la que está en Drive) con la receta. Versión del
// rediseño «Mercado y azulejo»; las pegas conocidas de la anterior (cadenas con `$&` en el
// título, texto sin escapar) están resueltas: se escapa todo y se rellena con funciones.
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const limpia = $("Limpia respuesta").first().json;
let html = Buffer.from($json.htmlTemplate, "base64").toString("utf-8");

// Color de la categoría: el mismo mapa que src/lib/colorCategoria.ts y src/sistema.css.
const COLORES = {
  aperitivos: ["#f4b623", "#2a2118"], postres: ["#e58a74", "#2a2118"], carnes: ["#c2452a", "#f4ecdd"],
  pescados: ["#1c4fd6", "#f4ecdd"], sopas: ["#0e5b46", "#f4ecdd"], ensaladas: ["#5d6b3a", "#f4ecdd"],
  arroces: ["#b8862b", "#2a2118"], pastas: ["#e0802c", "#2a2118"], otro: ["#2a2118", "#f4ecdd"],
};
const PREFIJOS = [["aperit", "aperitivos"], ["postre", "postres"], ["carne", "carnes"], ["pescad", "pescados"],
  ["sopa", "sopas"], ["crema", "sopas"], ["ensal", "ensaladas"], ["arroz", "arroces"], ["pasta", "pastas"]];
const categoria = (limpia.categoria || "").trim();
const clave = (PREFIJOS.find(([p]) => categoria.toLowerCase().startsWith(p)) || [])[1] || "otro";
const [kColor, kTexto] = COLORES[clave];

const fotoUrl = "https://gtqqqmethhakpybnuxin.supabase.co/storage/v1/object/public/fotos-recetas/" + limpia.titulo.replace(/[^a-zA-Z0-9\-_\.]/g, "_") + ".jpg";
const tituloCorto = limpia.titulo.split(" ").slice(0, 4).join(" ");
const fecha = new Date(limpia.fecha_iso + "T12:00:00");
const palabras = limpia.titulo.trim().split(" ");
const ultima = palabras.length > 1 ? palabras.pop() : null;
const tituloHtml = ultima ? esc(palabras.join(" ")) + " <em>" + esc(ultima) + "</em>" : "<em>" + esc(limpia.titulo) + "</em>";
const chips = [limpia.tiempo, limpia.porciones, limpia.dificultad].filter(Boolean)
  .map((d) => '<span class="chip">' + esc(d) + "</span>").join("");

const valores = {
  titulo: esc(limpia.titulo), tituloCorto: esc(tituloCorto), tituloHtml, categoria: esc(categoria),
  categoriaCorta: esc(categoria.split(/[\/ ]/)[0]), kColor, kTexto, chips, imagen: fotoUrl,
  fechaNumerica: fecha.toLocaleDateString("es-ES"),
  fechaLarga: fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
};
html = html.replace(/\{\{(\w+)\}\}/g, (todo, nombre) => (nombre in valores ? valores[nombre] : todo));

const esCabecera = (t) => t.startsWith("— ") && t.endsWith(" —");
const sinRaya = (t) => esc(t.replace(/^— /, "").replace(/ —$/, ""));

// Ingredientes: las cabeceras de grupo son cadenas y los ingredientes, objetos {nombre, cantidad, ...};
// se aceptan también ingredientes en cadena.
const ingHtml = limpia.ingredientes.map((i) => {
  if (typeof i === "string") {
    if (esCabecera(i)) return '<li class="ing-grupo">' + sinRaya(i) + "</li>";
    return '<li class="ing-item"><span class="ing-mark"></span><span style="grid-column:2 / 4">' + esc(i) + "</span></li>";
  }
  const q = i.cantidad ? '<span class="ing-q">' + esc(i.cantidad) + "</span>" : '<span class="ing-q vacia">—</span>';
  return '<li class="ing-item"><span class="ing-mark"></span>' + q + "<span>" + esc(i.nombre || "") + "</span></li>";
}).join("\n");
html = html.replace(/\{\{#each ingredientes\}\}[\s\S]*?\{\{\/each\}\}/, () => ingHtml);

// Pasos: el contador salta las cabeceras de fase.
let contador = 0;
const pasosHtml = limpia.pasos.map((p) => {
  if (esCabecera(p)) return '<li class="paso-fase">' + sinRaya(p) + "</li>";
  contador++;
  return '<li class="paso-item"><div class="paso-num">' + contador + '</div><div class="paso-texto">' + esc(p) + "</div></li>";
}).join("\n");
html = html.replace(/\{\{#each pasos\}\}[\s\S]*?\{\{\/each\}\}/, () => pasosHtml);

// Notas: {{#if notas}} se resuelve a mano.
if (limpia.notas && limpia.notas.length > 0) {
  // Las notas llegan partidas en las líneas del PDF original: solo se corta tras un punto final.
  const notasTexto = limpia.notas.map(esc).reduce((acc, linea, i) => (i === 0 ? linea : acc + (/[.!?:]$/.test(acc) ? "<br>" : " ") + linea), "");
  html = html.replace(/\{\{#if notas\}\}/, "").replace(/\{\{\/if\}\}/, "").replace(/\{\{notas\}\}/, () => notasTexto);
} else {
  html = html.replace(/\{\{#if notas\}\}[\s\S]*?\{\{\/if\}\}/, "");
}

return [{
  json: limpia,
  binary: { data: { data: Buffer.from(html).toString("base64"), mimeType: "text/html", fileName: "index.html", fileExtension: "html" } },
}];
