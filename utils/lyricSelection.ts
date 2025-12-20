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

      // Filter out lines with embedded section tags like "Title[Intro]"
      if (line.includes('[') && line.includes(']')) return false;

      // Filter out parenthetical annotations like (2x)
      if (line.match(/^\([^)]+\)$/)) return false;

      // Filter out Genius metadata patterns
      if (line.match(/\d+\s*Contributors?/i)) return false;
      if (line.match(/Translations?/i)) return false;
      if (line.match(/Lyrics$/)) return false;

      // Filter out language names commonly found in Genius metadata
      const languagePattern = /(Nederlands|Italiano|Español|Français|Deutsch|Português|Polski|Türkçe|Русский|日本語|中文)/;
      if (languagePattern.test(line)) return false;

      // Filter out lines that are suspiciously long (likely concatenated metadata)
      if (line.length > 150) return false;

      // Filter out "Embed" buttons and other UI elements
      if (line.match(/^Embed$/i)) return false;
      if (line.match(/^See.*Lyrics$/i)) return false;

      // Filter out lines with unusual character density (camelCase spam)
      const uppercaseCount = (line.match(/[A-Z]/g) || []).length;
      if (uppercaseCount > line.length * 0.4) return false;

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
