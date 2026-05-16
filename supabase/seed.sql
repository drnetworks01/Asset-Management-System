-- Auto-generated from Office_Assets_v2.xlsx
-- Generated at 2026-05-16T11:02:07.275Z

begin;

-- Categories
insert into public.categories (name) values ('AC') on conflict (name) do nothing;
insert into public.categories (name) values ('Appliance') on conflict (name) do nothing;
insert into public.categories (name) values ('Bed') on conflict (name) do nothing;
insert into public.categories (name) values ('Bedding') on conflict (name) do nothing;
insert into public.categories (name) values ('Board') on conflict (name) do nothing;
insert into public.categories (name) values ('Chair') on conflict (name) do nothing;
insert into public.categories (name) values ('Desk') on conflict (name) do nothing;
insert into public.categories (name) values ('Electronics') on conflict (name) do nothing;
insert into public.categories (name) values ('Equipment') on conflict (name) do nothing;
insert into public.categories (name) values ('Fixture') on conflict (name) do nothing;
insert into public.categories (name) values ('Furniture') on conflict (name) do nothing;
insert into public.categories (name) values ('Misc') on conflict (name) do nothing;
insert into public.categories (name) values ('Security') on conflict (name) do nothing;
insert into public.categories (name) values ('Sofa') on conflict (name) do nothing;
insert into public.categories (name) values ('Sports') on conflict (name) do nothing;
insert into public.categories (name) values ('Stock') on conflict (name) do nothing;
insert into public.categories (name) values ('Utensil') on conflict (name) do nothing;

-- Locations (default rectangular layout)
insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)
  select id, 'Boys Hostal – Block 01', 'boys-hostal-block-01', 'rect', '{"x":40,"y":40,"width":200,"height":150,"rotation":0}'::jsonb, 0
  from public.floors where level = 1
  on conflict (slug) do nothing;
insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)
  select id, 'Boys Hostal – Block 02', 'boys-hostal-block-02', 'rect', '{"x":280,"y":40,"width":200,"height":150,"rotation":0}'::jsonb, 1
  from public.floors where level = 1
  on conflict (slug) do nothing;
insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)
  select id, 'Boys Hostal – Block 03', 'boys-hostal-block-03', 'rect', '{"x":520,"y":40,"width":200,"height":150,"rotation":0}'::jsonb, 2
  from public.floors where level = 1
  on conflict (slug) do nothing;
insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)
  select id, 'Boys Hostal – Block 04', 'boys-hostal-block-04', 'rect', '{"x":760,"y":40,"width":200,"height":150,"rotation":0}'::jsonb, 3
  from public.floors where level = 1
  on conflict (slug) do nothing;
insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)
  select id, 'Canteen', 'canteen', 'rect', '{"x":40,"y":230,"width":200,"height":150,"rotation":0}'::jsonb, 4
  from public.floors where level = 1
  on conflict (slug) do nothing;
insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)
  select id, 'Class Room A', 'class-room-a', 'rect', '{"x":280,"y":230,"width":200,"height":150,"rotation":0}'::jsonb, 5
  from public.floors where level = 1
  on conflict (slug) do nothing;
insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)
  select id, 'Class Room B', 'class-room-b', 'rect', '{"x":520,"y":230,"width":200,"height":150,"rotation":0}'::jsonb, 6
  from public.floors where level = 1
  on conflict (slug) do nothing;
insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)
  select id, 'Domestics', 'domestics', 'rect', '{"x":760,"y":230,"width":200,"height":150,"rotation":0}'::jsonb, 7
  from public.floors where level = 1
  on conflict (slug) do nothing;
insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)
  select id, 'Dormitory / Other', 'dormitory-other', 'rect', '{"x":40,"y":420,"width":200,"height":150,"rotation":0}'::jsonb, 8
  from public.floors where level = 1
  on conflict (slug) do nothing;
insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)
  select id, 'Girls Hostal – Common', 'girls-hostal-common', 'rect', '{"x":280,"y":420,"width":200,"height":150,"rotation":0}'::jsonb, 9
  from public.floors where level = 1
  on conflict (slug) do nothing;
insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)
  select id, 'Girls Hostal – Room A', 'girls-hostal-room-a', 'rect', '{"x":520,"y":420,"width":200,"height":150,"rotation":0}'::jsonb, 10
  from public.floors where level = 1
  on conflict (slug) do nothing;
insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)
  select id, 'Girls Hostal – Room B', 'girls-hostal-room-b', 'rect', '{"x":760,"y":420,"width":200,"height":150,"rotation":0}'::jsonb, 11
  from public.floors where level = 1
  on conflict (slug) do nothing;
insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)
  select id, 'Girls Hostal – Room C', 'girls-hostal-room-c', 'rect', '{"x":40,"y":610,"width":200,"height":150,"rotation":0}'::jsonb, 12
  from public.floors where level = 1
  on conflict (slug) do nothing;
insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)
  select id, 'Hostal – General', 'hostal-general', 'rect', '{"x":280,"y":610,"width":200,"height":150,"rotation":0}'::jsonb, 13
  from public.floors where level = 1
  on conflict (slug) do nothing;
insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)
  select id, 'Kitchen', 'kitchen', 'rect', '{"x":520,"y":610,"width":200,"height":150,"rotation":0}'::jsonb, 14
  from public.floors where level = 1
  on conflict (slug) do nothing;
insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)
  select id, 'Office', 'office', 'rect', '{"x":760,"y":610,"width":200,"height":150,"rotation":0}'::jsonb, 15
  from public.floors where level = 1
  on conflict (slug) do nothing;
insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)
  select id, 'Rest Room – CEO', 'rest-room-ceo', 'rect', '{"x":40,"y":800,"width":200,"height":150,"rotation":0}'::jsonb, 16
  from public.floors where level = 1
  on conflict (slug) do nothing;
insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)
  select id, 'Security / CCTV', 'security-cctv', 'rect', '{"x":280,"y":800,"width":200,"height":150,"rotation":0}'::jsonb, 17
  from public.floors where level = 1
  on conflict (slug) do nothing;
insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)
  select id, 'Stock Room', 'stock-room', 'rect', '{"x":520,"y":800,"width":200,"height":150,"rotation":0}'::jsonb, 18
  from public.floors where level = 1
  on conflict (slug) do nothing;
insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)
  select id, 'Store Room', 'store-room', 'rect', '{"x":760,"y":800,"width":200,"height":150,"rotation":0}'::jsonb, 19
  from public.floors where level = 1
  on conflict (slug) do nothing;

