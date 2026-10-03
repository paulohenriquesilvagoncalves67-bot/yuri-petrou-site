-- Vídeos dos imóveis, sujeitos à mesma revisão e propriedade das fotos.
create table public.property_videos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  storage_path text not null unique,
  content_type text not null check (content_type in ('video/mp4','video/webm','video/quicktime')),
  byte_size bigint not null check (byte_size > 0 and byte_size <= 52428800),
  position integer not null default 0 check (position >= 0),
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  unique (property_id, sha256),
  check (storage_path like property_id::text || '/%')
);
create index property_videos_order_idx on public.property_videos(property_id, position, created_at);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('property-videos','property-videos',false,52428800,array['video/mp4','video/webm','video/quicktime']);

create function app_private.can_read_video(pid uuid) returns boolean language sql stable security definer
set search_path = '' as $$
  select exists(select 1 from public.properties where id=pid and
    ((publication_status='published' and property_status='available') or app_private.can_manage_property(id)));
$$;
create function app_private.can_read_video_file(path text) returns boolean language sql stable security definer
set search_path = '' as $$
  select exists(select 1 from public.property_videos v join public.properties p on p.id=v.property_id
    where v.storage_path=path and
    ((p.publication_status='published' and p.property_status='available') or app_private.can_manage_property(p.id)));
$$;
create function app_private.enforce_video() returns trigger language plpgsql security definer
set search_path = '' as $$
begin
  if tg_op='INSERT' or new.storage_path is distinct from old.storage_path then
    if not exists(select 1 from storage.objects where bucket_id='property-videos' and name=new.storage_path) then
      raise exception 'Upload video before registering it';
    end if;
  end if;
  return new;
end; $$;
create trigger video_guard before insert or update on public.property_videos
for each row execute function app_private.enforce_video();

alter table public.property_videos enable row level security;
create policy video_read on public.property_videos for select to anon,authenticated
using (app_private.can_read_video(property_id));
create policy video_insert on public.property_videos for insert to authenticated
with check (app_private.can_edit_media(property_id));
create policy video_update on public.property_videos for update to authenticated
using (app_private.can_edit_media(property_id)) with check (app_private.can_edit_media(property_id));
create policy video_delete on public.property_videos for delete to authenticated
using (app_private.can_edit_media(property_id));

create policy property_video_storage_select on storage.objects for select to anon,authenticated
using (bucket_id='property-videos' and (app_private.can_read_video_file(name) or
  (split_part(name,'/',1) ~ '^[0-9a-f-]{36}$' and app_private.can_edit_media((split_part(name,'/',1))::uuid))));
create policy property_video_storage_insert on storage.objects for insert to authenticated
with check (bucket_id='property-videos' and split_part(name,'/',1) ~ '^[0-9a-f-]{36}$'
  and app_private.can_edit_media((split_part(name,'/',1))::uuid));
create policy property_video_storage_delete on storage.objects for delete to authenticated
using (bucket_id='property-videos' and split_part(name,'/',1) ~ '^[0-9a-f-]{36}$'
  and app_private.can_edit_media((split_part(name,'/',1))::uuid));

revoke all on function app_private.enforce_video() from public,anon,authenticated;
grant usage on schema app_private to anon,authenticated;
grant execute on function app_private.can_read_video(uuid) to anon,authenticated;
grant execute on function app_private.can_read_video_file(text) to anon,authenticated;
revoke all on public.property_videos from public,anon,authenticated;
grant select on public.property_videos to anon,authenticated;
grant insert,update,delete on public.property_videos to authenticated;
