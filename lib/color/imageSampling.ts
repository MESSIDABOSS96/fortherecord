/**
 * Image sampling utilities for bucket-based color detection
 * Downscales images and computes pixel statistics in HSL color space
 */

import sharp from 'sharp';

export type PixelHSL = {
  h: number; // 0-360
  s: number; // 0-1
  l: number; // 0-1
};

export type PixelStats = {
  pixels: PixelHSL[];
  totalPixels: number;
  neutralPercent: number; // % of pixels with low saturation
  darkPercent: number; // % of pixels with low lightness
  lightPercent: number; // % of pixels with high lightness
  warmTendency: number; // -1 to 1, negative = cool, positive = warm
  avgSaturation: number;
  avgLightness: number;
};

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): PixelHSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Number(s.toFixed(3)),
    l: Number(l.toFixed(3)),
  };
}

/**
 * Downscale image to 64x64 and extract pixel data
 * Returns array of HSL pixels
 */
export async function sampleImageToPixels(imageBuffer: Buffer): Promise<PixelHSL[]> {
  // Downscale to 64x64 for speed
  const image = sharp(imageBuffer);
  const { data } = await image.resize(64, 64, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });

  const pixels: PixelHSL[] = [];

  // Convert RGB to HSL for each pixel
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    pixels.push(rgbToHsl(r, g, b));
  }

  return pixels;
}

/**
 * Compute statistics from pixel array
 */
export function computePixelStats(pixels: PixelHSL[], thresholds: {
  S_NEUTRAL: number;
  L_DARK: number;
  L_LIGHT: number;
}): PixelStats {
  const totalPixels = pixels.length;

  // Count neutral, dark, light pixels
  let neutralCount = 0;
  let darkCount = 0;
  let lightCount = 0;
  let sumSaturation = 0;
  let sumLightness = 0;
  let warmCount = 0; // pixels with warm hue tendency

  for (const pixel of pixels) {
    sumSaturation += pixel.s;
    sumLightness += pixel.l;

    if (pixel.s < thresholds.S_NEUTRAL) {
      neutralCount++;
    }

    if (pixel.l < thresholds.L_DARK) {
      darkCount++;
    }

    if (pixel.l > thresholds.L_LIGHT) {
      lightCount++;
    }

    // Warm tendency: red/orange/yellow hues (0-60, 300-360) vs blue/green (120-240)
    if (pixel.s > 0.1) {
      // Only count saturated pixels for warm/cool
      if ((pixel.h >= 0 && pixel.h <= 60) || (pixel.h >= 300 && pixel.h <= 360)) {
        warmCount++;
      } else if (pixel.h >= 120 && pixel.h <= 240) {
        warmCount--;
      }
    }
  }

  return {
    pixels,
    totalPixels,
    neutralPercent: neutralCount / totalPixels,
    darkPercent: darkCount / totalPixels,
    lightPercent: lightCount / totalPixels,
    warmTendency: warmCount / totalPixels, // normalized -1 to 1
    avgSaturation: sumSaturation / totalPixels,
    avgLightness: sumLightness / totalPixels,
  };
}

/**
 * Sample image and compute full stats in one call
 */
export async function sampleImageAndComputeStats(
  imageBuffer: Buffer,
  thresholds: {
    S_NEUTRAL: number;
    L_DARK: number;
    L_LIGHT: number;
  }
): Promise<PixelStats> {
  const pixels = await sampleImageToPixels(imageBuffer);
  return computePixelStats(pixels, thresholds);
}
