import { NextRequest, NextResponse } from 'next/server';

// Spotify token cache
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getSpotifyToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  // Get new token from Spotify
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify token');
  }

  const data = await response.json();
  cachedToken = data.access_token;
  // Set expiry to 5 minutes before actual expiry for safety
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

  if (!cachedToken) {
    throw new Error('Failed to get access token from Spotify');
  }

  return cachedToken;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim() === '') {
      return NextResponse.json({ tracks: [] });
    }

    // Get access token
    const token = await getSpotifyToken();

    // Search Spotify
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;
    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Spotify search failed');
    }

    const data = await response.json();

    // Transform Spotify data to our format
    const tracks = data.tracks.items.map((track: any) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist: any) => artist.name).join(', '),
      album: track.album.name,
      albumArt: track.album.images[0]?.url || '', // Largest image
      albumArtMedium: track.album.images[1]?.url || track.album.images[0]?.url || '', // 300x300
      albumArtSmall: track.album.images[2]?.url || track.album.images[1]?.url || '', // 64x64
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls.spotify,
    }));

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Spotify search error:', error);
    return NextResponse.json(
      { error: 'Failed to search Spotify' },
      { status: 500 }
    );
  }
}
