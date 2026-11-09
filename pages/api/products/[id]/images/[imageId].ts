import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/db';
import { productImages, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { deleteBlob } from '@/lib/blob';

/**
 * @swagger
 * /api/products/{id}/images/{imageId}:
 *   get:
 *     tags:
 *       - Product Images
 *     summary: Get image details
 *     description: Retrieve details of a specific product image
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Image details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductImage'
 *       404:
 *         description: Image or product not found
 *       500:
 *         description: Failed to fetch image
 *   put:
 *     tags:
 *       - Product Images
 *     summary: Update image
 *     description: Update a product image
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Image ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               altText:
 *                 type: string
 *               displayOrder:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductImage'
 *       404:
 *         description: Image or product not found
 *       500:
 *         description: Failed to update image
 *   delete:
 *     tags:
 *       - Product Images
 *     summary: Delete image
 *     description: Delete a product image
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       404:
 *         description: Image or product not found
 *       500:
 *         description: Failed to delete image
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, imageId } = req.query;

  if (!id || typeof id !== 'string' || !imageId || typeof imageId !== 'string') {
    return res.status(400).json({ error: 'Invalid product ID or image ID' });
  }

  // Check if product exists
  const product = await db.select().from(products).where(eq(products.id, id));
  if (product.length === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (req.method === 'GET') {
    try {
      const image = await db
        .select()
        .from(productImages)
        .where(and(eq(productImages.id, imageId), eq(productImages.productId, id)));

      if (image.length === 0) {
        return res.status(404).json({ error: 'Image not found' });
      }

      return res.status(200).json(image[0]);
    } catch (error) {
      console.error('Error fetching image:', error);
      return res.status(500).json({ error: 'Failed to fetch image' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { url, altText, displayOrder, isActive } = req.body;

      const image = await db
        .select()
        .from(productImages)
        .where(and(eq(productImages.id, imageId), eq(productImages.productId, id)));

      if (image.length === 0) {
        return res.status(404).json({ error: 'Image not found' });
      }

      const updateData: any = {};
      if (url !== undefined) updateData.url = url;
      if (altText !== undefined) updateData.altText = altText;
      if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
      if (isActive !== undefined) updateData.isActive = isActive;

      const updated = await db
        .update(productImages)
        .set(updateData)
        .where(eq(productImages.id, imageId))
        .returning();

      return res.status(200).json(updated[0]);
    } catch (error) {
      console.error('Error updating image:', error);
      return res.status(500).json({ error: 'Failed to update image' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const image = await db
        .select()
        .from(productImages)
        .where(and(eq(productImages.id, imageId), eq(productImages.productId, id)));

      if (image.length === 0) {
        return res.status(404).json({ error: 'Image not found' });
      }

      // Delete from Vercel Blob if URL is from Vercel Blob
      if (image[0].url && image[0].url.includes('blob.vercelusercontent.com')) {
        try {
          await deleteBlob(image[0].url);
        } catch (blobError) {
          console.warn('Warning: Failed to delete image from Vercel Blob:', blobError);
          // Continue with database deletion even if Blob deletion fails
        }
      }

      await db.delete(productImages).where(eq(productImages.id, imageId));

      return res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
      console.error('Error deleting image:', error);
      return res.status(500).json({ error: 'Failed to delete image' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
