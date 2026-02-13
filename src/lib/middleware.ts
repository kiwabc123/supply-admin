import { NextApiRequest, NextApiResponse } from 'next';
import { extractToken, verifyToken, JWTPayload } from './auth';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: JWTPayload;
}

/**
 * Middleware to verify JWT token
 * Usage: withAuth(handler)
 */
export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const token = extractToken(req.headers.authorization);

      if (!token) {
        return res.status(401).json({ message: 'Missing authorization token' });
      }

      const user = verifyToken(token);

      if (!user) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      req.user = user;
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}

/**
 * Middleware to verify JWT and check role
 */
export function withRole(roles: string[]) {
  return (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => {
    return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      return handler(req, res);
    });
  };
}
