/**
 * Curated 27-color palette for lyric cards (SOURCE OF TRUTH)
 * All colors manually selected by designer
 * HSL and LAB values precomputed for performance
 */

import { hexToLab } from '../../../lib/color/colorConversion';

export type CardColorFamily =
  | 'warmNeutrals'
  | 'coolNeutrals'
  | 'reds'
  | 'pinks'
  | 'purples'
  | 'blues'
  | 'greens'
  | 'ochres';

export type CardPaletteToken = {
  hex: string;
  family: CardColorFamily;
  tier: 'dark' | 'medium' | 'light';
  hsl: { h: number; s: number; l: number };
  lab: [number, number, number];
  name?: string;
};

/**
 * Helper to convert hex to HSL
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`Invalid hex: ${hex}`);

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

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
 * The expanded 55-color curated palette
 * Organized by family and tier (dark/medium/light)
 * Incorporates Spotify-sourced dark colors + original curated palette
 */
export const CARD_PALETTE: CardPaletteToken[] = [
  // ===== BLUES FAMILY (6 colors: 3 dark, 2 medium, 1 light) =====
  // DARK tier
  {
    hex: '#00355D',
    family: 'blues',
    tier: 'dark',
    hsl: hexToHsl('#00355D'),
    lab: hexToLab('#00355D'),
    name: 'Deep Navy',
  },
  {
    hex: '#1A3657',
    family: 'blues',
    tier: 'dark',
    hsl: hexToHsl('#1A3657'),
    lab: hexToLab('#1A3657'),
    name: 'Dark Blue',
  },
  {
    hex: '#28354F',
    family: 'blues',
    tier: 'dark',
    hsl: hexToHsl('#28354F'),
    lab: hexToLab('#28354F'),
    name: 'Midnight Blue',
  },
  // MEDIUM tier
  {
    hex: '#395886',
    family: 'blues',
    tier: 'medium',
    hsl: hexToHsl('#395886'),
    lab: hexToLab('#395886'),
    name: 'Navy Blue',
  },
  {
    hex: '#638ECB',
    family: 'blues',
    tier: 'medium',
    hsl: hexToHsl('#638ECB'),
    lab: hexToLab('#638ECB'),
    name: 'Blue',
  },
  // LIGHT tier
  {
    hex: '#8AAEE0',
    family: 'blues',
    tier: 'light',
    hsl: hexToHsl('#8AAEE0'),
    lab: hexToLab('#8AAEE0'),
    name: 'Sky Blue',
  },

  // ===== REDS FAMILY (7 colors: 3 dark, 3 medium, 1 light) =====
  // DARK tier
  {
    hex: '#650000',
    family: 'reds',
    tier: 'dark',
    hsl: hexToHsl('#650000'),
    lab: hexToLab('#650000'),
    name: 'Dark Red',
  },
  {
    hex: '#5C1D21',
    family: 'reds',
    tier: 'dark',
    hsl: hexToHsl('#5C1D21'),
    lab: hexToLab('#5C1D21'),
    name: 'Deep Burgundy',
  },
  {
    hex: '#402020',
    family: 'reds',
    tier: 'dark',
    hsl: hexToHsl('#402020'),
    lab: hexToLab('#402020'),
    name: 'Dark Brown Red',
  },
  // MEDIUM tier
  {
    hex: '#BF262B',
    family: 'reds',
    tier: 'medium',
    hsl: hexToHsl('#BF262B'),
    lab: hexToLab('#BF262B'),
    name: 'Crimson',
  },
  {
    hex: '#A33C3C',
    family: 'reds',
    tier: 'medium',
    hsl: hexToHsl('#A33C3C'),
    lab: hexToLab('#A33C3C'),
    name: 'Brick Red',
  },
  {
    hex: '#B75B56',
    family: 'reds',
    tier: 'medium',
    hsl: hexToHsl('#B75B56'),
    lab: hexToLab('#B75B56'),
    name: 'Terracotta',
  },
  // LIGHT tier
  {
    hex: '#F3C7BD',
    family: 'reds',
    tier: 'light',
    hsl: hexToHsl('#F3C7BD'),
    lab: hexToLab('#F3C7BD'),
    name: 'Blush',
  },

  // ===== PURPLES FAMILY (6 colors: 3 dark, 2 medium, 1 light) =====
  // DARK tier
  {
    hex: '#62003B',
    family: 'purples',
    tier: 'dark',
    hsl: hexToHsl('#62003B'),
    lab: hexToLab('#62003B'),
    name: 'Dark Magenta',
  },
  {
    hex: '#630133',
    family: 'purples',
    tier: 'dark',
    hsl: hexToHsl('#630133'),
    lab: hexToLab('#630133'),
    name: 'Deep Purple',
  },
  {
    hex: '#302838',
    family: 'purples',
    tier: 'dark',
    hsl: hexToHsl('#302838'),
    lab: hexToLab('#302838'),
    name: 'Dark Plum',
  },
  // MEDIUM tier
  {
    hex: '#6C5F8D',
    family: 'purples',
    tier: 'medium',
    hsl: hexToHsl('#6C5F8D'),
    lab: hexToLab('#6C5F8D'),
    name: 'Purple',
  },
  {
    hex: '#9C8CB9',
    family: 'purples',
    tier: 'medium',
    hsl: hexToHsl('#9C8CB9'),
    lab: hexToLab('#9C8CB9'),
    name: 'Lavender Purple',
  },
  // LIGHT tier
  {
    hex: '#BA96C1',
    family: 'purples',
    tier: 'light',
    hsl: hexToHsl('#BA96C1'),
    lab: hexToLab('#BA96C1'),
    name: 'Lavender',
  },

  // ===== GREENS FAMILY (4 colors: 2 dark, 2 medium) =====
  // DARK tier
  {
    hex: '#003D05',
    family: 'greens',
    tier: 'dark',
    hsl: hexToHsl('#003D05'),
    lab: hexToLab('#003D05'),
    name: 'Dark Green',
  },
  {
    hex: '#2B3A12',
    family: 'greens',
    tier: 'dark',
    hsl: hexToHsl('#2B3A12'),
    lab: hexToLab('#2B3A12'),
    name: 'Olive Green',
  },
  // MEDIUM tier
  {
    hex: '#519A73',
    family: 'greens',
    tier: 'medium',
    hsl: hexToHsl('#519A73'),
    lab: hexToLab('#519A73'),
    name: 'Forest Green',
  },
  {
    hex: '#00A699',
    family: 'greens',
    tier: 'medium',
    hsl: hexToHsl('#00A699'),
    lab: hexToLab('#00A699'),
    name: 'Teal',
  },

  // ===== OCHRES/ORANGES FAMILY (6 colors: 2 dark, 2 medium, 2 light) =====
  // DARK tier
  {
    hex: '#4C2E01',
    family: 'ochres',
    tier: 'dark',
    hsl: hexToHsl('#4C2E01'),
    lab: hexToLab('#4C2E01'),
    name: 'Dark Brown',
  },
  {
    hex: '#5C3A0F',
    family: 'ochres',
    tier: 'dark',
    hsl: hexToHsl('#5C3A0F'),
    lab: hexToLab('#5C3A0F'),
    name: 'Dark Orange Brown',
  },
  // MEDIUM tier
  {
    hex: '#DC7322',
    family: 'ochres',
    tier: 'medium',
    hsl: hexToHsl('#DC7322'),
    lab: hexToLab('#DC7322'),
    name: 'Orange',
  },
  {
    hex: '#EBB40f',
    family: 'ochres',
    tier: 'medium',
    hsl: hexToHsl('#EBB40f'),
    lab: hexToLab('#EBB40f'),
    name: 'Golden Yellow',
  },
  // LIGHT tier
  {
    hex: '#FFC09C',
    family: 'ochres',
    tier: 'light',
    hsl: hexToHsl('#FFC09C'),
    lab: hexToLab('#FFC09C'),
    name: 'Light Orange',
  },
  {
    hex: '#EDB44D',
    family: 'ochres',
    tier: 'light',
    hsl: hexToHsl('#EDB44D'),
    lab: hexToLab('#EDB44D'),
    name: 'Amber',
  },

  // ===== PINKS FAMILY (3 colors: 1 dark, 2 medium) =====
  // DARK tier
  {
    hex: '#5F1721',
    family: 'pinks',
    tier: 'dark',
    hsl: hexToHsl('#5F1721'),
    lab: hexToLab('#5F1721'),
    name: 'Dark Rose',
  },
  // MEDIUM tier
  {
    hex: '#FC809F',
    family: 'pinks',
    tier: 'medium',
    hsl: hexToHsl('#FC809F'),
    lab: hexToLab('#FC809F'),
    name: 'Rose Pink',
  },
  {
    hex: '#FFBCCD',
    family: 'pinks',
    tier: 'medium',
    hsl: hexToHsl('#FFBCCD'),
    lab: hexToLab('#FFBCCD'),
    name: 'Light Pink',
  },

  // ===== WARM NEUTRALS FAMILY (6 colors: all medium tier) =====
  {
    hex: '#7f6554',
    family: 'warmNeutrals',
    tier: 'medium',
    hsl: hexToHsl('#7f6554'),
    lab: hexToLab('#7f6554'),
    name: 'Warm Brown',
  },
  {
    hex: '#8E6159',
    family: 'warmNeutrals',
    tier: 'medium',
    hsl: hexToHsl('#8E6159'),
    lab: hexToLab('#8E6159'),
    name: 'Dusty Rose Brown',
  },
  {
    hex: '#a59385',
    family: 'warmNeutrals',
    tier: 'medium',
    hsl: hexToHsl('#a59385'),
    lab: hexToLab('#a59385'),
    name: 'Taupe',
  },
  {
    hex: '#c09e85',
    family: 'warmNeutrals',
    tier: 'medium',
    hsl: hexToHsl('#c09e85'),
    lab: hexToLab('#c09e85'),
    name: 'Warm Beige',
  },
  {
    hex: '#DCD7D5',
    family: 'warmNeutrals',
    tier: 'medium',
    hsl: hexToHsl('#DCD7D5'),
    lab: hexToLab('#DCD7D5'),
    name: 'Warm Silver',
  },
  {
    hex: '#e0cfc3',
    family: 'warmNeutrals',
    tier: 'medium',
    hsl: hexToHsl('#e0cfc3'),
    lab: hexToLab('#e0cfc3'),
    name: 'Warm Ivory',
  },

  // ===== COOL NEUTRALS FAMILY (7 colors: 3 dark, 4 medium) =====
  // DARK tier
  {
    hex: '#353535',
    family: 'coolNeutrals',
    tier: 'dark',
    hsl: hexToHsl('#353535'),
    lab: hexToLab('#353535'),
    name: 'Dark Gray',
  },
  {
    hex: '#383039',
    family: 'coolNeutrals',
    tier: 'dark',
    hsl: hexToHsl('#383039'),
    lab: hexToLab('#383039'),
    name: 'Dark Purple Gray',
  },
  {
    hex: '#303737',
    family: 'coolNeutrals',
    tier: 'dark',
    hsl: hexToHsl('#303737'),
    lab: hexToLab('#303737'),
    name: 'Dark Slate',
  },
  // MEDIUM tier
  {
    hex: '#484E4C',
    family: 'coolNeutrals',
    tier: 'medium',
    hsl: hexToHsl('#484E4C'),
    lab: hexToLab('#484E4C'),
    name: 'Slate',
  },
  {
    hex: '#5e5e5e',
    family: 'coolNeutrals',
    tier: 'medium',
    hsl: hexToHsl('#5e5e5e'),
    lab: hexToLab('#5e5e5e'),
    name: 'Charcoal',
  },
  {
    hex: '#95a8ac',
    family: 'coolNeutrals',
    tier: 'medium',
    hsl: hexToHsl('#95a8ac'),
    lab: hexToLab('#95a8ac'),
    name: 'Cool Gray',
  },
  {
    hex: '#AEA8B0',
    family: 'coolNeutrals',
    tier: 'medium',
    hsl: hexToHsl('#AEA8B0'),
    lab: hexToLab('#AEA8B0'),
    name: 'Dove Gray',
  },
];

