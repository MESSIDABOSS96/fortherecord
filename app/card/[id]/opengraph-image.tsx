import { ImageResponse } from '@vercel/og';
import React from 'react';
import { cleanSongTitle } from '@/utils/cleanSongTitle';

export const runtime = 'edge';
export const alt = 'Record Card';
export const contentType = 'image/png';
export const size = {
  width: 1200,
  height: 630,
};

async function getRecord(id: string) {
  try {
    // Fetch from API route instead of direct Supabase access in edge runtime
    // In edge runtime, we need to use absolute URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://fortherecord-three.vercel.app';
    
    const response = await fetch(`${baseUrl}/api/records/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Failed to fetch record ${id}: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching record:', error);
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    
    if (!id) {
      return new Response('Missing record ID', { status: 400 });
    }

    const record = await getRecord(id);

    if (!record) {
      return new Response(`Record not found: ${id}`, { status: 404 });
    }

    const backgroundColor = record.background_color || '#f5f3f0';
    const songTitle = cleanSongTitle(record.song_title || '');
    const artist = record.artist || '';
    const lyrics = record.lyric_excerpt || '';
    const forName = record.for_name || '';

    // Truncate lyrics to fit in image (approximately 4-5 lines)
    const maxLength = 120;
    const displayLyrics = lyrics.length > maxLength 
      ? lyrics.substring(0, maxLength) + '...' 
      : lyrics;

    return new ImageResponse(
      React.createElement(
        'div',
        {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: backgroundColor,
            padding: '48px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
        },
        // Header: Album art + Song info
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              marginBottom: '32px',
            },
          },
          React.createElement(
            'div',
            {
              style: {
                width: '92px',
                height: '92px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              },
            },
            record.album_art_url
              ? React.createElement('img', {
                  src: record.album_art_url,
                  alt: songTitle,
                  width: 92,
                  height: 92,
                  style: { borderRadius: '8px', objectFit: 'cover' },
                })
              : React.createElement(
                  'div',
                  {
                    style: {
                      width: '48px',
                      height: '48px',
                      border: '4px solid white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  },
                  React.createElement('div', {
                    style: {
                      width: '16px',
                      height: '16px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                    },
                  })
                )
          ),
          React.createElement(
            'div',
            { style: { flex: 1, minWidth: 0 } },
            React.createElement(
              'div',
              {
                style: {
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: '8px',
                },
              },
              songTitle
            ),
            React.createElement(
              'div',
              {
                style: {
                  fontSize: '24px',
                  color: '#666666',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
              },
              artist
            )
          )
        ),
        // Lyrics
        React.createElement(
          'div',
          {
            style: {
              fontSize: '36px',
              fontWeight: 'bold',
              lineHeight: '1.35',
              color: '#1a1a1a',
              marginBottom: '32px',
              whiteSpace: 'pre-line',
              flex: 1,
            },
          },
          displayLyrics
        ),
        // For label
        React.createElement(
          'div',
          {
            style: {
              fontSize: '20px',
              fontWeight: '500',
              fontStyle: 'italic',
              color: 'rgba(26, 26, 26, 0.7)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            },
          },
          `FOR ${forName.toUpperCase()}`
        )
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    console.error('Error generating OG image:', error);
    // Return a simple error image instead of blank screen
    return new ImageResponse(
      React.createElement(
        'div',
        {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f3f0',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '24px',
            color: '#666',
          },
        },
        `Error: ${error?.message || 'Failed to generate image'}`
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}

