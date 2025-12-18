export type CardSize = 'small' | 'medium' | 'large';

export interface CardSizeConfig {
  maxLines: number;
  minHeight: string;
  maxHeight: string;
}

export const CARD_SIZE_CONFIG: Record<CardSize, CardSizeConfig> = {
  small: {
    maxLines: 3,
    minHeight: '180px',
    maxHeight: '240px',
  },
  medium: {
    maxLines: 5,
    minHeight: '240px',
    maxHeight: '320px',
  },
  large: {
    maxLines: 8,
    minHeight: '320px',
    maxHeight: '450px',
  },
};

/**
 * Calculate the appropriate card size based on lyric content.
 * This creates a natural visual rhythm in the masonry grid.
 */
export function calculateCardSize(lyricExcerpt: string): CardSize {
  if (!lyricExcerpt || lyricExcerpt.trim().length === 0) {
    return 'small';
  }

  const lines = lyricExcerpt.split('\n').filter(line => line.trim());
  const wordCount = lyricExcerpt.trim().split(/\s+/).length;

  // Prioritize line count for formatted lyrics (like verses)
  if (lines.length > 4) return 'large';
  if (lines.length > 2) return 'medium';

  // Fall back to word count for prose-style lyrics
  if (wordCount <= 15) return 'small';
  if (wordCount <= 35) return 'medium';
  return 'large';
}
