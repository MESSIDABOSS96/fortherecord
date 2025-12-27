/**
 * Bucket-based color system for lyric cards
 * Maps album covers to 10 fixed colors using MAJORITY vs ACCENT logic
 * SERVER-SIDE ONLY - uses Sharp for image processing
 */

import { fetchImageToBuffer } from './imageFetcher';
import { sampleImageAndComputeStats, type PixelHSL } from './imageSampling';
import { hexToLab } from './colorConversion';
import { deltaE2000 } from './colorDistance';
import {
  BUCKET_COLORS,
  BUCKET_THRESHOLDS,
  type BucketName,
  type HueFamily,
  type BucketResult,
} from './bucketTypes';

/**
 * Check if pixel is white (non-contrasting)
 * Conservative: S < 0.05 AND L > 0.95
 */
function isWhite(pixel: PixelHSL): boolean {
  return pixel.s < BUCKET_THRESHOLDS.WHITE_S_MAX && pixel.l > BUCKET_THRESHOLDS.WHITE_L_MIN;
}

/**
 * Map hue (0-360) to color family
 * Updated ranges based on real-world album color perception
 * Round 2: Expanded red/purple to fix The Weeknd (magenta-red) vs Jeff Buckley (violet-purple)
 */
function mapHueToFamily(hue: number): HueFamily {
  if (hue >= 330 || hue <= 15) return 'red'; // 330-360, 0-15 (expanded to include magenta-reds)
  if (hue > 15 && hue <= 45) return 'orange'; // 15-45 (expanded to catch more oranges)
  if (hue > 45 && hue <= 60) return 'yellow'; // 45-60 (narrower but adequate)
  if (hue > 60 && hue <= 165) return 'green'; // 60-165
  if (hue > 165 && hue <= 250) return 'blue'; // 165-250
  if (hue > 250 && hue < 300) return 'purple'; // 250-299 (true purples/violets)
  if (hue >= 300 && hue < 330) return 'pink'; // 300-329 (hot pinks/magentas)
  return 'blue'; // fallback
}

/**
 * Get bucket color for a hue family
 */
function bucketColorForFamily(family: HueFamily): string {
  const familyToBucket: Record<HueFamily, BucketName> = {
    red: 'MAJORITY_RED',
    pink: 'MAJORITY_PINK',
    purple: 'MAJORITY_PURPLE',
    blue: 'MAJORITY_BLUE',
    green: 'MAJORITY_GREEN',
    orange: 'MAJORITY_ORANGE',
    yellow: 'MAJORITY_YELLOW',
  };

  const bucketName = familyToBucket[family];
  return BUCKET_COLORS[bucketName];
}

/**
 * Main bucket detection function
 */
