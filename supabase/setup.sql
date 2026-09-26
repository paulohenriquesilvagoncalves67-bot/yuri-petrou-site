-- Execute once in the SQL editor of a NEW, dedicated Yuri Petrou project.
-- Never run this against lineup-interno or another existing application.
create extension if not exists pgcrypto with schema extensions;
create schema if not exists app_private;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  role text not null default 'contributor' check (role in ('admin','contributor')),
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null default '', title_en text not null default '',
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '', description_en text not null default '',
  short_description text not null default '',
  property_type text not null default 'Casa',
  purpose text not null default 'sale' check (purpose in ('sale','rent','holiday')),
  neighborhood text not null default '', city text not null default 'Armação dos Búzios',
  bedrooms integer not null default 0 check (bedrooms between 0 and 100),
  suites integer not null default 0 check (suites between 0 and 100),
  bathrooms integer not null default 0 check (bathrooms between 0 and 100),
  parking_spaces integer not null default 0 check (parking_spaces between 0 and 100),
  area numeric(12,2) check (area >= 0), land_area numeric(12,2) check (land_area >= 0),
  features text[] not null default '{}',
  publication_status text not null default 'draft' check (publication_status in ('draft','pending_review','published','rejected')),
  property_status text not null default 'available' check (property_status in ('available','inactive','sold','rented')),
  featured boolean not null default false,
  seo_title text, seo_description text, review_note text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  published_at timestamptz
);
create index properties_public_idx on public.properties (featured desc, published_at desc)
  where publication_status='published' and property_status='available';
create index properties_owner_idx on public.properties (created_by, updated_at desc);
create index properties_review_idx on public.properties (publication_status, updated_at desc);

create table public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  storage_path text not null unique,
  thumbnail_path text not null unique,
  position integer not null default 0 check (position >= 0),
  is_cover boolean not null default false,
  alt_text text not null default '',
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  unique (property_id, sha256),
  check (storage_path like property_id::text || '/%'),
  check (thumbnail_path like property_id::text || '/%')
);
create unique index property_one_cover_idx on public.property_images(property_id) where is_cover;
create index property_images_order_idx on public.property_images(property_id, position, created_at);

create table public.property_activity (
  id bigint generated always as identity primary key,
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  created_at timestamptz not null default now()
);
create index property_activity_property_idx on public.property_activity(property_id, created_at desc);
create index property_activity_user_idx on public.property_activity(user_id);

-- Public API stores only editorial fields, never ownership or review notes.
-- A projection table avoids a security-definer view bypassing the source table's RLS.
create table public.published_properties (
  id uuid primary key references public.properties(id) on delete cascade,
  title text not null, title_en text not null, slug text not null unique,
  description text not null, description_en text not null, short_description text not null,
  property_type text not null, purpose text not null, neighborhood text not null, city text not null,
  bedrooms integer not null, suites integer not null, bathrooms integer not null,
  parking_spaces integer not null, area numeric(12,2), land_area numeric(12,2),
  features text[] not null, featured boolean not null, seo_title text, seo_description text,
  published_at timestamptz
);
create index published_properties_order_idx on public.published_properties(featured desc,published_at desc);

create or replace function app_private.is_admin() returns boolean language sql stable security definer
set search_path = '' as $$
  select exists(select 1 from public.profiles where id = (select auth.uid()) and role='admin' and approved);
$$;
create or replace function app_private.is_approved() returns boolean language sql stable security definer
set search_path = '' as $$
  select exists(select 1 from public.profiles where id = (select auth.uid()) and approved);
$$;
create or replace function app_private.can_manage_property(pid uuid) returns boolean language sql stable security definer
set search_path = '' as $$
  select app_private.is_admin() or exists(
    select 1 from public.properties where id=pid and created_by=(select auth.uid()) and app_private.is_approved());
$$;
create or replace function app_private.can_edit_media(pid uuid) returns boolean language sql stable security definer
set search_path = '' as $$
  select exists(select 1 from public.properties where id=pid and publication_status<>'published' and
    (app_private.is_admin() or (created_by=(select auth.uid()) and app_private.is_approved())));
$$;
create or replace function app_private.can_read_media(path text) returns boolean language sql stable security definer
set search_path = '' as $$
  select exists(select 1 from public.property_images i join public.properties p on p.id=i.property_id
    where (i.storage_path=path or i.thumbnail_path=path) and
    ((p.publication_status='published' and p.property_status='available') or app_private.can_manage_property(p.id)));
$$;
create or replace function app_private.can_read_image(pid uuid) returns boolean language sql stable security definer
set search_path = '' as $$
  select exists(select 1 from public.properties where id=pid and
    ((publication_status='published' and property_status='available') or app_private.can_manage_property(id)));
