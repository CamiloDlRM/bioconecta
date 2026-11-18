-- =====================================================================
-- BioConecta — fotos y comentarios de asistentes en cada evento
-- Pueden publicar: personas con inscripción confirmada y el organizador.
-- Cualquiera puede leer. El autor o el organizador pueden eliminar.
-- Las fotos usan el bucket event-images en la carpeta {uid}/posts/.
-- =====================================================================

create table public.event_posts (
  id bigint generated always as identity primary key,
  event_id bigint not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  author_name text not null,
  body text check (char_length(body) <= 1000),
  image_url text,
  image_path text,
  image_alt text check (char_length(image_alt) <= 200),
  created_at timestamptz not null default now(),
  constraint event_posts_has_content
    check (char_length(coalesce(btrim(body), '')) > 0 or image_url is not null)
);

create index event_posts_event_created_idx on public.event_posts (event_id, created_at desc);
create index event_posts_user_id_idx on public.event_posts (user_id);

-- El nombre del autor siempre sale del perfil (no se puede suplantar desde el cliente)
create or replace function private.set_post_author()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  select coalesce(nullif(btrim(p.full_name), ''), 'Participante')
    into new.author_name
    from public.profiles p
   where p.id = new.user_id;
  if new.author_name is null then
    new.author_name := 'Participante';
  end if;
  return new;
end;
$$;

create trigger event_posts_set_author
  before insert on public.event_posts
  for each row execute function private.set_post_author();

revoke execute on all functions in schema private from public, anon, authenticated;

alter table public.event_posts enable row level security;

create policy "event_posts: lectura de eventos visibles"
  on public.event_posts for select
  to anon, authenticated
  using (exists (select 1 from public.events e where e.id = event_posts.event_id));

create policy "event_posts: inscritos u organizador publican"
  on public.event_posts for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      exists (
        select 1 from public.registrations r
         where r.event_id = event_posts.event_id
           and r.user_id = (select auth.uid())
           and r.status = 'confirmada'
      )
      or exists (
        select 1 from public.events e
         where e.id = event_posts.event_id
           and e.organizer_id = (select auth.uid())
      )
    )
  );

create policy "event_posts: autor u organizador eliminan"
  on public.event_posts for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.events e
       where e.id = event_posts.event_id
         and e.organizer_id = (select auth.uid())
    )
  );

revoke all on public.event_posts from anon, authenticated;
grant select on public.event_posts to anon, authenticated;
grant insert (event_id, user_id, body, image_url, image_path, image_alt) on public.event_posts to authenticated;
grant delete on public.event_posts to authenticated;
