-- ═══════════════════════════════════════════════════════════════════════════
-- Búsqueda semántica: pgvector y una tabla de embeddings por receta
--
-- Los vectores van en una tabla aparte y no en una columna de `recetas`
-- porque el frontend lee `recetas` con `select('*')`: una columna de 768
-- floats por receta viajaría a todos los navegadores en cada carga del
-- catálogo sin que nadie la use.
--
-- La tabla tiene RLS activa y ninguna policy: ni anon ni authenticated pueden
-- leerla ni escribirla. Solo la tocan la Edge Function de búsqueda y el flujo
-- que indexa recetas, ambos con service_role (que se salta la RLS).
--
-- `texto_hash` guarda el hash del texto que se embebió, para poder reindexar
-- solo lo que cambió (editar notas, por ejemplo) sin pagar las 61 de nuevo.
--
-- 768 dimensiones: gemini-embedding-001 permite recortar su salida con
-- `outputDimensionality`. Cambiarlo obliga a reindexar todo.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists vector with schema extensions;

create table public.recetas_embeddings (
  receta_id   uuid primary key references public.recetas(id) on delete cascade,
  embedding   extensions.vector(768) not null,
  texto_hash  text not null,
  actualizado timestamptz not null default now()
);

alter table public.recetas_embeddings enable row level security;

-- Con 61 recetas un recorrido secuencial es instantáneo y un índice HNSW
-- empeoraría la precisión sin ganar nada. Se añade si el catálogo llega a miles.

create or replace function public.buscar_recetas_semantico(
  consulta extensions.vector(768),
  limite   int default 12
)
returns table (receta_id uuid, similitud float)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select receta_id, 1 - (embedding <=> consulta) as similitud
  from public.recetas_embeddings
  order by embedding <=> consulta
  limit least(limite, 50);
$$;

-- Solo la Edge Function (service_role) puede llamarla; la protección contra
-- el gasto en Vertex está en que esa función exige sesión.
revoke all on function public.buscar_recetas_semantico(extensions.vector, int) from public;
revoke all on function public.buscar_recetas_semantico(extensions.vector, int) from anon;
revoke all on function public.buscar_recetas_semantico(extensions.vector, int) from authenticated;
grant execute on function public.buscar_recetas_semantico(extensions.vector, int) to service_role;
