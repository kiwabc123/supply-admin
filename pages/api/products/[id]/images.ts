import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/db';
import { productImages, products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { uploadProductImage, deleteBlob } from '@/lib/blob';
import formidable from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * @swagger
 * /api/products/{id}/images:
 *   get:
 *     tags:
 *       - Product Images
 *     summary: Get images for a product
 *     description: Retrieve all images for a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: List of images
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductImage'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to fetch images
 *   post:
 *     tags:
 *       - Product Images
 *     summary: Add images to product (bulk upload)
 *     description: |
 *       Add one or more images to a product using multipart/form-data binary upload.
 *       
 *       **Supports bulk uploads:**
 *       - Single file: Just upload 1 file
 *       - Multiple files: Upload multiple files at once (up to 10MB each, 50MB total)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Image file(s) to upload (binary). Supports JPG, PNG, WebP, GIF. Max 10MB per file
 *               altTexts:
 *                 type: string
 *                 example: '["Front view","Side view"]'
 *                 description: JSON array of alt text for each image
 *               displayOrders:
 *                 type: string
 *                 example: '[0,1]'
 *                 description: JSON array of display orders (0-based index)
 *               isActiveList:
 *                 type: string
 *                 example: '[true,true]'
 *                 description: JSON array of active flags for each image
 *             encoding:
 *               files:
 *                 style: form
 *                 explode: true
 *           examples:
 *             single:
 *               summary: Upload 1 image
 *               value:
 *                 files: image1.jpg
 *                 altTexts: '["Product front view"]'
 *                 displayOrders: '[0]'
 *                 isActiveList: '[true]'
 *             multiple:
 *               summary: Upload 3 images at once (bulk)
 *               value:
 *                 files: [image1.jpg, image2.jpg, image3.jpg]
 *                 altTexts: '["Front","Side","Top"]'
 *                 displayOrders: '[0,1,2]'
 *                 isActiveList: '[true,true,true]'
 *     responses:
 *       201:
 *         description: Image(s) added successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   description: Single image response
 *                   $ref: '#/components/schemas/ProductImage'
 *                 - type: array
 *                   description: Array of images response (for bulk upload)
 *                   items:
 *                     $ref: '#/components/schemas/ProductImage'
 *             examples:
 *               single:
 *                 summary: Single image response
 *                 value:
 *                   id: "uuid-123"
 *                   productId: "product-uuid"
 *                   url: "https://blob.vercelusercontent.com/..."
 *                   altText: "Product front view"
 *                   displayOrder: 0
 *                   isActive: true
 *                   createdAt: "2026-02-17T08:00:00Z"
 *               multiple:
 *                 summary: Bulk upload response (array)
 *                 value:
 *                   - id: "uuid-1"
 *                     url: "https://blob.vercelusercontent.com/...1"
 *                     altText: "Front"
 *                     displayOrder: 0
 *                   - id: "uuid-2"
 *                     url: "https://blob.vercelusercontent.com/...2"
 *                     altText: "Side"
 *                     displayOrder: 1
 *                   - id: "uuid-3"
 *                     url: "https://blob.vercelusercontent.com/...3"
 *                     altText: "Top"
 *                     displayOrder: 2
 *       400:
 *         description: Invalid input or upload failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to upload file 2: Invalid file format"
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
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
      const images = await db.select().from(productImages).where(eq(productImages.productId, id));
      return res.status(200).json(images);
    } catch (error) {
      console.error('Error fetching images:', error);
      return res.status(500).json({ error: 'Failed to fetch images' });
    }
  } else if (req.method === 'POST') {
    try {
      // Check Vercel token first
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error('❌ BLOB_READ_WRITE_TOKEN is not set');
        return res.status(500).json({ error: 'Server error: BLOB_READ_WRITE_TOKEN not configured' });
      }

      console.log(`[${new Date().toISOString()}] 📤 Starting image upload...`);

      const form = formidable({
        multiples: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB max per file
        maxTotalFileSize: 50 * 1024 * 1024, // 50MB total
      });

      console.log(`[${new Date().toISOString()}] Parsing form data...`);
      
      // Parse with timeout
      const parsePromise = form.parse(req);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Form parsing timeout after 30s')), 30000)
      );

      const [fields, files] = await Promise.race([parsePromise, timeoutPromise]) as any;
      
      console.log(`[${new Date().toISOString()}] ✓ Form parsed successfully`);

      // Get form fields
      const altTexts = fields.altTexts ? JSON.parse(Array.isArray(fields.altTexts) ? fields.altTexts[0] : fields.altTexts) : [];
      const displayOrders = fields.displayOrders ? JSON.parse(Array.isArray(fields.displayOrders) ? fields.displayOrders[0] : fields.displayOrders) : [];
      const isActiveList = fields.isActiveList ? JSON.parse(Array.isArray(fields.isActiveList) ? fields.isActiveList[0] : fields.isActiveList) : [];

      // Get files - handle both single and multiple
      const fileArray = files.files || files.file || [];
      const filesArray = Array.isArray(fileArray) ? fileArray : fileArray ? [fileArray] : [];

      console.log(`[${new Date().toISOString()}] 📁 Files received: ${filesArray.length}`);

      if (filesArray.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
      }

      const uploadedImages = [];

      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        
        try {
          console.log(`[${new Date().toISOString()}] 📤 Processing file ${i + 1}/${filesArray.length}: ${file.originalFilename}`);
          
          // Read file content
          const fileContent = await fs.readFile(file.filepath);
          
          // Validate file type
          if (!file.mimetype || !file.mimetype.startsWith('image/')) {
            console.warn(`❌ File ${i + 1} has invalid mime type: ${file.mimetype}`);
            return res.status(400).json({ 
              error: `File ${i + 1} (${file.originalFilename}) is not a valid image. Got: ${file.mimetype}` 
            });
          }
          
          // Upload to Vercel Blob
          const filename = file.originalFilename || `image-${i + 1}`;
          console.log(`[${new Date().toISOString()}] 🔄 Uploading: ${filename} (${(fileContent.length / 1024).toFixed(2)} KB, ${file.mimetype})`);
          
          const blob = await uploadProductImage(fileContent, id as string, filename);

          console.log(`[${new Date().toISOString()}] ✅ Uploaded to: ${blob.url}`);

          // Create database record
          const newImage = await db
            .insert(productImages)
            .values({
              productId: id as string,
              url: blob.url,
              altText: altTexts[i] || null,
              displayOrder: displayOrders[i] !== undefined ? displayOrders[i] : i,
              isActive: isActiveList[i] !== undefined ? isActiveList[i] : true,
            })
            .returning();

          uploadedImages.push(newImage[0]);
          console.log(`[${new Date().toISOString()}] ✓ File ${i + 1}/${filesArray.length} completed`);
        } catch (error: any) {
          console.error(`[${new Date().toISOString()}] ❌ Error uploading file ${i + 1}:`, error);
          return res.status(400).json({ 
            error: `Failed to upload file ${i + 1} (${filesArray[i].originalFilename}): ${error.message || error}` 
          });
        }
      }

      console.log(`[${new Date().toISOString()}] ✅ All ${filesArray.length} files uploaded successfully!`);
      return res.status(201).json(uploadedImages.length === 1 ? uploadedImages[0] : uploadedImages);
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] ❌ Error:`, error);
      
      if (error.message.includes('timeout')) {
        return res.status(408).json({ error: 'Upload timeout: Request took too long. Try smaller files or fewer files.' });
      }
      
      return res.status(500).json({ error: `Failed to add images: ${error.message}` });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
