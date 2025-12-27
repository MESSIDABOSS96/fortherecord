/**
 * Deterministic fallback color selection when image extraction fails
 * Uses stable hashing to ensure same image URL always produces same color
 * Updated to use curated 27-color palette
 */

import {
  CARD_PALETTE,
  getTokensByFamily,
  type CardColorFamily,
  type CardPaletteToken,
} from '../../src/lib/colors/cardPalette';
import { contrastRatio } from './contrastUtils';

/**
 * Simple string hash function (djb2 algorithm)
 * Produces consistent integer from any string input
 * @param str Input string to hash
 * @returns Positive integer hash value
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i); // hash * 33 + c
  }
  return Math.abs(hash);
}

/**
 * Extract stable identifier from Spotify or other image URL
 * Spotify URLs contain a hash portion that's unique per image
 * Example: https://i.scdn.co/image/ab67616d0000b273a1b2c3d4e5f6... → a1b2c3d4e5f6...
 * @param imageUrl Full image URL
 * @returns Stable identifier extracted from URL
 */
export function extractStableId(imageUrl: string): string {
  // Try to extract hash portion from Spotify CDN URLs
  const match = imageUrl.match(/\/([a-f0-9]{32,})(?:\?|$)/i);
  return match ? match[1] : imageUrl;
}

/**
 * Get deterministic fallback color based on image URL hash
 * Prefers neutrals for cohesion
 * Same URL will always produce the same color selection
 * @param imageUrl Image URL to hash
 * @returns Palette color and text color
 */
export function getDeterministicFallbackColor(imageUrl: string): {
  paletteColor: CardPaletteToken;
  textColor: string;
  reason: string;
} {
  const stableId = extractStableId(imageUrl);
  const hash = hashString(stableId);

  // Define family priorities (prefer neutrals for cohesion)
  const families: CardColorFamily[] = [
    'coolNeutrals',
    'warmNeutrals',
    'blues',
    'purples',
    'greens',
    'reds',
    'pinks',
    'ochres',
  ];

  // Use hash to select family
  const familyIndex = hash % families.length;
  const selectedFamily = families[familyIndex];

  const familyTokens = getTokensByFamily(selectedFamily);
  const colorIndex = Math.floor(hash / families.length) % familyTokens.length;
  const paletteColor = familyTokens[colorIndex];

  // Choose text color based on contrast
  const darkContrast = contrastRatio(paletteColor.hex, '#111111');
  const lightContrast = contrastRatio(paletteColor.hex, '#F7F7F7');
  const textColor = darkContrast >= lightContrast ? '#111111' : '#F7F7F7';

  return {
    paletteColor,
    textColor,
    reason: `Fallback using hash of image ID (family: ${selectedFamily}, token: ${paletteColor.hex})`,
  };
}
