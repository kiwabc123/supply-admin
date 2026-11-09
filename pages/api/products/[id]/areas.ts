import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/db';
import { productAreas, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * @swagger
 * /api/products/{id}/areas:
 *   get:
 *     tags:
 *       - Product Areas
 *     summary: Get areas for a product
 *     description: Retrieve all areas where a product is used
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: List of areas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductArea'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to fetch areas
 *   post:
 *     tags:
 *       - Product Areas
 *     summary: Add area to product
 *     description: Add a new area where product is used
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - area
 *             properties:
 *               area:
 *                 type: string
 *                 enum: [GUEST_ROOM, BATHROOM, LOBBY, RESTAURANT, HOUSEKEEPING, BEDROOM, SPA]
 *                 example: BEDROOM
 *     responses:
 *       201:
 *         description: Area added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductArea'
 *       400:
 *         description: Invalid input or area already exists
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to add area
 *   delete:
 *     tags:
 *       - Product Areas
 *     summary: Remove area from product
 *     description: Remove an area from product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: area
 *         required: true
 *         schema:
 *           type: string
 *         description: Area to remove
 *     responses:
 *       200:
 *         description: Area removed successfully
 *       404:
 *         description: Area or product not found
 *       500:
 *         description: Failed to remove area
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  // Check if product exists
  const product = await db.select().from(products).where(eq(products.id, id));
  if (product.length === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (req.method === 'GET') {
    try {
      const areas = await db.select().from(productAreas).where(eq(productAreas.productId, id));
      return res.status(200).json(areas);
    } catch (error) {
      console.error('Error fetching areas:', error);
      return res.status(500).json({ error: 'Failed to fetch areas' });
    }
  } else if (req.method === 'POST') {
    try {
      const { area } = req.body;

      if (!area) {
        return res.status(400).json({ error: 'Area is required' });
      }

      // Check if area already exists for this product
      const existing = await db
        .select()
        .from(productAreas)
        .where(and(eq(productAreas.productId, id), eq(productAreas.area, area as any)))
        .limit(1);

      if (existing.length > 0) {
        return res.status(400).json({ error: 'This area is already assigned to this product' });
      }

      const newArea = await db
        .insert(productAreas)
        .values({
          productId: id,
          area: area as any,
        })
        .returning();

      return res.status(201).json(newArea[0]);
    } catch (error) {
      console.error('Error adding area:', error);
      return res.status(500).json({ error: 'Failed to add area' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { area } = req.query;

      if (!area) {
        return res.status(400).json({ error: 'Area is required' });
      }

      const result = await db
        .delete(productAreas)
        .where(and(eq(productAreas.productId, id), eq(productAreas.area, area as any)))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: 'Area not found for this product' });
      }

      return res.status(200).json({ message: 'Area removed successfully' });
    } catch (error) {
      console.error('Error removing area:', error);
      return res.status(500).json({ error: 'Failed to remove area' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
