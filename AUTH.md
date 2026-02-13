# Authentication & User Management

## Database Schema

### Users Table
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role user_role (ADMIN | MANAGER | USER | GUEST),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Sessions Table
```sql
sessions (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)
```

## Setup Instructions

### 1. Seed Demo User (Development Only)

Make a POST request to seed demo users:

```bash
curl -X POST http://localhost:3001/api/seed
```

This creates:
- Admin user: `admin@example.com` / `password123`
- Regular user: `user@example.com` / `password123`

**Note:** Seeding is only available in development mode!

### 2. Access Login Page

Navigate to: `http://localhost:3001/login`

### 3. Test Credentials

Use the demo credentials from the seed endpoint or login page.

## Authentication Endpoints

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "token-here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "ADMIN"
  }
}
```

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User"
}

Response:
{
  "id": "uuid",
  "message": "User registered successfully"
}
```

### Get Current User
```
GET /api/auth/me
Authorization: Bearer token-here

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "ADMIN"
  }
}
```

### Logout
```
POST /api/auth/logout

Response:
{
  "message": "Logged out successfully"
}
```

### Seed Database (Development Only)
```
POST /api/seed

Response:
{
  "success": true,
  "message": "Database seeded successfully",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin User"
  }
}
```

## Pages

- `/login` - Login page
- `/admin` - Admin dashboard (protected with token check)

## Client-Side Storage

Authentication tokens are stored in `localStorage`:
- `token` - Authentication token for API requests
- `user` - User object (JSON stringified)

Usage example:
```typescript
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');
```

## Architecture

```
Users (Frontend)
    ↓
Login Page (/login)
    ↓
POST /api/auth/login
    ↓
Verify Email & Password
    ↓
Generate Token
    ↓
Store in localStorage
    ↓
Redirect to /admin
    ↓
Protected Pages
    ↓
GET /api/auth/me (verify token)
```

## Security Considerations

⚠️ **Current Implementation:**
- Uses SHA-256 for password hashing (NOT secure!)
- Uses Base64 token encoding (NOT JWT!)
- Stores tokens in localStorage (vulnerable to XSS!)

**For Production Upgrade To:**
- bcrypt for password hashing (`npm install bcrypt`)
- JWT (jsonwebtoken) for token management (`npm install jsonwebtoken`)
- HttpOnly cookies for session storage
- CSRF protection
- Rate limiting on login attempts
- Email verification
- Password reset flow

## Next Steps

1. ✅ Database schema with users and sessions
2. ✅ Login page UI
3. ✅ Authentication API endpoints
4. ✅ Admin dashboard with logout
5. ⬜ Protected API routes middleware
6. ⬜ Refresh token mechanism
7. ⬜ Password recovery/reset
8. ⬜ Email verification
9. ⬜ Role-based access control (RBAC) middleware

