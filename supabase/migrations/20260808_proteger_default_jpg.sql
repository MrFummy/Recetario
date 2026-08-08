-- ═══════════════════════════════════════════════════════════════════════════
-- Protege `_default.jpg` frente al borrado desde la app
--
-- `_default.jpg` no es la foto de ninguna receta: ninguna fila de `recetas`
-- lo tiene como foto_url, y por eso una auditoría de huérfanos lo señala por
-- error. Es la **plantilla** que usa el nodo "Recupera foto" del flujo de n8n:
--
--     if (!foto) {
--       const data = await this.helpers.httpRequest({
--         url: '.../object/public/fotos-recetas/_default.jpg',
--         encoding: 'arraybuffer' });
--       foto = await this.helpers.prepareBinaryData(Buffer.from(data), ...);
--     }
--
-- Cuando un alta llega sin foto del plato, n8n descarga esos bytes y los vuelve
-- a subir con el nombre de la receta. Si el fichero desaparece, las altas sin
-- foto dejan de funcionar.
--
-- Hasta la migración 20260808_fotos_en_raiz_visibles estaba protegido por
-- accidente: la policy de SELECT no veía los ficheros de la raíz del bucket, de
-- modo que tampoco se podían borrar. Ese mismo accidente era el que dejaba
-- huérfanas las fotos antiguas, así que al corregirlo se perdió la protección
-- incidental. Aquí se hace explícita.
--
-- n8n usa service_role y se salta la RLS, así que la plantilla se puede seguir
-- reemplazando desde los flujos o desde el panel de Storage.
--
-- Verificado tras aplicarlo, evaluando la expresión como el usuario admin:
--     _default.jpg                  -> NO borrable
--     Raxo_de_la_abuela.jpg         -> borrable
--     Wok_de_verduras_al_curry.jpeg -> borrable
--     fotos/<uuid>.jpeg             -> borrable
--     descarga pública de _default.jpg -> HTTP 200, 824.959 bytes
-- ═══════════════════════════════════════════════════════════════════════════

alter policy "Borrado de fotos por admin" on storage.objects
  using (
    bucket_id = 'fotos-recetas'
    and public.es_admin()
    and name <> '_default.jpg'
  );
