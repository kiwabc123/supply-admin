import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body as LoginRequest;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await db.select().from(users).where(eq(users.email, email));

    if (!user.length) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user[0].isActive) {
      return res.status(401).json({ message: 'User account is inactive' });
    }

    // Verify password
    if (!verifyPassword(password, user[0].password)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(
      {
        userId: user[0].id,
        email: user[0].email,
        role: user[0].role,
      },
      '7d'
    );

    return res.status(200).json({
      token,
      user: {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
        role: user[0].role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed' });
  }
}
