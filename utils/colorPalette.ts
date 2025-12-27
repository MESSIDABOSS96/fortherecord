/**
 * Japanese-inspired color palette for lyric cards
 * Curated set of harmonious, muted colors inspired by traditional Japanese aesthetics
 */

// Original palette (maintained for backward compatibility)
export const JAPANESE_PALETTE = {
  // Existing colors (maintained for continuity)
  wisteria: '#c4a8d8',      // 藤色 (fuji-iro) - wisteria purple
  mizuasagi: '#8fb5e8',     // 水浅葱 (mizu-asagi) - water blue
  coral: '#e88b8b',         // 珊瑚色 (sango-iro) - coral red
  hatobanezumi: '#9fa8b5',  // 鳩羽鼠 (hatobanezumi) - dove gray
  torinoko: '#d89b7a',      // 鳥の子色 (torinoko-iro) - warm beige

  // Warm tones
  sakura: '#f4c2c2',        // 桜色 (sakura-iro) - cherry blossom
  momo: '#f19ca7',          // 桃色 (momo-iro) - peach
  usubeni: '#e89ab2',       // 薄紅 (usubeni) - light crimson
  karakurenai: '#c48a8a',   // 韓紅 (karakurenai) - deep red-brown

  // Cool tones
  asagi: '#66a5ad',         // 浅葱色 (asagi-iro) - light blue-green
  mizuiro: '#a8d8e8',       // 水色 (mizuiro) - water blue
  sorairo: '#9fc7df',       // 空色 (sorairo) - sky blue

  // Earth tones
  kinari: '#e6d5c3',        // 生成り (kinari) - ecru/natural
  yamabuki: '#e8b861',      // 山吹色 (yamabuki-iro) - golden yellow
  uguisu: '#a4b48e',        // 鶯色 (uguisu-iro) - warbler green
  moegi: '#90b494',         // 萌葱色 (moegi-iro) - spring green

  // Neutral/accent tones
  sumire: '#9e8fb2',        // 菫色 (sumire-iro) - violet
  nibiiro: '#a8a39d',       // 鈍色 (nibiiro) - dull gray
  benikakehana: '#d8a48f',  // 紅掛花色 - dusty rose-brown
  usuzumiiro: '#b8b5ad',    // 薄墨色 (usuzumiiro) - pale ink
};

/**
 * Extended palette V2: 48 colors in 8 families for perceptual matching
 */

export type ColorFamily =
  | 'Neutrals-Warm'
  | 'Neutrals-Cool'
  | 'Reds-Pinks'
  | 'Oranges-Browns'
  | 'Yellows-Ochres'
  | 'Greens'
  | 'Teals-Cyans'
  | 'Blues'
  | 'Purples';

export type PaletteColor = {
  key: string;
  hex: string;
  family: ColorFamily;
  lightness: number; // 1 (darkest) to 6 (lightest)
  lab: [number, number, number]; // Precomputed LAB values
  name?: string;
};

