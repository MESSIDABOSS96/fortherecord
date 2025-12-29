import { SelectedLyric } from '@/hooks/useAddRecordState';

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
 * Validate lyric selection (max 4 lines)
 */
export function validateLyricSelection(lines: SelectedLyric[]): {
  valid: boolean;
  error?: string;
} {
  if (lines.length === 0) {
    return { valid: false, error: 'Please select at least one line' };
  }

  if (lines.length > 4) {
    return { valid: false, error: 'Maximum 4 lines allowed' };
  }

  return { valid: true };
}

/**
 * Format selected lines for display (sorted by original song position, then joined with newlines)
 */
export function formatLyricExcerpt(lines: SelectedLyric[]): string {
  return lines
    .slice()
    .sort((a, b) => a.originalIndex - b.originalIndex)
    .map(l => l.text)
    .join('\n');
}

/**
 * Normalizes lyric subheaders to their root form
 * Falls back to original header if normalization produces empty or invalid result
 *
 * Examples:
 * - "Verse 1" → "Verse"
 * - "Chorus 2" → "Chorus"
 * - "Pre-Chorus 1" → "Pre-Chorus"
 * - "Intro" → "Intro" (unchanged)
 * - "Skit: Mommy" → "Skit"
 *
 * Safety: Returns original header if normalization would produce empty string
 */
export function normalizeSubheader(header: string): string {
  if (!header) return header;

  const original = header.trim();
  let normalized = original;

  // Step 1: Remove numbered suffixes (e.g., "Verse 1" → "Verse")
  normalized = normalized.replace(/\s+\d+$/i, '');

  // Step 2: Remove descriptors after colons (e.g., "Skit: Mommy" → "Skit")
  // Only if there's actual content before the colon
  if (normalized.includes(':') && normalized.indexOf(':') > 0) {
    normalized = normalized.split(':')[0].trim();
  }

  // Step 3: Remove parenthetical annotations (e.g., "Verse (Live)" → "Verse")
  normalized = normalized.replace(/\s*\(.+\)$/i, '');

  // Safety check: If we ended up with empty string or very short result, return original
  if (!normalized || normalized.length < 2) {
    return original;
  }

  return normalized.trim();
}
