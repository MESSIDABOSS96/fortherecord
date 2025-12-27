/**
 * Server-side color extraction using Sharp (Node.js compatible)
 * Replaces browser-only FastAverageColor with proper server-side implementation
 * Uses real color quantization instead of fake random candidates
 */

import sharp from 'sharp';
import { rgbToHex, hexToLab } from './colorConversion';
import { deltaE2000 } from './colorDistance';
import { fetchImageToBuffer } from './imageFetcher';

// Tuned parameters based on user examples
const SATURATION_WEIGHT = 0.30; // Reduced from 0.45 to reduce bias against dark/neutral albums
const CONTRAST_WEIGHT = 0.40; // Increased from 0.35 for visual pop
const AREA_WEIGHT = 0.30; // Increased from 0.20 to respect dominant colors

const MIN_LIGHTNESS = 0.08; // Reduced from 0.12 to allow darker colors
const MAX_LIGHTNESS = 0.94; // Increased from 0.92
const MIN_SATURATION = 0.08; // Reduced from 0.10

const MIN_AREA_SHARE = 0.03; // Ignore tiny specks
const LARGE_AREA_THRESHOLD = 0.70; // Penalize if low saturation

const DARK_IMAGE_THRESHOLD = 0.30; // NEW: for dark album detection

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
 * Score saturation component
 */
function scoreSaturation(saturation: number): number {
  if (saturation < 0.15) {
    return 0;
  } else if (saturation > 0.95) {
    return 0.7; // Penalize neon colors
  } else {
    return saturation;
  }
}

/**
 * Score area component
 */
function scoreArea(areaShare: number, saturation: number): number {
  if (areaShare < MIN_AREA_SHARE) {
    return 0.3; // Penalize tiny specks
  } else if (areaShare > LARGE_AREA_THRESHOLD && saturation < 0.2) {
    return 0.4; // Penalize large boring areas
  } else {
    return Math.min(1.0, areaShare * 2);
  }
}

/**
 * Calculate average saturation from candidates
 */
function calculateAvgSaturation(candidates: ColorCandidate[]): number {
  if (candidates.length === 0) return 0;
  const sum = candidates.reduce((acc, c) => acc + c.hsl.s, 0);
  return sum / candidates.length;
}

/**
 * Calculate average lightness from candidates
 */
function calculateAvgLightness(candidates: ColorCandidate[]): number {
  if (candidates.length === 0) return 0.5;
  const sum = candidates.reduce((acc, c) => acc + c.hsl.l, 0);
  return sum / candidates.length;
}

/**
 * Quantize colors using histogram-based clustering
 * Returns real top N colors from the image (not fake random ones)
 */
function quantizeColors(
  pixelData: Buffer,
  width: number,
  height: number,
  numColors: number
): ColorCandidate[] {
  // Build color histogram (reduce to 32×32×32 = 32k buckets for efficiency)
  const colorCounts = new Map<string, { rgb: { r: number; g: number; b: number }; count: number }>();

  for (let i = 0; i < pixelData.length; i += 3) {
    // Quantize to 32 levels per channel (divide by 8, multiply by 8)
    const r = Math.floor(pixelData[i] / 8) * 8;
    const g = Math.floor(pixelData[i + 1] / 8) * 8;
    const b = Math.floor(pixelData[i + 2] / 8) * 8;

    const key = `${r},${g},${b}`;
    const existing = colorCounts.get(key);

    if (existing) {
      existing.count++;
    } else {
      colorCounts.set(key, { rgb: { r, g, b }, count: 1 });
    }
  }

  // Sort by frequency and take top N
  const sorted = Array.from(colorCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, numColors);

  // Convert to ColorCandidate format
  const totalPixels = width * height;

  return sorted.map(({ rgb, count }) => {
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const lab = hexToLab(hex);

    return {
      rgb,
      hex,
      hsl,
      lab,
      areaShare: count / totalPixels,
      saturationScore: 0,
      contrastScore: 0,
      areaScore: 0,
      standoutScore: 0,
    };
  });
}

/**
 * Extract standout color from image URL using Sharp (server-compatible)
 * Returns the color that "pops" most based on saturation, contrast, and area
 */
export async function extractStandoutColorServer(
  imageUrl: string
): Promise<{
  standoutColor: ColorCandidate;
  allCandidates: ColorCandidate[];
  imageAvgColor: { r: number; g: number; b: number };
  isImageNeutral: boolean;
}> {
  // 1. Fetch image to buffer
  const buffer = await fetchImageToBuffer(imageUrl);

  // 2. Get Sharp statistics
  const image = sharp(buffer);
  const stats = await image.stats();

  // 3. Extract raw pixel data for quantization
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  // 4. Quantize to find real top N colors
  const candidates = quantizeColors(data, info.width, info.height, 8);

  // Filter out near-black, near-white colors
  let filteredCandidates = candidates.filter(
    (c) => c.hsl.l >= MIN_LIGHTNESS && c.hsl.l <= MAX_LIGHTNESS
  );

  // If we filtered out everything, use all candidates
  if (filteredCandidates.length === 0) {
    filteredCandidates = candidates;
  }

  // 5. Calculate image average color from stats
  const imageAvgColor = stats.dominant;
  const imageAvgLab = hexToLab(rgbToHex(imageAvgColor.r, imageAvgColor.g, imageAvgColor.b));

  // 6. Detect if image is neutral or very dark
  const avgSaturation = calculateAvgSaturation(filteredCandidates);
  const avgLightness = calculateAvgLightness(filteredCandidates);
  const isImageNeutral = avgSaturation < 0.20 || avgLightness < DARK_IMAGE_THRESHOLD;

  // If not neutral, filter out low-saturation colors
  if (!isImageNeutral) {
    const highSatCandidates = filteredCandidates.filter((c) => c.hsl.s >= MIN_SATURATION);
    if (highSatCandidates.length > 0) {
      filteredCandidates = highSatCandidates;
    }
  }

  // 7. Score candidates
  for (const candidate of filteredCandidates) {
    // Saturation score
    candidate.saturationScore = scoreSaturation(candidate.hsl.s);

    // Contrast score (DeltaE from image average)
    const deltaE = deltaE2000(candidate.lab, imageAvgLab);
    candidate.contrastScore = Math.min(1.0, deltaE / 50);

    // Area score
    candidate.areaScore = scoreArea(candidate.areaShare, candidate.hsl.s);

    // Combined standout score
    candidate.standoutScore =
      SATURATION_WEIGHT * candidate.saturationScore +
      CONTRAST_WEIGHT * candidate.contrastScore +
      AREA_WEIGHT * candidate.areaScore;
  }

  // 8. Sort by standout score and return winner
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

  return {
    standoutColor,
    allCandidates: filteredCandidates,
    imageAvgColor,
    isImageNeutral,
  };
}
