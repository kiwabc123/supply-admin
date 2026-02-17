import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/db';
import { productCategories } from '@/db/schema';

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: List all categories
 *     description: Retrieve a list of all product categories
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         description: Failed to fetch categories
 *   post:
 *     tags:
 *       - Categories
 *     summary: Create a new category
 *     description: Create a new product category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 example: Electronics
 *               slug:
 *                 type: string
 *                 example: electronics
 *               description:
 *                 type: string
 *               displayOrder:
 *                 type: integer
 *                 example: 0
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Failed to create category
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const categories = await db.select().from(productCategories);
      return res.status(200).json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
  } else if (req.method === 'POST') {
    try {
      const body = req.body;

      if (!body.name || !body.slug) {
        return res.status(400).json({ error: 'Name and slug are required' });
      }

      const newCategory = await db
        .insert(productCategories)
        .values({
          name: body.name,
          slug: body.slug,
          description: body.description || null,
          displayOrder: body.displayOrder || 0,
          isActive: body.isActive ?? true,
        })
        .returning();

      return res.status(201).json(newCategory[0]);
    } catch (error) {
      console.error('Error creating category:', error);
      return res.status(500).json({ error: 'Failed to create category' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
