import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import React from 'react';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cardId = params.id;
    
    // Fetch the record
    const baseUrl = request.nextUrl.origin;
    const recordsResponse = await fetch(`${baseUrl}/api/records`);
    if (!recordsResponse.ok) {
      throw new Error('Failed to fetch records');
    }
    
    const records = await recordsResponse.json();
    const record = records.find((r: any) => r.id === cardId);
    
    if (!record) {
      return new Response('Card not found', { status: 404 });
    }

    const backgroundColor = record.background_color || '#f5f3f0';
    const songTitle = record.song_title || '';
    const artist = record.artist || '';
    const lyrics = record.lyric_excerpt || '';
    const forName = record.for_name || '';
    
    // Truncate lyrics if too long
    const maxLines = 4;
    const lyricsLines = lyrics.split('\n').slice(0, maxLines);
    const displayLyrics = lyricsLines.join('\n');
    
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
            padding: '24px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
        },
        // Header
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            },
          },
          React.createElement(
            'div',
            {
              style: {
                width: '46px',
                height: '46px',
                borderRadius: '4px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            },
            record.album_art_url
              ? React.createElement('img', {
                  src: record.album_art_url,
                  alt: songTitle,
                  width: 46,
                  height: 46,
                  style: { borderRadius: '4px', objectFit: 'cover' },
                })
              : React.createElement(
                  'div',
                  {
                    style: {
                      width: '24px',
                      height: '24px',
                      border: '2px solid white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  },
                  React.createElement('div', {
                    style: {
                      width: '8px',
                      height: '8px',
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
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
              },
              songTitle
            ),
            React.createElement(
              'div',
              {
                style: {
                  fontSize: '12px',
                  color: '#666666',
                  marginTop: '4px',
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
              fontSize: '18px',
              fontWeight: 'bold',
              lineHeight: '1.35',
              color: '#1a1a1a',
              marginBottom: '16px',
              whiteSpace: 'pre-line',
            },
          },
          displayLyrics
        ),
        // For label
        React.createElement(
          'div',
          {
            style: {
              fontSize: '10px',
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
        width: 400,
        height: 500,
      }
    );
  } catch (error) {
    console.error('Error generating card image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}

