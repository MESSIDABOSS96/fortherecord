/**
 * Color distance calculations using perceptual metrics
 * DeltaE2000 is the industry standard for measuring perceived color difference
 */

import type { PaletteColor } from '@/utils/colorPalette';

/**
 * Calculate DeltaE2000 color difference (CIE2000)
 * Most accurate perceptual color distance metric
 * @param lab1 First color in LAB space [L*, a*, b*]
 * @param lab2 Second color in LAB space [L*, a*, b*]
 * @returns DeltaE2000 value (0 = identical, 100 = very different)
 */
export function deltaE2000(
  lab1: [number, number, number],
  lab2: [number, number, number]
): number {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;

  // Calculate chroma
  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cbar = (C1 + C2) / 2;

  // Adjust a* values
  const G =
    0.5 *
    (1 - Math.sqrt(Math.pow(Cbar, 7) / (Math.pow(Cbar, 7) + Math.pow(25, 7))));
  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);

  // Recalculate chroma and hue
  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  const h1p = (Math.atan2(b1, a1p) * 180) / Math.PI + (a1p >= 0 && b1 >= 0 ? 0 : 360);
  const h2p = (Math.atan2(b2, a2p) * 180) / Math.PI + (a2p >= 0 && b2 >= 0 ? 0 : 360);

  // Differences
  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) {
    const diff = h2p - h1p;
    if (Math.abs(diff) <= 180) dhp = diff;
    else if (diff > 180) dhp = diff - 360;
    else dhp = diff + 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(((dhp * Math.PI) / 180) / 2);

  // Weighting factors
  const Lbar = (L1 + L2) / 2;
  const Cbar_p = (C1p + C2p) / 2;

  let Hbar_p = (h1p + h2p) / 2;
  if (C1p * C2p !== 0 && Math.abs(h1p - h2p) > 180) {
    Hbar_p = (h1p + h2p + 360) / 2;
  }

  const T =
    1 -
    0.17 * Math.cos(((Hbar_p - 30) * Math.PI) / 180) +
    0.24 * Math.cos((2 * Hbar_p * Math.PI) / 180) +
    0.32 * Math.cos(((3 * Hbar_p + 6) * Math.PI) / 180) -
    0.2 * Math.cos(((4 * Hbar_p - 63) * Math.PI) / 180);

  const SL =
    1 +
    (0.015 * Math.pow(Lbar - 50, 2)) / Math.sqrt(20 + Math.pow(Lbar - 50, 2));
  const SC = 1 + 0.045 * Cbar_p;
  const SH = 1 + 0.015 * Cbar_p * T;

  const RT =
    -2 *
    Math.sqrt(
      Math.pow(Cbar_p, 7) / (Math.pow(Cbar_p, 7) + Math.pow(25, 7))
    ) *
    Math.sin(
      ((60 * Math.exp(-Math.pow((Hbar_p - 275) / 25, 2))) * Math.PI) / 180
    );

  const kL = 1,
    kC = 1,
    kH = 1; // Weighting factors (typically 1)

  const deltaE = Math.sqrt(
    Math.pow(dLp / (kL * SL), 2) +
      Math.pow(dCp / (kC * SC), 2) +
      Math.pow(dHp / (kH * SH), 2) +
      RT * (dCp / (kC * SC)) * (dHp / (kH * SH))
  );

  return deltaE;
}

/**
 * Simpler DeltaE94 calculation (fallback option)
 * Less accurate than DeltaE2000 but faster
 * @param lab1 First color in LAB space
 * @param lab2 Second color in LAB space
 * @returns DeltaE94 value
 */
export function deltaE94(
  lab1: [number, number, number],
  lab2: [number, number, number]
): number {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;

  const dL = L1 - L2;
  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const dC = C1 - C2;
  const da = a1 - a2;
  const db = b1 - b2;
  const dH = Math.sqrt(da * da + db * db - dC * dC);

  const kL = 1;
  const K1 = 0.045;
  const K2 = 0.015;

  const SL = 1;
  const SC = 1 + K1 * C1;
  const SH = 1 + K2 * C1;

  return Math.sqrt(
    Math.pow(dL / (kL * SL), 2) +
      Math.pow(dC / SC, 2) +
      Math.pow(dH / SH, 2)
  );
}

/**
 * Find the closest color in a palette to a target LAB color
 * Uses DeltaE2000 for perceptual accuracy
 * @param targetLab Target color in LAB space
 * @param palette Array of palette colors with precomputed LAB values
 * @returns Closest palette color
 */
export function findClosestColor(
  targetLab: [number, number, number],
  palette: PaletteColor[]
): PaletteColor {
  let minDistance = Infinity;
  let closest = palette[0];

  for (const color of palette) {
    const distance = deltaE2000(targetLab, color.lab);
    if (distance < minDistance) {
      minDistance = distance;
      closest = color;
    }
  }

  return closest;
}
