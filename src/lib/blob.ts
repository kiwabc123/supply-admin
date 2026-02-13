import { put, del } from '@vercel/blob';

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.warn('BLOB_READ_WRITE_TOKEN environment variable is not set');
}

export interface UploadOptions {
  filename: string;
  contentType?: string;
}

/**
 * Upload a file to Vercel Blob
 */
export async function uploadBlob(file: Buffer, options: UploadOptions) {
  const filename = `products/${Date.now()}-${options.filename}`;
  
  const blob = await put(filename, file, {
    contentType: options.contentType || 'application/octet-stream',
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return blob;
}

/**
 * Delete a file from Vercel Blob
 */
export async function deleteBlob(url: string) {
  await del(url, {
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

/**
 * Upload product image to Vercel Blob
 */
export async function uploadProductImage(file: Buffer, productId: string, filename: string) {
  const path = `products/${productId}/${Date.now()}-${filename}`;
  
  const blob = await put(path, file, {
    contentType: 'image/*',
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return blob;
}
