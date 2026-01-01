import { Record } from '@/types/record';

export type FilterType = 'all' | 'songs' | 'lyrics' | 'stories' | 'people';

/**
 * Searches records based on query string and filter type.
 * Performs case-insensitive substring matching across relevant fields.
 * Excludes non-lyric decorative cards (logo, vinyl, image) from search results.
 *
 * @param records - Array of records to search
 * @param query - Search query string
 * @param filter - Filter type to apply
 * @returns Filtered array of records
 */
export function searchRecords(
  records: Record[],
  query: string,
  filter: FilterType
): Record[] {
  // No filtering needed if query is empty and filter is 'all'
  if (!query.trim() && filter === 'all') {
    return records;
  }

  const normalizedQuery = query.toLowerCase().trim();

  return records.filter((record) => {
    // Skip non-lyric decorative cards from search
    if (record.card_type && record.card_type !== 'lyric') {
      return false;
    }

    // Apply filter-specific search
    switch (filter) {
      case 'songs':
        return (
          record.song_title.toLowerCase().includes(normalizedQuery) ||
          record.artist.toLowerCase().includes(normalizedQuery)
        );

      case 'lyrics':
        return record.lyric_excerpt.toLowerCase().includes(normalizedQuery);

      case 'stories':
        return record.reflection_text.toLowerCase().includes(normalizedQuery);

      case 'people':
        return record.for_name.toLowerCase().includes(normalizedQuery);

      case 'all':
      default:
        // Search across ALL fields
        return (
          record.for_name.toLowerCase().includes(normalizedQuery) ||
          record.song_title.toLowerCase().includes(normalizedQuery) ||
          record.artist.toLowerCase().includes(normalizedQuery) ||
          record.lyric_excerpt.toLowerCase().includes(normalizedQuery) ||
          record.reflection_text.toLowerCase().includes(normalizedQuery)
        );
    }
  });
}