export async function getBucketFromAlbumCover(
  imageUrl: string,
  stableId?: string
): Promise<BucketResult> {
  try {
    // STEP 1: Sample image
    const buffer = await fetchImageToBuffer(imageUrl);
    const stats = await sampleImageAndComputeStats(buffer, {
      S_NEUTRAL: BUCKET_THRESHOLDS.S_NEUTRAL,
      L_DARK: BUCKET_THRESHOLDS.L_DARK,
      L_LIGHT: BUCKET_THRESHOLDS.L_LIGHT,
    });

    const { pixels, totalPixels, neutralPercent, darkPercent, lightPercent, warmTendency } = stats;

    // STEP 1.5: Check for HIGH-CONTRAST accents FIRST (before neutral check)
    // This allows dark-neutral albums with bright accents (like Coldplay) to be detected
    const accentResult = detectContrastingAccent(pixels, totalPixels);
    const isHighContrastAccent = accentResult && accentResult.deltaE > 30;

    // STEP 2: Determine base characteristics (if neutral-dominant AND no high-contrast accent)
    if (neutralPercent > BUCKET_THRESHOLDS.NEUTRAL_PERCENT && !isHighContrastAccent) {
      // Majority neutral cover
      let bucket: BucketName;
      let baseDesc: string;

      if (darkPercent > BUCKET_THRESHOLDS.DARK_PERCENT) {
        bucket = 'MAJORITY_DARK';
        baseDesc = 'dark neutral';
      } else if (lightPercent > BUCKET_THRESHOLDS.LIGHT_PERCENT) {
        bucket = 'MAJORITY_LIGHT_NEUTRAL';
        baseDesc = 'light neutral';
      } else if (warmTendency > 0.1) {
        bucket = 'MAJORITY_WARM_NEUTRAL';
        baseDesc = 'warm neutral';
      } else {
        bucket = 'MAJORITY_LIGHT_NEUTRAL';
        baseDesc = 'neutral (default light)';
      }

      // Count hues for debug
      const topHueCounts = countHuesByFamily(
        pixels.filter((p) => p.s >= BUCKET_THRESHOLDS.S_MAJORITY)
      );

      return {
        bgColor: BUCKET_COLORS[bucket],
        textColor: '#111111',
        bucket,
        bucketType: 'majority',
        debug: {
          neutralPercent,
          darkPercent,
          lightPercent,
          warmTendency,
          baseCharacteristics: baseDesc,
          accentDetected: false,
          topHueCounts,
        },
      };
    }

    // STEP 2.5: Dark album special handling (prevents false accents on black covers)
    // If album is very dark (like 2Pac), skip accent detection and return MAJORITY_DARK
    if (darkPercent > 0.65 && neutralPercent > 0.50) {
      const topHueCounts = countHuesByFamily(
        pixels.filter((p) => p.s >= BUCKET_THRESHOLDS.S_MAJORITY)
      );

      return {
        bgColor: BUCKET_COLORS.MAJORITY_DARK,
        textColor: '#111111',
        bucket: 'MAJORITY_DARK',
        bucketType: 'majority',
        debug: {
          neutralPercent,
          darkPercent,
          lightPercent,
          warmTendency,
          baseCharacteristics: 'very dark album (accent detection skipped)',
          accentDetected: false,
          topHueCounts,
        },
      };
    }

    // STEP 3: Use accent result (already computed above)
    if (accentResult) {
      const bucket = accentResult.bucket;
      const topHueCounts = countHuesByFamily(
        pixels.filter((p) => p.s >= BUCKET_THRESHOLDS.S_MAJORITY)
      );

      return {
        bgColor: BUCKET_COLORS[bucket],
        textColor: '#111111',
        bucket,
        bucketType: 'accent',
        debug: {
          neutralPercent,
          darkPercent,
          lightPercent,
          warmTendency,
          baseCharacteristics: 'accent-driven',
          accentDetected: true,
          accentFamily: accentResult.family,
          accentShare: accentResult.share,
          accentDeltaE: accentResult.deltaE,
          topHueCounts,
        },
      };
    }

    // STEP 4: Fallback to majority hue
    const saturatedPixels = pixels.filter(
      (p) =>
        p.s >= BUCKET_THRESHOLDS.S_MAJORITY &&
        p.l >= 0.12 &&
        p.l <= 0.90
    );

    if (saturatedPixels.length > 0) {
      const hueCounts = countHuesByFamily(saturatedPixels);
      const majorityFamily = Object.keys(hueCounts).reduce((a, b) =>
        hueCounts[a as HueFamily] > hueCounts[b as HueFamily] ? a : b
      ) as HueFamily;

      const bucket = familyToBucket(majorityFamily);

      return {
        bgColor: BUCKET_COLORS[bucket],
        textColor: '#111111',
        bucket,
        bucketType: 'majority',
        debug: {
          neutralPercent,
          darkPercent,
          lightPercent,
          warmTendency,
          baseCharacteristics: 'majority hue',
          accentDetected: false,
          topHueCounts: hueCounts,
          majorityFamily,
        },
      };
    }

    // STEP 5: Final fallback - use dark or light neutral
    const bucket = darkPercent > 0.5 ? 'MAJORITY_DARK' : 'MAJORITY_LIGHT_NEUTRAL';
    return {
      bgColor: BUCKET_COLORS[bucket],
      textColor: '#111111',
      bucket,
      bucketType: 'majority',
      debug: {
        neutralPercent,
        darkPercent,
        lightPercent,
        warmTendency,
        baseCharacteristics: 'fallback neutral',
        accentDetected: false,
        topHueCounts: {} as Record<HueFamily, number>,
      },
    };
  } catch (error) {
    console.error('Bucket extraction failed:', error);

    // Deterministic error fallback
    const hash = deterministicHash(stableId || imageUrl);
    const bucket = hash % 2 === 0 ? 'MAJORITY_LIGHT_NEUTRAL' : 'MAJORITY_DARK';

    return {
      bgColor: BUCKET_COLORS[bucket],
      textColor: '#111111',
      bucket,
      bucketType: 'majority',
      debug: {
        neutralPercent: 0,
        darkPercent: 0,
        lightPercent: 0,
        warmTendency: 0,
        baseCharacteristics: 'error fallback',
        accentDetected: false,
        topHueCounts: {} as Record<HueFamily, number>,
      },
    };
  }
}

/**
 * Detect contrasting accent color
 * Returns accent info if valid, null otherwise
 */
