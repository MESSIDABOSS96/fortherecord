/**
 * Script to migrate all seed records to the new 10-bucket color system
 * Replaces the 55-palette colors with deterministic bucket colors
 *
 * Usage: npx tsx scripts/migrateToBuckets.ts
 */

import { seedRecords } from '../data/seedRecords';
import fs from 'fs/promises';
import path from 'path';

// Server URL (adjust if needed)
const API_URL = process.env.API_URL || 'http://localhost:3001';

async function migrateToBuckets() {
  console.log(`\n🎨 Migrating ${seedRecords.length} seed records to bucket color system...\n`);

  const updatedRecords = [];
  let successCount = 0;
  let errorCount = 0;
  const bucketDistribution: Record<string, number> = {};

  for (let i = 0; i < seedRecords.length; i++) {
    const record = seedRecords[i];
    const progress = `[${i + 1}/${seedRecords.length}]`;

    // Skip non-lyric cards
    if (record.cardType && record.cardType !== 'lyric') {
      console.log(`${progress} ⏭️  Skipping ${record.cardType} card: ${record.song_title || record.logoText || record.id}`);
      updatedRecords.push(record);
      continue;
    }

    console.log(`${progress} Processing: ${record.artist} - ${record.song_title}`);

    if (!record.album_art_url) {
      console.warn(`  ⚠️  No album art URL, keeping existing color: ${record.background_color}`);
      updatedRecords.push(record);
      errorCount++;
      continue;
    }

    try {
      // Call BUCKET extraction API (not the old colors/extract API)
      const response = await fetch(`${API_URL}/api/bucket-extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: record.album_art_url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const bucketData = await response.json();

      // Track bucket distribution
      const bucketName = bucketData.bucket;
      bucketDistribution[bucketName] = (bucketDistribution[bucketName] || 0) + 1;

      console.log(
        `  ✓ ${bucketName} → ${bucketData.bgColor} (${bucketData.bucketType})`
      );
      successCount++;

      updatedRecords.push({
        ...record,
        background_color: bucketData.bgColor,
      });

      // Rate limit (be gentle with the API and external CDNs)
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error: any) {
      console.error(`  ✗ Error: ${error.message}, keeping existing color`);
      updatedRecords.push(record);
      errorCount++;
    }
  }

  // Generate updated TypeScript file
  const outputPath = path.join(process.cwd(), 'data', 'seedRecords.ts');

  // Format the records array for better readability
  const recordsJson = JSON.stringify(updatedRecords, null, 2)
    // Fix Date objects
    .replace(/"created_at":\s*"([^"]+)"/g, (_, date) => `"created_at": new Date("${date}")`);

  const fileContent = `// Migrated to bucket color system by migrateToBuckets.ts on ${new Date().toISOString()}
// ${successCount} bucket colors extracted, ${errorCount} errors
import { Record } from "@/types/record";

// Seed data using 10-bucket color system
// All lyric cards now use one of 10 deterministic bucket colors
export const seedRecords: Record[] = ${recordsJson};
`;

  await fs.writeFile(outputPath, fileContent, 'utf-8');

  console.log(`\n✓ Updated ${outputPath}`);
  console.log(`\nResults:`);
  console.log(`  ✓ Successfully migrated: ${successCount}`);
  console.log(`  ✗ Errors: ${errorCount}`);
  console.log(`  📦 Total processed: ${updatedRecords.length}`);

  console.log(`\nBucket Distribution:`);
  Object.entries(bucketDistribution)
    .sort((a, b) => b[1] - a[1])
    .forEach(([bucket, count]) => {
      const percentage = ((count / successCount) * 100).toFixed(1);
      console.log(`  ${bucket}: ${count} (${percentage}%)`);
    });
}

// Run the script
migrateToBuckets().catch((error) => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
