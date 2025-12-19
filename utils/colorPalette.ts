/**
 * Japanese-inspired color palette for lyric cards
 * Curated set of harmonious, muted colors inspired by traditional Japanese aesthetics
 */

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
 * Used as fallback when color extraction fails
 */
export function getRandomPaletteColor(): string {
  const colors = Object.values(JAPANESE_PALETTE);
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}
