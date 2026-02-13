import { pgTable, text, varchar, timestamp, boolean, uuid, foreignKey, uniqueIndex, index, integer, pgEnum } from 'drizzle-orm/pg-core';

// =====================================================
// AUTH ENUMS
// =====================================================

export const userRoleEnum = pgEnum('user_role', [
  'ADMIN',
  'MANAGER',
  'USER',
  'GUEST',
]);

// =====================================================
// AUTH TABLES
// =====================================================

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    role: userRoleEnum('role').default('USER'),
    isActive: boolean('is_active').default(true),
    lastLogin: timestamp('last_login'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    emailIdx: index('idx_user_email').on(table.email),
    activeIdx: index('idx_user_is_active').on(table.isActive),
  })
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    token: varchar('token', { length: 500 }).notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
    userIdx: index('idx_session_user_id').on(table.userId),
    tokenIdx: index('idx_session_token').on(table.token),
  })
);

// =====================================================
// PRODUCT ENUMS
// =====================================================

export const productAreaEnum = pgEnum('product_area', [
  'GUEST_ROOM',
  'BATHROOM',
  'LOBBY',
  'RESTAURANT',
  'HOUSEKEEPING',
  'BEDROOM',
  'SPA',
]);

// =====================================================
// PRODUCT TABLES
// =====================================================

export const productCategories = pgTable(
  'product_categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description'),
    displayOrder: integer('display_order').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    slugIdx: index('idx_category_slug').on(table.slug),
    displayOrderIdx: index('idx_category_display_order').on(table.displayOrder),
  })
);

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 500 }).notNull(),
    slug: varchar('slug', { length: 500 }).notNull().unique(),
    shortDescription: varchar('short_description', { length: 1000 }),
    description: text('description'),
    categoryId: uuid('category_id').notNull(),
    isFeatured: boolean('is_featured').default(false),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    categoryFk: foreignKey({
      columns: [table.categoryId],
      foreignColumns: [productCategories.id],
    }),
    slugIdx: index('idx_product_slug').on(table.slug),
    codeIdx: index('idx_product_code').on(table.code),
    categoryIdx: index('idx_product_category_id').on(table.categoryId),
    featuredIdx: index('idx_product_is_featured').on(table.isFeatured),
    activeIdx: index('idx_product_is_active').on(table.isActive),
    createdIdx: index('idx_product_created_at').on(table.createdAt),
  })
);

export const productAreas = pgTable(
  'product_areas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id').notNull(),
    area: productAreaEnum('area').notNull(),
  },
  (table) => ({
    productFk: foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }),
    productIdx: index('idx_product_areas_product_id').on(table.productId),
    uniqueIdx: uniqueIndex('unique_product_area').on(table.productId, table.area),
  })
);

export const productImages = pgTable(
  'product_images',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id').notNull(),
    url: text('url').notNull(),
    altText: varchar('alt_text', { length: 255 }),
    displayOrder: integer('display_order').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    productFk: foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }),
    productIdx: index('idx_product_images_product_id').on(table.productId),
    displayOrderIdx: index('idx_product_images_display_order').on(table.displayOrder),
  })
);

// =====================================================
// BLOG POSTS TABLES
// =====================================================

export const blogPosts = pgTable(
  'blog_posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    title: varchar('title', { length: 500 }).notNull(),
    summary: text('summary').notNull(),
    content: text('content').notNull(),
    intro: text('intro'),
    seoH2: varchar('seo_h2', { length: 500 }),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    slugIdx: index('idx_blog_slug').on(table.slug),
    createdIdx: index('idx_blog_created_at').on(table.createdAt),
  })
);

export const blogPostRelations = pgTable(
  'blog_post_relations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id').notNull(),
    relatedPostId: uuid('related_post_id').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    postFk: foreignKey({
      columns: [table.postId],
      foreignColumns: [blogPosts.id],
    }),
    relatedPostFk: foreignKey({
      columns: [table.relatedPostId],
      foreignColumns: [blogPosts.id],
    }),
    postIdx: index('idx_blog_relations_post_id').on(table.postId),
    relatedPostIdx: index('idx_blog_relations_related_post_id').on(table.relatedPostId),
    uniqueIdx: uniqueIndex('unique_relation').on(table.postId, table.relatedPostId),
  })
);