export const JAPANESE_PALETTE_V2: PaletteColor[] = [
  // Neutrals-Warm (6 shades)
  { key: 'sumi-1', hex: '#2B2520', family: 'Neutrals-Warm', lightness: 1, lab: [15.2, 2.1, 3.4], name: 'Deep Sumi' },
  { key: 'sumi-2', hex: '#4A423D', family: 'Neutrals-Warm', lightness: 2, lab: [28.5, 1.8, 4.2] },
  { key: 'kinari-1', hex: '#7D7268', family: 'Neutrals-Warm', lightness: 3, lab: [48.3, 2.4, 6.8] },
  { key: 'kinari-2', hex: '#A39A91', family: 'Neutrals-Warm', lightness: 4, lab: [63.1, 1.5, 6.1] },
  { key: 'kinari-3', hex: '#C9C3BC', family: 'Neutrals-Warm', lightness: 5, lab: [78.2, 0.8, 4.5] },
  { key: 'kinari-4', hex: '#E8E4DF', family: 'Neutrals-Warm', lightness: 6, lab: [90.5, 0.5, 3.2], name: 'Kinari Ivory' },

  // Neutrals-Cool (6 shades)
  { key: 'nezumi-1', hex: '#252A2E', family: 'Neutrals-Cool', lightness: 1, lab: [16.8, -1.2, -2.1] },
  { key: 'nezumi-2', hex: '#3E454B', family: 'Neutrals-Cool', lightness: 2, lab: [29.4, -1.8, -3.5] },
  { key: 'nezumi-3', hex: '#6B7479', family: 'Neutrals-Cool', lightness: 3, lab: [48.7, -2.4, -4.2] },
  { key: 'nezumi-4', hex: '#94999D', family: 'Neutrals-Cool', lightness: 4, lab: [63.5, -1.5, -2.8] },
  { key: 'nezumi-5', hex: '#BFC2C5', family: 'Neutrals-Cool', lightness: 5, lab: [78.9, -0.8, -1.5] },
  { key: 'usuzumi', hex: '#E2E4E6', family: 'Neutrals-Cool', lightness: 6, lab: [91.2, -0.4, -0.8], name: 'Usuzumi' },

  // Reds-Pinks (6 shades)
  { key: 'beni-1', hex: '#6B2C3E', family: 'Reds-Pinks', lightness: 1, lab: [28.4, 28.6, 8.2] },
  { key: 'beni-2', hex: '#8F3E52', family: 'Reds-Pinks', lightness: 2, lab: [38.2, 32.4, 9.1] },
  { key: 'kurenai', hex: '#B85D72', family: 'Reds-Pinks', lightness: 3, lab: [51.6, 30.8, 7.5], name: 'Kurenai' },
  { key: 'momo', hex: '#D88899', family: 'Reds-Pinks', lightness: 4, lab: [66.3, 24.2, 4.8], name: 'Momo' },
  { key: 'usubeni', hex: '#E8A5B4', family: 'Reds-Pinks', lightness: 5, lab: [75.8, 18.5, 3.2], name: 'Usubeni' },
  { key: 'sakura', hex: '#F4D5DC', family: 'Reds-Pinks', lightness: 6, lab: [88.4, 10.2, 1.5], name: 'Sakura' },

  // Oranges-Browns (6 shades)
  { key: 'kaki-1', hex: '#5D3A2E', family: 'Oranges-Browns', lightness: 1, lab: [28.6, 8.4, 12.6] },
  { key: 'kaki-2', hex: '#7A4F3C', family: 'Oranges-Browns', lightness: 2, lab: [38.9, 10.2, 16.8] },
  { key: 'karacha', hex: '#A66D52', family: 'Oranges-Browns', lightness: 3, lab: [52.4, 12.8, 20.4], name: 'Karacha' },
  { key: 'tonocha', hex: '#C88B6E', family: 'Oranges-Browns', lightness: 4, lab: [64.7, 14.5, 22.6], name: 'Tonocha' },
  { key: 'mikan', hex: '#E5A887', family: 'Oranges-Browns', lightness: 5, lab: [75.2, 12.8, 24.8], name: 'Mikan' },
  { key: 'shirocha', hex: '#F2D5C4', family: 'Oranges-Browns', lightness: 6, lab: [87.9, 7.2, 14.5] },

  // Yellows-Ochres (6 shades)
  { key: 'karashi-1', hex: '#5D5124', family: 'Yellows-Ochres', lightness: 1, lab: [35.8, -2.4, 22.6] },
  { key: 'karashi-2', hex: '#7A6D38', family: 'Yellows-Ochres', lightness: 2, lab: [47.2, -3.8, 28.4], name: 'Karashi' },
  { key: 'kuchinashi', hex: '#A89658', family: 'Yellows-Ochres', lightness: 3, lab: [62.5, -5.2, 35.8], name: 'Kuchinashi' },
  { key: 'kihada', hex: '#C5B87A', family: 'Yellows-Ochres', lightness: 4, lab: [74.8, -6.4, 38.2] },
  { key: 'tamago', hex: '#E5D89C', family: 'Yellows-Ochres', lightness: 5, lab: [86.3, -4.8, 32.5], name: 'Tamago' },
  { key: 'usuki', hex: '#F2EDD5', family: 'Yellows-Ochres', lightness: 6, lab: [93.6, -2.2, 18.4] },

  // Greens (6 shades)
  { key: 'tokiwa', hex: '#2E4A3A', family: 'Greens', lightness: 1, lab: [31.5, -12.8, 8.6], name: 'Tokiwa' },
  { key: 'matcha', hex: '#3D6250', family: 'Greens', lightness: 2, lab: [42.8, -18.4, 12.2], name: 'Matcha' },
  { key: 'rokusho', hex: '#5A8470', family: 'Greens', lightness: 3, lab: [55.6, -20.6, 14.8] },
  { key: 'moegi', hex: '#7FA691', family: 'Greens', lightness: 4, lab: [68.4, -18.2, 12.4], name: 'Moegi' },
  { key: 'wakaba', hex: '#A5C4B4', family: 'Greens', lightness: 5, lab: [79.2, -14.5, 8.6], name: 'Wakaba' },
  { key: 'byakuroku', hex: '#D5E8E0', family: 'Greens', lightness: 6, lab: [91.8, -8.4, 4.2] },

  // Teals-Cyans (6 shades)
  { key: 'tetsukon', hex: '#1F3D44', family: 'Teals-Cyans', lightness: 1, lab: [26.4, -8.6, -6.8] },
  { key: 'aoguro', hex: '#2D5560', family: 'Teals-Cyans', lightness: 2, lab: [36.8, -12.4, -9.2] },
  { key: 'asagi', hex: '#4A7A88', family: 'Teals-Cyans', lightness: 3, lab: [51.2, -14.8, -12.6], name: 'Asagi' },
  { key: 'sora', hex: '#6B9DAA', family: 'Teals-Cyans', lightness: 4, lab: [65.4, -13.2, -11.4] },
  { key: 'mizuasagi', hex: '#93BFCC', family: 'Teals-Cyans', lightness: 5, lab: [77.8, -10.5, -9.2], name: 'Mizuasagi' },
  { key: 'mizuiro', hex: '#C8E2EA', family: 'Teals-Cyans', lightness: 6, lab: [90.6, -6.4, -5.8], name: 'Mizuiro' },

  // Blues (6 shades)
  { key: 'kon-1', hex: '#1E2A44', family: 'Blues', lightness: 1, lab: [18.6, 2.4, -14.8] },
  { key: 'kon-2', hex: '#2A3D62', family: 'Blues', lightness: 2, lab: [28.4, 3.8, -22.6], name: 'Kon Navy' },
  { key: 'ai', hex: '#3D5A8A', family: 'Blues', lightness: 3, lab: [42.8, 5.2, -28.4], name: 'Ai Indigo' },
  { key: 'ruri', hex: '#5E7DB3', family: 'Blues', lightness: 4, lab: [57.2, 6.8, -32.6], name: 'Ruri' },
  { key: 'hanada', hex: '#89A8D4', family: 'Blues', lightness: 5, lab: [71.5, 5.4, -26.8] },
  { key: 'fuji', hex: '#C4D6ED', family: 'Blues', lightness: 6, lab: [86.8, 3.2, -16.4], name: 'Fujiiro' },

  // Purples (6 shades)
  { key: 'nasubi', hex: '#3A2647', family: 'Purples', lightness: 1, lab: [20.4, 14.6, -16.8], name: 'Nasubi' },
  { key: 'sumire-1', hex: '#523862', family: 'Purples', lightness: 2, lab: [30.6, 20.4, -22.4], name: 'Sumire' },
  { key: 'sumire-2', hex: '#735389', family: 'Purples', lightness: 3, lab: [44.8, 24.6, -26.8] },
  { key: 'fujimura', hex: '#9B7BB0', family: 'Purples', lightness: 4, lab: [59.2, 22.8, -24.6] },
  { key: 'fujimurasaki', hex: '#BFA3CF', family: 'Purples', lightness: 5, lab: [72.4, 18.2, -20.4], name: 'Fujimurasaki' },
  { key: 'usumomo', hex: '#E2D5EA', family: 'Purples', lightness: 6, lab: [87.6, 10.4, -12.2] },
];

