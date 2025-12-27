/**
 * WCAG contrast utilities for ensuring accessible text/background combinations
 * Includes contrast offset logic for visual harmony with album covers
 */

import { hexToRgb, labToHex } from './colorConversion';

/**
 * Calculate relative luminance for WCAG contrast ratio
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @returns Relative luminance (0-1)
 */
export function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const normalized = c / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate WCAG 2.1 contrast ratio between two colors
 * @param hex1 First hex color
 * @param hex2 Second hex color
 * @returns Contrast ratio (1-21)
 */
export function contrastRatio(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);

  const L1 = relativeLuminance(r1, g1, b1);
  const L2 = relativeLuminance(r2, g2, b2);

  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Choose optimal text color (black or white) for a given background
 * @param bgHex Background hex color
 * @returns "#1a1a1a" (near-black) or "#f7f7f7" (near-white)
 */
export function chooseTextColor(bgHex: string): string {
  const blackContrast = contrastRatio(bgHex, '#1a1a1a');
  const whiteContrast = contrastRatio(bgHex, '#f7f7f7');

  // Prefer black for lighter backgrounds
  return blackContrast >= 4.5 ? '#1a1a1a' : '#f7f7f7';
}

/**
 * Apply contrast offset to make card background distinct from album cover
 * Adjusts L* (lightness) in LAB space while preserving hue/saturation
 * @param baseLab Album cover dominant color in LAB space
 * @param targetLab Matched palette color in LAB space
 * @param minOffset Minimum lightness difference (default: 8)
 * @param maxOffset Maximum lightness difference (default: 18)
 * @returns Adjusted LAB color with offset applied
 */
export function applyContrastOffset(
  baseLab: [number, number, number],
  targetLab: [number, number, number],
  minOffset: number = 8,
  maxOffset: number = 18
): [number, number, number] {
  const [baseL] = baseLab;
  const [targetL, targetA, targetB] = targetLab;

  const diff = Math.abs(baseL - targetL);

  // If already sufficiently different, return as-is
  if (diff >= minOffset) {
    return targetLab;
  }

  // Determine direction: if album is dark, card should be lighter (and vice versa)
  const shouldLighten = baseL < 50;

  // Dynamic offset: colors near neutral (L*=50) get larger offsets
  const offsetAmount = Math.max(
    minOffset,
    Math.min(maxOffset, minOffset + (50 - Math.abs(baseL - 50)) * 0.2)
  );

  let newL = shouldLighten ? targetL + offsetAmount : targetL - offsetAmount;

  // Clamp to valid LAB lightness range
  newL = Math.max(5, Math.min(95, newL));

  return [newL, targetA, targetB];
}

/**
 * Ensure final background color meets WCAG contrast requirements
 * Iteratively adjusts L* until contrast ratio threshold is met
 * @param bgLab Background color in LAB space
 * @param textColor Text color hex (#1a1a1a or #f7f7f7)
 * @param minRatio Minimum contrast ratio (default: 4.5 for WCAG AA)
 * @returns Adjusted LAB color that meets contrast requirements
 */
export function ensureContrast(
  bgLab: [number, number, number],
  textColor: string,
  minRatio: number = 4.5
): [number, number, number] {
  let [L, a, b] = bgLab;
  let bgHex = labToHex(L, a, b);
  let ratio = contrastRatio(bgHex, textColor);

  let iterations = 0;
  const maxIterations = 20;
  const step = 2;

  while (ratio < minRatio && iterations < maxIterations) {
    // If text is light, darken background; if text is dark, lighten background
    const isLightText = textColor === '#f7f7f7';
    L = isLightText ? L - step : L + step;
    L = Math.max(5, Math.min(95, L));

    bgHex = labToHex(L, a, b);
    ratio = contrastRatio(bgHex, textColor);
    iterations++;
  }

  return [L, a, b];
}