$$;

create or replace function app_private.new_profile() returns trigger language plpgsql security definer
set search_path = '' as $$
begin
  insert into public.profiles(id,email,name) values(new.id, coalesce(new.email,''), coalesce(new.raw_user_meta_data->>'name',''));
  return new;
end; $$;
create trigger auth_user_profile after insert on auth.users for each row execute function app_private.new_profile();

create or replace function app_private.touch_profile() returns trigger language plpgsql
set search_path = '' as $$ begin new.updated_at=now(); return new; end; $$;
create trigger profile_updated before update on public.profiles for each row execute function app_private.touch_profile();

create or replace function app_private.enforce_property() returns trigger language plpgsql security definer
set search_path = '' as $$
declare admin_user boolean := app_private.is_admin() or auth.role()='service_role';
begin
  if tg_op='INSERT' then
    if not admin_user and (not app_private.is_approved() or new.created_by<>auth.uid() or new.publication_status<>'draft' or new.featured or new.seo_title is not null or new.seo_description is not null or new.review_note is not null or new.published_at is not null) then
      raise exception 'Only approved users can create draft properties owned by themselves';
    end if;
  else
    if not admin_user then
      if not app_private.is_approved() or old.created_by<>auth.uid() or new.created_by<>old.created_by
        or new.slug<>old.slug or new.featured is distinct from old.featured
        or new.seo_title is distinct from old.seo_title or new.seo_description is distinct from old.seo_description
        or new.review_note is distinct from old.review_note or new.published_at is distinct from old.published_at then
        raise exception 'Contributor cannot change ownership or admin-only fields';
      end if;
      if new.publication_status='published' and old.publication_status<>'published' then
        raise exception 'Only admin can publish';
      end if;
      if new.publication_status='rejected' and old.publication_status<>'rejected' then
        raise exception 'Only admin can reject';
      end if;
      if old.publication_status='published' then
        if new.publication_status<>'published' and new.publication_status<>'pending_review' then
          raise exception 'Published property may only be sent for review';
        end if;
        if new.publication_status='published' and
          (new.title,new.title_en,new.description,new.description_en,new.short_description,new.property_type,new.purpose,new.neighborhood,new.city,new.bedrooms,new.suites,new.bathrooms,new.parking_spaces,new.area,new.land_area,new.features)
          is distinct from
          (old.title,old.title_en,old.description,old.description_en,old.short_description,old.property_type,old.purpose,old.neighborhood,old.city,old.bedrooms,old.suites,old.bathrooms,old.parking_spaces,old.area,old.land_area,old.features) then
          raise exception 'Send published property for review before editing';
        end if;
      end if;
    end if;
  end if;
  if new.publication_status in ('pending_review','published') then
    if length(trim(new.title))<3 or length(trim(new.description))<30 or length(trim(new.city))<2 then
      raise exception 'Title, description and city are required for review';
    end if;
    if not exists(select 1 from public.property_images where property_id=new.id and is_cover) then
      raise exception 'A cover image is required for review';
    end if;
  end if;
  if new.publication_status='published' then
    if tg_op='INSERT' then new.published_at=now();
    elsif old.publication_status<>'published' then new.published_at=now(); end if;
  end if;
  new.updated_at=now();
  return new;
end; $$;
create trigger property_guard before insert or update on public.properties for each row execute function app_private.enforce_property();

create or replace function app_private.log_property() returns trigger language plpgsql security definer
set search_path = '' as $$
declare action_name text;
begin
  if tg_op='INSERT' then action_name:='created';
  elsif new.publication_status is distinct from old.publication_status then action_name:=new.publication_status;
  elsif new.property_status is distinct from old.property_status then action_name:=new.property_status;
  else action_name:='edited'; end if;
  insert into public.property_activity(property_id,user_id,action) values(new.id,auth.uid(),action_name);
  return new;
end; $$;
create trigger property_history after insert or update on public.properties for each row execute function app_private.log_property();

create or replace function app_private.sync_published_property() returns trigger language plpgsql security definer
set search_path = '' as $$
begin
  if tg_op='DELETE' then
    delete from public.published_properties where id=old.id;
    return old;
  end if;
  delete from public.published_properties where id=new.id;
  if new.publication_status='published' and new.property_status='available' then
    insert into public.published_properties
      (id,title,title_en,slug,description,description_en,short_description,property_type,purpose,
       neighborhood,city,bedrooms,suites,bathrooms,parking_spaces,area,land_area,features,
       featured,seo_title,seo_description,published_at)
    values
      (new.id,new.title,new.title_en,new.slug,new.description,new.description_en,new.short_description,new.property_type,new.purpose,
       new.neighborhood,new.city,new.bedrooms,new.suites,new.bathrooms,new.parking_spaces,new.area,new.land_area,new.features,
       new.featured,new.seo_title,new.seo_description,new.published_at);
  end if;
  return new;
