# JWT Authentication Implementation

## Overview

This project now uses **JWT (JSON Web Tokens)** for secure authentication instead of simple base64 encoding.

## Configuration

### JWT_SECRET

Set a strong secret key in your `.env.local`:

```env
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-at-least-32-chars"
```

**Requirements:**
- Minimum 32 characters recommended
- Use strong random characters
- Change for production
- Store securely (never commit to git)

## JWT Token Structure

Generated tokens contain:
- **userId**: User's UUID
- **email**: User's email address
- **role**: User's role (ADMIN, MANAGER, USER, GUEST)
- **exp**: Token expiration timestamp (7 days)
- **iat**: Token issued at timestamp

Example decoded JWT:
```json
{
  "userId": "0ba5ace1-0ffe-4b01-aaf9-aeec46ccd790",
  "email": "admin@example.com",
  "role": "ADMIN",
  "iat": 1707786563,
  "exp": 1708391363
}
```

## Authentication Flow

```
User Login
    ↓
POST /api/auth/login (email + password)
    ↓
Validate credentials
    ↓
Generate JWT token (7 day expiry)
    ↓
Return token + user info
    ↓
Client stores token in localStorage
    ↓
Attach to API requests: Authorization: Bearer <token>
    ↓
Server verifies token signature
    ↓
Grant access if valid
```

## API Endpoints

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "0ba5ace1-0ffe-4b01-aaf9-aeec46ccd790",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

### Get Current User (Requires Auth)
```bash
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response:
{
  "user": {
    "id": "0ba5ace1-0ffe-4b01-aaf9-aeec46ccd790",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

### Protected Endpoint Example
```bash
GET /api/protected/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response:
{
  "message": "This is a protected endpoint",
  "user": {
    "userId": "0ba5ace1-0ffe-4b01-aaf9-aeec46ccd790",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "timestamp": "2026-02-13T15:43:42.123Z"
}
```

## Using Auth Utilities

### In API Endpoints

#### Without Middleware
```typescript
import { extractToken, verifyToken } from '@/lib/auth';

export default async function handler(req, res) {
  const token = extractToken(req.headers.authorization);
  
  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }
  
  const user = verifyToken(token);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  // user contains: { userId, email, role }
  console.log(`Authenticated as: ${user.email}`);
  return res.status(200).json({ success: true });
}
```

#### With Middleware (Recommended)
```typescript
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

async function handler(req: AuthenticatedRequest, res) {
  // req.user is automatically populated and verified
  console.log(`Authenticated as: ${req.user?.email}`);
  return res.status(200).json({ user: req.user });
}

export default withAuth(handler);
```

### With Role-Based Access Control
```typescript
import { withRole } from '@/lib/middleware';

async function handler(req: AuthenticatedRequest, res) {
  // Only ADMIN users can access this
  return res.status(200).json({ message: 'Admin only access' });
}

export default withRole(['ADMIN'])(handler);
```

## Client-Side Usage

### Storing Token
```typescript
// After successful login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

const { token, user } = await response.json();

// Store token
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));
```

### Using Token in Requests
```typescript
const token = localStorage.getItem('token');

const response = await fetch('/api/protected/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Using Auth Context
```typescript
import { useAuth } from '@/contexts/AuthContext';

function Component() {
  const { user, token, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <p>Please login</p>;
  }
  
  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Security Best Practices

✅ **What We Do:**
- JWT tokens signed with SECRET
- Tokens expire after 7 days
- Passwords hashed with SHA-256
- User role-based access control
- Token verification on protected endpoints

⚠️ **What Could Be Improved:**
- Use bcrypt instead of SHA-256 for passwords
- Implement refresh token rotation
- Add HTTPS in production
- Use HttpOnly cookies instead of localStorage
- Add rate limiting on login attempts
- Implement email verification
- Add two-factor authentication

## Testing

### Quick Test
```bash
# 1. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# 2. Use returned token to access protected endpoint
export TOKEN="<token-from-login>"

curl -X GET http://localhost:3001/api/protected/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Test Invalid Token
```bash
curl -X GET http://localhost:3001/api/protected/profile \
  -H "Authorization: Bearer invalid-token-here"

# Response: 401 "Invalid or expired token"
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | `'your-secret...` | Secret key for signing tokens |
| `NODE_ENV` | `development` | Environment mode |
| `DATABASE_URL` | Required | PostgreSQL connection string |

## Token Expiration

Tokens expire after **7 days**. To change:

Edit `src/lib/auth.ts`:
```typescript
export function generateToken(payload: JWTPayload, expiresIn: string | number = '7d') {
  // Change '7d' to desired expiration (e.g., '24h', '30d')
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions);
}
```

## Troubleshooting

### "Missing authorization token"
- API requires token in `Authorization: Bearer <token>` header
- Check localStorage.getItem('token') is not null

### "Invalid or expired token"
- Token signature doesn't match JWT_SECRET
- Token has expired (older than 7 days)
- JWT_SECRET changed between login and request

### "User not found"
- User was deleted from database after login
- User account was deactivated

## Production Deployment

### Vercel

1. Set environment variable in Vercel dashboard:
   ```
   JWT_SECRET = your-production-secret-here
   ```

2. Use strong secret (minimum 32+ random characters)

3. Rotate secret periodically

### Security Checklist
- [ ] JWT_SECRET is at least 32 characters
- [ ] JWT_SECRET is never committed to git
- [ ] Using HTTPS in production
- [ ] Database connection is encrypted (SSL/TLS)
- [ ] Consider implementing refresh tokens
- [ ] Add rate limiting on login endpoint
- [ ] Monitor failed login attempts
- [ ] Regular security audits

## References

- [JWT.io](https://jwt.io) - JWT standard and tools
- [jsonwebtoken npm](https://github.com/auth0/node-jsonwebtoken) - Implementation docs
- [OWASP Auth Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
