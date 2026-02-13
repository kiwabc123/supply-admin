import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/db';
import { products } from '@/db/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const allProducts = await db.select().from(products).limit(100);
      return res.status(200).json(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
  } else if (req.method === 'POST') {
    try {
      const body = req.body;
      
      const newProduct = await db.insert(products).values({
        code: body.code,
        name: body.name,
        slug: body.slug,
        shortDescription: body.shortDescription,
        description: body.description,
        categoryId: body.categoryId,
        isFeatured: body.isFeatured || false,
        isActive: body.isActive ?? true,
      }).returning();

      return res.status(201).json(newProduct[0]);
    } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({ error: 'Failed to create product' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
