/**
 * Palette mapping module
 * Maps standout colors to palette families and selects optimal tokens
 */

import {
  CARD_PALETTE,
  FAMILY_HUE_RANGES,
  getTokensByFamily,
  getTokensByFamilyAndTier,
  sortByLightness,
  type CardColorFamily,
  type CardPaletteToken,
} from '../../src/lib/colors/cardPalette';
import { deltaE2000 } from './colorDistance';
import { contrastRatio } from './contrastUtils';
import type { ColorCandidate } from './standoutColorExtraction';
import type { Tier } from './tierSelection';

/**
 * Map standout color to appropriate palette family
 * Based on hue and saturation
 */
export function mapToFamily(
  standoutColor: ColorCandidate,
  isImageNeutral: boolean
): CardColorFamily {
  const { hsl, lab } = standoutColor;

  // Enhanced neutral detection for dark albums
  if (isImageNeutral || hsl.s < 0.12) {
    // b* > 0 = warm (yellow/red bias)
    // b* < 0 = cool (blue bias)
    const bStar = lab[2];
    // Stricter threshold for cool neutrals (was 0, now 2)
    return bStar > 2 ? 'warmNeutrals' : 'coolNeutrals';
  }

  // Map by hue
  const hue = hsl.h;

  // Check each family's hue range
  for (const [family, range] of Object.entries(FAMILY_HUE_RANGES)) {
    if (family === 'coolNeutrals' || family === 'warmNeutrals') {
      continue; // Already handled neutrals
    }

    const { min, max, wrapAround } = range;

    if (wrapAround) {
      // Handle red wrap-around (345-360 and 0-15)
      if (hue >= min || hue <= max) {
        return family as CardColorFamily;
      }
    } else {
      if (hue >= min && hue <= max) {
        // Special case: greens near blue boundary - prefer coolNeutrals if borderline
        if (family === 'greens' && hue >= 160 && hue <= 180 && hsl.s < 0.3) {
          return 'coolNeutrals';
        }
        return family as CardColorFamily;
      }
    }
  }

  // Fallback to neutrals if no match
  return hsl.h < 180 ? 'warmNeutrals' : 'coolNeutrals';
}

/**
 * Find closest token within a family using DeltaE
 * Now tier-aware: filters by both family and tier
 */
export function findClosestToken(
  standoutColor: ColorCandidate,
  family: CardColorFamily,
  tier: Tier
): CardPaletteToken {
  // Get tokens in this family AND tier
  let familyTokens = getTokensByFamilyAndTier(family, tier);

  // If no tokens in this tier, fall back to adjacent tier
  if (familyTokens.length === 0) {
    if (tier === 'light') {
      // Light → Medium fallback
      familyTokens = getTokensByFamilyAndTier(family, 'medium');
    } else if (tier === 'medium') {
      // Medium → Dark fallback
      familyTokens = getTokensByFamilyAndTier(family, 'dark');
    }

    // If still no tokens, use any from family (ultimate fallback)
    if (familyTokens.length === 0) {
      familyTokens = getTokensByFamily(family);
    }

    // If still empty, use first palette color
    if (familyTokens.length === 0) {
      return CARD_PALETTE[0];
    }
  }

  // Find closest by DeltaE (perceptual distance)
  let minDistance = Infinity;
  let closestToken = familyTokens[0];

  for (const token of familyTokens) {
    const distance = deltaE2000(standoutColor.lab, token.lab);
    if (distance < minDistance) {
      minDistance = distance;
      closestToken = token;
    }
  }

  return closestToken;
}

/**
 * Ensure text contrast meets WCAG 4.5:1
 * Chooses between #111111 and #F7F7F7
 * If neither works, tries stepping to lighter/darker tokens in same family
 */
export function ensureTextContrast(
  bgToken: CardPaletteToken,
  family: CardColorFamily
): { bgColor: string; textColor: string } {
  const darkText = '#111111';
  const lightText = '#F7F7F7';

  // Test both text colors
  const darkContrast = contrastRatio(bgToken.hex, darkText);
  const lightContrast = contrastRatio(bgToken.hex, lightText);

  // Pick the better one
  const textColor = darkContrast >= lightContrast ? darkText : lightText;

  // Check if it meets WCAG AA (4.5:1)
  const chosenContrast = Math.max(darkContrast, lightContrast);

  if (chosenContrast >= 4.5) {
    return { bgColor: bgToken.hex, textColor };
  }

  // If neither meets 4.5:1, try stepping to lighter/darker tokens in family
  const familyTokens = getTokensByFamily(family);
  const sorted = sortByLightness(familyTokens, true);

  // If text is light, we need a darker bg
  // If text is dark, we need a lighter bg
  const needDarker = textColor === lightText;

  for (const token of needDarker ? sorted.reverse() : sorted) {
    const newContrast = contrastRatio(token.hex, textColor);
    if (newContrast >= 4.5) {
      return { bgColor: token.hex, textColor };
    }
  }

  // If still no luck, fall back to neutrals
  const neutralFamily = needDarker ? 'coolNeutrals' : 'warmNeutrals';
  const neutralTokens = sortByLightness(getTokensByFamily(neutralFamily), !needDarker);

  for (const token of neutralTokens) {
    const newContrast = contrastRatio(token.hex, textColor);
    if (newContrast >= 4.5) {
      return { bgColor: token.hex, textColor };
    }
  }

  // Last resort: return original and hope for the best
  return { bgColor: bgToken.hex, textColor };
}
