# 🚀 Quick Start Guide

## Project Setup Complete! ✅

Your Next.js project is now fully configured with Neon database and Vercel Blob storage.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Get Your Credentials

### Neon Database
1. Go to https://console.neon.tech
2. Create a new project
3. Create a database
4. Copy the connection string

### Vercel Blob
1. Go to https://vercel.com/docs/storage/vercel-blob
2. Create a blob store and token
3. Copy the token

## Step 3: Configure Environment

Edit `.env.local` with your credentials:

```env
DATABASE_URL=postgresql://your_neon_connection_string
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Step 4: Initialize Database

```bash
npm run db:push
```

This will create all tables in your Neon database.

## Step 5: Run Development Server

```bash
npm run dev
```

Visit:
- **Frontend**: http://localhost:3000
- **Products**: http://localhost:3000/products  
- **Admin**: http://localhost:3000/admin

## 📁 Project Structure

```
company-api/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Home
│   │   ├── products/          # Products page
│   │   ├── admin/             # Admin panel
│   │   │   ├── layout.tsx     # Sidebar layout
│   │   │   ├── page.tsx       # Dashboard
│   │   │   └── products/      # Product mgmt
│   │   └── api/               # API routes
│   │       ├── products/      # Product CRUD
│   │       └── upload/        # Image upload
│   ├── db/                     # Database
│   │   ├── db.ts             # Database client
│   │   ├── schema.ts         # Drizzle schema
│   │   └── migrate.ts        # Migration script
│   ├── lib/                    # Utilities
│   │   ├── blob.ts           # Vercel Blob helpers
│   │   └── schemas.ts        # Zod schemas
│   └── types/                  # TypeScript types
├── database/                   # SQL reference
│   ├── schema.sql            # Original SQL schema
│   ├── types.ts              # TypeScript types
│   └── example-queries.sql
├── drizzle.config.ts          # Drizzle config
├── next.config.ts             # Next.js config
├── tsconfig.json              # TypeScript config
└── tailwind.config.ts         # Tailwind config
```

## 🗄️ Database Tables

- **products** - Main products table
- **product_categories** - Product categories
- **product_areas** - Product area associations
- **product_images** - Product images (URL stored)
- **blog_posts** - Blog posts
- **blog_post_relations** - Related posts

## 🖼️ Image Upload Flow

1. Upload image in admin panel
2. Image sent to `/api/upload`
3. Uploaded to Vercel Blob
4. URL stored in database
5. Images served from CDN

## 📚 Available API Endpoints

### Products
- `GET /api/products` - List all
- `POST /api/products` - Create
- `GET /api/products/[id]` - Get one
- `PUT /api/products/[id]` - Update
- `DELETE /api/products/[id]` - Delete

### Images
- `POST /api/upload` - Upload image
- `DELETE /api/upload?url=...` - Delete image

## 🛠️ Useful Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Database commands
npm run db:push     # Push schema changes
npm run db:studio   # Open Drizzle Studio
```

## 🔒 Environment Variables

| Variable | Required | Source |
|----------|----------|--------|
| DATABASE_URL | Yes | Neon Console |
| BLOB_READ_WRITE_TOKEN | Yes | Vercel Dashboard |
| NEXT_PUBLIC_APP_URL | No | Local URL |
| NODE_ENV | No | Set automatically |

## 🚢 Deploy to Vercel

```bash
git push origin main
```

Vercel will automatically:
- Build the project
- Configure environment variables
- Deploy to Edge Network
- Set up Blob storage

## 📖 Documentation Links

- [Next.js Docs](https://nextjs.org/docs)
- [Neon Docs](https://neon.tech/docs)
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- [Drizzle ORM](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)

## ⚡ Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Add environment variables to `.env.local`
3. ✅ Push database schema: `npm run db:push`
4. ✅ Start development: `npm run dev`
5. 📝 Build product listing page
6. 📝 Build admin dashboard
7. 📝 Set up authentication (optional)
8. 📝 Add blog post management
9. 🚢 Deploy to Vercel

Happy coding! 🎉
