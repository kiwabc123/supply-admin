import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { hashPassword } from '@/lib/auth';
import { eq } from 'drizzle-orm';

interface SeedResponse {
  success?: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Seed endpoint - Only enable this in development!
 * Creates demo users for testing authentication
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SeedResponse>
) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Seeding is disabled in production' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('🌱 Seeding database...');

    // Check if admin already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, 'admin@example.com'));

    if (existing.length > 0) {
      console.log('✅ Demo user already exists');
      return res.status(200).json({
        success: true,
        message: 'Demo user already exists',
        user: {
          id: existing[0].id,
          email: existing[0].email,
          name: existing[0].name,
        },
      });
    }

    // Create demo users
    const adminHashedPassword = hashPassword('password123');

    const newUsers = await db
      .insert(users)
      .values([
        {
          email: 'admin@example.com',
          password: adminHashedPassword,
          name: 'Admin User',
          role: 'ADMIN',
          isActive: true,
        },
        {
          email: 'user@example.com',
          password: hashPassword('password123'),
          name: 'Regular User',
          role: 'USER',
          isActive: true,
        },
      ])
      .returning();

    console.log('✅ Demo users created:', newUsers.map((u) => u.email));

    return res.status(201).json({
      success: true,
      message: 'Database seeded successfully',
      user: {
        id: newUsers[0].id,
        email: newUsers[0].email,
        name: newUsers[0].name,
      },
    });
  } catch (error) {
    console.error('❌ Seeding error:', error);
    const message = error instanceof Error ? error.message : 'Seeding failed';
    return res.status(500).json({ message });
  }
}
