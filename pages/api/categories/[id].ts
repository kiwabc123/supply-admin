import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/db';
import { productCategories } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get category by ID
 *     description: Retrieve a specific category by its ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Category found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *       500:
 *         description: Failed to fetch category
 *   put:
 *     tags:
 *       - Categories
 *     summary: Update category
 *     description: Update an existing category by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               displayOrder:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *       500:
 *         description: Failed to update category
 *   delete:
 *     tags:
 *       - Categories
 *     summary: Delete category
 *     description: Delete a category by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Failed to delete category
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const category = await db
        .select()
        .from(productCategories)
        .where(eq(productCategories.id, id as string));

      if (!category.length) {
        return res.status(404).json({ error: 'Category not found' });
      }

      return res.status(200).json(category[0]);
    } catch (error) {
      console.error('Error fetching category:', error);
      return res.status(500).json({ error: 'Failed to fetch category' });
    }
  } else if (req.method === 'PUT') {
    try {
      const body = req.body;

      const updated = await db
        .update(productCategories)
        .set({
          name: body.name,
          slug: body.slug,
          description: body.description,
          displayOrder: body.displayOrder,
          isActive: body.isActive,
        })
        .where(eq(productCategories.id, id as string))
        .returning();

      if (!updated.length) {
        return res.status(404).json({ error: 'Category not found' });
      }

      return res.status(200).json(updated[0]);
    } catch (error) {
      console.error('Error updating category:', error);
      return res.status(500).json({ error: 'Failed to update category' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deleted = await db
        .delete(productCategories)
        .where(eq(productCategories.id, id as string))
        .returning();

      if (!deleted.length) {
        return res.status(404).json({ error: 'Category not found' });
      }

      return res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);
      return res.status(500).json({ error: 'Failed to delete category' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
