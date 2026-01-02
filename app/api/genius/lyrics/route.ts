import { NextRequest, NextResponse } from 'next/server';
import { cleanSongTitle } from '@/utils/cleanSongTitle';

// Increase timeout for Vercel serverless function (requires Pro plan)
// Hobby plan max is 10s, Pro allows up to 60s
export const maxDuration = 60;

// TypeScript interfaces for Genius API
interface GeniusSearchResult {
  result: {
    title: string;
    primary_artist: {
      name: string;
    };
    url: string;
    id: number;
  };
}

interface ScoredResult {
  url: string;
  title: string;
  artist: string;
  score: number;
}

// Levenshtein distance calculation for string similarity
function getEditDistance(s1: string, s2: string): number {
  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

// Calculate similarity between two strings (0 to 1)
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// Search Genius API directly
async function searchGenius(query: string, apiKey: string): Promise<GeniusSearchResult[]> {
  const response = await fetch(
    `https://api.genius.com/search?q=${encodeURIComponent(query)}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Genius search failed');
  }

  const data = await response.json();
  return data.response.hits || [];
}

// Score a search result based on title/artist matching
function scoreSongMatch(
  result: GeniusSearchResult,
  targetTitle: string,
  targetArtist: string
): number {
  let score = 0;

  const resultTitle = result.result.title.toLowerCase();
  const resultArtist = result.result.primary_artist.name.toLowerCase();
  const targetTitleLower = targetTitle.toLowerCase();
  const targetArtistLower = targetArtist.toLowerCase();

  // TITLE MATCHING (max 60 points)
  if (resultTitle === targetTitleLower) {
    score += 60; // Perfect match
  } else if (resultTitle.includes(targetTitleLower)) {
    score += 40; // Contains target
  } else if (targetTitleLower.includes(resultTitle)) {
    score += 30; // Target contains result
  } else {
    // Calculate similarity
    const similarity = calculateSimilarity(resultTitle, targetTitleLower);
    score += Math.floor(similarity * 40);
  }

  // ARTIST MATCHING (max 40 points)
  // Also handle "The " prefix differences (e.g., "The Beatles" vs "Beatles", "The Five Stairsteps" vs "Five Stairsteps")
  const resultArtistNoThe = resultArtist.replace(/^the\s+/i, '');
  const targetArtistNoThe = targetArtistLower.replace(/^the\s+/i, '');

  if (resultArtist === targetArtistLower) {
    score += 40; // Perfect match
  } else if (resultArtistNoThe === targetArtistNoThe) {
    score += 38; // Match without "The" prefix
  } else if (resultArtist.includes(targetArtistLower) || targetArtistLower.includes(resultArtist)) {
    score += 25; // Partial match
  } else {
    const similarity = calculateSimilarity(resultArtist, targetArtistLower);
    score += Math.floor(similarity * 20);
  }

  // PENALTIES (negative points for wrong versions)
  const titleLowerFull = resultTitle.toLowerCase();

  // Penalize covers by other artists
  if (resultArtist !== targetArtistLower && !resultArtist.includes(targetArtistLower)) {
    score -= 50; // Heavy penalty for wrong artist
  }

  // Penalize remasters/live/alternate versions slightly
  if (titleLowerFull.includes('remaster')) score -= 3;
  if (titleLowerFull.includes('live')) score -= 8;
  if (titleLowerFull.includes('cover')) score -= 15;
  if (titleLowerFull.includes('tribute')) score -= 20;
  if (titleLowerFull.includes('karaoke')) score -= 25;

  // Prefer original over medley if exact match exists
  if (titleLowerFull.includes('/') && resultTitle !== targetTitleLower) {
    score -= 5; // Slight penalty for medleys
  }

  return Math.max(0, score); // Never negative
}

// Find best matching song from search results
async function findBestSongMatch(
  title: string,
  artist: string,
  apiKey: string
): Promise<ScoredResult[] | null> {
  // Clean the title before searching to remove Spotify-specific suffixes
  const cleanedTitle = cleanSongTitle(title);

  // Extract primary artist (first artist before comma, if multiple)
  // Spotify includes featuring artists in artist field: "Tyler, The Creator, Brent Faiyaz, Fana Hues"
  // Genius only has primary artist: "Tyler, The Creator"
  const primaryArtist = artist.split(',')[0].trim();

  const query = `${cleanedTitle} ${primaryArtist}`;

  console.log(`Searching for: "${cleanedTitle}" by ${primaryArtist} (original: "${title}" by ${artist})`);

  const searchResults = await searchGenius(query, apiKey);

  if (searchResults.length === 0) {
    console.warn(`No search results for "${cleanedTitle}" by ${primaryArtist}`);
    return null;
  }

  // Score all results using CLEANED title and PRIMARY artist
  const scored = searchResults.map(hit => {
    const score = scoreSongMatch(hit, cleanedTitle, primaryArtist);
    return {
      url: hit.result.url,
      title: hit.result.title,
      artist: hit.result.primary_artist.name,
      score: score
    };
  });

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  // Log top 3 for debugging
  console.log(`Top matches for "${cleanedTitle}" by ${primaryArtist}:`);
  scored.slice(0, 3).forEach((match, i) => {
    console.log(`  ${i + 1}. "${match.title}" by ${match.artist} (score: ${match.score})`);
  });

  // Return best match if score is reasonable (>30)
  if (scored[0].score < 30) {
    console.warn(`Best match score too low (${scored[0].score}) for "${cleanedTitle}" by ${primaryArtist}`);
    return null;
  }

  return scored;
}

// Validate lyrics content to detect obviously wrong results
// Simplified for speed to avoid Vercel timeout
function validateLyricsContent(lyrics: string, title: string, artist: string): boolean {
  // Basic check: Minimum length only
  const lineCount = lyrics.split('\n').filter(l => l.trim()).length;
  if (lineCount < 5) {
    console.warn(`Lyrics validation failed for "${title}" by ${artist}: too short (${lineCount} lines)`);
    return false;
  }

  // Quick check for obvious Genius UI elements
  if (lyrics.includes('Contributors') && lineCount < 10) {
    console.warn(`Lyrics validation failed for "${title}" by ${artist}: appears to be metadata`);
    return false;
  }

  return true;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get('title');
    const artist = searchParams.get('artist');

    if (!title || !artist) {
      return NextResponse.json(
        { error: 'Missing title or artist parameter' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GENIUS_ACCESS_TOKEN;
    if (!apiKey) {
      console.error('GENIUS_ACCESS_TOKEN not configured');
      return NextResponse.json(
        { error: 'Lyrics service not configured' },
        { status: 500 }
      );
    }

    // Find best matching songs (returns array sorted by score)
    const scoredResults = await findBestSongMatch(title, artist, apiKey);

    if (!scoredResults || scoredResults.length === 0) {
      console.warn(`No good match found for "${title}" by ${artist}`);
      return NextResponse.json(
        { error: 'Song not found on Genius' },
        { status: 404 }
      );
    }

    // Dynamic import of extractLyrics
    const extractLyrics = (await import('genius-lyrics-api/lib/utils/extractLyrics' as any)).default as any;

    // Try up to 2 matches with detailed error logging
    for (let i = 0; i < Math.min(scoredResults.length, 2); i++) {
      const candidate = scoredResults[i];

      console.log(`[${i + 1}] Attempting: "${candidate.title}" by ${candidate.artist} (score: ${candidate.score}) - URL: ${candidate.url}`);

      try {
        const lyrics = await extractLyrics(candidate.url);

        if (!lyrics) {
          console.error(`[${i + 1}] extractLyrics returned null/undefined for "${candidate.title}"`);
          continue; // Try next candidate
        }

        console.log(`[${i + 1}] Extracted ${lyrics.length} chars from "${candidate.title}"`);

        // Validate lyrics content
        if (!validateLyricsContent(lyrics, title, artist)) {
          console.warn(`[${i + 1}] Validation failed for "${candidate.title}"`);
          continue; // Try next candidate
        }

        // Success! Return the lyrics
        console.log(`✓ Successfully fetched lyrics for "${candidate.title}" by ${candidate.artist}`);
        return NextResponse.json({
          lyrics,
          matchedTitle: candidate.title,
          matchedArtist: candidate.artist
        });
      } catch (err) {
        console.error(`[${i + 1}] Exception extracting lyrics from "${candidate.title}":`, err);
        console.error(`[${i + 1}] Error stack:`, err instanceof Error ? err.stack : 'No stack trace');
        continue; // Try next candidate
      }
    }

    // If we get here, none of the candidates worked
    console.error(`All candidates failed for "${title}" by ${artist}`);
    return NextResponse.json(
      { error: 'Could not extract valid lyrics from any matching songs' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Genius lyrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lyrics' },
      { status: 500 }
    );
  }
}
