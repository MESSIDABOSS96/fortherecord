import { NextRequest, NextResponse } from 'next/server';
import { getLyrics } from 'genius-lyrics-api';

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

    // Verify Genius API token
    const apiKey = process.env.GENIUS_ACCESS_TOKEN;
    if (!apiKey) {
      console.error('GENIUS_ACCESS_TOKEN not configured');
      return NextResponse.json(
        { error: 'Lyrics service not configured' },
        { status: 500 }
      );
    }

    // Fetch lyrics using genius-lyrics-api
    const lyrics = await getLyrics({
      apiKey,
      title,
      artist,
      optimizeQuery: true, // Removes common words like "feat.", "remix", etc.
    });

    if (!lyrics) {
      return NextResponse.json(
        { error: 'Lyrics not found for this song' },
        { status: 404 }
      );
    }

    return NextResponse.json({ lyrics });
  } catch (error) {
    console.error('Genius lyrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lyrics' },
      { status: 500 }
    );
  }
}
