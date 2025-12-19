import FastAverageColor from 'fast-average-color';

/**
 * Extract the dominant color from an image URL
 * Uses fast-average-color library for client-side color extraction
 *
 * @param imageUrl - URL of the image to analyze
 * @param options - Configuration options (timeout in ms)
 * @returns Promise resolving to RGB color object
 * @throws Error if extraction fails
 */
export async function extractDominantColor(
  imageUrl: string,
  options: { timeout?: number } = {}
): Promise<{ r: number; g: number; b: number }> {
  const { timeout = 2000 } = options;

  return new Promise((resolve, reject) => {
    const fac = new FastAverageColor();
    const img = new Image();
    const timeoutId = setTimeout(() => {
      reject(new Error('Color extraction timeout'));
    }, timeout);

    // Set crossOrigin to handle CORS for external images (Spotify CDN)
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        clearTimeout(timeoutId);

        // Extract average color from the image
        const color = fac.getColor(img);

        // Return RGB values
        resolve({
          r: color.value[0],
          g: color.value[1],
          b: color.value[2],
        });

        // Clean up
        fac.destroy();
      } catch (error) {
        clearTimeout(timeoutId);
        fac.destroy();
        reject(error);
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      fac.destroy();
      reject(new Error('Failed to load image'));
    };

    // Start loading the image
    img.src = imageUrl;
  });
}
