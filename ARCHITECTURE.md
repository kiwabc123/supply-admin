# Project Architecture & Setup Documentation

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend & Admin                         │
│                    (Next.js App Router)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────────┐              │
│  │   Frontend   │         │   Admin Panel    │              │
│  │              │         │                  │              │
│  │ /            │         │ /admin           │              │
│  │ /products    │         │ /admin/products  │              │
│  │ /blog        │         │ /admin/categories│              │
│  └──────────────┘         └──────────────────┘              │
│         │                          │                        │
│         └──────────────┬───────────┘                        │
│                        │                                    │
├─────────────────────────────────────────────────────────────┤
│                     API Layer                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  REST API Routes (src/app/api/)                      │  │
│  │  - GET/POST/PUT/DELETE /api/products                │  │
│  │  - POST/DELETE /api/upload (images)                 │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                   Database Layer                             │
│         (Drizzle ORM + Neon PostgreSQL)                     │
│            Database Client (src/db/db.ts)                   │
│         Schema Definitions (src/db/schema.ts)               │
├─────────────────────────────────────────────────────────────┤
│                  External Services                           │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │   Neon Postgres  │        │  Vercel Blob     │          │
│  │                  │        │  (Image Storage) │          │
│  │ Tables:          │        │                  │          │
│  │ - products       │        │ Stores:          │          │
│  │ - categories     │        │ - Product images │          │
│  │ - blog_posts     │        │ - Uploaded files │          │
│  │ - blog_relations │        │                  │          │
│  │ - product_areas  │        │ CDN delivery:    │          │
│  │ - product_images │        │ *.vercel-storage │          │
│  │   (URLs only)    │        └──────────────────┘          │
│  └──────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow

### Product Creation Flow
```
Admin Panel 
  ↓
POST /api/products
  ↓
Drizzle ORM validates
  ↓
Insert into Neon Database
  ↓
Response: Created Product
```

### Image Upload Flow
```
Admin Panel (File Select)
  ↓
POST /api/upload (FormData with file)
  ↓
File validation
  ↓
Upload to Vercel Blob
  ↓
Get Blob URL
  ↓
Store URL in product_images table
  ↓
Response: Blob URL
```

### Frontend Data Fetching
```
Product List Page (/products)
  ↓
GET /api/products
  ↓
Fetch from Neon via Drizzle
  ↓
Join with product_images
  ↓
Map Blob URLs to images
  ↓
Render Product Cards
```

## 🗂️ File Organization

### Core Configuration
```
drizzle.config.ts           → Drizzle ORM config
next.config.ts              → Next.js config
tsconfig.json               → TypeScript config
tailwind.config.ts          → Tailwind CSS config
postcss.config.js           → PostCSS config
.eslintrc.json              → ESLint config
package.json                → Dependencies
```

### Database Layer (src/db/)
```
db.ts                       → Database client initialization
schema.ts                   → Drizzle ORM schema definitions
migrate.ts                  → Migration runner script
```

### Frontend (src/app/)
```
layout.tsx                  → Root layout
page.tsx                    → Home page
globals.css                 → Global styles
products/
  └── page.tsx              → Products listing page
admin/
  ├── layout.tsx            → Admin sidebar layout
  ├── page.tsx              → Dashboard
  └── products/
      └── page.tsx          → Product management
api/
  ├── products/
  │   ├── route.ts          → GET/POST all products
  │   └── [id]/route.ts     → GET/PUT/DELETE single product
  └── upload/
      └── route.ts          → POST/DELETE images
```

### Utilities (src/lib/)
```
blob.ts                     → Vercel Blob integration
schemas.ts                  → Zod validation schemas
```

### Documentation
```
README.md                   → Full documentation
QUICKSTART.md              → Quick start guide
architecture.md            → This file
```

## 🗄️ Database Schema

