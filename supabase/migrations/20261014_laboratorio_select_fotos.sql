-- ═══════════════════════════════════════════════════════════════════════════
-- Política de LECTURA para las fotos de candidatas
--
-- La migración 20261014_laboratorio_candidatas.sql dio al admin INSERT, UPDATE y
-- DELETE sobre storage.objects del bucket `fotos-candidatas`, pero no SELECT.
-- Storage necesita poder ver el objeto para borrarlo: sin SELECT, `remove()`
-- responde sin error y no borra nada, y las fotos de las candidatas borradas o
-- pasadas al recetario se quedaban sueltas en el bucket.
--
-- No expone nada nuevo: el bucket es público, así que la lectura por URL ya
-- funcionaba sin RLS; esto solo permite al admin listar y borrar desde la API.
-- ═══════════════════════════════════════════════════════════════════════════

drop policy if exists "Lectura de fotos de candidatas por admin" on storage.objects;

create policy "Lectura de fotos de candidatas por admin"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'fotos-candidatas' and public.es_admin());
