import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

/**
 * Example protected endpoint
 * Requires valid JWT token in Authorization header
 * Usage: GET /api/protected/profile
 * Header: Authorization: Bearer <your-jwt-token>
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // req.user contains the decoded JWT payload
    return res.status(200).json({
      message: 'This is a protected endpoint',
      user: req.user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withAuth(handler);
