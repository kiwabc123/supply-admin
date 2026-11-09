import { put, del } from '@vercel/blob';

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.warn('⚠️ BLOB_READ_WRITE_TOKEN environment variable is not set');
} else {
  console.log('✅ BLOB_READ_WRITE_TOKEN is configured');
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
 * Upload product image to Vercel Blob with timeout
 */
export async function uploadProductImage(file: Buffer, productId: string, filename: string) {
  const path = `products/${productId}/${Date.now()}-${filename}`;
  
  console.log(`[blob] 🚀 Starting Vercel Blob upload: ${path}`);
  console.log(`[blob] Token configured: ${!!process.env.BLOB_READ_WRITE_TOKEN}`);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('[blob] ❌ BLOB_READ_WRITE_TOKEN not set!');
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured. Check .env.local');
  }

  try {
    // Create upload with explicit timeout
    const uploadPromise = (async () => {
      console.log(`[blob] 📤 Calling Vercel put() with token...`);
      
      const result = await put(path, file, {
        contentType: 'image/jpeg',
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      console.log(`[blob] ✅ Vercel responded:`, result.url);
      return result;
    })();

    // Add timeout (40 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      const timer = setTimeout(() => {
        console.error('[blob] ⏱️ Timeout! Vercel Blob did not respond in 40 seconds');
        reject(new Error('Vercel Blob upload timeout (40s) - token may be invalid or network issue'));
      }, 40000);
      
      // Cleanup timer on completion
      uploadPromise.finally(() => clearTimeout(timer));
    });

    const blob = await Promise.race([uploadPromise, timeoutPromise]) as Awaited<typeof uploadPromise>;
    
    console.log(`[blob] ✅ Upload successful: ${blob.url}`);
    return blob;
  } catch (error: any) {
    console.error(`[blob] ❌ Upload failed for ${filename}:`, {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    });
    throw error;
  }
}
