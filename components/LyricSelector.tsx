"use client";

import { useState, useEffect } from 'react';
import { splitLyricsIntoLines } from '@/utils/lyricSelection';

interface LyricSelectorProps {
  songTitle: string;
  artist: string;
  selectedLines: string[];
  onSelectionChange: (lines: string[]) => void;
  onConfirm: (lines: string[]) => void;
}

export default function LyricSelector({
  songTitle,
  artist,
  selectedLines,
  onSelectionChange,
  onConfirm,
}: LyricSelectorProps) {
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch lyrics on mount
  useEffect(() => {
    const fetchLyrics = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `/api/genius/lyrics?title=${encodeURIComponent(songTitle)}&artist=${encodeURIComponent(artist)}`
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch lyrics');
        }

        const data = await response.json();

        // Split lyrics into lines using utility
        const lines = splitLyricsIntoLines(data.lyrics);

        setLyrics(lines);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load lyrics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
  }, [songTitle, artist]);

  const handleLineClick = (line: string) => {
    const isSelected = selectedLines.includes(line);

    if (isSelected) {
      // Deselect
      onSelectionChange(selectedLines.filter(l => l !== line));
    } else {
      // Select (if under limit)
      if (selectedLines.length < 4) {
        onSelectionChange([...selectedLines, line]);
      }
    }
  };

  const getLineNumber = (line: string): number | null => {
    const index = selectedLines.indexOf(line);
    return index >= 0 ? index + 1 : null;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-3"></div>
        <p className="text-gray-600">Loading lyrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Selection counter */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700">
          {selectedLines.length} of 4 lines selected
        </p>
      </div>

      {/* Lyric lines */}
      <div className="space-y-2 max-h-96 overflow-y-auto mb-6 pr-2">
        {lyrics.map((line, index) => {
          const lineNumber = getLineNumber(line);
          const isSelected = lineNumber !== null;

          return (
            <button
              key={index}
              onClick={() => handleLineClick(line)}
              disabled={!isSelected && selectedLines.length >= 4}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-400'
              } ${!isSelected && selectedLines.length >= 4 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start gap-3">
                {/* Selection badge */}
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isSelected ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {lineNumber || ''}
                </div>

                {/* Lyric text */}
                <span className={`flex-1 ${isSelected ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                  {line}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirm button */}
      <button
        onClick={() => onConfirm(selectedLines)}
        disabled={selectedLines.length === 0}
        className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
      >
        Continue with {selectedLines.length} {selectedLines.length === 1 ? 'line' : 'lines'}
      </button>
    </div>
  );
}