### Products Table
```sql
CREATE TABLE products (
  id uuid PRIMARY KEY,
  code varchar UNIQUE NOT NULL,
  name varchar NOT NULL,
  slug varchar UNIQUE NOT NULL,
  short_description varchar,
  description text,
  category_id uuid FOREIGN KEY,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  INDEXES: slug, code, category_id, is_featured, is_active, created_at
)
```

### Product Categories Table
```sql
CREATE TABLE product_categories (
  id uuid PRIMARY KEY,
  name varchar NOT NULL,
  slug varchar UNIQUE NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  INDEXES: slug, display_order
)
```

### Product Areas Table (Many-to-Many)
```sql
CREATE TABLE product_areas (
  id uuid PRIMARY KEY,
  product_id uuid FOREIGN KEY NOT NULL,
  area ENUM (GUEST_ROOM, BATHROOM, LOBBY, RESTAURANT, HOUSEKEEPING, BEDROOM, SPA),
  UNIQUE: product_id, area
  INDEXES: product_id
)
```

### Product Images Table
```sql
CREATE TABLE product_images (
  id uuid PRIMARY KEY,
  product_id uuid FOREIGN KEY NOT NULL,
  url text NOT NULL,           -- Vercel Blob URL
  alt_text varchar,
  display_order integer,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT NOW(),
  INDEXES: product_id, display_order
)
```

### Blog Posts Tables
```sql
CREATE TABLE blog_posts (
  id uuid PRIMARY KEY,
  slug varchar UNIQUE NOT NULL,
  title varchar NOT NULL,
  summary text NOT NULL,
  content text NOT NULL,
  intro text,
  seo_h2 varchar,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  INDEXES: slug, created_at
)

CREATE TABLE blog_post_relations (
  id uuid PRIMARY KEY,
  post_id uuid FOREIGN KEY NOT NULL,
  related_post_id uuid FOREIGN KEY NOT NULL,
  created_at timestamp DEFAULT NOW(),
  UNIQUE: post_id, related_post_id
  INDEXES: post_id, related_post_id
)
```

## 🔐 Environment Variables

```env
# DATABASE
DATABASE_URL=postgresql://username:password@host/database

# STORAGE
BLOB_READ_WRITE_TOKEN=vercel_token_here

# APP
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 🚀 Deployment Architecture

### Vercel Deployment Flow
```
GitHub Repository
  ↓
Push to main branch
  ↓
Vercel detects changes
  ↓
Build process (npm run build)
  ↓
Environment variables injected
  ↓
Deploy to Edge Network
  ↓
Blob storage auto-configured
  ↓
Live at yourdomain.vercel.app
```

## 📊 Type Safety

### Drizzle ORM Types
- Generated from `src/db/schema.ts`
- Provides type-safe database queries
- Runtime validation

### Zod Schemas
- API request/response validation
- Located in `src/lib/schemas.ts`
- Runtime type checking

### TypeScript types
- Path aliases configured in `tsconfig.json`
- `@/*` → `src/*` mapping
- Strict mode enabled

## 🔄 Development Workflow

### Local Development
```bash
npm run dev  # Start dev server on :3000
             # Hot reload enabled
             # Access admin at /admin
```

### Database Changes
```bash
# Make changes to src/db/schema.ts
npm run db:push    # Push changes to Neon
npm run db:studio  # Visual DB editor
```

### Building
```bash
npm run build      # Production build
npm run type-check # Type checking
npm run lint       # Linting
```

## 🎯 Key Features

- ✅ **Type-Safe**: TypeScript + Zod + Drizzle
- ✅ **Real-time Database**: Neon PostgreSQL
- ✅ **Image CDN**: Vercel Blob with CDN
- ✅ **Admin Panel**: Built-in dashboard
- ✅ **API Routes**: RESTful API
- ✅ **Responsive UI**: Tailwind CSS
- ✅ **Fast Deployment**: Single command to Vercel

## 🔗 Related Docs

- [Next.js App Router](https://nextjs.org/docs/app)
- [Drizzle ORM PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql)
- [Neon Database](https://neon.tech/docs)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- [Vercel Deployment](https://vercel.com/docs)
