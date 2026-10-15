-- ═══════════════════════════════════════════════════════════════════════════
-- Mi pasaporte: recetas por países visitados (fase 1, datos)
--
-- Ver docs/pasaporte.md.
--
--   · `recetas.pais`: código ISO 3166-1 alfa-2 en mayúsculas (`PT`, `JP`…), opcional.
--     Una receta pertenece como mucho a un país. Sin clave foránea a `paises`:
--     etiquetar una receta no debe exigir haber dado de alta el país antes. La
--     edita el admin con la policy de UPDATE de `recetas` que ya existe.
--   · `paises`: un país visitado, con su contexto y su portada. Existe aunque no
--     tenga recetas todavía (visitado ≠ cocinado).
--   · `fotos_pais`: galería de cada país. Se borra en cascada con el país.
--   · Lectura PÚBLICA de `paises` y `fotos_pais` (la sección la ve cualquiera,
--     igual que el catálogo); escritura solo del admin (`es_admin()`).
--
-- Fotos: bucket aparte `fotos-paises`, público para lectura (se pintan con <img>)
-- y escritura solo del admin. Como en `fotos-candidatas`, el admin necesita
-- también SELECT sobre storage.objects: sin él `remove()` responde sin error y no
-- borra nada. No se mezcla con `fotos-recetas`: la auditoría de huérfanas las
-- señalaría.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- ── recetas.pais ───────────────────────────────────────────────────────────

alter table public.recetas
  add column if not exists pais text;

alter table public.recetas
  drop constraint if exists recetas_pais_iso;
alter table public.recetas
  add constraint recetas_pais_iso check (pais is null or pais ~ '^[A-Z]{2}$');

create index if not exists recetas_pais_idx on public.recetas (pais);

-- ── paises ─────────────────────────────────────────────────────────────────

create table if not exists public.paises (
  codigo      text        primary key check (codigo ~ '^[A-Z]{2}$'),
  nombre      text        not null check (btrim(nombre) <> ''),
  fecha_viaje text,
  contexto    text,
  portada_url text,
  created_at  timestamptz not null default now()
);

alter table public.paises enable row level security;

drop policy if exists "Lectura publica de paises"   on public.paises;
drop policy if exists "El admin gestiona los paises" on public.paises;

create policy "Lectura publica de paises"
  on public.paises for select
  to anon, authenticated
  using (true);

create policy "El admin gestiona los paises"
  on public.paises for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

-- ── fotos_pais ─────────────────────────────────────────────────────────────

create table if not exists public.fotos_pais (
  id         uuid        primary key default gen_random_uuid(),
  pais       text        not null references public.paises (codigo) on delete cascade,
  url        text        not null check (btrim(url) <> ''),
  pie        text,
  orden      integer     not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists fotos_pais_pais_idx on public.fotos_pais (pais, orden);

alter table public.fotos_pais enable row level security;

drop policy if exists "Lectura publica de fotos de pais"   on public.fotos_pais;
drop policy if exists "El admin gestiona las fotos de pais" on public.fotos_pais;

create policy "Lectura publica de fotos de pais"
  on public.fotos_pais for select
  to anon, authenticated
  using (true);

create policy "El admin gestiona las fotos de pais"
  on public.fotos_pais for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

-- ── Storage: fotos-paises ──────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('fotos-paises', 'fotos-paises', true)
on conflict (id) do nothing;

drop policy if exists "Lectura de fotos de paises por admin"       on storage.objects;
drop policy if exists "Subida de fotos de paises por admin"        on storage.objects;
drop policy if exists "Actualizacion de fotos de paises por admin" on storage.objects;
drop policy if exists "Borrado de fotos de paises por admin"       on storage.objects;

create policy "Lectura de fotos de paises por admin"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'fotos-paises' and public.es_admin());

create policy "Subida de fotos de paises por admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'fotos-paises' and public.es_admin());

create policy "Actualizacion de fotos de paises por admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'fotos-paises' and public.es_admin())
  with check (bucket_id = 'fotos-paises' and public.es_admin());

create policy "Borrado de fotos de paises por admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'fotos-paises' and public.es_admin());

commit;
