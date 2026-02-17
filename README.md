# Company API & Portal

A modern Next.js application with frontend, admin panel, Neon PostgreSQL database, and Vercel Blob storage for product management.

## Architecture

```
Next.js (Frontend + Admin)
    │
    ├── Neon (Database)
    │    └── products table
    │
    └── Vercel Blob
         └── product images
```

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Storage**: Vercel Blob for images
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript & Zod

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── page.tsx        # Home page
│   ├── products/       # Public products page
│   ├── admin/          # Admin dashboard
│   └── layout.tsx      # Root layout
├── db/                 # Database
│   ├── db.ts          # Database client
│   └── schema.ts      # Drizzle schema
├── lib/                # Utilities
│   └── blob.ts        # Vercel Blob helpers
└── types/             # TypeScript types

database/              # SQL schemas and types
├── schema.sql        # Database schema
├── types.ts          # TypeScript types
└── example-queries.sql
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create `.env.local` with:

```env
# Get from Neon dashboard
DATABASE_URL=postgresql://user:password@host/database

# Get from Vercel Blob
BLOB_READ_WRITE_TOKEN=your_token_here

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Database Setup

#### Create Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Create a database and copy the connection string
4. Paste into `DATABASE_URL` in `.env.local`

#### Push Schema to Database

```bash
npm run db:push
```

### 4. Vercel Blob Setup

1. Go to [Vercel Blob Dashboard](https://vercel.com/docs/storage/vercel-blob)
2. Create a new Blob store
3. Generate a token
4. Paste into `BLOB_READ_WRITE_TOKEN` in `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Available Routes

### Frontend
- `/` - Home page
- `/products` - Products listing

### Admin
- `/admin` - Dashboard
- `/admin/products` - Products management
- `/admin/categories` - Categories management
- `/admin/blog` - Blog posts management

## Database Schema

### Tables
- `products` - Main products table
- `product_categories` - Product categories
- `product_areas` - Product area associations
- `product_images` - Product images (URLs stored in Vercel Blob)
- `blog_posts` - Blog posts
- `blog_post_relations` - Related blog posts

### Enums
- `product_area` - GUEST_ROOM, BATHROOM, LOBBY, RESTAURANT, HOUSEKEEPING, BEDROOM, SPA

## API Documentation (Swagger)

Interactive API documentation is available at:

```
http://localhost:3000/docs
```

The Swagger UI allows you to:
- View all available endpoints
- Test API requests directly from the browser
- See request/response schemas
- Authenticate with JWT tokens
- Check HTTP status codes and error messages

### Available Endpoints

**Authentication:**
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user info (requires auth)
- `POST /api/auth/logout` - Logout user

**Utilities:**
- `POST /api/seed` - Seed database with demo data (dev only)
- `GET /api/health` - Health check

## Development Commands

```bash
# Development server
npm run dev

# Build
npm run build

# Start production
npm start

# Type checking
npm run type-check

# Lint
npm run lint

# Database operations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## File Upload Flow

1. User uploads image in admin panel
2. Image is sent to API route
3. API route uploads to Vercel Blob using `uploadProductImage()`
4. Blob URL is returned and stored in `product_images` table
5. Images are served from Vercel Blob CDN

## API Routes

For complete API documentation with interactive testing, visit `/docs` in your browser after starting the development server.

**Planned endpoints:**
- `POST /api/products` - Create product
- `GET /api/products` - List products
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product
- `POST /api/upload` - Upload images

Access the full API documentation at: **`http://localhost:3000/docs`**

## Deployment

### Deploy to Vercel

```bash
# Push to GitHub, then:
git push origin main
```

Vercel will automatically:
1. Build the project
2. Use your environment variables
3. Deploy to Vercel Edge Network
4. Configure blob storage automatically

## Type Definitions

TypeScript types are maintained in:
- `src/db/schema.ts` - Drizzle schema types
- `database/types.ts` - Application types

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Neon Docs](https://neon.tech/docs)
- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- [Drizzle ORM](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
