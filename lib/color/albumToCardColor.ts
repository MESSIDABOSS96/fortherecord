/**
 * Main orchestrator for album cover to card color extraction
 * Uses standout color algorithm to find visually striking colors
 * Maps to curated 55-color palette with tier-based selection
 */

import { extractStandoutColorServer as extractStandoutColor, type ColorCandidate } from './serverColorExtraction';
import { mapToFamily, findClosestToken, ensureTextContrast } from './paletteMapping';
import { selectTier } from './tierSelection';
import type { CardColorFamily } from '../../src/lib/colors/cardPalette';
import { getDeterministicFallbackColor } from './deterministicFallback';

export type ColorExtractionResult = {
  bgColor: string;
  textColor: string;
  family: CardColorFamily;
  tier?: 'dark' | 'medium' | 'light';
  paletteKey: string;
  method: 'extraction' | 'fallback';
  debug?: {
    candidates: ColorCandidate[];
    standoutColor: ColorCandidate;
    chosenFamily: CardColorFamily;
    chosenToken: string;
    imageAvgColor: { r: number; g: number; b: number };
    isImageNeutral: boolean;
  };
};

/**
 * Extract card colors from album cover using standout color algorithm
 * @param imageUrl URL of the album cover image
 * @param stableId Optional stable ID for deterministic fallback
 * @param includeDebug Whether to include debug information
 * @returns Color extraction result with background and text colors
 */
export async function getCardColorsFromAlbumCover(
  imageUrl: string,
  stableId?: string,
  includeDebug = false
): Promise<ColorExtractionResult> {
  try {
    // Step 1: Extract standout color from album art
    const { standoutColor, allCandidates, imageAvgColor, isImageNeutral } =
      await extractStandoutColor(imageUrl);

    // Step 2: Calculate average lightness for tier selection
    const avgLightness = allCandidates.length > 0
      ? allCandidates.reduce((sum, c) => sum + c.hsl.l, 0) / allCandidates.length
      : standoutColor.hsl.l;

    // Step 3: Map standout color to palette family
    const family = mapToFamily(standoutColor, isImageNeutral);

    // Step 4: Select tier based on album characteristics
    const tier = selectTier(standoutColor, isImageNeutral, avgLightness);

    // Step 5: Find closest token within that family AND tier
    const token = findClosestToken(standoutColor, family, tier);

    // Step 6: Ensure text contrast meets WCAG 4.5:1
    const { bgColor, textColor } = ensureTextContrast(token, family);

    return {
      bgColor,
      textColor,
      family,
      tier,
      paletteKey: token.hex,
      method: 'extraction',
      ...(includeDebug && {
        debug: {
          candidates: allCandidates,
          standoutColor,
          chosenFamily: family,
          chosenToken: token.hex,
          imageAvgColor,
          isImageNeutral,
        },
      }),
    };
  } catch (error) {
    console.error('Color extraction failed, using deterministic fallback:', error);

    // Deterministic fallback based on hash
    const fallbackResult = getDeterministicFallbackColor(stableId || imageUrl);

    return {
      bgColor: fallbackResult.paletteColor.hex,
      textColor: fallbackResult.textColor,
      family: fallbackResult.paletteColor.family,
      tier: fallbackResult.paletteColor.tier,
      paletteKey: fallbackResult.paletteColor.hex,
      method: 'fallback',
    };
  }
}

/**
 * Legacy function name for backward compatibility
 * @deprecated Use getCardColorsFromAlbumCover instead
 */
export async function albumToCardColor(
  imageUrl: string,
  imageBuffer?: Buffer
): Promise<ColorExtractionResult> {
  // imageBuffer param ignored - not used in client-side extraction
  return getCardColorsFromAlbumCover(imageUrl);
}
