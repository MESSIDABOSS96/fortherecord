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
}

export default function SpotifySearch({ onSelectTrack }: SpotifySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const selectedRef = useRef<HTMLButtonElement>(null);

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
    let matchedColor = '#A39A91'; // Default fallback (kinari-2)

    try {
      // Use bucket color extraction API (10-color deterministic system)
      const response = await fetch('/api/bucket-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: track.albumArtMedium }),
      });

      if (response.ok) {
        const colorData = await response.json();
        matchedColor = colorData.bgColor;
      } else {
        console.error('Bucket extraction API failed:', await response.text());
      }
    } catch (error) {
      console.error('Bucket extraction failed:', error);
    }

    onSelectTrack({
      song_title: track.name,
      artist: track.artists,
      album_art_url: track.albumArtMedium, // 300x300 image
      spotify_track_id: track.id,
      background_color: matchedColor,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-11 pr-4 py-3.5 bg-[#f5f3f0] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm placeholder:text-gray-500"
          placeholder="Songs, Albums or Artists"
          autoFocus
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-gray-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm">Searching...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <p className="text-sm text-gray-600">{results.length} results</p>
          {results.map((track, index) => (
            <button
              key={track.id}
              ref={selectedIndex === index ? selectedRef : null}
              onClick={() => handleSelectTrack(track)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                selectedIndex === index
                  ? 'bg-gray-200 shadow-sm'
                  : 'hover:bg-gray-100'
              }`}
            >
              {/* Album Art */}
              <div className="w-14 h-14 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                {track.albumArtSmall && (
                  <Image
                    src={track.albumArtSmall}
                    alt={track.album}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">{track.name}</div>
                <div className="text-sm text-gray-600 truncate">{track.artists}</div>
                <div className="text-xs text-gray-500 truncate">{track.album}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && query.trim() && results.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No results found for &quot;{query}&quot;</p>
          <p className="text-xs mt-1">Try searching with different keywords</p>
        </div>
      )}

      {/* Initial State */}
      {!query.trim() && !loading && (
        <div className="text-center py-8 text-gray-400">
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
