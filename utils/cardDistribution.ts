import { Record as RecordModel, CardType } from '@/types/record';

export interface DistributionConfig {
  targetRatio: number;        // 0.2 - 0.3 (20-30%)
  minSpacing: number;         // Minimum cards between same type
  columnCount?: number;       // Column count for even distribution (default: 4)
}

/**
 * Intelligently distributes non-lyric cards among lyric cards
 * to achieve a target ratio while preventing clustering of same types.
 * Uses a builder pattern to ensure column variety and spacing constraints.
 */
export function distributeNonLyricCards(
  lyricCards: RecordModel[],
  nonLyricCards: RecordModel[],
  config: DistributionConfig = { targetRatio: 0.25, minSpacing: 3, columnCount: 4 }
): RecordModel[] {
  // Edge case: no cards to distribute
  if (lyricCards.length === 0) return nonLyricCards;
  if (nonLyricCards.length === 0) return lyricCards;

  // 1. Calculate Targets
  const targetNonLyricCount = Math.floor(
    (config.targetRatio * lyricCards.length) / (1 - config.targetRatio)
  );

  // Cap at available non-lyric cards
  const insertCount = Math.min(targetNonLyricCount, nonLyricCards.length);

  if (insertCount === 0) return lyricCards;

  // 2. Prepare Queues
  const lyricQueue = [...lyricCards];
  const cardsByType = groupCardsByType(nonLyricCards);
  let availableNonLyrics: RecordModel[] = [];
  const types = Object.keys(cardsByType);

  // Flatten randomly to create a supply pool
  while (availableNonLyrics.length < insertCount) {
    const validTypes = types.filter(t => cardsByType[t].length > 0);
    if (validTypes.length === 0) break;

    // Pick random type
    const randomType = validTypes[Math.floor(Math.random() * validTypes.length)];
    const card = cardsByType[randomType].shift()!;
    availableNonLyrics.push(card);
  }

  const expectedTotalLength = lyricCards.length + insertCount;

  // 3. Generate Target Schedule
  // Create a list of "ideal" indices where we want to place non-lyrics
  // distinct from specific constraints.
  const targetIndices: number[] = [];
  const segmentSize = expectedTotalLength / insertCount;

  for (let k = 0; k < insertCount; k++) {
    // Target middle of segment with random jitter
    const segmentStart = k * segmentSize;
    const segmentEnd = (k + 1) * segmentSize;
    const jitter = Math.random() * (segmentSize * 0.5) - (segmentSize * 0.25);

    let target = Math.floor(segmentStart + (segmentSize / 2) + jitter);

    // Ensure targets are at least somewhat spaced and don't start at 0
    if (target < 1) target = 1;
    if (targetIndices.length > 0 && target <= targetIndices[targetIndices.length - 1]) {
      target = targetIndices[targetIndices.length - 1] + 1;
    }

    targetIndices.push(target);
  }

  // 4. Sequential Build
  const result: RecordModel[] = [];
  const columnCount = config.columnCount || 4;

  // State tracking
  let lastNonLyricIndex = -999;
  let lastNonLyricCol = -1;
  const typeHistory: string[] = [];

  let nonLyricsPlaced = 0;

  // We iterate through all potential slots
  for (let i = 0; i < expectedTotalLength; i++) {
    const currentCol = i % columnCount;

    // Are we due for a placement?
    // Use the next target index from our schedule
    let isDue = false;
    if (nonLyricsPlaced < insertCount) {
      // Look at the "next" target. If we passed it, we are due.
      // However, we strictly consume one target per placement.
      const currentTarget = targetIndices[nonLyricsPlaced];
      if (i >= currentTarget) {
        isDue = true;
      }
    }

    // Determine if we CAN place here
    let canPlaceNonLyric = isDue && availableNonLyrics.length > 0;

    // Constraint 0: Never at index 0
    if (i === 0) canPlaceNonLyric = false;

    // Constraint 1: Minimum Spacing
    if (i - lastNonLyricIndex < config.minSpacing) {
      canPlaceNonLyric = false;
    }

    // Constraint 2: Column Variety 
    if (currentCol === lastNonLyricCol) {
      canPlaceNonLyric = false;
    }

    // Emergency Override: If we run out of lyrics, we MUST place (or if strictly forced by end of array)
    const remainingSlots = expectedTotalLength - i;
    const remainingNonLyrics = availableNonLyrics.length;
    if (remainingNonLyrics >= remainingSlots) {
      canPlaceNonLyric = true;
    }

    if (canPlaceNonLyric) {
      // PLACING NON-LYRIC

      // Select best non-lyric
      let bestIndex = 0;
      for (let k = 0; k < availableNonLyrics.length; k++) {
        const type = getCardTypeKey(availableNonLyrics[k]);
        const recentTypes = typeHistory.slice(-config.minSpacing);
        if (!recentTypes.includes(type)) {
          bestIndex = k;
          break;
        }
      }

      const card = availableNonLyrics[bestIndex];
      availableNonLyrics.splice(bestIndex, 1);

      result.push(card);

      // Update state
      lastNonLyricIndex = i;
      lastNonLyricCol = currentCol;
      typeHistory.push(getCardTypeKey(card));
      nonLyricsPlaced++;

    } else {
      // PLACING LYRIC
      if (lyricQueue.length > 0) {
        result.push(lyricQueue.shift()!);
      } else if (availableNonLyrics.length > 0) {
        // Fallback
        result.push(availableNonLyrics.shift()!);
        nonLyricsPlaced++; // Count this forced placement
      }
    }
  }

  return result;
}

/**
 * Helper to get a unique type key for a card
 */
function getCardTypeKey(card: RecordModel): string {
  if (card.cardType === 'vinyl' && card.vinylImageUrl) {
    const filename = card.vinylImageUrl.split('/').pop()?.split('.')[0] || 'vinyl';
    return `vinyl-${filename}`;
  }
  return card.cardType || 'lyric';
}

/**
 * Groups cards by their detailed type (including vinyl variants)
 */
function groupCardsByType(cards: RecordModel[]): Record<string, RecordModel[]> {
  const grouped: Record<string, RecordModel[]> = {}; // Explicitly typed

  for (const card of cards) {
    const typeKey = getCardTypeKey(card);
    if (!grouped[typeKey]) {
      grouped[typeKey] = [];
    }
    grouped[typeKey].push(card);
  }

  return grouped;
}
