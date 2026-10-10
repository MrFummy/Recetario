-- ═══════════════════════════════════════════════════════════════════════════
-- Tiempo, porciones y dificultad (10 oct 2026)
--
-- Vertex ya extrae estos tres campos de cada receta al darla de alta —se ve
-- en la salida del nodo `Recupera foto` de "Recetas con Frontend"— pero el
-- nodo `Guardar en Supabase` no los escribía y la tabla no tenía columnas
-- para ellos: se calculaban, se pagaban y se descartaban. Ver
-- docs/ideas.md § "El punto de partida" y CLAUDE.md § Pendiente.
--
-- Alcance decidido: solo altas nuevas. Las recetas existentes quedan con
-- estos tres campos en NULL — rellenarlas exigiría volver a pasarlas por
-- Vertex (no solo regenerar el PDF desde Supabase, que es lo que hace el
-- flujo "Regenerar PDFs antiguos"), y es trabajo aparte, no parte de esto.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.recetas
  add column tiempo text,
  add column porciones text,
  add column dificultad text;

comment on column public.recetas.tiempo is 'Texto libre de Vertex, p. ej. "Preparación: 15'' + 1 h de reposo. Cocción: 20''". Null en recetas anteriores al 10 oct 2026 (no hay backfill).';
comment on column public.recetas.porciones is 'Texto libre de Vertex, p. ej. "4" o "2 raciones". Null en recetas anteriores al 10 oct 2026.';
comment on column public.recetas.dificultad is 'Uno de: Fácil, Media, Difícil. Null en recetas anteriores al 10 oct 2026.';
