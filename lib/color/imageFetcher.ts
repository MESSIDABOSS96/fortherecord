/**
 * Image fetching utility for server-side color extraction
 * Fetches images via HTTPS/HTTP and returns Buffer for Sharp processing
 */

import https from 'https';
import http from 'http';

/**
 * Fetch image from URL to Buffer
 * @param url Image URL (http or https)
 * @returns Promise<Buffer> Image data as Buffer
 */
export async function fetchImageToBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    const request = client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });

    request.on('error', reject);
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}
