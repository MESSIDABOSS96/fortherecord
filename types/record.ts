export interface Record {
  id: string;
  card_type?: string;
  for_name: string;
  song_title: string;
  artist: string;
  album_art_url?: string;
  spotify_track_id?: string; // Spotify track ID for API integration
  lyric_excerpt: string;
  reflection_text: string;
  background_color: string;
  created_at: Date;
}
