"use client";

import SpotifySearch from './SpotifySearch';
import LyricSelector from './LyricSelector';
import RecordPreview from './RecordPreview';
import AddRecordInputs from './AddRecordInputs';
import { useAddRecordState, SelectedLyric } from '@/hooks/useAddRecordState';
import { Record } from '@/types/record';
import { useState } from 'react';
import Image from 'next/image';

interface AddRecordFlowProps {
  onSubmit: (data: Omit<Record, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}

export default function AddRecordFlow({ onSubmit, onCancel }: AddRecordFlowProps) {
  const {
    step,
    songData,
    selectedLines,
    forName,
    reflectionText,
    setStep,
    setSongData,
    setSelectedLines,
    setForName,
    setReflectionText,
  } = useAddRecordState();

  const [tempName, setTempName] = useState('');

  // Helper function to sort lyrics by original song position
  const getSortedLyricText = (lyrics: SelectedLyric[]): string => {
    return lyrics
      .slice()
      .sort((a, b) => a.originalIndex - b.originalIndex)
      .map(l => l.text)
      .join('\n');
  };

  const handleSongSelect = async (song: any) => {
    setSongData({
      song_title: song.song_title,
      artist: song.artist,
      album_art_url: song.album_art_url,
      spotify_track_id: song.spotify_track_id,
      background_color: song.background_color,
    });
    // Auto-advance to step 2
    setTimeout(() => setStep(2), 500);
  };

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      setForName(tempName);
      setStep(3);
    }
  };

  const handleLyricsConfirm = (lines: SelectedLyric[]) => {
    setSelectedLines(lines);
    setStep(4);
  };

  const handleSubmit = () => {
    if (!songData || selectedLines.length === 0) return;

    onSubmit({
      ...songData,
      lyric_excerpt: getSortedLyricText(selectedLines),
      for_name: forName,
      reflection_text: reflectionText,
      cardType: 'lyric',
    });
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      {/* Progress indicator */}
      <div className="max-w-sm mx-auto mb-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-0.5 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-gray-800' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step 1: Centered song selection */}
      {step === 1 && (
        <div className="max-w-2xl mx-auto mt-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Select a song</h2>
            <p className="text-gray-600 text-lg">
              Search for the song that reminds you of someone
            </p>
          </div>
          <SpotifySearch onSelectTrack={handleSongSelect} />
        </div>
      )}

      {/* Step 2: Who are you thinking of? */}
      {step === 2 && songData && (
        <div className="mt-12">
          <div className="mb-10">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12 4l-8 8 8 8" stroke="currentColor" strokeWidth="2" />
              </svg>
              Back
            </button>
          </div>

          <div className="max-w-xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Who are you thinking of?</h2>
            </div>

            <div className="space-y-6">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-lg text-center"
                placeholder="Mom, Sarah, my best friend..."
                autoFocus
              />

              <button
                onClick={handleNameSubmit}
                disabled={!tempName.trim()}
                className="w-full px-6 py-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Lyric Selection - 2 column with preview */}
      {step === 3 && songData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16">
          {/* Left: Lyric Selector */}
          <div>
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12 4l-8 8 8 8" stroke="currentColor" strokeWidth="2" />
              </svg>
              Back
            </button>

            <h2 className="text-2xl font-bold mb-4">Select lyrics</h2>
            <p className="text-gray-600 mb-10">
              Click up to 4 lines that remind you of {forName}
            </p>

            <LyricSelector
              songTitle={songData.song_title}
              artist={songData.artist}
              selectedLines={selectedLines}
              onSelectionChange={setSelectedLines}
              onConfirm={handleLyricsConfirm}
            />
          </div>

          {/* Right: Preview */}
          <div className="hidden lg:block">
            <div className="sticky top-12">
              <RecordPreview
                songData={songData}
                lyricExcerpt={getSortedLyricText(selectedLines)}
                forName={forName}
                reflectionText={reflectionText}
                showExpandedView={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile preview for step 3 */}
      {step === 3 && songData && (
        <div className="lg:hidden mt-8">
          <p className="text-sm text-gray-500 mb-4">Preview</p>
          <RecordPreview
            songData={songData}
            lyricExcerpt={getSortedLyricText(selectedLines)}
            forName={forName}
            reflectionText={reflectionText}
            showExpandedView={false}
          />
        </div>
      )}

      {/* Step 4: Tell your story - Inline editing in expanded card */}
      {step === 4 && songData && (
        <div className="mt-16">
          {/* Back button */}
          <div className="max-w-4xl mx-auto mb-8">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12 4l-8 8 8 8" stroke="currentColor" strokeWidth="2" />
              </svg>
              Back to lyrics
            </button>
          </div>

          {/* Expanded card - matches RecordModal structure */}
          <div className="max-w-4xl mx-auto">
            <div
              className="rounded-3xl overflow-hidden flex flex-col p-8"
              style={{
                backgroundColor: songData.background_color,
                boxShadow: "var(--shadow-lg)",
              }}
            >
              {/* Two-panel content */}
              <div className="flex flex-col md:flex-row mb-8 relative">
                {/* Left panel: Song info + Lyrics */}
                <div className="md:w-1/2 p-8 flex flex-col">
                  {/* Album art + Song info */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-black/20 rounded-xl flex-shrink-0 overflow-hidden">
                      {songData.album_art_url ? (
                        <Image
                          src={songData.album_art_url}
                          alt={songData.song_title}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="2" />
                            <circle cx="16" cy="16" r="6" fill="white" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xl text-gray-900">
                        {songData.song_title}
                      </div>
                      <div className="text-gray-700">{songData.artist}</div>
                    </div>
                  </div>

                  {/* Lyric excerpt */}
                  <div className="text-gray-900 font-bold text-2xl leading-snug whitespace-pre-wrap">
                    {getSortedLyricText(selectedLines) || 'Select lyrics to see preview...'}
                  </div>
                </div>

                {/* Vertical divider */}
                <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4/5 w-px bg-black/20"></div>

                {/* Right panel: Inline editing area */}
                <div className="md:w-1/2 p-8 flex flex-col">
                  <div className="text-base font-medium italic text-gray-800 uppercase tracking-wide mb-4 text-center">
                    FOR {forName.toUpperCase() || 'YOUR NAME'}
                  </div>

                  {/* Inline textarea - replaces static text */}
                  <textarea
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder="Why do these lyrics remind you of them? Tell their story..."
                    className="text-gray-900 leading-relaxed overflow-y-auto max-h-[350px] bg-transparent border-none focus:outline-none focus:ring-0 resize-none w-full placeholder:text-gray-500 placeholder:italic"
                    style={{ minHeight: '200px' }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="text-center">
                <div className="text-sm font-bold uppercase tracking-wide text-gray-900">
                  Posted on {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="text-sm font-bold uppercase tracking-wide text-gray-900">
                  For {forName || 'Your Name'}
                </div>
              </div>
            </div>

            {/* Publish button - below the card */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={reflectionText.trim() === ''}
                className="px-12 py-4 bg-gray-900 text-white rounded-full font-semibold text-base hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                Publish Record
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
