-- =====================================================================
-- BioConecta — esquema inicial
-- Perfiles (participante / organizador), eventos, inscripciones
-- y bucket de imágenes. Todas las tablas expuestas tienen RLS.
-- =====================================================================

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Utilidad: updated_at automático
-- ---------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- PROFILES: un perfil por usuario de auth.users
-- El rol es auto-declarado al registrarse (no otorga privilegios
-- distintos a los que cualquiera obtiene registrándose como organizador).
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'participante'
    check (role in ('participante', 'organizador')),
  organization_name text,
  organization_type text
    check (organization_type in ('fundacion', 'universidad', 'colectivo', 'entidad_publica', 'empresa', 'otro')),
  phone text,
  website text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

-- Crea el perfil automáticamente al registrarse
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role, organization_name, organization_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when new.raw_user_meta_data ->> 'role' = 'organizador' then 'organizador' else 'participante' end,
    nullif(new.raw_user_meta_data ->> 'organization_name', ''),
    case
      when new.raw_user_meta_data ->> 'organization_type'
        in ('fundacion', 'universidad', 'colectivo', 'entidad_publica', 'empresa', 'otro')
      then new.raw_user_meta_data ->> 'organization_type'
      else null
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------
-- EVENTS
-- organizer_id es null para eventos reales cargados por el equipo
-- (organizados por entidades sin cuenta en la plataforma).
-- sustainability: insumos del modelo de huella de carbono (ver lib/footprint.ts)
-- ---------------------------------------------------------------------
create table public.events (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  organizer_id uuid references public.profiles (id) on delete set null,
  organizer_name text not null check (char_length(organizer_name) between 2 and 140),
  title text not null check (char_length(title) between 5 and 140),
  summary text not null check (char_length(summary) between 10 and 280),
  description text not null,
  event_type text not null
    check (event_type in ('charla', 'taller', 'voluntariado', 'salida_de_campo', 'siembra', 'limpieza')),
  modality text not null default 'presencial'
    check (modality in ('presencial', 'virtual', 'hibrido')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  city text not null default 'Barranquilla',
  venue_name text,
  address text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  online_url text,
  capacity integer check (capacity > 0),
  registered_count integer not null default 0 check (registered_count >= 0),
  requirements text,
  is_free boolean not null default true,
  price_info text,
  image_url text,
  source_url text,
  contact_email text,
  sustainability jsonb,
  status text not null default 'publicado'
    check (status in ('borrador', 'publicado', 'cancelado')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_dates_check check (ends_at >= starts_at),
  constraint events_location_check
    check (modality = 'virtual' or (latitude is not null and longitude is not null))
);

create index events_organizer_id_idx on public.events (organizer_id);
create index events_published_starts_at_idx on public.events (starts_at) where status = 'publicado';
create index events_type_starts_at_idx on public.events (event_type, starts_at);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- REGISTRATIONS (inscripciones)
-- ---------------------------------------------------------------------
create table public.registrations (
  id bigint generated always as identity primary key,
  event_id bigint not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 140),
  email text not null check (position('@' in email) > 1),
  phone text,
  status text not null default 'confirmada' check (status in ('confirmada', 'cancelada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint registrations_event_user_key unique (event_id, user_id)
);

create index registrations_user_id_idx on public.registrations (user_id);

create trigger registrations_set_updated_at
  before update on public.registrations
  for each row execute function private.set_updated_at();

-- Control de cupos atómico: bloquea la fila del evento, valida y
-- mantiene events.registered_count. SECURITY DEFINER porque necesita
-- contar/actualizar filas que el usuario no ve por RLS; vive en un
-- esquema no expuesto y solo se invoca como trigger.
create or replace function private.handle_registration_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  ev record;
begin
  if tg_op = 'INSERT' then
    select id, status, capacity, registered_count, ends_at
      into ev
      from public.events
     where id = new.event_id
       for update;

    if not found or ev.status <> 'publicado' then
      raise exception 'El evento no está disponible para inscripciones' using errcode = 'P0001';
    end if;
    if ev.ends_at < now() then
      raise exception 'El evento ya terminó' using errcode = 'P0001';
    end if;

    if new.status = 'confirmada' then
      if ev.capacity is not null and ev.registered_count >= ev.capacity then
        raise exception 'No quedan cupos disponibles' using errcode = 'P0001';
      end if;
      update public.events set registered_count = registered_count + 1 where id = new.event_id;
    end if;
    return new;

  elsif tg_op = 'UPDATE' then
    if new.event_id <> old.event_id or new.user_id <> old.user_id then
      raise exception 'No se puede cambiar el evento o el usuario de una inscripción' using errcode = 'P0001';
    end if;
    if new.status = old.status then
      return new;
    end if;

    select id, status, capacity, registered_count, ends_at
      into ev
      from public.events
     where id = new.event_id
       for update;

    if new.status = 'confirmada' then
      if ev.status <> 'publicado' or ev.ends_at < now() then
        raise exception 'El evento no está disponible para inscripciones' using errcode = 'P0001';
      end if;
      if ev.capacity is not null and ev.registered_count >= ev.capacity then
        raise exception 'No quedan cupos disponibles' using errcode = 'P0001';
      end if;
      update public.events set registered_count = registered_count + 1 where id = new.event_id;
    else
      update public.events set registered_count = greatest(registered_count - 1, 0) where id = new.event_id;
    end if;
    return new;

  elsif tg_op = 'DELETE' then
    if old.status = 'confirmada' then
      update public.events set registered_count = greatest(registered_count - 1, 0) where id = old.event_id;
    end if;
    return old;
  end if;

  return null;
end;
$$;

create trigger registrations_capacity_insert_update
  before insert or update on public.registrations
  for each row execute function private.handle_registration_change();

create trigger registrations_capacity_delete
  after delete on public.registrations
  for each row execute function private.handle_registration_change();

revoke execute on all functions in schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;

-- PROFILES: los organizadores son públicos; cada quien ve y edita el suyo
create policy "profiles: organizadores públicos o propio"
  on public.profiles for select
  to anon, authenticated
  using (role = 'organizador' or id = (select auth.uid()));

create policy "profiles: editar el propio"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- EVENTS: todos ven los no-borrador; el organizador ve también sus borradores
create policy "events: ver publicados o propios"
  on public.events for select
  to anon, authenticated
  using (status <> 'borrador' or organizer_id = (select auth.uid()));

create policy "events: organizadores crean los suyos"
  on public.events for insert
  to authenticated
  with check (
    organizer_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
       where p.id = (select auth.uid()) and p.role = 'organizador'
    )
  );

create policy "events: organizador edita los suyos"
  on public.events for update
  to authenticated
  using (organizer_id = (select auth.uid()))
  with check (organizer_id = (select auth.uid()));

create policy "events: organizador elimina los suyos"
  on public.events for delete
  to authenticated
  using (organizer_id = (select auth.uid()));

-- REGISTRATIONS: el participante ve las suyas; el organizador ve las de sus eventos
create policy "registrations: propias o de mis eventos"
  on public.registrations for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.events e
       where e.id = registrations.event_id
         and e.organizer_id = (select auth.uid())
    )
  );

