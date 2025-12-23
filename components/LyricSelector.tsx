"use client";

import { useState, useEffect } from 'react';
import { SelectedLyric } from '@/hooks/useAddRecordState';

interface LyricSelectorProps {
  songTitle: string;
  artist: string;
  selectedLines: SelectedLyric[];
  onSelectionChange: (lines: SelectedLyric[]) => void;
  onConfirm: (lines: SelectedLyric[]) => void;
}

// Parse lyrics into sections (Intro, Verse 1, etc.)
interface LyricSection {
  header: string;  // e.g., "[Verse 1]"
  lines: string[];
  startIndex: number;  // Track original index for selection
}

function parseLyricsIntoSections(lyrics: string[]): LyricSection[] {
  const sections: LyricSection[] = [];
  let currentSection: LyricSection | null = null;
  let lineIndex = 0;

  for (const line of lyrics) {
    // Check if line is a section header (e.g., [Verse 1], [Chorus])
    if (line.match(/^\[.*\]$/)) {
      // Save previous section
      if (currentSection && currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      // Start new section
      currentSection = {
        header: line,
        lines: [],
        startIndex: lineIndex + 1  // Next line starts the section
      };
    } else if (line.trim()) {
      // Add non-empty line to current section
      if (!currentSection) {
        // No header yet, create default section
        currentSection = {
          header: '',
          lines: [],
          startIndex: lineIndex
        };
      }
      currentSection.lines.push(line);
    }
    lineIndex++;
  }

  // Add final section
  if (currentSection && currentSection.lines.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

export default function LyricSelector({
  songTitle,
  artist,
  selectedLines,
  onSelectionChange,
  onConfirm,
}: LyricSelectorProps) {
  const [allLyrics, setAllLyrics] = useState<string[]>([]);
  const [sections, setSections] = useState<LyricSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Fetch lyrics
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
        const lines = data.lyrics.split('\n').filter((l: string) => l.trim());

        setAllLyrics(lines);
        setSections(parseLyricsIntoSections(lines));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load lyrics');
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
  }, [songTitle, artist]);

  const handleLineClick = (line: string, index: number) => {
    const isSelected = selectedLines.some(l => l.originalIndex === index);

    if (isSelected) {
      // Deselect
      onSelectionChange(selectedLines.filter(l => l.originalIndex !== index));
    } else {
      // Select (if under 4 lines)
      if (selectedLines.length >= 4) return;
      onSelectionChange([...selectedLines, { text: line, originalIndex: index }]);
    }
  };

  const isLineSelected = (index: number) => {
    return selectedLines.some(l => l.originalIndex === index);
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
      <div className="mb-6 text-sm text-gray-600">
        {selectedLines.length} out of 4 lines selected
      </div>

      {/* Lyrics display - Genius style */}
      <div className="max-h-96 overflow-y-auto pr-2 mb-6">
        {sections.map((section, sectionIdx) => {
          let lineIndex = section.startIndex;

          return (
            <div key={sectionIdx} className="mb-8">
              {/* Section header */}
              {section.header && (
                <h3 className="text-lg font-bold mb-4 text-gray-900">
                  {section.header}
                </h3>
              )}

              {/* Lines in this section */}
              <div className="space-y-1">
                {section.lines.map((line, idx) => {
                  const globalIndex = lineIndex + idx;
                  const isSelected = isLineSelected(globalIndex);
                  const isHovered = hoveredIndex === globalIndex;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleLineClick(line, globalIndex)}
                      onMouseEnter={() => setHoveredIndex(globalIndex)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className={`
                        px-3 py-2 rounded cursor-pointer transition-colors
                        ${isSelected
                          ? 'bg-gray-200 text-gray-900'
                          : isHovered
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700'
                        }
                      `}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue button */}
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