-- Items
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Black (plastic)', 4, 'good', null
  from public.locations l where l.slug = 'canteen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Blue', 1, 'good', 'Canteen blue chair'
  from public.locations l where l.slug = 'canteen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Blue', 2, 'broken', 'Blue broken (1+1)'
  from public.locations l where l.slug = 'canteen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Black', 17, 'good', null
  from public.locations l where l.slug = 'canteen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Black', 8, 'good', null
  from public.locations l where l.slug = 'canteen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Brown', 1, 'good', null
  from public.locations l where l.slug = 'canteen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Black', 7, 'good', null
  from public.locations l where l.slug = 'canteen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Canteen type', 36, 'good', null
  from public.locations l where l.slug = 'canteen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Desk'), 'Desk', 12, 'good', '10+2'
  from public.locations l where l.slug = 'canteen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Appliance'), 'Water Filter', 3, 'good', null
  from public.locations l where l.slug = 'canteen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Plastic Chair', 12, 'good', '6+4+2'
  from public.locations l where l.slug = 'canteen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Appliance'), 'Washing Machine', 2, 'good', 'Woskini machines'
  from public.locations l where l.slug = 'canteen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Fixture'), 'Sink', 3, 'good', null
  from public.locations l where l.slug = 'canteen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Double (Student)', 58, 'good', '29x2 double chairs'
  from public.locations l where l.slug = 'class-room-a';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Double (Student)', 8, 'broken', '4x2 double – broken'
  from public.locations l where l.slug = 'class-room-a';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Blue', 1, 'good', null
  from public.locations l where l.slug = 'class-room-a';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Plastic', 4, 'good', null
  from public.locations l where l.slug = 'class-room-a';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Desk'), 'Desk', 1, 'good', null
  from public.locations l where l.slug = 'class-room-a';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Electronics'), 'Smart Board', 1, 'good', null
  from public.locations l where l.slug = 'class-room-a';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Board'), 'White Board', 1, 'good', null
  from public.locations l where l.slug = 'class-room-a';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'AC'), 'AC Machine (Singer R32)', 4, 'good', 'Singer brand, R32 gas'
  from public.locations l where l.slug = 'class-room-a';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Canteen type', 2, 'good', null
  from public.locations l where l.slug = 'class-room-b';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Student', 29, 'good', '28+1'
  from public.locations l where l.slug = 'class-room-b';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Black', 9, 'good', null
  from public.locations l where l.slug = 'class-room-b';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Bed', 1, 'good', null
  from public.locations l where l.slug = 'class-room-b';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Appliance'), 'Fan', 1, 'good', null
  from public.locations l where l.slug = 'class-room-b';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Furniture'), 'Stool', 1, 'good', null
  from public.locations l where l.slug = 'class-room-b';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Appliance'), 'Ceiling Fan', 1, 'good', null
  from public.locations l where l.slug = 'class-room-b';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Desk'), 'Desk', 3, 'good', null
  from public.locations l where l.slug = 'office';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Black Plastic', 2, 'good', null
  from public.locations l where l.slug = 'office';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Blue Student', 2, 'good', null
  from public.locations l where l.slug = 'office';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Plastic', 5, 'good', null
  from public.locations l where l.slug = 'office';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Sofa'), 'Sofa – Red', 3, 'good', null
  from public.locations l where l.slug = 'office';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Sofa'), 'Sofa – Black', 3, 'good', null
  from public.locations l where l.slug = 'office';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Appliance'), 'Fan', 2, 'good', null
  from public.locations l where l.slug = 'office';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'AC'), 'AC Machine', 2, 'good', null
  from public.locations l where l.slug = 'office';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Appliance'), 'Washing Machine', 1, 'good', null
  from public.locations l where l.slug = 'store-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Desk'), 'Desk', 1, 'good', null
  from public.locations l where l.slug = 'store-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Bed', 4, 'good', null
  from public.locations l where l.slug = 'store-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair', 3, 'good', null
  from public.locations l where l.slug = 'store-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'AC'), 'AC Machine', 1, 'good', null
  from public.locations l where l.slug = 'store-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Furniture'), 'Stool', 1, 'good', null
  from public.locations l where l.slug = 'store-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Plastic', 1, 'good', null
  from public.locations l where l.slug = 'store-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Bed', 2, 'good', null
  from public.locations l where l.slug = 'store-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair', 3, 'good', null
  from public.locations l where l.slug = 'store-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Desk'), 'Desk', 1, 'good', null
  from public.locations l where l.slug = 'store-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Blue', 21, 'good', '20+1 blue chairs'
  from public.locations l where l.slug = 'store-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair – Red', 1, 'good', null
  from public.locations l where l.slug = 'store-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Bed – Emergency', 1, 'good', null
  from public.locations l where l.slug = 'store-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Bed – Spring', 1, 'good', null
  from public.locations l where l.slug = 'store-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Class Room Chair (Broken)', 76, 'broken', '38x2 broken classroom chairs'
  from public.locations l where l.slug = 'store-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'AC'), 'AC Machine (Broken)', 2, 'broken', null
  from public.locations l where l.slug = 'store-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Appliance'), 'Fan (Broken)', 1, 'broken', null
  from public.locations l where l.slug = 'store-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Bed (Broken)', 2, 'broken', null
  from public.locations l where l.slug = 'store-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Security'), 'CCTV System', 1, 'good', null
  from public.locations l where l.slug = 'security-cctv';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Security'), 'Camera', 5, 'good', null
  from public.locations l where l.slug = 'security-cctv';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Electronics'), 'TV – Fuji', 1, 'good', 'Model No: B2FU-N1A0A'
  from public.locations l where l.slug = 'security-cctv';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Appliance'), 'Fridge (Sisil)', 1, 'good', 'S/N: 371203A109D251'
  from public.locations l where l.slug = 'security-cctv';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair', 1, 'good', 'Security chair'
  from public.locations l where l.slug = 'security-cctv';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Bed', 3, 'good', 'Beds=+2 noted'
  from public.locations l where l.slug = 'dormitory-other';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Fixture'), 'Glass (Window/Door)', 1, 'good', null
  from public.locations l where l.slug = 'dormitory-other';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Stock'), 'Items (stock)', 10, 'good', 'Miscellaneous stock items'
  from public.locations l where l.slug = 'stock-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Desk'), 'Desk', 1, 'good', null
  from public.locations l where l.slug = 'stock-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Canteen Chair', 3, 'good', null
  from public.locations l where l.slug = 'stock-room';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Double Bed', 5, 'good', null
  from public.locations l where l.slug = 'boys-hostal-block-01';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bedding'), 'Mattress', 9, 'good', null
  from public.locations l where l.slug = 'boys-hostal-block-01';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Misc'), 'Dust Bin', 5, 'good', '02+03'
  from public.locations l where l.slug = 'boys-hostal-block-01';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Sports'), 'Cricket Bat', 2, 'good', null
  from public.locations l where l.slug = 'boys-hostal-block-01';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Sports'), 'Cricket Stump', 3, 'good', null
  from public.locations l where l.slug = 'boys-hostal-block-01';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Furniture'), 'Mirror Table (Kannadi Mesa)', 1, 'good', null
  from public.locations l where l.slug = 'boys-hostal-block-01';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Long Chair', 1, 'good', null
  from public.locations l where l.slug = 'boys-hostal-block-01';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Appliance'), 'Wall Fan', 1, 'good', null
  from public.locations l where l.slug = 'boys-hostal-block-01';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Double Bed', 3, 'good', null
  from public.locations l where l.slug = 'boys-hostal-block-02';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bedding'), 'Mattress', 5, 'good', null
  from public.locations l where l.slug = 'boys-hostal-block-02';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Double Bed', 3, 'good', null
  from public.locations l where l.slug = 'boys-hostal-block-03';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bedding'), 'Mattress', 6, 'good', null
  from public.locations l where l.slug = 'boys-hostal-block-03';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Double Bed', 4, 'good', null
  from public.locations l where l.slug = 'boys-hostal-block-04';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bedding'), 'Mattress', 8, 'good', null
  from public.locations l where l.slug = 'boys-hostal-block-04';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Double Bed', 2, 'good', 'Second section'
  from public.locations l where l.slug = 'boys-hostal-block-04';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bedding'), 'Mattress', 4, 'good', null
  from public.locations l where l.slug = 'boys-hostal-block-04';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Appliance'), 'Wall Fan', 1, 'good', null
  from public.locations l where l.slug = 'boys-hostal-block-04';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Furniture'), 'Long Table', 1, 'good', null
  from public.locations l where l.slug = 'boys-hostal-block-04';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Plastic Chair', 1, 'good', null
  from public.locations l where l.slug = 'boys-hostal-block-04';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Fixture'), 'Face Glass (Mirror)', 1, 'good', null
  from public.locations l where l.slug = 'boys-hostal-block-04';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Misc'), 'Dust Bin', 1, 'good', null
  from public.locations l where l.slug = 'boys-hostal-block-04';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Bed', 4, 'good', null
  from public.locations l where l.slug = 'girls-hostal-room-a';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bedding'), 'Mattress', 4, 'good', null
  from public.locations l where l.slug = 'girls-hostal-room-a';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Furniture'), 'Stool', 1, 'good', null
  from public.locations l where l.slug = 'girls-hostal-room-a';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Chair'), 'Chair', 2, 'good', null
  from public.locations l where l.slug = 'girls-hostal-room-a';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Appliance'), 'Fan', 1, 'good', null
  from public.locations l where l.slug = 'girls-hostal-room-a';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Furniture'), 'Mirror Table (Kannadi Mesaya)', 1, 'good', null
  from public.locations l where l.slug = 'girls-hostal-room-a';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Furniture'), 'Long Table', 1, 'good', null
  from public.locations l where l.slug = 'girls-hostal-room-a';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Bed', 4, 'good', null
  from public.locations l where l.slug = 'girls-hostal-room-b';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bedding'), 'Mattress', 4, 'good', null
  from public.locations l where l.slug = 'girls-hostal-room-b';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Furniture'), 'Dressing Table', 1, 'good', null
  from public.locations l where l.slug = 'girls-hostal-room-b';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Single Bed', 5, 'good', null
  from public.locations l where l.slug = 'girls-hostal-room-c';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bedding'), 'Mattress', 5, 'good', null
  from public.locations l where l.slug = 'girls-hostal-room-c';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Double Bed', 20, 'good', null
  from public.locations l where l.slug = 'girls-hostal-common';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bedding'), 'Mattress', 20, 'good', null
  from public.locations l where l.slug = 'girls-hostal-common';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Furniture'), 'Mirror Table (Kannadi Table)', 1, 'good', null
  from public.locations l where l.slug = 'girls-hostal-common';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Misc'), 'Dust Pan', 2, 'good', null
  from public.locations l where l.slug = 'girls-hostal-common';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Misc'), 'Kossa (Broom)', 1, 'good', null
  from public.locations l where l.slug = 'girls-hostal-common';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Equipment'), 'Step Ladder', 1, 'good', 'Wangediya - 01'
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Misc'), 'Dust Pan', 4, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Equipment'), 'Rake', 1, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Tidal (Strainer/Colander)', 7, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Equipment'), 'Oil Tank (Thel Tank)', 1, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Appliance'), 'Mini Fridge', 1, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Equipment'), 'Gas Cylinder – 5 kg (Laugh)', 1, 'good', '5 kg gas'
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Equipment'), 'Gas Cylinder – 12.5 kg (Litro)', 1, 'good', '12.5 kg gas'
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Equipment'), 'Double Gas Burner Lid', 1, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Rice Pot (Rice Thacchi)', 3, 'good', 'Large'
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Kethalag', 1, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Small Pot (Podi Thacchi)', 2, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Aluminium Pot (Badun)', 8, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Appliance'), 'Rice Cooker', 2, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Knife', 2, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Oil Pot (Thel Hendi)', 2, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Aluminium Big Tray', 2, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Equipment'), 'Water Meter (Unico)', 1, 'good', 'Brand: Unico'
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Saucepan', 1, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Hiramanaya (Grater)', 1, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Lip Pot (Lip Thacchi)', 1, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), '5 kg Saucepan', 1, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Cutting Board (Kerrat Ganaga)', 1, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Aluminium Small Pan (Podi Plyan)', 2, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Plastic Basin (Besama)', 1, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Appliance'), 'Blender Cup', 2, 'good', 'Item 26'
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Drinking Glass', 3, 'good', 'Item 27'
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Koppa (Cup)', 3, 'good', '02+1, Item 28'
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Plastic Long Container (Jage)', 2, 'good', 'Item 29'
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Aluminium Dish', 6, 'good', 'Item 3b'
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Aluminium Plate (small)', 8, 'good', '5+3'
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Plastic Band/Basket', 1, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Spoon (Large)', 6, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Spoon (Small)', 1, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Aluminum Pigan', 5, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Glass', 13, 'good', '7+6'
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Glass Plate', 4, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Utensil'), 'Aluminium Plate', 3, 'good', null
  from public.locations l where l.slug = 'kitchen';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Equipment'), 'Water Tank', 8, 'good', null
  from public.locations l where l.slug = 'domestics';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Equipment'), 'Machine', 1, 'good', 'Type not specified'
  from public.locations l where l.slug = 'domestics';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Equipment'), 'Hosepipe (Horse)', 1, 'good', null
  from public.locations l where l.slug = 'domestics';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Equipment'), 'Boot', 1, 'good', null
  from public.locations l where l.slug = 'domestics';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Equipment'), 'Yakada Inna (Iron Rod)', 1, 'good', null
  from public.locations l where l.slug = 'domestics';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Equipment'), 'Plastic Idala (Bucket)', 4, 'good', '01/02+1'
  from public.locations l where l.slug = 'domestics';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Equipment'), 'Kassa (Broom)', 3, 'good', '01+02'
  from public.locations l where l.slug = 'domestics';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Bed', 20, 'good', null
  from public.locations l where l.slug = 'hostal-general';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bedding'), 'Mattress', 20, 'good', null
  from public.locations l where l.slug = 'hostal-general';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Double Bed', 10, 'good', null
  from public.locations l where l.slug = 'hostal-general';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Misc'), 'Dust Pan', 2, 'good', null
  from public.locations l where l.slug = 'hostal-general';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Misc'), 'Kossa (Broom)', 1, 'good', null
  from public.locations l where l.slug = 'hostal-general';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Water Bed', 1, 'good', null
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Mechanical Bed', 1, 'good', null
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Fixture'), 'Curtain', 1, 'good', null
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bedding'), 'Cushion', 2, 'good', null
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bedding'), 'Pillow', 3, 'good', null
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bedding'), 'Pillow (extra)', 1, 'good', null
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Fixture'), 'Oval Rug / Mat', 1, 'good', null
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Fixture'), 'Lamp', 1, 'good', null
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Furniture'), 'Shelf', 2, 'good', null
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bedding'), 'Bed Sheet Set', 4, 'good', '04 with full set'
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Misc'), 'Decoration Item', 1, 'good', null
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Furniture'), 'Wardrobe (Almari)', 1, 'good', null
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Furniture'), 'Display Stand', 1, 'good', null
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Misc'), 'Towel / Shelf', 60, 'good', 'Toilet shelf - 60'
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Misc'), 'Bottle', 1, 'good', null
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Misc'), 'Air Freshener / Spray', 1, 'good', null
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Electronics'), 'Torch', 1, 'good', null
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Electronics'), 'Multiplug', 1, 'good', null
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Misc'), 'Hanger', 4, 'good', null
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Bed'), 'Bed', 4, 'good', null
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Appliance'), 'Iron', 1, 'good', null
  from public.locations l where l.slug = 'rest-room-ceo';
insert into public.items (location_id, category_id, name, qty, condition, notes)
  select l.id, (select id from public.categories where name = 'Appliance'), 'Water Filter', 2, 'good', null
  from public.locations l where l.slug = 'rest-room-ceo';

commit;
