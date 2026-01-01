import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Revalidate every 60 seconds
export const revalidate = 60;

// GET /api/records - Fetch all records
export async function GET() {
  try {
    // Initialize Supabase client directly in the API route
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ygpnkvwretilfrmeirtp.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncG5rdndyZXRpbGZybWVpcnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4OTgzNTUsImV4cCI6MjA4MjQ3NDM1NX0.Cqc7J68bQotQ1lQa61_PKc7thX_QUrQz7ahkAILxOOM';

    // Debug: Log environment variables
    console.log('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
    console.log('SUPABASE_KEY:', supabaseKey ? 'SET' : 'MISSING');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch records', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || [], {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/records - Create a new record
export async function POST(request: Request) {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ygpnkvwretilfrmeirtp.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncG5rdndyZXRpbGZybWVpcnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4OTgzNTUsImV4cCI6MjA4MjQ3NDM1NX0.Cqc7J68bQotQ1lQa61_PKc7thX_QUrQz7ahkAILxOOM';

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'id',
      'for_name',
      'song_title',
      'artist',
      'lyric_excerpt',
      'reflection_text',
      'background_color'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Insert the record
    const { data, error } = await supabase
      .from('records')
      .insert([{
        id: body.id,
        card_type: 'lyric',
        for_name: body.for_name,
        song_title: body.song_title,
        artist: body.artist,
        album_art_url: body.album_art_url || null,
        spotify_track_id: body.spotify_track_id || null,
        lyric_excerpt: body.lyric_excerpt,
        reflection_text: body.reflection_text,
        background_color: body.background_color,
        created_at: body.created_at || new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create record' },
        { status: 500 }
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
