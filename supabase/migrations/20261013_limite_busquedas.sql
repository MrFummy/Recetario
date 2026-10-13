-- ═══════════════════════════════════════════════════════════════════════════
-- Límite de búsquedas semánticas por usuario
--
-- Cada búsqueda gasta cuota de Gemini y el registro de usuarios está abierto,
-- así que cualquiera con una cuenta podría lanzarlas en bucle y agotar el límite
-- por minuto de la clave (compartida, quizá, con el flujo de n8n).
--
-- `registrar_busqueda` cuenta las búsquedas del usuario en la ventana y, si no
-- ha llegado al tope, apunta una más. Devuelve false cuando se ha pasado. Todo
-- en una sola llamada, con un lock por usuario: sin él, dos peticiones
-- simultáneas leerían el mismo contador y se colarían las dos.
--
-- La tabla no tiene policies (RLS activa): solo la toca service_role, que es
-- como la usa la Edge Function. Un usuario no puede borrarse su propio historial.
-- ═══════════════════════════════════════════════════════════════════════════

create table public.busquedas_uso (
  id        bigint generated always as identity primary key,
  user_id   uuid not null references auth.users(id) on delete cascade,
  creada_en timestamptz not null default now()
);

create index busquedas_uso_user_fecha on public.busquedas_uso (user_id, creada_en desc);

alter table public.busquedas_uso enable row level security;

create or replace function public.registrar_busqueda(
  p_user    uuid,
  p_limite  int default 20,
  p_ventana interval default interval '1 hour'
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  recientes int;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user::text, 0));

  -- Limpieza oportunista: nada de lo anterior a un día sirve ya para el límite.
  delete from public.busquedas_uso
  where user_id = p_user and creada_en < now() - interval '1 day';

  select count(*) into recientes
  from public.busquedas_uso
  where user_id = p_user and creada_en > now() - p_ventana;

  if recientes >= p_limite then
    return false;
  end if;

  insert into public.busquedas_uso (user_id) values (p_user);
  return true;
end;
$$;

revoke all on function public.registrar_busqueda(uuid, int, interval) from public;
revoke all on function public.registrar_busqueda(uuid, int, interval) from anon;
revoke all on function public.registrar_busqueda(uuid, int, interval) from authenticated;
grant execute on function public.registrar_busqueda(uuid, int, interval) to service_role;
