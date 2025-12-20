"use client";

import SpotifySearch from './SpotifySearch';
import LyricSelector from './LyricSelector';
import RecordPreview from './RecordPreview';
import AddRecordInputs from './AddRecordInputs';
import { useAddRecordState } from '@/hooks/useAddRecordState';
import { Record } from '@/types/record';
import { useState } from 'react';

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

  const handleLyricsConfirm = (lines: string[]) => {
    setSelectedLines(lines);
    setStep(4);
  };

  const handleSubmit = () => {
    if (!songData || selectedLines.length === 0) return;

    onSubmit({
      ...songData,
      lyric_excerpt: selectedLines.join('\n'),
      for_name: forName,
      reflection_text: reflectionText,
      cardType: 'lyric',
    });
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      {/* Progress indicator */}
      <div className="max-w-md mx-auto mb-12">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-gray-800' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step 1: Centered song selection */}
      {step === 1 && (
        <div className="max-w-2xl mx-auto mt-16">
          <div className="text-center mb-10">
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
        <div className="mt-16">
          <div className="mb-8">
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
            <div className="text-center mb-10">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-8">
          {/* Left: Lyric Selector */}
          <div>
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12 4l-8 8 8 8" stroke="currentColor" strokeWidth="2" />
              </svg>
              Back
            </button>

            <h2 className="text-2xl font-bold mb-2">Select lyrics</h2>
            <p className="text-gray-600 mb-8">
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
            <div className="sticky top-8">
              <p className="text-sm text-gray-500 mb-4">Preview</p>
              <RecordPreview
                songData={songData}
                lyricExcerpt={selectedLines.join('\n')}
                forName={forName}
                reflectionText={reflectionText}
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
            lyricExcerpt={selectedLines.join('\n')}
            forName={forName}
            reflectionText={reflectionText}
          />
        </div>
      )}

      {/* Step 4: Story - 2 column with preview */}
      {step === 4 && songData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-8">
          {/* Left: Story Input */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12 4l-8 8 8 8" stroke="currentColor" strokeWidth="2" />
              </svg>
              Back to lyrics
            </button>

            <h2 className="text-2xl font-bold mb-2">Tell your story</h2>
            <p className="text-gray-600 mb-8">
              Why do these lyrics remind you of {forName}?
            </p>

            <AddRecordInputs
              forName={forName}
              reflectionText={reflectionText}
              onForNameChange={setForName}
              onReflectionChange={setReflectionText}
              onSubmit={handleSubmit}
              canSubmit={reflectionText.trim() !== ''}
            />
          </div>

          {/* Right: Preview */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <p className="text-sm text-gray-500 mb-4">Preview</p>
              <RecordPreview
                songData={songData}
                lyricExcerpt={selectedLines.join('\n')}
                forName={forName}
                reflectionText={reflectionText}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile preview for step 4 */}
      {step === 4 && songData && (
        <div className="lg:hidden mt-8">
          <p className="text-sm text-gray-500 mb-4">Preview</p>
          <RecordPreview
            songData={songData}
            lyricExcerpt={selectedLines.join('\n')}
            forName={forName}
            reflectionText={reflectionText}
          />
        </div>
      )}
    </main>
  );
}
