import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/db';
import { products } from '@/db/schema';

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags:
 *       - Products
 *     summary: List all products
 *     description: Retrieve a list of all products (max 100)
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Failed to fetch products
 *   post:
 *     tags:
 *       - Products
 *     summary: Create a new product
 *     description: Create a new product with the provided details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - slug
 *             properties:
 *               code:
 *                 type: string
 *                 example: PROD-001
 *               name:
 *                 type: string
 *                 example: Product Name
 *               slug:
 *                 type: string
 *                 example: product-name
 *               shortDescription:
 *                 type: string
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               isFeatured:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       500:
 *         description: Failed to create product
 */
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
