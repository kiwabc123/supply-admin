import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { extractToken, verifyToken } from '@/lib/auth';

interface MeResponse {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  message?: string;
}

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user
 *     description: Get the current authenticated user's information
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - no valid token provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing authorization token
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MeResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Extract and verify JWT token
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: 'Missing authorization token' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Get user from database to ensure they still exist
    const userRecord = await db.select().from(users).where(eq(users.id, decoded.userId));

    if (!userRecord.length) {
      return res.status(401).json({ message: 'User not found' });
    }

    return res.status(200).json({
      user: {
        id: userRecord[0].id,
        email: userRecord[0].email,
        name: userRecord[0].name,
        role: userRecord[0].role,
      },
    });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ message: 'Authentication failed' });
  }
}
