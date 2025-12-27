'use client';

import { useState, useEffect } from 'react';
import { seedRecords } from '@/data/seedRecords';
import Image from 'next/image';
import { BUCKET_COLORS, type BucketName } from '@/lib/color/bucketSystem';

type BucketResult = {
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
    accentFamily?: string;
    accentShare?: number;
    accentDeltaE?: number;
    topHueCounts: Record<string, number>;
    majorityFamily?: string;
  };
};

type TestRecord = {
  artist: string;
  song_title: string;
  album_art_url?: string;
  bucketResult?: BucketResult;
  loading: boolean;
  error?: string;
};

export default function BucketDemoPage() {
  const [testRecords, setTestRecords] = useState<TestRecord[]>([]);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [showDebug, setShowDebug] = useState<{ [key: number]: boolean }>({});
  const [filterBucket, setFilterBucket] = useState<BucketName | 'all'>('all');

  useEffect(() => {
    async function loadBucketData() {
      // Get lyric cards with album art
      const lyricCards = seedRecords.filter(
        (r) => (!r.cardType || r.cardType === 'lyric') && r.album_art_url
      );

      const initialRecords: TestRecord[] = lyricCards.map((r) => ({
        artist: r.artist,
        song_title: r.song_title,
        album_art_url: r.album_art_url,
        loading: true,
      }));

      setTestRecords(initialRecords);
      setGlobalLoading(false);

      // Fetch bucket results for each
      for (let i = 0; i < lyricCards.length; i++) {
        const record = lyricCards[i];
        if (!record.album_art_url) continue;

        try {
          const response = await fetch('/api/bucket-extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: record.album_art_url }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const result: BucketResult = await response.json();

          setTestRecords((prev) =>
            prev.map((r, idx) =>
              idx === i ? { ...r, bucketResult: result, loading: false } : r
            )
          );
        } catch (error: any) {
          console.error(`Bucket extraction failed for ${record.song_title}:`, error);
          setTestRecords((prev) =>
            prev.map((r, idx) =>
              idx === i ? { ...r, error: error.message, loading: false } : r
            )
          );
        }
      }
    }

    loadBucketData();
  }, []);

  const filteredRecords =
    filterBucket === 'all'
      ? testRecords
      : testRecords.filter((r) => r.bucketResult?.bucket === filterBucket);

  const bucketStats = Object.keys(BUCKET_COLORS).reduce((acc, bucket) => {
    acc[bucket as BucketName] = testRecords.filter(
      (r) => r.bucketResult?.bucket === bucket
    ).length;
    return acc;
  }, {} as Record<BucketName, number>);

  if (globalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <div className="text-lg text-gray-700">Loading bucket demo...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Bucket System Demo</h1>
        <p className="text-gray-600 mb-6">
          Visual verification of deterministic bucket assignments (10 fixed colors)
        </p>

        {/* Bucket Filter */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Filter by Bucket</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterBucket('all')}
              className={`px-4 py-2 rounded font-medium ${
                filterBucket === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All ({testRecords.length})
            </button>

            {(Object.keys(BUCKET_COLORS) as BucketName[]).map((bucket) => (
              <button
                key={bucket}
                onClick={() => setFilterBucket(bucket)}
                style={{
                  backgroundColor:
                    filterBucket === bucket ? BUCKET_COLORS[bucket] : undefined,
                  color: filterBucket === bucket ? '#111111' : undefined,
                }}
                className={`px-4 py-2 rounded font-medium ${
                  filterBucket === bucket
                    ? 'ring-2 ring-gray-900'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {bucket.replace('MAJORITY_', '').replace('_', ' ')} ({bucketStats[bucket] || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Bucket Stats */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Bucket Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(Object.keys(BUCKET_COLORS) as BucketName[]).map((bucket) => {
              const count = bucketStats[bucket] || 0;
              const percent = testRecords.length > 0
                ? Math.round((count / testRecords.length) * 100)
                : 0;

              return (
                <div key={bucket} className="text-center">
                  <div
                    className="w-full h-24 rounded-lg mb-2 shadow-md flex items-center justify-center font-mono text-sm"
                    style={{ backgroundColor: BUCKET_COLORS[bucket], color: '#111111' }}
                  >
                    {BUCKET_COLORS[bucket]}
                  </div>
                  <div className="text-xs font-medium">
                    {bucket.replace('MAJORITY_', '').replace('_', ' ')}
                  </div>
                  <div className="text-xs text-gray-600">
                    {count} cards ({percent}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Album Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecords.map((record, idx) => (
            <div key={idx} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-900 truncate">
                {record.artist} - {record.song_title}
              </h3>

              {/* Album Cover */}
              <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg">
                {record.album_art_url && (
                  <Image
                    src={record.album_art_url}
                    alt={`${record.artist} - ${record.song_title}`}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              {/* Assigned Bucket Color */}
              {record.loading && (
                <div className="text-center py-4 text-gray-500">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}

              {record.error && (
                <div className="text-center py-4 text-red-600 text-sm">
                  Error: {record.error}
                </div>
              )}

              {record.bucketResult && (
                <>
                  <div
                    className="w-full h-32 rounded-lg shadow-lg p-4 flex flex-col justify-between"
                    style={{
                      backgroundColor: record.bucketResult.bgColor,
                      color: record.bucketResult.textColor,
                    }}
                  >
                    <div>
                      <div className="text-sm font-bold">{record.artist}</div>
                      <div className="text-xs opacity-80">{record.song_title}</div>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="font-semibold">
                        {record.bucketResult.bucket.replace('MAJORITY_', '').replace('_', ' ')}
                      </div>
                      <div className="font-mono">{record.bucketResult.bgColor}</div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs ${
                            record.bucketResult.bucketType === 'accent'
                              ? 'bg-yellow-400 bg-opacity-50'
                              : 'bg-gray-500 bg-opacity-30'
                          }`}
                        >
                          {record.bucketResult.bucketType}
                        </span>
                        {record.bucketResult.debug.accentDetected && (
                          <span className="inline-block px-2 py-0.5 rounded text-xs bg-orange-400 bg-opacity-50">
                            accent: {record.bucketResult.debug.accentFamily}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Debug Info */}
                  <div className="pt-2 border-t border-gray-200">
                    <button
                      onClick={() =>
                        setShowDebug((prev) => ({
                          ...prev,
                          [idx]: !prev[idx],
                        }))
                      }
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium mb-2"
                    >
                      {showDebug[idx] ? '▼' : '▶'} Debug Metrics
                    </button>

                    {showDebug[idx] && (
                      <div className="space-y-2 text-xs text-gray-700">
                        <div>
                          <span className="font-medium">Base:</span>{' '}
                          {record.bucketResult.debug.baseCharacteristics}
                        </div>
                        <div>
                          <span className="font-medium">Neutral:</span>{' '}
                          {(record.bucketResult.debug.neutralPercent * 100).toFixed(1)}%
                        </div>
                        <div>
                          <span className="font-medium">Dark:</span>{' '}
                          {(record.bucketResult.debug.darkPercent * 100).toFixed(1)}%
                        </div>
                        <div>
                          <span className="font-medium">Light:</span>{' '}
                          {(record.bucketResult.debug.lightPercent * 100).toFixed(1)}%
                        </div>
                        {record.bucketResult.debug.accentDetected && (
                          <>
                            <div>
                              <span className="font-medium">Accent Share:</span>{' '}
                              {((record.bucketResult.debug.accentShare || 0) * 100).toFixed(1)}%
                            </div>
                            <div>
                              <span className="font-medium">DeltaE:</span>{' '}
                              {record.bucketResult.debug.accentDeltaE?.toFixed(1)}
                            </div>
                          </>
                        )}
                        {record.bucketResult.debug.majorityFamily && (
                          <div>
                            <span className="font-medium">Majority Hue:</span>{' '}
                            {record.bucketResult.debug.majorityFamily}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {filteredRecords.length === 0 && !globalLoading && (
          <div className="text-center py-12 text-gray-500">
            <p>No records match this bucket filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
