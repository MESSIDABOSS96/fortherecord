"use client";

import { useState, useEffect } from 'react';
import { SelectedLyric } from '@/hooks/useAddRecordState';
import { normalizeSubheader } from '@/utils/lyricSelection';

interface LyricSelectorProps {
  songTitle: string;
  artist: string;
  selectedLines: SelectedLyric[];
  onSelectionChange: (lines: SelectedLyric[]) => void;
  onConfirm: (lines: SelectedLyric[]) => void;
}

// Parse lyrics into sections (Intro, Verse 1, etc.)
interface LyricSection {
  header: string;  // e.g., "Verse 1" (without brackets)
  lines: string[];
  startIndex: number;  // Track original index for selection
}

// Filter out non-lyric content from Genius
function isNonLyricLine(line: string): boolean {
  const trimmed = line.trim();

  // IMPORTANT: Never filter out section headers
  if (trimmed.match(/^\[.+\]$/)) {
    return false; // Keep all section headers
  }

  const lowerTrimmed = trimmed.toLowerCase();

  // Filter out contributor info
  if (lowerTrimmed.match(/\d+\s*contributors?/)) return true;

  // Filter out "Embed" buttons
  if (lowerTrimmed === 'embed') return true;

  // Filter out view counts, share buttons, etc.
  if (lowerTrimmed.match(/^\d+k?\s*(views?|shares?)/)) return true;

  // Filter out "See [Artist] Live" type lines
  if (lowerTrimmed.match(/see .* live/)) return true;

  // Filter out "Get tickets as low as $X"
  if (lowerTrimmed.match(/get tickets/)) return true;

  // Filter out metadata like "Lyrics for this song..."
  if (lowerTrimmed.match(/lyrics for this song/)) return true;

  // Filter out long descriptive blocks (Genius annotations/descriptions)
  if (trimmed.length > 150) return true;

  // Filter out lines that look like descriptions
  if (trimmed.length > 80 && lowerTrimmed.match(/\b(is|are|was|were|the)\b.*\b(is|are|was|were|the)\b/)) return true;

  // Filter out "Read More" links
  if (lowerTrimmed.match(/read more/)) return true;

  // NEW FILTERS - catch more non-lyric content:

  // Filter album names with dates (e.g., "- Contraband (15.9.2023)")
  if (trimmed.match(/^-\s*.+\s*\(\d{1,2}\.\d{1,2}\.\d{4}\)$/)) return true;

  // Filter historical/academic text patterns
  if (lowerTrimmed.match(/aryan|atlantis|veda|varuna|hymn to/)) return true;
  if (trimmed.match(/^[A-Z]{2,}.*FROM\s+[A-Z]{2,}/)) return true; // "THE ARYAN COLONIES FROM ATLANTIS"

  // Filter Q&A format ("WE come now to another question:")
  if (trimmed.match(/^[A-Z]{2,}\s+come now to/)) return true;

  return false;
}

function parseLyricsIntoSections(lyrics: string[]): LyricSection[] {
  const sections: LyricSection[] = [];
  let currentSection: LyricSection | null = null;
  let lineIndex = 0;

  for (let line of lyrics) {
    // Extract section header if it's embedded in junk text (e.g., "146 Contributors...Read More [Intro]")
    const embeddedHeaderMatch = line.match(/\[([^\]]+)\]\s*$/);
    if (embeddedHeaderMatch && isNonLyricLine(line)) {
      // Replace the junk line with just the header
      line = `[${embeddedHeaderMatch[1]}]`;
    }

    // Skip non-lyric content (after extracting any embedded headers)
    if (isNonLyricLine(line)) {
      lineIndex++;
      continue;
    }

    // Check if line is a section header (e.g., [Verse 1], [Chorus])
    const headerMatch = line.match(/^\[(.+)\]$/);
    if (headerMatch) {
      // Save previous section (even if it has no lines, if it has a header)
      if (currentSection) {
        sections.push(currentSection);
      }
      // Start new section - remove brackets and normalize header
      const rawHeader = headerMatch[1];
      currentSection = {
        header: normalizeSubheader(rawHeader),  // Apply safe normalization
        lines: [],
        startIndex: lineIndex
      };
    } else if (line.trim()) {
      // Add non-empty line to current section
      if (!currentSection) {
        // No header yet, create default section without header
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

  // Add final section (even if it has no lines, if it has a header)
  if (currentSection) {
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
        const parsedSections = parseLyricsIntoSections(lines);
        setSections(parsedSections);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Could not load lyrics';

        // Provide more specific error messages based on the error
        if (errorMessage.includes('validation failed')) {
          setError('Unable to find reliable lyrics for this song. The lyrics may not be available on Genius, or there may be multiple versions causing confusion.');
        } else if (errorMessage.includes('not found')) {
          setError('Lyrics not found. This song may not be available on Genius, or it may be protected by licensing restrictions.');
        } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
          setError('Network error. Please check your internet connection and try again.');
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
  }, [songTitle, artist]);

  // Retry function
  const handleRetry = () => {
    setError('');
    setLoading(true);
    // Re-trigger the fetch by updating a dependency (useEffect will re-run)
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
        const parsedSections = parseLyricsIntoSections(lines);
        setSections(parsedSections);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Could not load lyrics';

        if (errorMessage.includes('validation failed')) {
          setError('Unable to find reliable lyrics for this song. The lyrics may not be available on Genius, or there may be multiple versions causing confusion.');
        } else if (errorMessage.includes('not found')) {
          setError('Lyrics not found. This song may not be available on Genius, or it may be protected by licensing restrictions.');
        } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
          setError('Network error. Please check your internet connection and try again.');
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
  };

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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-3" style={{ borderColor: 'var(--color-text-secondary)' }}></div>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading lyrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 text-sm mb-3">{error}</p>
        <button
          onClick={handleRetry}
          className="text-sm text-red-600 hover:text-red-800 underline font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Selection counter */}
      <div className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {selectedLines.length} out of 4 lines selected
      </div>

      {/* Lyrics display - Rounded outlined box */}
      <div className="border-2 rounded-2xl p-6 mb-6" style={{ borderColor: 'var(--color-input-border)' }}>
        <div className="max-h-96 overflow-y-auto pr-2">
          {sections.map((section, sectionIdx) => {
            let lineIndex = section.startIndex;

            return (
              <div key={sectionIdx} className="mb-8 last:mb-0">
                {/* Section header - Bold, no brackets */}
                {section.header && (
                  <h3 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
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
                        className="px-3 py-2 rounded cursor-pointer transition-colors"
                        style={{
                          backgroundColor: isSelected
                            ? 'rgba(200, 200, 200, 0.3)'
                            : isHovered
                              ? 'var(--color-input-bg)'
                              : 'transparent',
                          color: isSelected
                            ? '#ffffff'
                            : 'var(--color-text-primary)'
                        }}
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
      </div>

      {/* Continue button */}
      <div className="flex justify-center">
        <button
          onClick={() => onConfirm(selectedLines)}
          disabled={selectedLines.length === 0}
          className="px-8 sm:px-12 py-3 sm:py-4 rounded-full disabled:cursor-not-allowed transition-colors font-semibold text-sm sm:text-base shadow-md"
          style={{
            backgroundColor: 'rgba(128, 128, 128, 0.3)',
            color: selectedLines.length > 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'
          }}
        >
          Continue with {selectedLines.length} {selectedLines.length === 1 ? 'line' : 'lines'}
        </button>
      </div>
    </div>
  );
}
