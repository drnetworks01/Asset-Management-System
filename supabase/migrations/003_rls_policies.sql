-- 003_rls_policies.sql — Row-Level Security

alter table public.floors enable row level security;
alter table public.locations enable row level security;
alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.item_photos enable row level security;
alter table public.audit_log enable row level security;
alter table public.import_runs enable row level security;

create or replace function public.current_user_role()
returns text language sql stable as $$
  select coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    'viewer'
  );
$$;

create policy "authenticated read floors" on public.floors
  for select to authenticated using (true);
create policy "authenticated read locations" on public.locations
  for select to authenticated using (true);
create policy "authenticated read categories" on public.categories
  for select to authenticated using (true);
create policy "authenticated read items" on public.items
  for select to authenticated using (deleted_at is null);
create policy "authenticated read item_photos" on public.item_photos
  for select to authenticated using (true);
create policy "admin read audit_log" on public.audit_log
  for select to authenticated using (public.current_user_role() = 'admin');
create policy "authenticated read import_runs" on public.import_runs
  for select to authenticated using (true);

create policy "admin/staff insert items" on public.items
  for insert to authenticated
  with check (public.current_user_role() in ('admin','staff'));
create policy "admin/staff update items" on public.items
  for update to authenticated
  using (public.current_user_role() in ('admin','staff'));

create policy "admin delete items" on public.items
  for delete to authenticated
  using (public.current_user_role() = 'admin');

create policy "admin write locations" on public.locations
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "admin write floors" on public.floors
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "authenticated insert photos" on public.item_photos
  for insert to authenticated with check (true);
create policy "admin delete photos" on public.item_photos
  for delete to authenticated
  using (public.current_user_role() = 'admin');