create policy "registrations: inscribirme"
  on public.registrations for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "registrations: actualizar las mías"
  on public.registrations for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- GRANTS (Data API). Privilegios por columna para que el cliente no
-- pueda tocar contadores, ids ni banderas internas.
-- ---------------------------------------------------------------------
revoke all on public.profiles, public.events, public.registrations from anon, authenticated;

grant select on public.profiles to anon, authenticated;
grant update (full_name, role, organization_name, organization_type, phone, website, bio)
  on public.profiles to authenticated;

grant select on public.events to anon, authenticated;
grant insert (
  slug, organizer_id, organizer_name, title, summary, description, event_type, modality,
  starts_at, ends_at, city, venue_name, address, latitude, longitude, online_url, capacity,
  requirements, is_free, price_info, image_url, source_url, contact_email, sustainability, status
) on public.events to authenticated;
grant update (
  organizer_name, title, summary, description, event_type, modality,
  starts_at, ends_at, city, venue_name, address, latitude, longitude, online_url, capacity,
  requirements, is_free, price_info, image_url, source_url, contact_email, sustainability, status
) on public.events to authenticated;
grant delete on public.events to authenticated;

grant select on public.registrations to authenticated;
grant insert (event_id, user_id, full_name, email, phone) on public.registrations to authenticated;
grant update (status, full_name, phone) on public.registrations to authenticated;

-- ---------------------------------------------------------------------
-- STORAGE: imágenes de portada de eventos (lectura pública,
-- escritura solo en la carpeta {uid}/ del usuario autenticado)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('event-images', 'event-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "event-images: subir a mi carpeta"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "event-images: ver mis archivos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "event-images: actualizar mis archivos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "event-images: borrar mis archivos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
