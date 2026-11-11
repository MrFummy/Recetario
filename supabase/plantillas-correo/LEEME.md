# Plantillas de correo de Supabase Auth

Las cuatro salen de la misma base que los avisos de n8n ([n8n/correo-base.js](../../n8n/correo-base.js)).
**Supabase no las despliega desde el repositorio**: hay que pegarlas a mano en el panel, en
*Authentication → Email Templates* (cada plantilla tiene un cuadro «Subject» y otro «Message body», en modo fuente/HTML).

| Plantilla del panel | Asunto | Fichero | Cuándo la manda la app |
|---|---|---|---|
| **Confirm signup** | Confirma tu cuenta en El Recetario de Markis | [confirmar-registro.html](confirmar-registro.html) | Al registrarse (`signUp`) |
| **Change Email Address** | Confirma tu nuevo correo en El Recetario de Markis | [cambiar-correo.html](cambiar-correo.html) | «Mi cuenta» → cambiar correo (`updateUser`) |
| **Reset Password** | Restablece tu contraseña de El Recetario de Markis | [restablecer-contrasena.html](restablecer-contrasena.html) | Hoy ninguna: la app no tiene «he olvidado mi contraseña»; se deja lista por si se añade |
| **Reauthentication** | Tu código de El Recetario de Markis | [reautenticacion.html](reautenticacion.html) | Solo si se activa «Secure password change»; hoy no |

Las variables son las de Supabase (`{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .NewEmail }}`, `{{ .Token }}`) y se dejan tal cual:
las rellena Supabase al enviar.

**Para regenerarlas** tras tocar la base: `node supabase/plantillas-correo/generar.mjs` (reescribe los `.html`) y
`node supabase/plantillas-correo/generar.mjs vista <fichero.html>` para ver las cuatro con datos de ejemplo.

**Cosas a saber**
- Con el SMTP por defecto de Supabase el remitente es genérico y hay un límite de correos por hora; no lo cambia esta plantilla.
- Gmail ignora la fuente Fraunces (se ve Georgia) y Outlook de escritorio no redondea la foto: son límites de los clientes de correo.
- El logo de la cabecera se sirve desde `recetario.orballo.link/icon-256.png`: no borrarlo del build.
- Tras pegarlas, comprobar con una cuenta de prueba: registrarse y abrir el correo (el enlace debe volver a la web).
