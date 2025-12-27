/**
 * Shared types and constants for the bucket-based color system
 * This file can be safely imported by both client and server code
 * NO Sharp dependencies - only pure TypeScript types and constants
 */

// 10 Fixed bucket colors (ONLY allowed outputs)
export const BUCKET_COLORS = {
  MAJORITY_DARK: '#898989',
  MAJORITY_LIGHT_NEUTRAL: '#E0E0E0',
  MAJORITY_WARM_NEUTRAL: '#D6B588',
  MAJORITY_RED: '#D94446',
  MAJORITY_PINK: '#FF85B3',
  MAJORITY_PURPLE: '#E0B0FF',
  MAJORITY_BLUE: '#6395EE',
  MAJORITY_GREEN: '#3CAE63',
  MAJORITY_ORANGE: '#FF7518',
  MAJORITY_YELLOW: '#FFD32C',
} as const;

export type BucketName = keyof typeof BUCKET_COLORS;

// Tunable thresholds (confirmed defaults)
export const BUCKET_THRESHOLDS = {
  // Neutral detection
  S_NEUTRAL: 0.12,
  NEUTRAL_PERCENT: 0.65,

  // Base type detection
  L_DARK: 0.18,
  L_LIGHT: 0.85,
  DARK_PERCENT: 0.55,
  LIGHT_PERCENT: 0.55,

  // Accent detection (lowered to catch smaller accents like Coldplay's orange)
  S_ACCENT: 0.25,
  MIN_ACCENT_SHARE: 0.08, // Lowered from 0.10 to 0.08 (8%)
  MIN_ACCENT_SAT: 0.30,
  MIN_DELTA_E: 15, // Lowered from 20 to 15 for better accent detection

  // Majority hue detection
  S_MAJORITY: 0.18,

  // White detection (conservative)
  WHITE_S_MAX: 0.05,
  WHITE_L_MIN: 0.95,
};

export type HueFamily = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink';

export type BucketResult = {
  bgColor: string;
  textColor: '#111111';
  bucket: BucketName;
  bucketType: 'majority' | 'accent';
  debug: {
    neutralPercent: number;
    darkPercent: number;
    lightPercent: number;
    warmTendency: number;
    baseCharacteristics: string;
    accentDetected: boolean;
    accentFamily?: HueFamily;
    accentShare?: number;
    accentDeltaE?: number;
    topHueCounts: Record<HueFamily, number>;
    majorityFamily?: HueFamily;
  };
};
