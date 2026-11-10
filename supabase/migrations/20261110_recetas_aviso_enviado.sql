-- Marca de «ya se ha avisado de esta receta» para los correos de recetas nuevas.
--
-- El flujo de n8n «Aviso de nuevas recetas» pregunta cada pocos minutos qué recetas tienen
-- `aviso_enviado_en` a null, las marca (con una sola petición, para que dos pasadas no avisen dos
-- veces) y manda un correo por receta y por afan suscrito. Se eligió esto y no un webhook de base de
-- datos porque `pg_net` no está instalado, no hace falta abrir un endpoint público con un secreto, y si
-- n8n estuvo caído lo pendiente se recupera solo en la siguiente pasada.
--
-- Las recetas que YA existen se marcan como avisadas: sin esto, la primera pasada mandaría a cada
-- suscrito un correo por cada receta antigua.

alter table public.recetas add column if not exists aviso_enviado_en timestamptz;

update public.recetas set aviso_enviado_en = now() where aviso_enviado_en is null;
