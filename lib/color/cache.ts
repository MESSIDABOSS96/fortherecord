/**
 * LRU (Least Recently Used) cache implementation for color extraction results
 * Prevents redundant image fetching and color calculations
 */

type CacheEntry<T> = {
  value: T;
  timestamp: number;
};

/**
 * Generic LRU Cache with TTL support
 * Automatically evicts least recently used entries when capacity is reached
 * @template T Type of values stored in cache
 */
export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private ttl: number; // milliseconds

  /**
   * Create a new LRU cache
   * @param maxSize Maximum number of entries (default: 200)
   * @param ttlMinutes Time-to-live in minutes (default: 60)
   */
  constructor(maxSize: number = 200, ttlMinutes: number = 60) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttlMinutes * 60 * 1000;
  }

  /**
   * Get value from cache
   * Returns undefined if key doesn't exist or entry has expired
   * @param key Cache key
   * @returns Cached value or undefined
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * Set value in cache
   * Evicts oldest entry if cache is at capacity
   * @param key Cache key
   * @param value Value to cache
   */
  set(key: string, value: T): void {
    // Remove if exists (for re-insertion at end)
    this.cache.delete(key);

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Check if key exists in cache and is not expired
   * @param key Cache key
   * @returns true if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Clear all entries from cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get current cache size
   * @returns Number of entries in cache
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * Type for color extraction results stored in cache
 * Updated to match new standout color system
 */
export type ColorExtractionResult = {
  bgColor: string;
  textColor: string;
  borderColor: string;
  family: string;
  paletteKey: string;
  method: 'extraction' | 'fallback';
  debug?: {
    candidates?: any[];
    standoutColor?: any;
    chosenFamily?: string;
    chosenToken?: string;
    imageAvgColor?: { r: number; g: number; b: number };
    isImageNeutral?: boolean;
  };
};

/**
 * Singleton cache instance for color extraction results
 * Shared across all color extraction operations
 */
export const colorCache = new LRUCache<ColorExtractionResult>(200, 60);
