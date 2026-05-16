import { sql } from 'drizzle-orm';
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { randomUUID } from 'node:crypto';

const uuid = () => text('id').primaryKey().$defaultFn(() => randomUUID());
const now = () => sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`;

export const users = sqliteTable('users', {
  id: uuid(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'staff', 'viewer'] })
    .notNull()
    .default('viewer'),
  createdAt: text('created_at').notNull().default(now()),
});

export const floors = sqliteTable(
  'floors',
  {
    id: uuid(),
    level: integer('level').notNull(),
    name: text('name').notNull(),
    backgroundImageUrl: text('background_image_url'),
    createdAt: text('created_at').notNull().default(now()),
  },
  (t) => ({
    levelIdx: uniqueIndex('floors_level_idx').on(t.level),
  }),
);

export const locations = sqliteTable(
  'locations',
  {
    id: uuid(),
    floorId: text('floor_id')
      .notNull()
      .references(() => floors.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    shape: text('shape', {
      enum: ['rect', 'l_shape', 'circle', 'polygon'],
    }).notNull(),
    shapeData: text('shape_data', { mode: 'json' }).notNull(),
    color: text('color').notNull().default('#0F766E'),
    icon: text('icon'),
    displayOrder: integer('display_order').notNull().default(0),
    createdAt: text('created_at').notNull().default(now()),
    updatedAt: text('updated_at').notNull().default(now()),
  },
  (t) => ({
    slugIdx: uniqueIndex('locations_slug_idx').on(t.slug),
    floorIdx: index('locations_floor_id_idx').on(t.floorId),
  }),
);

export const categories = sqliteTable('categories', {
  id: uuid(),
  name: text('name').notNull().unique(),
  icon: text('icon'),
  color: text('color'),
});

export const items = sqliteTable(
  'items',
  {
    id: uuid(),
    locationId: text('location_id')
      .notNull()
      .references(() => locations.id, { onDelete: 'restrict' }),
    categoryId: text('category_id').references(() => categories.id, {
      onDelete: 'set null',
    }),
    name: text('name').notNull(),
    qty: integer('qty').notNull().default(1),
    condition: text('condition', { enum: ['good', 'broken', 'repair'] })
      .notNull()
      .default('good'),
    notes: text('notes'),
    qrCode: text('qr_code').unique(),
    deletedAt: text('deleted_at'),
    createdAt: text('created_at').notNull().default(now()),
    updatedAt: text('updated_at').notNull().default(now()),
  },
  (t) => ({
    locationIdx: index('items_location_id_idx').on(t.locationId),
    categoryIdx: index('items_category_id_idx').on(t.categoryId),
    conditionIdx: index('items_condition_idx').on(t.condition),
  }),
);

export const itemPhotos = sqliteTable(
  'item_photos',
  {
    id: uuid(),
    itemId: text('item_id')
      .notNull()
      .references(() => items.id, { onDelete: 'cascade' }),
    storagePath: text('storage_path').notNull(),
    caption: text('caption'),
    uploadedAt: text('uploaded_at').notNull().default(now()),
  },
  (t) => ({
    itemIdx: index('item_photos_item_id_idx').on(t.itemId),
  }),
);

export const auditLog = sqliteTable(
  'audit_log',
  {
    id: uuid(),
    entityType: text('entity_type', {
      enum: ['item', 'location', 'floor', 'category', 'import', 'user'],
    }).notNull(),
    entityId: text('entity_id'),
    action: text('action', {
      enum: ['create', 'update', 'delete', 'import', 'revert', 'login'],
    }).notNull(),
    before: text('before', { mode: 'json' }),
    after: text('after', { mode: 'json' }),
    userEmail: text('user_email'),
    createdAt: text('created_at').notNull().default(now()),
  },
  (t) => ({
    entityIdx: index('audit_log_entity_idx').on(t.entityType, t.entityId),
    createdAtIdx: index('audit_log_created_at_idx').on(t.createdAt),
  }),
);

export const importRuns = sqliteTable('import_runs', {
  id: uuid(),
  filename: text('filename').notNull(),
  totalRows: integer('total_rows'),
  added: integer('added').notNull().default(0),
  updated: integer('updated').notNull().default(0),
  skipped: integer('skipped').notNull().default(0),
  status: text('status', { enum: ['pending', 'applied', 'reverted'] })
    .notNull()
    .default('pending'),
  diffSnapshot: text('diff_snapshot', { mode: 'json' }),
  createdAt: text('created_at').notNull().default(now()),
});

export type User = typeof users.$inferSelect;
export type Floor = typeof floors.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Item = typeof items.$inferSelect;
export type ItemPhoto = typeof itemPhotos.$inferSelect;

export type LocationShapeData = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  points?: Array<{ x: number; y: number }>;
};
