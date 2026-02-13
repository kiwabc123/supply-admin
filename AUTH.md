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

## Pages

- `/login` - Login page
- `/admin` - Admin dashboard (protected)

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

## Security Notes

⚠️ **Current Implementation Uses:**
- SHA-256 for password hashing (NOT production-safe!)
- Base64 token encoding (NOT JWT!)

**For Production, Upgrade To:**
- bcrypt for password hashing
- JWT (jsonwebtoken) for token management
- HttpOnly cookies for session storage
- CSRF protection
- Rate limiting on login

## Test Credentials

```
Email: admin@example.com
Password: password123
```

Use these on the login page to test authentication.
