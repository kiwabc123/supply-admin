import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { hashPassword } from '@/lib/auth';

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface RegisterResponse {
  id?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body as RegisterRequest;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existing = await db.select().from(users).where(
      (u) => u.email === email
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Create new user
    const newUser = await db.insert(users).values({
      email,
      password: hashPassword(password),
      name,
      role: 'USER',
      isActive: true,
    }).returning();

    return res.status(201).json({
      id: newUser[0].id,
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Registration failed' });
  }
}
