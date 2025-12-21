"use client";

import { useState, useEffect } from 'react';
import { splitLyricsIntoLines } from '@/utils/lyricSelection';
import { SelectedLyric } from '@/hooks/useAddRecordState';

interface LyricSelectorProps {
  songTitle: string;
  artist: string;
  selectedLines: SelectedLyric[];
  onSelectionChange: (lines: SelectedLyric[]) => void;
  onConfirm: (lines: SelectedLyric[]) => void;
}

export default function LyricSelector({
  songTitle,
  artist,
  selectedLines,
  onSelectionChange,
  onConfirm,
}: LyricSelectorProps) {
  // Helper function to get min/max range of current selection
  const getSelectionRange = (lines: SelectedLyric[]): { min: number; max: number } | null => {
    if (lines.length === 0) return null;

    const indices = lines.map(l => l.originalIndex).sort((a, b) => a - b);
    return {
      min: indices[0],
      max: indices[indices.length - 1]
    };
  };

  // Helper function to validate consecutiveness
  const isConsecutiveSelection = (lines: SelectedLyric[]): boolean => {
    if (lines.length <= 1) return true;

    const indices = lines.map(l => l.originalIndex).sort((a, b) => a - b);

    for (let i = 1; i < indices.length; i++) {
      if (indices[i] !== indices[i - 1] + 1) {
        return false;
      }
    }

    return true;
  };

  // Helper function to check if a line can be selected
  const canSelectLine = (
    lineIndex: number,
    currentSelection: SelectedLyric[]
  ): boolean => {
    // Empty selection: any line can start a new selection
    if (currentSelection.length === 0) return true;

    // Maximum 4 lines
    if (currentSelection.length >= 4) return false;

    // Get current range
    const range = getSelectionRange(currentSelection);
    if (!range) return true;

    // Line must be adjacent to current range (extends min or max)
    return lineIndex === range.min - 1 || lineIndex === range.max + 1;
  };

  // Helper function to check if a line can be deselected
  const canDeselectLine = (
    lineIndex: number,
    currentSelection: SelectedLyric[]
  ): boolean => {
    if (currentSelection.length === 0) return false;

    // Single line: always allow deselection
    if (currentSelection.length === 1) return true;

    const range = getSelectionRange(currentSelection);
    if (!range) return false;

    // Can only deselect from edges (first or last line)
    return lineIndex === range.min || lineIndex === range.max;
  };

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

  const handleLineClick = (line: string, index: number) => {
    // Check if already selected
    const isSelected = selectedLines.some(l => l.originalIndex === index);

    if (isSelected) {
      // DESELECTION: Only allow from edges
      if (!canDeselectLine(index, selectedLines)) {
        return; // Middle lines cannot be deselected
      }

      const newSelection = selectedLines.filter(l => l.originalIndex !== index);
      onSelectionChange(newSelection);
    } else {
      // SELECTION: Must extend consecutive range
      if (!canSelectLine(index, selectedLines)) {
        return; // Non-adjacent lines cannot be selected
      }

      const newSelection = [...selectedLines, { text: line, originalIndex: index }];

      // Safety check
      if (!isConsecutiveSelection(newSelection)) {
        console.error('Non-consecutive selection detected');
        return;
      }

      onSelectionChange(newSelection);
    }
  };

  const getLineNumber = (line: string): number | null => {
    // Sort by original index first
    const sorted = [...selectedLines].sort((a, b) => a.originalIndex - b.originalIndex);
    const index = sorted.findIndex(l => l.text === line);
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
        {selectedLines.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Select consecutive lines only. Click the first or last line to deselect.
          </p>
        )}
      </div>

      {/* Lyric lines */}
      <div className="space-y-2 max-h-96 overflow-y-auto mb-6 pr-2">
        {lyrics.map((line, index) => {
          const lineNumber = getLineNumber(line);
          const isSelected = lineNumber !== null;

          return (
            <button
              key={index}
              onClick={() => handleLineClick(line, index)}
              disabled={(() => {
                const isSelected = getLineNumber(line) !== null;

                if (isSelected) {
                  // Selected line: check if it can be deselected
                  return !canDeselectLine(index, selectedLines);
                } else {
                  // Unselected line: check if it can be selected
                  return !canSelectLine(index, selectedLines);
                }
              })()}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-gray-900 bg-gray-50'
                  : canSelectLine(index, selectedLines)
                    ? 'border-gray-200 hover:border-gray-400 cursor-pointer'
                    : 'border-gray-200 opacity-40 cursor-not-allowed'
              } ${
                isSelected && !canDeselectLine(index, selectedLines)
                  ? 'opacity-60 cursor-not-allowed'
                  : ''
              }`}
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