export const COLOR_FAMILIES: Record<ColorFamily, { description: string; saturationRange: [number, number] }> = {
  'Neutrals-Warm': { description: 'Warm grays, ivories, charcoals', saturationRange: [0, 8] },
  'Neutrals-Cool': { description: 'Cool grays, slate tones', saturationRange: [0, 8] },
  'Reds-Pinks': { description: 'Beni, sakura, momo pinks', saturationRange: [15, 40] },
  'Oranges-Browns': { description: 'Kaki, karacha, terracotta', saturationRange: [12, 30] },
  'Yellows-Ochres': { description: 'Karashi, tamago, amber', saturationRange: [20, 45] },
  Greens: { description: 'Matcha, moegi, jade greens', saturationRange: [10, 28] },
  'Teals-Cyans': { description: 'Asagi, mizuiro, sky blues', saturationRange: [10, 25] },
  Blues: { description: 'Kon, ai, ruri blues', saturationRange: [8, 35] },
  Purples: { description: 'Sumire, fujimurasaki violets', saturationRange: [12, 30] },
};

/**
 * Convert hex color to RGB object
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Calculate weighted Euclidean distance between two RGB colors
 * Uses perceptual weighting: human eyes are more sensitive to green
 */
function colorDistance(
  rgb1: { r: number; g: number; b: number },
  rgb2: { r: number; g: number; b: number }
): number {
  // Weighted RGB distance (approximates perceptual difference)
  // Weights: R=0.3, G=0.59, B=0.11 (based on human eye sensitivity)
  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;

  return Math.sqrt(
    0.30 * rDiff * rDiff +
    0.59 * gDiff * gDiff +
    0.11 * bDiff * bDiff
  );
}

/**
 * Find the closest palette color to the given RGB color
 * Uses weighted Euclidean distance for perceptual matching
 */
export function matchColorToPalette(rgb: {
  r: number;
  g: number;
  b: number;
}): string {
  const paletteColors = Object.values(JAPANESE_PALETTE);

  let closestColor = paletteColors[0];
  let minDistance = Infinity;

  for (const hexColor of paletteColors) {
    const paletteRgb = hexToRgb(hexColor);
    const distance = colorDistance(rgb, paletteRgb);

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = hexColor;
    }
  }

  return closestColor;
}

/**
 * Get a random color from the palette
 * @deprecated Use deterministic fallback from lib/color/deterministicFallback.ts instead
 * Kept for backward compatibility only
 */
export function getRandomPaletteColor(): string {
  const colors = Object.values(JAPANESE_PALETTE);
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}
