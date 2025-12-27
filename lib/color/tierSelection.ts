/**
 * Tier selection logic for choosing color lightness levels
 * Adapts Spotify's dark-dominant aesthetic with variety for grid view
 */

import type { ColorCandidate } from './serverColorExtraction';

export type Tier = 'dark' | 'medium' | 'light';

/**
 * Select appropriate tier based on album characteristics
 *
 * @param standoutColor The standout color extracted from album art
 * @param isImageNeutral Whether the image is neutral/low saturation
 * @param avgLightness Average lightness of all candidates (0-1)
 * @returns 'dark' | 'medium' | 'light'
 */
export function selectTier(
  standoutColor: ColorCandidate,
  isImageNeutral: boolean,
  avgLightness: number
): Tier {
  const hue = standoutColor.hsl.h;

  // RULE 1: Warm/Orange albums (20-50°) can use light tier
  // Matches Spotify's pattern of light backgrounds for warm tones
  if (hue >= 20 && hue <= 50) {
    if (avgLightness > 0.5) {
      return 'light';  // Bright orange/warm album → light orange bg
    }
    return 'medium';   // Medium orange/warm album → medium orange bg
  }

  // RULE 2: Very bright/white albums → medium tier (not dark)
  // Provides contrast for very light album art
  if (avgLightness > 0.75 && !isImageNeutral) {
    return 'medium';
  }

  // RULE 3: Very dark albums → always dark tier
  // Natural match - dark album art pairs with dark background
  if (avgLightness < 0.30) {
    return 'dark';
  }

  // RULE 4 (DEFAULT): Use dark tier
  // Matches Spotify's primary strategy (90% dark colors)
  return 'dark';
}
