'use client';

import { useState, useEffect } from 'react';
import { seedRecords } from '@/data/seedRecords';
import Image from 'next/image';

type ColorCandidate = {
  rgb: { r: number; g: number; b: number };
  hex: string;
  hsl: { h: number; s: number; l: number };
  areaShare: number;
  saturationScore: number;
  contrastScore: number;
  areaScore: number;
  standoutScore: number;
};

type ColorResult = {
  bgColor: string;
  textColor: string;
  borderColor: string;
  family: string;
  tier?: 'dark' | 'medium' | 'light';
  paletteKey: string;
  method: 'extraction' | 'fallback';
  cached?: boolean;
  debug?: {
    candidates?: ColorCandidate[];
    standoutColor?: ColorCandidate;
    chosenFamily?: string;
    chosenToken?: string;
    imageAvgColor?: { r: number; g: number; b: number };
    isImageNeutral?: boolean;
  };
};

export default function TestColorsPage() {
  const [testRecords, setTestRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    async function loadTestData() {
      try {
        // Take first 6 lyric cards from seed data
        const lyricCards = seedRecords.filter((r) => (!r.cardType || r.cardType === 'lyric') && r.album_art_url);
        const sampleSeeds = lyricCards.slice(0, 6);

        // Fetch color data for each
        const results = await Promise.all(
          sampleSeeds.map(async (record) => {
            try {
              const response = await fetch('/api/colors/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: record.album_art_url }),
              });

              if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
              }

              const colorData: ColorResult = await response.json();

              return {
                ...record,
                colorData,
              };
            } catch (error) {
              console.error(`Failed to load color for ${record.song_title}:`, error);
              return {
                ...record,
                colorData: null,
              };
            }
          })
        );

        setTestRecords(results);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadTestData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <div className="text-lg text-gray-700">Loading color test data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">Error loading test data</div>
          <div className="text-sm text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Album-to-Card Color Testing</h1>
        <p className="text-gray-600 mb-8">
          Visual verification of deterministic color extraction from album covers
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testRecords.map((record, idx) => (
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

              {/* Computed Card Color */}
              {record.colorData && (
                <div
                  className="w-full aspect-square rounded-lg shadow-lg p-6 flex flex-col justify-between transition-all hover:scale-105"
                  style={{
                    backgroundColor: record.colorData.bgColor,
                    color: record.colorData.textColor,
                    border: `2px solid ${record.colorData.borderColor}`,
                  }}
                >
                  <div>
                    <div className="text-sm font-bold">{record.artist}</div>
                    <div className="text-xs opacity-80">{record.song_title}</div>
                  </div>

                  <div className="text-xs space-y-1 opacity-90">
                    <div className="font-semibold">{record.colorData.family}</div>
                    {record.colorData.tier && (
                      <div className="text-xs">Tier: {record.colorData.tier}</div>
                    )}
                    <div>{record.colorData.paletteKey}</div>
                    <div className="font-mono">{record.colorData.bgColor}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs ${
                          record.colorData.method === 'extraction'
                            ? 'bg-green-500 bg-opacity-20'
                            : 'bg-yellow-500 bg-opacity-20'
                        }`}
                      >
                        {record.colorData.method}
                      </span>
                      {record.colorData.cached && (
                        <span className="inline-block px-2 py-0.5 rounded text-xs bg-blue-500 bg-opacity-20">
                          cached
                        </span>
                      )}
                      {record.colorData.debug?.isImageNeutral && (
                        <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-500 bg-opacity-20">
                          neutral
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Old vs New Color Comparison */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Old Color</div>
                  <div
                    className="w-full h-16 rounded shadow flex items-center justify-center text-xs font-mono"
                    style={{ backgroundColor: record.background_color }}
                  >
                    {record.background_color}
                  </div>
                </div>
                {record.colorData && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">New Color</div>
                    <div
                      className="w-full h-16 rounded shadow flex items-center justify-center text-xs font-mono"
                      style={{
                        backgroundColor: record.colorData.bgColor,
                        color: record.colorData.textColor,
                      }}
                    >
                      {record.colorData.bgColor}
                    </div>
                  </div>
                )}
              </div>

              {/* Debug Info */}
              {record.colorData?.debug && (
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
                    {showDebug[idx] ? '▼' : '▶'} Show Debug Info
                  </button>

                  {showDebug[idx] && (
                    <div className="space-y-3 text-xs">
                      {/* Image Average Color */}
                      {record.colorData.debug.imageAvgColor && (
                        <div>
                          <div className="text-gray-600 font-medium mb-1">Image Average</div>
                          <div
                            className="w-full h-8 rounded shadow flex items-center justify-center font-mono"
                            style={{
                              backgroundColor: `rgb(${record.colorData.debug.imageAvgColor.r}, ${record.colorData.debug.imageAvgColor.g}, ${record.colorData.debug.imageAvgColor.b})`,
                            }}
                          >
                            rgb({record.colorData.debug.imageAvgColor.r},{' '}
                            {record.colorData.debug.imageAvgColor.g},{' '}
                            {record.colorData.debug.imageAvgColor.b})
                          </div>
                        </div>
                      )}

                      {/* Standout Color */}
                      {record.colorData.debug.standoutColor && (
                        <div>
                          <div className="text-gray-600 font-medium mb-1">
                            Standout Color (Winner)
                          </div>
                          <div
                            className="w-full h-12 rounded shadow flex items-center justify-center font-mono"
                            style={{ backgroundColor: record.colorData.debug.standoutColor.hex }}
                          >
                            {record.colorData.debug.standoutColor.hex}
                          </div>
                          <div className="mt-1 text-xs text-gray-600 space-y-0.5">
                            <div>
                              Score: {record.colorData.debug.standoutColor.standoutScore.toFixed(3)}
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-1">
                              <div>
                                Sat:{' '}
                                {record.colorData.debug.standoutColor.saturationScore.toFixed(2)}
                              </div>
                              <div>
                                Con:{' '}
                                {record.colorData.debug.standoutColor.contrastScore.toFixed(2)}
                              </div>
                              <div>
                                Area: {record.colorData.debug.standoutColor.areaScore.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* All Candidates */}
                      {record.colorData.debug.candidates &&
                        record.colorData.debug.candidates.length > 0 && (
                          <div>
                            <div className="text-gray-600 font-medium mb-1">
                              All Candidates (Top {record.colorData.debug.candidates.length})
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                              {record.colorData.debug.candidates.map(
                                (candidate: ColorCandidate, cIdx: number) => (
                                  <div
                                    key={cIdx}
                                    className="relative group"
                                    title={`Score: ${candidate.standoutScore.toFixed(3)}\nSat: ${candidate.saturationScore.toFixed(2)}, Con: ${candidate.contrastScore.toFixed(2)}, Area: ${candidate.areaScore.toFixed(2)}`}
                                  >
                                    <div
                                      className="w-full h-12 rounded shadow"
                                      style={{ backgroundColor: candidate.hex }}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center text-white text-[10px] font-mono p-1 text-center">
                                      {candidate.standoutScore.toFixed(2)}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Mapping Info */}
                      <div className="text-gray-600 space-y-0.5">
                        <div>
                          <span className="font-medium">Chosen Family:</span>{' '}
                          {record.colorData.debug.chosenFamily || record.colorData.family}
                        </div>
                        <div>
                          <span className="font-medium">Final Token:</span>{' '}
                          {record.colorData.debug.chosenToken || record.colorData.paletteKey}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {testRecords.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No test records found with album art</p>
          </div>
        )}
      </div>
    </div>
  );
}
