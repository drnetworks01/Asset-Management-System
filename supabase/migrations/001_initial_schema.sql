-- 001_initial_schema.sql
-- Office Assets — initial schema

create table public.floors (
  id uuid primary key default gen_random_uuid(),
  level int not null unique,
  name text not null,
  background_image_url text,
  created_at timestamptz not null default now()
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  floor_id uuid not null references public.floors(id) on delete cascade,
  name text not null,
  slug text not null unique,
  shape text not null check (shape in ('rect','l_shape','circle','polygon')),
  shape_data jsonb not null,
  color text not null default '#0F766E',
  icon text,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index locations_floor_id_idx on public.locations(floor_id);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text,
  color text
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete restrict,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  qty int not null default 1 check (qty >= 0),
  condition text not null default 'good' check (condition in ('good','broken','repair')),
  notes text,
  qr_code text unique,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index items_location_id_idx on public.items(location_id);
create index items_category_id_idx on public.items(category_id);
create index items_qr_code_idx on public.items(qr_code) where qr_code is not null;
create index items_condition_idx on public.items(condition);

create table public.item_photos (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  storage_path text not null,
  caption text,
  uploaded_at timestamptz not null default now()
);
create index item_photos_item_id_idx on public.item_photos(item_id);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('item','location','floor','category','import')),
  entity_id uuid,
  action text not null check (action in ('create','update','delete','import','revert')),
  before jsonb,
  after jsonb,
  user_email text,
  created_at timestamptz not null default now()
);
create index audit_log_entity_idx on public.audit_log(entity_type, entity_id);
create index audit_log_created_at_idx on public.audit_log(created_at desc);

create table public.import_runs (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  total_rows int,
  added int not null default 0,
  updated int not null default 0,
  skipped int not null default 0,
  status text not null default 'pending' check (status in ('pending','applied','reverted')),
  diff_snapshot jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger items_touch_updated_at
  before update on public.items
  for each row execute function public.touch_updated_at();

create trigger locations_touch_updated_at
  before update on public.locations
  for each row execute function public.touch_updated_at();
