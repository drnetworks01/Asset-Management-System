-- 002_seed_static.sql — bootstrap floors

insert into public.floors (level, name) values
  (1, 'Floor 1'),
  (2, 'Floor 2'),
  (3, 'Floor 3')
on conflict (level) do nothing;
