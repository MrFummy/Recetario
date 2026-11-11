// Genera las plantillas de correo de Supabase Auth con la misma base que los avisos de n8n
// (n8n/correo-base.js). Supabase no las despliega desde el repositorio: hay que pegarlas a mano en
// el panel (Authentication → Email Templates). Ver LEEME.md.
//   node supabase/plantillas-correo/generar.mjs            → escribe los .html junto a este fichero
//   node supabase/plantillas-correo/generar.mjs vista <f>  → una página con las cuatro, con enlaces de ejemplo
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const base = fs.readFileSync(path.join(aqui, '../../n8n/correo-base.js'), 'utf8');
const { correo } = new Function(`${base}\nreturn { correo };`)();

const PIE = 'Si tú no has pedido esto, puedes ignorar este correo: no se hará ningún cambio.';
const ENLACE = '{{ .ConfirmationURL }}';
const enlaceSuelto = `Si el botón no funciona, copia este enlace en el navegador:<br /><span style="word-break:break-all;color:#1c4fd6;">${ENLACE}</span>`;
const em = (t) => `<em style="font-style:italic;font-weight:400;color:#c2452a;">${t}</em>`;

// Variables de Supabase: {{ .ConfirmationURL }}, {{ .Email }}, {{ .NewEmail }}, {{ .Token }}, {{ .SiteURL }}.
export const PLANTILLAS = {
  'confirmar-registro': {
    ajuste: 'Confirm signup', asunto: 'Confirma tu cuenta en El Recetario de Markis',
    html: correo({
      preheader: 'Un último paso para entrar en el recetario.', kicker: 'confirmar cuenta',
      titulo: `Bienvenido a ${em('la cocina')}`,
      texto: 'Gracias por registrarte en <strong>El Recetario de Markis</strong>. Confirma tu correo para entrar y empezar a guardar tu despensa, tus menús y tu pasaporte de sabores.',
      boton: { texto: 'Confirmar mi correo', url: ENLACE },
      nota: { titulo: 'Si no se abre', html: enlaceSuelto },
      pie: PIE,
    }),
  },
  'cambiar-correo': {
    ajuste: 'Change Email Address', asunto: 'Confirma tu nuevo correo en El Recetario de Markis',
    html: correo({
      preheader: 'Confirma el cambio de correo de tu cuenta.', kicker: 'cambio de correo',
      titulo: `Confirma tu ${em('nuevo correo')}`,
      texto: 'Has pedido cambiar el correo de tu cuenta de <strong>{{ .Email }}</strong> a <strong>{{ .NewEmail }}</strong>. Hasta que lo confirmes, la cuenta sigue con el anterior.',
      boton: { texto: 'Confirmar el cambio', url: ENLACE },
      nota: { titulo: 'Si no se abre', html: enlaceSuelto },
      pie: PIE,
    }),
  },
  'restablecer-contrasena': {
    ajuste: 'Reset Password', asunto: 'Restablece tu contraseña de El Recetario de Markis',
    html: correo({
      preheader: 'Elige una contraseña nueva.', kicker: 'contraseña',
      titulo: `Elige una ${em('contraseña nueva')}`,
      texto: 'Has pedido restablecer la contraseña de tu cuenta en <strong>El Recetario de Markis</strong>. Pulsa el botón para elegir una nueva.',
      boton: { texto: 'Restablecer contraseña', url: ENLACE },
      nota: { titulo: 'Si no se abre', html: enlaceSuelto },
      pie: PIE,
    }),
  },
  'reautenticacion': {
    ajuste: 'Reauthentication', asunto: 'Tu código de El Recetario de Markis',
    html: correo({
      preheader: 'Tu código de confirmación.', kicker: 'código de confirmación',
      titulo: `Tu ${em('código')}`,
      texto: 'Para confirmar el cambio en tu cuenta, escribe este código en la web. Caduca en poco tiempo.',
      bloques: ['<div style="text-align:center;font-family:\'JetBrains Mono\',Consolas,monospace;font-size:34px;letter-spacing:.3em;font-weight:500;color:#2a2118;border:1.5px solid #2a2118;border-radius:4px;background-color:#faf5e8;padding:18px 12px;">{{ .Token }}</div>'],
      pie: PIE,
    }),
  },
};

const modo = process.argv[2];
if (modo === 'vista') {
  const demo = (h) => h.replaceAll('{{ .ConfirmationURL }}', 'https://recetario.orballo.link/#/ejemplo').replaceAll('{{ .Email }}', 'ana@ejemplo.com').replaceAll('{{ .NewEmail }}', 'ana.nueva@ejemplo.com').replaceAll('{{ .Token }}', '482915');
  // También se escapan < y >: sin ello, el servidor de desarrollo de Vite cree que el primer `<head>` de la página
  // es suyo e inyecta su script dentro del srcdoc.
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const trozos = Object.entries(PLANTILLAS).map(([k, p]) => `<section><h2>${p.ajuste} · ${p.asunto}</h2><iframe srcdoc="${esc(demo(p.html))}"></iframe></section>`).join('');
  fs.writeFileSync(process.argv[3], `<!doctype html><meta charset="utf-8"><title>Correos de Supabase Auth</title><style>body{margin:0;background:#222;color:#eee;font-family:system-ui;padding:20px}h2{font:600 14px system-ui;margin:24px 0 8px}iframe{width:100%;max-width:680px;height:900px;border:0;background:#fff;display:block;margin:0 auto}</style>${trozos}`);
  console.log('vista escrita');
} else {
  for (const [k, p] of Object.entries(PLANTILLAS)) fs.writeFileSync(path.join(aqui, `${k}.html`), p.html);
  console.log('escritas:', Object.keys(PLANTILLAS).join(', '));
}
