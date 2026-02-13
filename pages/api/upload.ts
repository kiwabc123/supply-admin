import type { NextApiRequest, NextApiResponse } from 'next';
import { uploadProductImage, deleteBlob } from '@/lib/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { file, productId } = req.body;

      if (!file || !productId) {
        return res.status(400).json({ error: 'Missing file or productId' });
      }

      // Convert base64 to Buffer if needed
      const buffer = Buffer.isBuffer(file) ? file : Buffer.from(file, 'base64');
      
      const blob = await uploadProductImage(
        buffer,
        productId,
        'product-image'
      );

      return res.status(201).json(blob);
    } catch (error) {
      console.error('Error uploading image:', error);
      return res.status(500).json({ error: 'Failed to upload image' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'No URL provided' });
      }

      await deleteBlob(url);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting image:', error);
      return res.status(500).json({ error: 'Failed to delete image' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
