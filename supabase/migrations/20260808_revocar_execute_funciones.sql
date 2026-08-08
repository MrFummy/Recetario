-- ═══════════════════════════════════════════════════════════════════════════
-- Quita el EXECUTE público sobre las funciones SECURITY DEFINER
--
-- Postgres concede EXECUTE a PUBLIC por defecto, así que ambas funciones
-- quedaban publicadas como RPC en /rest/v1/rpc/. Es lo que marcan los lints
-- 0028 y 0029 del linter de Supabase.
--
--   - update_recipe_average_rating es una función de trigger. Invocarla por RPC
--     falla igualmente ("can only be called as a trigger"), pero no tiene por
--     qué estar publicada. Verificado en una transacción con rollback que, tras
--     revocar, el trigger sigue disparándose y recalculando la media: el
--     privilegio se comprueba al crear el trigger, no en cada disparo.
--
--   - es_admin sí necesita EXECUTE para `authenticated`: las policies de
--     `recetas` y de storage la evalúan con los privilegios de quien consulta,
--     así que sin ese permiso el admin dejaría de poder editar. Solo se le
--     retira a anon y a PUBLIC.
--
-- Verificado tras aplicarlo, con un afan votando y retirando el voto sobre una
-- receta que ya tenía media: la media se recalcula en el INSERT y vuelve a su
-- valor anterior en el DELETE.
-- ═══════════════════════════════════════════════════════════════════════════

revoke all on function public.update_recipe_average_rating() from public;
revoke all on function public.update_recipe_average_rating() from anon;
revoke all on function public.update_recipe_average_rating() from authenticated;

revoke all on function public.es_admin() from public;
revoke all on function public.es_admin() from anon;
grant execute on function public.es_admin() to authenticated;
