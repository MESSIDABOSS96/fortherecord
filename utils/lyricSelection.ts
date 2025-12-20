/**
 * Split lyrics into individual lines, filtering out empty lines and section headers
 */
export function splitLyricsIntoLines(lyrics: string): string[] {
  return lyrics
    .split('\n')
    .map(line => line.trim())
    .filter(line => {
      // Filter out empty lines
      if (line.length === 0) return false;

      // Filter out section headers like [Verse 1], [Chorus], etc.
      if (line.startsWith('[') && line.endsWith(']')) return false;

      // Filter out parenthetical annotations like (2x)
      if (line.match(/^\([^)]+\)$/)) return false;

      return true;
    });
}

/**
 * Validate lyric selection (max 3 lines)
 */
export function validateLyricSelection(lines: string[]): {
  valid: boolean;
  error?: string;
} {
  if (lines.length === 0) {
    return { valid: false, error: 'Please select at least one line' };
  }

  if (lines.length > 3) {
    return { valid: false, error: 'Maximum 3 lines allowed' };
  }

  return { valid: true };
}

/**
 * Format selected lines for display (join with newlines)
 */
export function formatLyricExcerpt(lines: string[]): string {
  return lines.join('\n');
}
