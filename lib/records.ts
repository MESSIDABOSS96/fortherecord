import { seedRecords } from '@/data/seedRecords';
import { Record } from '@/types/record';

/**
 * Static archive data source.
 *
 * The site originally read from Supabase. That project was on the free tier,
 * went idle, was paused, and then deleted — taking the live grid down with it.
 * Records now come from `data/seedRecords.ts`, which is committed to the repo,
 * so the archive stays up indefinitely with no database, no credentials, and
 * nothing that can expire.
 *
 * Submissions are closed. See `SUBMISSIONS_CLOSED_MESSAGE`.
 */

export const SUBMISSIONS_CLOSED_MESSAGE =
  'For the Record is now a closed archive. New submissions are no longer being accepted, but every record shared here stays up.';

/** Every record in the archive, newest first. */
export function getAllRecords(): Record[] {
  return [...seedRecords].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Only the lyric cards — this is what the home grid renders.
 * Records with no `card_type` are treated as lyric cards, matching the
 * original client-side filter.
 */
export function getLyricRecords(): Record[] {
  return getAllRecords().filter(
    (r) => r.card_type === 'lyric' || !r.card_type
  );
}

/** A single record by id, or null if it isn't in the archive. */
export function getRecordById(id: string): Record | null {
  return getAllRecords().find((r) => r.id === id) ?? null;
}
