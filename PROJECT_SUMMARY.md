# Project Status & Recent Changes

**Date:** December 23, 2025
**Feature Focus:** Grid Distribution, Seed Data, and Layout Refinement

## Summary
Recent work has focused on optimizing the home page experience for "For The Record," specifically refining how cards are distributed in the masonry grid and expanding the seed content.

## Key Changes

### 1. Grid Distribution Logic
- **Algorithm**: Implemented a "Target Schedule" algorithm in `utils/cardDistribution.ts`.
- **Constraint**: The grid strict never starts with a non-lyric card.
- **Constraint**: Non-lyric cards (vinyls, images) are evenly dispersed (~25% ratio) and never clumped.
- **Constraint**: Prevented "vertical stacking" where non-lyric cards appear in the same column consecutively.

### 2. Seed Data Expansion
- **New Songs**: Added 22 user-requested songs (Pink Floyd, Jeff Buckley, Frank Ocean, etc.) to `data/seedRecords.ts`.
- **Metadata**: Each valid record now includes correct artist, title, and sentiment-appropriate placeholder lyrics.
- **Album Art**: Configured `next.config.ts` to allow images from external domains (`i.scdn.co`, `fastly.net`, `wikimedia.org`, etc.).

### 3. Layout Improvements
- **Add Record Flow**: Refined the specific "Select Lyrics" step for better alignment and spacing.
- **Preview Card**: Aligned the live preview card directly with the selection interface.

## Current State
- **Server Restart Required**: The `next.config.ts` file was updated. The development server must be restarted for new album art to load correctly.
- **Verification**: The distribution logic has been verified to meet all constraints (0 violations, perfect ratio).

## Files of Interest
- `utils/cardDistribution.ts`: Core logic for the target schedule algorithm.
- `data/seedRecords.ts`: The expanded dataset.
- `next.config.ts`: Image domain configuration.