end; $$;
create trigger property_public_projection after insert or update or delete on public.properties
for each row execute function app_private.sync_published_property();

create or replace function app_private.enforce_image() returns trigger language plpgsql security definer
set search_path = '' as $$
declare verify_paths boolean := tg_op='INSERT';
begin
  if tg_op='UPDATE' then
    verify_paths := new.storage_path is distinct from old.storage_path or new.thumbnail_path is distinct from old.thumbnail_path;
  end if;
  if verify_paths then
    if not exists(select 1 from storage.objects where bucket_id='property-images' and name=new.storage_path)
      or not exists(select 1 from storage.objects where bucket_id='property-images' and name=new.thumbnail_path) then
      raise exception 'Upload both image sizes before registering a photo';
    end if;
  end if;
  return new;
end; $$;
create trigger image_guard before insert or update on public.property_images for each row execute function app_private.enforce_image();

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.property_activity enable row level security;
alter table public.published_properties enable row level security;

create policy profile_read on public.profiles for select to authenticated using (id=(select auth.uid()) or app_private.is_admin());
create policy profile_admin_update on public.profiles for update to authenticated using (app_private.is_admin()) with check (app_private.is_admin());
create policy property_read on public.properties for select to authenticated using (app_private.can_manage_property(id));
create policy property_create on public.properties for insert to authenticated with check
  (app_private.is_admin() or (app_private.is_approved() and created_by=(select auth.uid()) and publication_status='draft'));
create policy property_update on public.properties for update to authenticated using (app_private.can_manage_property(id)) with check (app_private.can_manage_property(id));
create policy property_delete on public.properties for delete to authenticated using (app_private.is_admin());
create policy image_read on public.property_images for select to anon,authenticated using (app_private.can_read_image(property_id));
create policy image_insert on public.property_images for insert to authenticated with check (app_private.can_edit_media(property_id));
create policy image_update on public.property_images for update to authenticated using (app_private.can_edit_media(property_id)) with check (app_private.can_edit_media(property_id));
create policy image_delete on public.property_images for delete to authenticated using (app_private.can_edit_media(property_id));
create policy activity_read on public.property_activity for select to authenticated using (app_private.can_manage_property(property_id));
create policy published_read on public.published_properties for select to anon,authenticated using (true);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('property-images','property-images',false,15728640,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy property_storage_select on storage.objects for select to anon,authenticated
using (bucket_id='property-images' and (app_private.can_read_media(name) or
  (split_part(name,'/',1) ~ '^[0-9a-f-]{36}$' and app_private.can_edit_media((split_part(name,'/',1))::uuid))));
create policy property_storage_insert on storage.objects for insert to authenticated
with check (bucket_id='property-images' and app_private.can_edit_media((split_part(name,'/',1))::uuid));
create policy property_storage_delete on storage.objects for delete to authenticated
using (bucket_id='property-images' and app_private.can_edit_media((split_part(name,'/',1))::uuid));

grant usage on schema app_private to anon, authenticated;
grant execute on function app_private.is_admin() to anon,authenticated;
grant execute on function app_private.is_approved() to anon,authenticated;
grant execute on function app_private.can_manage_property(uuid) to anon,authenticated;
grant execute on function app_private.can_edit_media(uuid) to anon,authenticated;
grant execute on function app_private.can_read_media(text) to anon,authenticated;
grant execute on function app_private.can_read_image(uuid) to anon,authenticated;
revoke all on function app_private.new_profile() from public,anon,authenticated;
revoke all on function app_private.touch_profile() from public,anon,authenticated;
revoke all on function app_private.enforce_property() from public,anon,authenticated;
revoke all on function app_private.log_property() from public,anon,authenticated;
revoke all on function app_private.enforce_image() from public,anon,authenticated;
revoke all on function app_private.sync_published_property() from public,anon,authenticated;
revoke all on public.profiles,public.properties,public.property_images,public.property_activity from public,anon,authenticated;
revoke all on public.published_properties from public,anon,authenticated;
grant select on public.published_properties,public.property_images to anon,authenticated;
grant select on public.profiles,public.properties to authenticated;
grant select on public.property_activity to authenticated;
grant insert,update,delete on public.properties,public.property_images to authenticated;
grant update(name,role,approved) on public.profiles to authenticated;
