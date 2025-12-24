import { Record, CardType } from '@/types/record';

export interface DistributionConfig {
  targetRatio: number;        // 0.2 - 0.3 (20-30%)
  minSpacing: number;         // Minimum cards between same type
  columnCount?: number;       // Column count for even distribution (default: 4)
}

/**
 * Intelligently distributes non-lyric cards among lyric cards
 * to achieve a target ratio while preventing clustering of same types
 * and ensuring even distribution across columns
 */
export function distributeNonLyricCards(
  lyricCards: Record[],
  nonLyricCards: Record[],
  config: DistributionConfig = { targetRatio: 0.25, minSpacing: 3, columnCount: 4 }
): Record[] {
  // Edge case: no cards to distribute
  if (lyricCards.length === 0) return nonLyricCards;
  if (nonLyricCards.length === 0) return lyricCards;

  const columnCount = config.columnCount || 4;

  // Calculate how many non-lyric cards we should insert
  const targetNonLyricCount = Math.floor(
    lyricCards.length * config.targetRatio / (1 - config.targetRatio)
  );

  // Limit to available non-lyric cards
  const cardsToInsert = Math.min(targetNonLyricCount, nonLyricCards.length);

  // If we have very few lyric cards, just append non-lyric cards
  if (lyricCards.length < 10) {
    return [...lyricCards, ...nonLyricCards.slice(0, cardsToInsert)];
  }

  // Group non-lyric cards by type for even distribution
  const cardsByType = groupCardsByType(nonLyricCards);

  // Create a rotation queue of card types
  const typeQueue = createTypeRotationQueue(cardsByType);

  // Pre-calculate insertion positions that will give even column distribution
  // Strategy: Divide the lyric cards into segments and place one non-lyric card per segment
  const insertionPositions: number[] = [];
  const columnUsage: number[] = new Array(columnCount).fill(0);

  // Calculate ideal spacing between non-lyric cards for even vertical distribution
  const idealSpacing = Math.floor(lyricCards.length / (cardsToInsert + 1));

  // Generate candidate positions that are evenly spaced vertically
  for (let i = 0; i < cardsToInsert; i++) {
    // Find column with least usage
    const targetColumn = columnUsage.indexOf(Math.min(...columnUsage));

    // Start from ideal position for this segment
    let basePosition = (i + 1) * idealSpacing;

    // Search window around the ideal position to find one that maps to target column
    // This ensures we maintain vertical distribution while achieving column balance
    const searchRadius = Math.min(idealSpacing, 10);
    let foundPosition = false;

    // Try positions in a window around the ideal position
    for (let offset = 0; offset <= searchRadius; offset++) {
      // Alternate checking positions before and after ideal position
      const positions = offset === 0 ? [basePosition] : [basePosition + offset, basePosition - offset];

      for (const pos of positions) {
        if (pos >= 0 && pos < lyricCards.length) {
          const column = pos % columnCount;
          if (column === targetColumn) {
            // Check minimum spacing from previously placed cards
            const hasGoodSpacing = insertionPositions.every(
              prevPos => Math.abs(pos - prevPos) >= config.minSpacing
            );

            if (hasGoodSpacing) {
              insertionPositions.push(pos);
              columnUsage[targetColumn]++;
              foundPosition = true;
              break;
            }
          }
        }
      }

      if (foundPosition) break;
    }

    // Fallback: if we couldn't find a position with perfect spacing, relax constraints
    if (!foundPosition) {
      for (let pos = basePosition; pos < lyricCards.length; pos++) {
        const column = pos % columnCount;
        if (column === targetColumn) {
          insertionPositions.push(pos);
          columnUsage[targetColumn]++;
          foundPosition = true;
          break;
        }
      }
    }

    // Last resort: just pick the next available position
    if (!foundPosition && basePosition < lyricCards.length) {
      insertionPositions.push(basePosition);
    }
  }

  // Sort positions to insert from back to front (prevents position shifting)
  insertionPositions.sort((a, b) => b - a);

  // Build result array starting with lyric cards
  const result: Record[] = [...lyricCards];

  // Track last position of each card type to prevent same-type clustering
  const lastPositionByType: Map<string, number> = new Map();
  let typeQueueIndex = 0;

  // Insert non-lyric cards at calculated positions (back to front)
  for (const position of insertionPositions) {
    let attempts = 0;
    let insertedCard: Record | null = null;

    while (attempts < typeQueue.length && !insertedCard) {
      const cardType = typeQueue[typeQueueIndex % typeQueue.length];
      const cardsOfType = cardsByType[cardType];

      if (cardsOfType && cardsOfType.length > 0) {
        const lastPos = lastPositionByType.get(cardType) ?? -Infinity;

        // Check if minimum spacing is satisfied
        if (Math.abs(position - lastPos) >= config.minSpacing) {
          // Insert the card
          insertedCard = cardsOfType.shift()!;
          result.splice(position, 0, insertedCard);
          lastPositionByType.set(cardType, position);
        }
      }

      typeQueueIndex++;
      attempts++;
    }

    // If we couldn't insert due to spacing, try with any remaining card
    if (!insertedCard) {
      for (const cards of Object.values(cardsByType)) {
        if (cards.length > 0) {
          insertedCard = cards.shift()!;
          result.splice(position, 0, insertedCard);
          break;
        }
      }
    }
  }

  return result;
}

/**
 * Groups cards by their detailed type (including vinyl variants)
 */
function groupCardsByType(cards: Record[]): Record<string, Record[]> {
  const grouped: Record<string, Record[]> = {};

  for (const card of cards) {
    let typeKey = card.cardType || 'lyric';

    // For vinyl cards, create unique keys based on imageUrl to distribute variants
    if (typeKey === 'vinyl' && card.vinylImageUrl) {
      // Extract filename from URL to create unique type key
      const filename = card.vinylImageUrl.split('/').pop()?.split('.')[0] || 'vinyl';
      typeKey = `vinyl-${filename}`;
    }

    if (!grouped[typeKey]) {
      grouped[typeKey] = [];
    }
    grouped[typeKey].push(card);
  }

  return grouped;
}

/**
 * Creates a rotation queue of card types, shuffled for variety
 */
function createTypeRotationQueue(cardsByType: Record<string, Record[]>): string[] {
  const types = Object.keys(cardsByType);

  // Simple shuffle using Fisher-Yates
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }

  return types;
}
