-- ═══════════════════════════════════════════════════════════════════════════
-- El Laboratorio: recetas candidatas
--
-- Recetas que se quieren probar antes de decidir si entran al recetario. Ver
-- docs/candidatas.md.
--
--   · Tabla propia, NO filas de `recetas` con una marca: `recetas` es de lectura
--     pública y alimenta el PDF, Notion, los embeddings y el contador.
--   · Mismo formato JSONB que `recetas` (ingredientes con `base`/`valor`/`unidad`,
--     pasos como cadenas), para que el paso al recetario sea casi copiar.
--   · Solo el admin lee y escribe. n8n escribe con `service_role`, que se salta
--     la RLS. Sin policy para `anon`: no ve nada.
--   · Estados: `por_probar` → `probada`. Descartar = borrar la fila; no se guardan
--     descartadas.
--   · `fuente_url` es UNIQUE: el flujo de entrada avisa de duplicados en lugar de
--     volver a llamar a Gemini. Una candidata sin enlace (texto pegado) deja la
--     columna a NULL, que UNIQUE permite repetida. El flujo debe NORMALIZAR la URL
--     (sin utm_*, igshid, etc.) antes de insertar, o no detectará repetidas.
--   · `de_video`: la receta salió de un vídeo, donde las cantidades son menos
--     fiables (la web enseña «revisa las cantidades»).
--
-- Fotos: bucket aparte `fotos-candidatas`, público para lectura (las miniaturas se
-- pintan con <img>) y escritura solo del admin. No se mezcla con `fotos-recetas`:
-- la auditoría de huérfanas las señalaría y su policy está pensada para otra cosa.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.candidatas (
  id           uuid        primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),

  titulo       text        not null check (btrim(titulo) <> ''),
  categoria    text,
  ingredientes jsonb       not null default '[]'::jsonb,
  pasos        jsonb       not null default '[]'::jsonb,
  notas        jsonb,
  tiempo       text,
  porciones    text,
  dificultad   text,

  fuente_url   text        unique,
  fuente_tipo  text        not null default 'texto'
               check (fuente_tipo in ('youtube', 'instagram', 'web', 'texto')),
  estado       text        not null default 'por_probar'
               check (estado in ('por_probar', 'probada')),
  foto_url     text,
  de_video     boolean     not null default false
);

alter table public.candidatas enable row level security;

drop policy if exists "El admin gestiona las candidatas" on public.candidatas;

create policy "El admin gestiona las candidatas"
  on public.candidatas for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

-- ── Storage: fotos-candidatas ──────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('fotos-candidatas', 'fotos-candidatas', true)
on conflict (id) do nothing;

drop policy if exists "Subida de fotos de candidatas por admin"       on storage.objects;
drop policy if exists "Actualizacion de fotos de candidatas por admin" on storage.objects;
drop policy if exists "Borrado de fotos de candidatas por admin"       on storage.objects;

create policy "Subida de fotos de candidatas por admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'fotos-candidatas' and public.es_admin());

create policy "Actualizacion de fotos de candidatas por admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'fotos-candidatas' and public.es_admin())
  with check (bucket_id = 'fotos-candidatas' and public.es_admin());

create policy "Borrado de fotos de candidatas por admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'fotos-candidatas' and public.es_admin());
