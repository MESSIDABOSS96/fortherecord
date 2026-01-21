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
    const reflectionText = record.reflection_text || '';

    // Format date
    const createdAt = new Date(record.created_at);
    const formattedDate = createdAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Truncate lyrics if too long (for left panel)
    const maxLyricsLength = 150;
    const displayLyrics = lyrics.length > maxLyricsLength
      ? lyrics.substring(0, maxLyricsLength) + '...'
      : lyrics;

    // Truncate reflection if too long (for right panel)
    const maxReflectionLength = 200;
    const displayReflection = reflectionText.length > maxReflectionLength
      ? reflectionText.substring(0, maxReflectionLength) + '...'
      : reflectionText;

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
            padding: '48px 80px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            borderRadius: '24px',
          },
        },
        // Single column mobile-style layout
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            },
          },
          // Top: Album art + Song title + Artist (horizontal row)
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
                  width: '72px',
                  height: '72px',
                  borderRadius: '6px',
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
                    width: 72,
                    height: 72,
                    style: { borderRadius: '6px', objectFit: 'cover' },
                  })
                : React.createElement(
                    'div',
                    {
                      style: {
                        width: '36px',
                        height: '36px',
                        border: '3px solid white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      },
                    },
                    React.createElement('div', {
                      style: {
                        width: '12px',
                        height: '12px',
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
                    marginBottom: '6px',
                  },
                },
                songTitle
              ),
              React.createElement(
                'div',
                {
                  style: {
                    fontSize: '22px',
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
          // Middle: Lyric excerpt (bold, large)
          React.createElement(
            'div',
            {
              style: {
                fontSize: '32px',
                fontWeight: 'bold',
                lineHeight: '1.35',
                color: '#1a1a1a',
                whiteSpace: 'pre-line',
                marginBottom: '32px',
              },
            },
            displayLyrics
          ),
          // Divider
          React.createElement('div', {
            style: {
              width: '100%',
              height: '1px',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              marginBottom: '24px',
            },
          }),
          // "For [name]" header
          React.createElement(
            'div',
            {
              style: {
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginBottom: '16px',
                textAlign: 'center',
              },
            },
            `For ${forName}`
          ),
          // Reflection text
          React.createElement(
            'div',
            {
              style: {
                fontSize: '20px',
                lineHeight: '1.5',
                color: '#1a1a1a',
                textAlign: 'center',
                flex: 1,
              },
            },
            displayReflection
          )
        ),
        // Footer
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '24px',
            },
          },
          React.createElement(
            'div',
            {
              style: {
                fontSize: '16px',
                color: 'rgba(26, 26, 26, 0.7)',
                letterSpacing: '0.03em',
              },
            },
            `Posted on ${formattedDate}`
          ),
          React.createElement(
            'div',
            {
              style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginTop: '6px',
              },
            },
            'fortherecord.fm'
          )
        )
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    console.error('Error generating OG image:', error);
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
