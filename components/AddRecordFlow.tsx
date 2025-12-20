"use client";

import SpotifySearch from './SpotifySearch';
import LyricSelector from './LyricSelector';
import RecordPreview from './RecordPreview';
import AddRecordInputs from './AddRecordInputs';
import { useAddRecordState } from '@/hooks/useAddRecordState';
import { Record } from '@/types/record';

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

  const handleLyricsConfirm = (lines: string[]) => {
    setSelectedLines(lines);
    setStep(3);
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
      <div className="max-w-md mx-auto mb-8">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-gray-900' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Step UI */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Select a song</h2>
              <p className="text-gray-600 mb-6">
                Search for the song that reminds you of someone
              </p>
              <SpotifySearch onSelectTrack={handleSongSelect} />
            </div>
          )}

          {step === 2 && songData && (
            <div>
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12 4l-8 8 8 8" stroke="currentColor" strokeWidth="2" />
                </svg>
                Back to song selection
              </button>

              <h2 className="text-2xl font-bold mb-2">Select lyrics</h2>
              <p className="text-gray-600 mb-6">
                Click up to 3 lines that remind you of them
              </p>

              <LyricSelector
                songTitle={songData.song_title}
                artist={songData.artist}
                selectedLines={selectedLines}
                onSelectionChange={setSelectedLines}
                onConfirm={handleLyricsConfirm}
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12 4l-8 8 8 8" stroke="currentColor" strokeWidth="2" />
                </svg>
                Back to lyrics
              </button>

              <h2 className="text-2xl font-bold mb-2">Tell your story</h2>
              <p className="text-gray-600 mb-6">
                Why do these lyrics remind you of them?
              </p>

              <AddRecordInputs
                forName={forName}
                reflectionText={reflectionText}
                onForNameChange={setForName}
                onReflectionChange={setReflectionText}
                onSubmit={handleSubmit}
                canSubmit={forName.trim() !== '' && reflectionText.trim() !== ''}
              />
            </div>
          )}
        </div>

        {/* Right: Live Preview (only visible after step 1) */}
        {step > 1 && songData && (
          <div className="hidden lg:block">
            <RecordPreview
              songData={songData}
              lyricExcerpt={selectedLines.join('\n')}
              forName={forName}
              reflectionText={reflectionText}
            />
          </div>
        )}
      </div>

      {/* Mobile preview - below on small screens */}
      {step > 1 && songData && (
        <div className="lg:hidden mt-8">
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
