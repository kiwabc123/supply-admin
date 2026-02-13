import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const product = await db.select().from(products).where(eq(products.id, id as string));
      
      if (!product.length) {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.status(200).json(product[0]);
    } catch (error) {
      console.error('Error fetching product:', error);
      return res.status(500).json({ error: 'Failed to fetch product' });
    }
  } else if (req.method === 'PUT') {
    try {
      const body = req.body;
      
      const updated = await db.update(products)
        .set({
          name: body.name,
          slug: body.slug,
          shortDescription: body.shortDescription,
          description: body.description,
          categoryId: body.categoryId,
          isFeatured: body.isFeatured,
          isActive: body.isActive,
        })
        .where(eq(products.id, id as string))
        .returning();

      if (!updated.length) {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.status(200).json(updated[0]);
    } catch (error) {
      console.error('Error updating product:', error);
      return res.status(500).json({ error: 'Failed to update product' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deleted = await db.delete(products)
        .where(eq(products.id, id as string))
        .returning();

      if (!deleted.length) {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({ error: 'Failed to delete product' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
