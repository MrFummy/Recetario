-- El Pasaporte pasa a ser solo para usuarios con sesión.
--
-- Antes la lectura de `paises` y `fotos_pais` era pública (`to anon,
-- authenticated`). La web ya oculta la sección a los visitantes, pero sin esto
-- los datos seguían sirviéndose a quien consultara la API directamente.
--
-- El bucket `fotos-paises` se queda público a propósito: pasarlo a URLs
-- firmadas complica la carga por poco. Se protegen las filas, no las imágenes.

drop policy if exists "Lectura publica de paises"        on public.paises;
drop policy if exists "Lectura publica de fotos de pais" on public.fotos_pais;
drop policy if exists "Los afans leen los paises"        on public.paises;
drop policy if exists "Los afans leen las fotos de pais" on public.fotos_pais;

create policy "Los afans leen los paises"
  on public.paises for select
  to authenticated
  using (true);

create policy "Los afans leen las fotos de pais"
  on public.fotos_pais for select
  to authenticated
  using (true);