function detectContrastingAccent(pixels: PixelHSL[], totalPixels: number): {
  family: HueFamily;
  bucket: BucketName;
  share: number;
  deltaE: number;
} | null {
  // Filter eligible accent pixels (saturated, not extreme lightness, NOT white)
  const eligible = pixels.filter(
    (p) =>
      p.s >= BUCKET_THRESHOLDS.S_ACCENT &&
      p.l >= 0.12 &&
      p.l <= 0.90 &&
      !isWhite(p) // ENFORCE: white is NOT an accent
  );

  if (eligible.length < totalPixels * BUCKET_THRESHOLDS.MIN_ACCENT_SHARE) {
    return null; // Not enough accent pixels
  }

  // Bucket eligible pixels by hue family
  const hueBuckets: Record<HueFamily, PixelHSL[]> = {
    red: [],
    orange: [],
    yellow: [],
    green: [],
    blue: [],
    purple: [],
    pink: [],
  };

  for (const pixel of eligible) {
    const family = mapHueToFamily(pixel.h);
    hueBuckets[family].push(pixel);
  }

  // Calculate base color (non-accent pixels)
  const nonAccent = pixels.filter((p) => !eligible.includes(p));
  const baseColor = averagePixelColor(nonAccent.length > 0 ? nonAccent : pixels);

  // Find strongest accent
  let bestAccent: { family: HueFamily; bucket: BucketName; share: number; deltaE: number } | null = null;
  let bestScore = 0;

  for (const [family, accentPixels] of Object.entries(hueBuckets) as [HueFamily, PixelHSL[]][]) {
    if (accentPixels.length === 0) continue;

    const accentShare = accentPixels.length / totalPixels;
    const avgAccentColor = averagePixelColor(accentPixels);
    const avgSat = accentPixels.reduce((sum, p) => sum + p.s, 0) / accentPixels.length;

    // Convert to LAB for perceptual distance
    const baseLab = hslToApproxLab(baseColor);
    const accentLab = hslToApproxLab(avgAccentColor);
    const deltaE = deltaE2000(baseLab, accentLab);

    // Valid accent conditions
    const isValid =
      accentShare >= BUCKET_THRESHOLDS.MIN_ACCENT_SHARE &&
      avgSat >= BUCKET_THRESHOLDS.MIN_ACCENT_SAT &&
      deltaE >= BUCKET_THRESHOLDS.MIN_DELTA_E;

    if (isValid) {
      const score = accentShare + deltaE / 100;
      if (score > bestScore) {
        bestScore = score;
        bestAccent = {
          family,
          bucket: familyToBucket(family),
          share: accentShare,
          deltaE,
        };
      }
    }
  }

  return bestAccent;
}

/**
 * Count pixels by hue family
 */
function countHuesByFamily(pixels: PixelHSL[]): Record<HueFamily, number> {
  const counts: Record<HueFamily, number> = {
    red: 0,
    orange: 0,
    yellow: 0,
    green: 0,
    blue: 0,
    purple: 0,
    pink: 0,
  };

  for (const pixel of pixels) {
    const family = mapHueToFamily(pixel.h);
    counts[family]++;
  }

  return counts;
}

/**
 * Average pixel color
 */
function averagePixelColor(pixels: PixelHSL[]): PixelHSL {
  if (pixels.length === 0) return { h: 0, s: 0, l: 0.5 };

  let sumH = 0;
  let sumS = 0;
  let sumL = 0;

  for (const p of pixels) {
    sumH += p.h;
    sumS += p.s;
    sumL += p.l;
  }

  return {
    h: Math.round(sumH / pixels.length),
    s: sumS / pixels.length,
    l: sumL / pixels.length,
  };
}

/**
 * Approximate HSL to LAB (for deltaE calculation)
 * Convert HSL → RGB → LAB
 */
function hslToApproxLab(hsl: PixelHSL): [number, number, number] {
  // Convert HSL to RGB first
  const { h, s, l } = hsl;
  const hNorm = h / 360;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, hNorm + 1 / 3);
    g = hue2rgb(p, q, hNorm);
    b = hue2rgb(p, q, hNorm - 1 / 3);
  }

  // Convert RGB to hex, then use hexToLab
  const toHex = (c: number) => Math.round(c * 255).toString(16).padStart(2, '0');
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  return hexToLab(hex);
}

/**
 * Map family to bucket name
 */
function familyToBucket(family: HueFamily): BucketName {
  const map: Record<HueFamily, BucketName> = {
    red: 'MAJORITY_RED',
    orange: 'MAJORITY_ORANGE',
    yellow: 'MAJORITY_YELLOW',
    green: 'MAJORITY_GREEN',
    blue: 'MAJORITY_BLUE',
    purple: 'MAJORITY_PURPLE',
    pink: 'MAJORITY_PINK',
  };
  return map[family];
}

/**
 * Deterministic hash function (djb2)
 */
function deterministicHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  return Math.abs(hash);
}
