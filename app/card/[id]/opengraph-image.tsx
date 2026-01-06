import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { cleanSongTitle } from '@/utils/cleanSongTitle';

export const runtime = 'edge';
export const alt = 'Record Card';
export const contentType = 'image/png';

async function getRecord(id: string) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ygpnkvwretilfrmeirtp.supabase.co';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncG5rdndyZXRpbGZybWVpcnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4OTgzNTUsImV4cCI6MjA4MjQ3NDM1NX0.Cqc7J68bQotQ1lQa61_PKc7thX_QUrQz7ahkAILxOOM';

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function Image(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await getRecord(id);

    if (!record) {
      return new Response('Record not found', { status: 404 });
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
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}

