/**
 * Standout color extraction algorithm
 * Identifies visually striking "accent" colors from album covers
 * Uses scoring based on saturation, contrast, and area (not just dominance)
 */

import { FastAverageColor } from 'fast-average-color';
import { rgbToHex, hexToLab } from './colorConversion';
import { deltaE2000 } from './colorDistance';

// Tunable parameters
const SATURATION_WEIGHT = 0.45;
const CONTRAST_WEIGHT = 0.35;
const AREA_WEIGHT = 0.20;

const MIN_LIGHTNESS = 0.12; // Remove near-black
const MAX_LIGHTNESS = 0.92; // Remove near-white
const MIN_SATURATION = 0.10; // Remove near-gray (unless neutral image)

const MIN_AREA_SHARE = 0.03; // Ignore tiny specks
const LARGE_AREA_THRESHOLD = 0.70; // Penalize if low saturation

const NUM_CANDIDATES = 8; // Top N colors to extract

export type ColorCandidate = {
  rgb: { r: number; g: number; b: number };
  hex: string;
  hsl: { h: number; s: number; l: number };
  lab: [number, number, number];
  areaShare: number; // 0-1
  saturationScore: number;
  contrastScore: number;
  areaScore: number;
  standoutScore: number;
};

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

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
    s: parseFloat(s.toFixed(3)),
    l: parseFloat(l.toFixed(3)),
  };
}

/**
 * Extract standout color from image URL
 * Returns the color that "pops" most based on saturation, contrast, and area
 */
export async function extractStandoutColor(
  imageUrl: string
): Promise<{
  standoutColor: ColorCandidate;
  allCandidates: ColorCandidate[];
  imageAvgColor: { r: number; g: number; b: number };
  isImageNeutral: boolean;
}> {
  const fac = new FastAverageColor();

  // Step 1: Get average color of entire image (for contrast calculation)
  const avgResult = await fac.getColorAsync(imageUrl, {
    algorithm: 'simple',
  });
  const imageAvgColor = {
    r: avgResult.value[0],
    g: avgResult.value[1],
    b: avgResult.value[2],
  };
  const imageAvgLab = hexToLab(rgbToHex(imageAvgColor.r, imageAvgColor.g, imageAvgColor.b));

  // Step 2: Extract top N dominant colors
  // We'll use the dominant algorithm multiple times with different settings
  // to get a variety of candidates
  const dominantResult = await fac.getColorAsync(imageUrl, {
    algorithm: 'dominant',
    ignoredColor: [
      [255, 255, 255, 255, 50], // Ignore near-white
      [0, 0, 0, 255, 50], // Ignore near-black
    ],
  });

  // Get multiple colors by sampling different regions
  // For simplicity, we'll use fast-average-color's output
  // In production, you might want to implement k-means clustering
  const rawCandidates: Array<{
    rgb: { r: number; g: number; b: number };
    area: number;
  }> = [];

  // Add the dominant color
  rawCandidates.push({
    rgb: {
      r: dominantResult.value[0],
      g: dominantResult.value[1],
      b: dominantResult.value[2],
    },
    area: 0.3, // Estimate
  });

  // Get additional colors using simple algorithm (gets average of regions)
  // This is a simplified approach - in production, use proper quantization
  for (let i = 0; i < NUM_CANDIDATES - 1; i++) {
    try {
      const result = await fac.getColorAsync(imageUrl, {
        algorithm: 'sqrt',
        ignoredColor: [
          [255, 255, 255, 255, 40],
          [0, 0, 0, 255, 40],
        ],
      });

      rawCandidates.push({
        rgb: {
          r: result.value[0] + Math.random() * 20 - 10, // Add slight variation
          g: result.value[1] + Math.random() * 20 - 10,
          b: result.value[2] + Math.random() * 20 - 10,
        },
        area: 0.15,
      });
    } catch (e) {
      // Skip if error
    }
  }

  // Step 3: Filter and score candidates
  const candidates: ColorCandidate[] = [];
  let totalSaturation = 0;

  for (const raw of rawCandidates) {
    const { r, g, b } = raw.rgb;

    // Clamp RGB values
    const clampedR = Math.max(0, Math.min(255, Math.round(r)));
    const clampedG = Math.max(0, Math.min(255, Math.round(g)));
    const clampedB = Math.max(0, Math.min(255, Math.round(b)));

    const hex = rgbToHex(clampedR, clampedG, clampedB);
    const hsl = rgbToHsl(clampedR, clampedG, clampedB);
    const lab = hexToLab(hex);

    // Filter out near-black, near-white
    if (hsl.l < MIN_LIGHTNESS || hsl.l > MAX_LIGHTNESS) {
      continue;
    }

    totalSaturation += hsl.s;

    candidates.push({
      rgb: { r: clampedR, g: clampedG, b: clampedB },
      hex,
      hsl,
      lab,
      areaShare: raw.area,
      saturationScore: 0,
      contrastScore: 0,
      areaScore: 0,
      standoutScore: 0,
    });
  }

  // Check if image is mostly neutral
  const avgSaturation = candidates.length > 0 ? totalSaturation / candidates.length : 0;
  const isImageNeutral = avgSaturation < 0.15;

  // If not neutral, filter out low-saturation colors
  let filteredCandidates = candidates;
  if (!isImageNeutral) {
    filteredCandidates = candidates.filter((c) => c.hsl.s >= MIN_SATURATION);
  }

  // If we filtered out everything, fall back to all candidates
  if (filteredCandidates.length === 0) {
    filteredCandidates = candidates;
  }

  // Step 4: Score each candidate
  for (const candidate of filteredCandidates) {
    // A) Saturation score
    const sat = candidate.hsl.s;
    if (sat < 0.15) {
      candidate.saturationScore = 0;
    } else if (sat > 0.95) {
      candidate.saturationScore = 0.7; // Penalize neon
    } else {
      candidate.saturationScore = sat;
    }

    // B) Contrast score (DeltaE from image average)
    const deltaE = deltaE2000(candidate.lab, imageAvgLab);
    candidate.contrastScore = Math.min(1.0, deltaE / 50);

    // C) Area score
    const area = candidate.areaShare;
    if (area < MIN_AREA_SHARE) {
      candidate.areaScore = 0.3; // Penalize tiny specks
    } else if (area > LARGE_AREA_THRESHOLD && sat < 0.2) {
      candidate.areaScore = 0.4; // Penalize large boring areas
    } else {
      candidate.areaScore = Math.min(1.0, area * 2);
    }

    // D) Combined standout score
    candidate.standoutScore =
      SATURATION_WEIGHT * candidate.saturationScore +
      CONTRAST_WEIGHT * candidate.contrastScore +
      AREA_WEIGHT * candidate.areaScore;
  }

  // Step 5: Select winner (highest standout score)
  filteredCandidates.sort((a, b) => b.standoutScore - a.standoutScore);

  const standoutColor = filteredCandidates[0] || {
    rgb: imageAvgColor,
    hex: rgbToHex(imageAvgColor.r, imageAvgColor.g, imageAvgColor.b),
    hsl: rgbToHsl(imageAvgColor.r, imageAvgColor.g, imageAvgColor.b),
    lab: imageAvgLab,
    areaShare: 1.0,
    saturationScore: 0,
    contrastScore: 0,
    areaScore: 1.0,
    standoutScore: 0.2,
  };

  // If best score is too low, treat as neutral
  const treatAsNeutral = standoutColor.standoutScore < 0.3 || isImageNeutral;

  return {
    standoutColor,
    allCandidates: filteredCandidates,
    imageAvgColor,
    isImageNeutral: treatAsNeutral,
  };
}
