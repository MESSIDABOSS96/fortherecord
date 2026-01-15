"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: string;
  album: string;
  albumArt: string;
  albumArtMedium: string;
  albumArtSmall: string;
  previewUrl: string | null;
  spotifyUrl: string;
}

interface SpotifySearchProps {
  onSelectTrack: (track: {
    song_title: string;
    artist: string;
    album_art_url: string;
    spotify_track_id: string;
    background_color: string;
  }) => void;
  isValidating?: boolean;
  validationError?: string;
  onClearError?: () => void;
}

export default function SpotifySearch({ onSelectTrack, isValidating = false, validationError = '', onClearError }: SpotifySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Clear validation error when user starts typing
  useEffect(() => {
    if (query.trim() && validationError && onClearError) {
      onClearError();
    }
  }, [query, validationError, onClearError]);

  // Dismiss keyboard on scroll (iOS behavior)
  useEffect(() => {
    const resultsContainer = resultsRef.current;
    if (!resultsContainer) return;

    const handleScroll = () => {
      // Blur the input to dismiss keyboard when scrolling
      if (inputRef.current && document.activeElement === inputRef.current) {
        inputRef.current.blur();
      }
    };

    resultsContainer.addEventListener('scroll', handleScroll, { passive: true });
    resultsContainer.addEventListener('touchmove', handleScroll, { passive: true });

    return () => {
      resultsContainer.removeEventListener('scroll', handleScroll);
      resultsContainer.removeEventListener('touchmove', handleScroll);
    };
  }, [results]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setResults(data.tracks || []);
      } catch (err) {
        setError('Failed to search. Please try again.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [query]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0 // Wrap to top
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1 // Wrap to bottom
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectTrack(results[selectedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setSelectedIndex(-1); // Clear selection
        break;
    }
  };

  const handleSelectTrack = async (track: SpotifyTrack) => {
    // Extract color first, then call onSelectTrack with the correct color
    let backgroundColor = '#A39A91'; // Default fallback

    try {
      const response = await fetch('/api/bucket-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: track.albumArtMedium }),
      });

      if (response.ok) {
        const colorData = await response.json();
        backgroundColor = colorData.bgColor;
        console.log('Extracted color:', backgroundColor);
      }
    } catch (error) {
      console.error('Background color extraction failed:', error);
    }

    // Now trigger the callback with the extracted color
    onSelectTrack({
      song_title: track.name,
      artist: track.artists,
      album_art_url: track.albumArtMedium, // 300x300 image
      spotify_track_id: track.id,
      background_color: backgroundColor,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 transform -translate-y-1/2"
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-11 pr-4 py-3.5 rounded-full focus:outline-none text-[16px] placeholder:text-xs sm:placeholder:text-sm"
          style={{
            backgroundColor: 'var(--color-input-bg)',
            borderColor: 'var(--color-input-border)',
            color: 'var(--color-text-secondary)',
            borderWidth: '1px',
            borderStyle: 'solid'
          }}
          placeholder="Songs, Albums or Artists"
          autoFocus
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-text-secondary)' }}></div>
          <p className="mt-2 text-sm">Searching...</p>
        </div>
      )}

      {/* Error State */}
      {(error || validationError) && (
        <div className={`rounded-lg p-4 text-sm flex items-center gap-3 ${validationError
          ? 'bg-gray-50 border border-gray-200 text-gray-600' // Neutral gray to match aesthetic
          : 'bg-red-50 border border-red-200 text-red-700'    // Keep red for actual system errors
          }`}>
          {validationError ? (
            // Info Icon for validation messages
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 8V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11.9945 16H12.0035" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            // Warning/Error Icon for system errors
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="2" />
              <path d="M10 6V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
          <span className="font-medium">{error || validationError}</span>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div ref={resultsRef} className="space-y-2 max-h-96 overflow-y-auto">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{results.length} results</p>
          {results.map((track, index) => {
            const isSelected = selectedIndex === index;
            // Check if this specific track is the one being validated
            // We can approximate this by checking if validation is active and this is the selected item
            const isBeingValidated = isValidating && isSelected;

            return (
              <button
                key={track.id}
                ref={isSelected ? selectedRef : null}
                onClick={() => !isValidating && handleSelectTrack(track)}
                disabled={isValidating}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left border ${isValidating ? 'opacity-75 cursor-wait' : ''}`}
                style={{
                  borderColor: 'var(--color-input-border)',
                  backgroundColor: isSelected ? 'var(--color-input-bg)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-input-bg)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Album Art */}
                <div className="w-14 h-14 rounded flex-shrink-0 overflow-hidden relative" style={{ backgroundColor: 'var(--color-input-border)' }}>
                  {track.albumArtSmall && (
                    <Image
                      src={track.albumArtSmall}
                      alt={track.album}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Overlay loading spinner if this track is being validated */}
                  {isBeingValidated && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    </div>
                  )}
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{track.name}</div>
                  <div className="text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>{track.artists}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{track.album}</div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && query.trim() && results.length === 0 && !error && (
        <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
          <p className="text-sm">No results found for &quot;{query}&quot;</p>
          <p className="text-xs mt-1">Try searching with different keywords</p>
        </div>
      )}

      {/* Initial State */}
      {!query.trim() && !loading && (
        <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto mb-3 opacity-50"
          >
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-sm">Start typing to search for music</p>
        </div>
      )}
    </div>
  );
}
