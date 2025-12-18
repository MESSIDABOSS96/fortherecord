export type CardType = 'lyric' | 'image' | 'logo' | 'vinyl';

export interface Record {
  id: string;
  cardType?: CardType; // defaults to 'lyric' if not specified
  for_name: string;
  song_title: string;
  artist: string;
  album_art_url?: string;
  spotify_track_id?: string; // Spotify track ID for API integration
  lyric_excerpt: string;
  reflection_text: string;
  background_color: string;
  created_at: Date;

  // Type-specific fields
  imageUrl?: string;        // For 'image' cards
  logoText?: string;         // For 'logo' cards
  vinylImageUrl?: string;   // For 'vinyl' cards
}
