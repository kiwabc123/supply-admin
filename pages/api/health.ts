import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/db';
import { products } from '@/db/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test database connection
    const productCount = await db.select().from(products);
    
    return res.status(200).json({
      status: 'connected',
      message: 'Database is working!',
      productCount: productCount.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
