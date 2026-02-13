# Database Schema Documentation

This directory contains the SQL schema and TypeScript types for the Company Web project's blog posts and product catalog system.

## Files Overview

### 1. `schema.sql`
Complete MySQL database schema with all tables, relationships, and views.

**Tables:**
- `blog_posts` - Main blog post content
- `blog_post_relations` - Many-to-many relationships between blog posts
- `product_categories` - Product classification
- `products` - Main product records
- `product_areas` - Many-to-many product areas (GUEST_ROOM, BATHROOM, etc.)
- `product_images` - Product images with thumbnail flag
- `product_specifications` - Product specs (Material, Size, etc.)
- `product_features` - Product feature bullets
- `contact_info` - Company contact information

**Views:**
- `v_products_full` - Complete product view with category and thumbnail
- `v_product_areas` - Products grouped by usage areas

### 2. `types.ts`
TypeScript interfaces and types matching the SQL schema for frontend/backend development.

**Exports:**
- `BlogPost`, `BlogPostCreate`, `BlogPostUpdate`
- `BlogPostRelation`, `BlogPostFull`
- `ProductCategory`, `Product`, `ProductFull`
- `ProductArea` (enum: GUEST_ROOM, BATHROOM, LOBBY, RESTAURANT, HOUSEKEEPING, BEDROOM, SPA)
- `ProductImage`, `ProductSpecification`, `ProductFeature`
- `ContactInfo`
- Generic types: `PaginatedResponse`, `ApiResponse`
- View types: `ProductFullView`, `ProductAreaView`

### 3. `example-queries.sql`
Common SQL queries for typical operations:
- **Blog Posts:** Get single post, related posts, paginated list, insert/update
- **Products:** Get product details, images, areas, specs, features
- **Filtering:** By category, by area, featured products
- **Analytics:** Category statistics, relation counts, image counts
- **CRUD Operations:** Insert, update, delete (soft and hard)

---

## Blog Posts Schema

### Table: `blog_posts`

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(36) | UUID primary key |
| `slug` | VARCHAR(255) | URL-friendly identifier (unique) |
| `title` | VARCHAR(500) | Post title |
| `summary` | TEXT | Short summary for listings |
| `content` | LONGTEXT | HTML content of the post |
| `intro` | TEXT | Optional intro paragraph |
| `seoH2` | VARCHAR(500) | Optional H2 for SEO |
| `is_active` | BOOLEAN | Active/inactive status |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last updated timestamp |

### Table: `blog_post_relations`

Stores many-to-many relationships between blog posts for "Related Posts" feature.

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(36) | UUID primary key |
| `post_id` | VARCHAR(36) | FK to blog_posts |
| `related_post_id` | VARCHAR(36) | FK to blog_posts (related) |
| `created_at` | TIMESTAMP | Creation timestamp |

---

## Products Schema

### Table: `product_categories`

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(36) | UUID primary key |
| `name` | VARCHAR(255) | Category name (e.g., "Bedding") |
| `slug` | VARCHAR(255) | URL-friendly identifier (unique) |
| `description` | TEXT | Category description |
| `display_order` | INT | Sort order |
| `is_active` | BOOLEAN | Active/inactive status |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last updated timestamp |

### Table: `products`

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(36) | UUID primary key |
| `code` | VARCHAR(50) | Product code (unique) |
| `name` | VARCHAR(500) | Product name |
| `slug` | VARCHAR(500) | URL-friendly identifier (unique) |
| `short_description` | VARCHAR(1000) | Short product summary |
| `description` | LONGTEXT | Full product description |
| `category_id` | VARCHAR(36) | FK to product_categories |
| `is_featured` | BOOLEAN | Featured in homepage |
| `is_active` | BOOLEAN | Active/inactive status |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last updated timestamp |

### Table: `product_areas`

Stores which areas each product is used for (Many-to-Many).

**Enum Values:** `GUEST_ROOM`, `BATHROOM`, `LOBBY`, `RESTAURANT`, `HOUSEKEEPING`, `BEDROOM`, `SPA`

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(36) | UUID primary key |
| `product_id` | VARCHAR(36) | FK to products |
| `area` | ENUM | Area of use |