/**
 * Hue ranges for mapping standout colors to families
 * Ranges in degrees (0-360)
 * Note: Red wraps around (345-360 and 0-15)
 */
export const FAMILY_HUE_RANGES: Record<
  CardColorFamily,
  { min: number; max: number; wrapAround?: boolean }
> = {
  reds: { min: 345, max: 15, wrapAround: true },
  pinks: { min: 315, max: 345 },
  purples: { min: 270, max: 315 },
  blues: { min: 195, max: 275 }, // Expanded from 200-270 for better blue coverage
  greens: { min: 60, max: 195 }, // Expanded to start at 60° to capture yellow-greens
  ochres: { min: 40, max: 60 }, // Narrowed to 40-60° to avoid yellow-greens
  warmNeutrals: { min: 15, max: 35 }, // orange-beige range
  coolNeutrals: { min: 0, max: 360 }, // fallback for low saturation
};

/**
 * Get all tokens in a specific family
 */
export function getTokensByFamily(family: CardColorFamily): CardPaletteToken[] {
  return CARD_PALETTE.filter((token) => token.family === family);
}

/**
 * Get a specific token by hex value
 */
export function getTokenByHex(hex: string): CardPaletteToken | undefined {
  return CARD_PALETTE.find((token) => token.hex.toLowerCase() === hex.toLowerCase());
}

/**
 * Sort tokens in a family by lightness (light to dark)
 */
export function sortByLightness(
  tokens: CardPaletteToken[],
  ascending = true
): CardPaletteToken[] {
  return [...tokens].sort((a, b) => {
    const diff = a.hsl.l - b.hsl.l;
    return ascending ? diff : -diff;
  });
}

/**
 * Get tokens in a specific family AND tier
 * Used for tier-based color selection
 */
export function getTokensByFamilyAndTier(
  family: CardColorFamily,
  tier: 'dark' | 'medium' | 'light'
): CardPaletteToken[] {
  return CARD_PALETTE.filter((token) => token.family === family && token.tier === tier);
}
