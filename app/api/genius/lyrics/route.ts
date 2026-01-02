import { NextRequest, NextResponse } from 'next/server';
import { cleanSongTitle } from '@/utils/cleanSongTitle';
import axios from 'axios';
import * as cheerio from 'cheerio';

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

// Scrape lyrics from Genius.com URL
// Uses modern cheerio to preserve [Verse], [Chorus], [Bridge] structure
async function scrapeGeniusLyrics(url: string): Promise<string | null> {
  try {
    console.log(`Scraping Genius lyrics from: ${url}`);

    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://genius.com/',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
      }
    });

    const $ = cheerio.load(response.data);
    const lyricsContainers = $('div[data-lyrics-container="true"]');

    if (lyricsContainers.length === 0) {
      console.error('No lyrics containers found');
      return null;
    }

    let lyrics = '';
    lyricsContainers.each((_, container) => {
      $(container).contents().each((__, node) => {
        if (node.type === 'text') {
          lyrics += $(node).text();
        } else if (node.type === 'tag') {
          if (node.name === 'br') {
            lyrics += '\n';
          } else {
            lyrics += $(node).text();
          }
        }
      });
      lyrics += '\n\n';
    });

    lyrics = lyrics.trim().replace(/\n{3,}/g, '\n\n');

    if (!lyrics || lyrics.length < 50) {
      console.error(`Lyrics too short: ${lyrics.length} chars`);
      return null;
    }

    console.log(`Successfully scraped ${lyrics.length} characters from Genius`);
    return lyrics;
  } catch (error) {
    console.error('Error scraping Genius:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.message, error.code, error.response?.status);
    }
    return null;
  }
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

    // Try top 2 matches by scraping Genius with modern cheerio
    for (let i = 0; i < Math.min(scoredResults.length, 2); i++) {
      const candidate = scoredResults[i];

      console.log(`[${i + 1}] Attempting scrape: "${candidate.title}" by ${candidate.artist} (score: ${candidate.score})`);
      console.log(`[${i + 1}] URL: ${candidate.url}`);

      try {
        const lyrics = await scrapeGeniusLyrics(candidate.url);

        if (!lyrics) {
          console.error(`[${i + 1}] Scraper returned null for "${candidate.title}"`);
          continue; // Try next candidate
        }

        console.log(`[${i + 1}] Scraped ${lyrics.length} chars from "${candidate.title}"`);

        // Validate lyrics content
        if (!validateLyricsContent(lyrics, title, artist)) {
          console.warn(`[${i + 1}] Validation failed for "${candidate.title}"`);
          continue; // Try next candidate
        }

        // Success! Return the lyrics
        console.log(`✓ Successfully scraped Genius lyrics for "${candidate.title}" by ${candidate.artist}`);
        return NextResponse.json({
          lyrics,
          matchedTitle: candidate.title,
          matchedArtist: candidate.artist
        });
      } catch (err) {
        console.error(`[${i + 1}] Exception scraping "${candidate.title}":`, err);
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