### Table: `product_images`

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(36) | UUID primary key |
| `product_id` | VARCHAR(36) | FK to products |
| `url` | TEXT | Image URL (cloud storage) |
| `alt` | VARCHAR(500) | Alt text for accessibility |
| `is_thumbnail` | BOOLEAN | Flag for main thumbnail |
| `display_order` | INT | Display order in gallery |
| `created_at` | TIMESTAMP | Creation timestamp |

### Table: `product_specifications`

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(36) | UUID primary key |
| `product_id` | VARCHAR(36) | FK to products |
| `label` | VARCHAR(255) | Spec label (e.g., "Material") |
| `value` | TEXT | Spec value (e.g., "100% Cotton") |
| `display_order` | INT | Display order |

### Table: `product_features`

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(36) | UUID primary key |
| `product_id` | VARCHAR(36) | FK to products |
| `feature` | TEXT | Feature description |
| `display_order` | INT | Display order |

---

## Data Relationships

```
blog_posts (1) ──── (many) blog_post_relations (many) ──── (1) blog_posts

product_categories (1) ──── (many) products (1)
                                        │
                                        ├──── (many) product_areas
                                        ├──── (many) product_images
                                        ├──── (many) product_specifications
                                        └──── (many) product_features
```

---

## Setup Instructions

### 1. Create Database

```bash
mysql -u root -p < schema.sql
```

### 2. Verify Tables

```sql
SHOW TABLES;
DESCRIBE products;
DESCRIBE blog_posts;
```

### 3. Enable Foreign Keys (if using InnoDB)

```sql
SET FOREIGN_KEY_CHECKS=1;
```

### 4. Use TypeScript Types

```typescript
import { Product, BlogPost, ProductFull } from './types';

interface GetProductResponse {
  success: boolean;
  data: ProductFull;
}
```

---

## Common Queries

### Get All Products by Category

```sql
SELECT p.* FROM products p
JOIN product_categories pc ON p.category_id = pc.id
WHERE pc.slug = 'bedding' AND p.is_active = TRUE;
```

### Get Product with All Details

```sql
SELECT 
    p.*,
    GROUP_CONCAT(DISTINCT pa.area) AS areas,
    JSON_ARRAYAGG(pi.url) AS images,
    JSON_ARRAYAGG(JSON_OBJECT('label', ps.label, 'value', ps.value)) AS specs
FROM products p
LEFT JOIN product_areas pa ON p.id = pa.product_id
LEFT JOIN product_images pi ON p.id = pi.product_id
LEFT JOIN product_specifications ps ON p.id = ps.product_id
WHERE p.slug = 'product-slug'
GROUP BY p.id;
```

### Get Blog Post with Related Posts

```sql
SELECT 
    bp.id, bp.title, bp.slug,
    JSON_ARRAYAGG(JSON_OBJECT('title', bp2.title, 'slug', bp2.slug)) AS related
FROM blog_posts bp
LEFT JOIN blog_post_relations bpr ON bp.id = bpr.post_id
LEFT JOIN blog_posts bp2 ON bpr.related_post_id = bp2.id
WHERE bp.slug = 'post-slug'
GROUP BY bp.id;
```

---

## Indexing Strategy

All tables include indexes on:
- `slug` - For URL-based queries
- `category_id`, `product_id` - For foreign key lookups
- `is_active`, `is_featured` - For filtering
- `created_at` - For sorting by date
- Composite unique indexes - For data integrity

---

## Best Practices

1. **Always use soft deletes** - Set `is_active = FALSE` instead of deleting
2. **Use slugs in URLs** - Not IDs, for better SEO and readability
3. **Normalize images** - Store URLs in cloud storage (e.g., Azure Blob, S3)
4. **Cascade deletions** - Delete product images when product is deleted
5. **Transaction safety** - Use transactions when inserting related data
6. **UTF-8 Support** - All tables use `utf8mb4_unicode_ci` for Thai text support

---

## Migrations

When modifying schema:

1. Create a new migration file: `20260212_add_new_column.sql`
2. Document the change and rollback procedure
3. Test in staging environment first
4. Keep a backup before production deployment

---

## Support & Questions

For questions about the schema structure or TypeScript types, refer to:
- Project TypeScript interfaces: `/interface/`
- Current data structure: `/data/posts.ts`, `/data/products/`
- API responses structure for integration

---

**Last Updated:** February 2026
**Schema Version:** 1.0
