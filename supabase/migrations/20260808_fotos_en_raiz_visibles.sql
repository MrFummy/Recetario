-- ═══════════════════════════════════════════════════════════════════════════
-- Hace visibles para la RLS las fotos que están en la raíz del bucket
--
-- Síntoma: al cambiar la foto de una receta desde la app, la anterior no se
-- borraba y quedaba huérfana en el bucket, sin ningún error. Se habían
-- acumulado tres.
--
-- Causa: la policy de SELECT usaba
--
--     (storage.foldername(name))[1] <> '..'
--
-- Para un fichero en la raíz del bucket, `storage.foldername()` devuelve un
-- array vacío, así que `[1]` es NULL y la comparación da NULL, no true. La RLS
-- trata ese NULL como falso, de modo que esos ficheros son invisibles: la
-- llamada `remove()` de la API de Storage no encuentra nada que borrar y
-- devuelve una lista vacía sin quejarse.
--
-- Solo afectaba a los ficheros que sube n8n, que van a la raíz. Las fotos que
-- sube la app van bajo `fotos/` y sí se borraban. Las descargas nunca se vieron
-- afectadas porque el bucket es público y `/object/public/` no pasa por RLS,
-- que es la razón de que el fallo pasara desapercibido.
--
-- `coalesce` mantiene intacta la protección contra travesía de rutas y añade
-- el caso de la raíz. Verificado tras aplicarlo:
--
--     '../secreto.jpg'         -> bloqueado
--     'Raxo_de_la_abuela.jpg'  -> visible
--     'fotos/x.jpg'            -> visible
--     anónimo y autenticado    -> ven las 51 fotos
-- ═══════════════════════════════════════════════════════════════════════════

alter policy "Fotos de recetas públicas" on storage.objects
  using (
    bucket_id = 'fotos-recetas'
    and coalesce((storage.foldername(name))[1], '') <> '..'
  );

-- Los tres huérfanos ya existentes (Raxo_de_la_abuela.jpg, _default.jpg y
-- Wok_de_verduras_al_curry.jpeg) no se tocan aquí: Supabase bloquea el borrado
-- directo por SQL sobre storage.objects. Se limpian desde el panel de Storage
-- o con la API, y conviene comprobar antes que _default.jpg no se use como
-- imagen de reserva en ningún sitio.
