import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/records - Fetch all records
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch records' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
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
        card_type: body.cardType || body.card_type || 'lyric',
        for_name: body.for_name,
        song_title: body.song_title,
        artist: body.artist,
        album_art_url: body.album_art_url || null,
        spotify_track_id: body.spotify_track_id || null,
        lyric_excerpt: body.lyric_excerpt,
        reflection_text: body.reflection_text,
        background_color: body.background_color,
        created_at: body.created_at || new Date().toISOString(),
        image_url: body.imageUrl || body.image_url || null,
        logo_text: body.logoText || body.logo_text || null,
        vinyl_image_url: body.vinylImageUrl || body.vinyl_image_url || null
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
