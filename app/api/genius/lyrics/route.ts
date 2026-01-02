import { NextRequest, NextResponse } from 'next/server';
import { cleanSongTitle } from '@/utils/cleanSongTitle';

export const maxDuration = 60;

// Musixmatch API base URL
const MUSIXMATCH_API_BASE = 'https://api.musixmatch.com/ws/1.1';

interface MusixmatchTrack {
  track_id: number;
  track_name: string;
  artist_name: string;
}

interface MusixmatchSearchResponse {
  message: {
    header: {
      status_code: number;
    };
    body: {
      track_list: Array<{
        track: MusixmatchTrack;
      }>;
    };
  };
}

interface MusixmatchLyricsResponse {
  message: {
    header: {
      status_code: number;
    };
    body: {
      lyrics?: {
        lyrics_body: string;
      };
    };
  };
}

// Search for a track on Musixmatch
async function searchMusixmatchTrack(
  title: string,
  artist: string,
  apiKey: string
): Promise<MusixmatchTrack | null> {
  const cleanedTitle = cleanSongTitle(title);
  const primaryArtist = artist.split(',')[0].trim();

  const searchUrl = `${MUSIXMATCH_API_BASE}/track.search?` +
    `q_track=${encodeURIComponent(cleanedTitle)}&` +
    `q_artist=${encodeURIComponent(primaryArtist)}&` +
    `page_size=5&` +
    `apikey=${apiKey}`;

  console.log(`Searching Musixmatch for: "${cleanedTitle}" by ${primaryArtist}`);

  const response = await fetch(searchUrl);
  const data: MusixmatchSearchResponse = await response.json();

  if (data.message.header.status_code !== 200) {
    console.error('Musixmatch search failed:', data.message.header.status_code);
    return null;
  }

  const trackList = data.message.body.track_list;
  if (!trackList || trackList.length === 0) {
    console.warn(`No tracks found for "${cleanedTitle}" by ${primaryArtist}`);
    return null;
  }

  // Return the first (best) match
  const bestMatch = trackList[0].track;
  console.log(`Found track: "${bestMatch.track_name}" by ${bestMatch.artist_name} (ID: ${bestMatch.track_id})`);

  return bestMatch;
}

// Get lyrics for a track from Musixmatch
async function getMusixmatchLyrics(
  trackId: number,
  apiKey: string
): Promise<string | null> {
  const lyricsUrl = `${MUSIXMATCH_API_BASE}/track.lyrics.get?` +
    `track_id=${trackId}&` +
    `apikey=${apiKey}`;

  console.log(`Fetching lyrics for track ID: ${trackId}`);

  const response = await fetch(lyricsUrl);
  const data: MusixmatchLyricsResponse = await response.json();

  if (data.message.header.status_code !== 200) {
    console.error('Musixmatch lyrics fetch failed:', data.message.header.status_code);
    return null;
  }

  const lyrics = data.message.body.lyrics?.lyrics_body;
  if (!lyrics) {
    console.warn('No lyrics found in response');
    return null;
  }

  // Remove Musixmatch footer (usually contains "******* This Lyrics is NOT for Commercial use *******")
  const cleanedLyrics = lyrics
    .split('*******')[0]
    .trim();

  console.log(`Successfully fetched ${cleanedLyrics.length} characters of lyrics`);

  return cleanedLyrics;
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

    const apiKey = process.env.MUSIXMATCH_API_KEY;
    if (!apiKey) {
      console.error('MUSIXMATCH_API_KEY not configured');
      return NextResponse.json(
        { error: 'Lyrics service not configured' },
        { status: 500 }
      );
    }

    // Search for the track
    const track = await searchMusixmatchTrack(title, artist, apiKey);
    if (!track) {
      return NextResponse.json(
        { error: 'Song not found on Musixmatch' },
        { status: 404 }
      );
    }

    // Get the lyrics
    const lyrics = await getMusixmatchLyrics(track.track_id, apiKey);
    if (!lyrics) {
      return NextResponse.json(
        { error: 'Lyrics not available for this song' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      lyrics,
      matchedTitle: track.track_name,
      matchedArtist: track.artist_name
    });

  } catch (error) {
    console.error('Musixmatch lyrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lyrics' },
      { status: 500 }
    );
  }
}
