"use client";

import SpotifySearch from './SpotifySearch';
import LyricSelector from './LyricSelector';
import RecordPreview from './RecordPreview';
import AddRecordInputs from './AddRecordInputs';
import { useAddRecordState, SelectedLyric } from '@/hooks/useAddRecordState';
import { cleanSongTitle } from '@/utils/cleanSongTitle';
import { Record } from '@/types/record';
import { useState } from 'react';
import Image from 'next/image';

interface AddRecordFlowProps {
  onSubmit: (data: Omit<Record, 'id' | 'created_at'>) => void;
  onCancel: () => void;
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

export default function AddRecordFlow({ onSubmit, onCancel, currentStep, onStepChange }: AddRecordFlowProps) {
  const {
    step: internalStep,
    songData,
    selectedLines,
    forName,
    reflectionText,
    setStep: setInternalStep,
    setSongData,
    setSelectedLines,
    setForName,
    setReflectionText,
  } = useAddRecordState();

  // Use passed-in step if available, otherwise use internal step
  const step = currentStep ?? internalStep;
  const setStep = (newStep: number) => {
    if (onStepChange) {
      onStepChange(newStep);
    } else {
      setInternalStep(newStep as 1 | 2 | 3 | 4);
    }
  };

  const [tempName, setTempName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingLyrics, setIsValidatingLyrics] = useState(false);
  const [lyricError, setLyricError] = useState('');

  // Helper function to sort lyrics by original song position
  const getSortedLyricText = (lyrics: SelectedLyric[]): string => {
    return lyrics
      .slice()
      .sort((a, b) => a.originalIndex - b.originalIndex)
      .map(l => l.text)
      .join('\n');
  };

  const checkLyricsAvailability = async (title: string, artist: string): Promise<boolean> => {
    try {
      console.log(`Checking lyrics for: "${title}" by ${artist}`);
      const response = await fetch(`/api/genius/lyrics?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`);
      console.log('Lyrics API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lyrics API error (status ' + response.status + '):', errorText);
        try {
          const errorData = JSON.parse(errorText);
          console.error('Parsed error:', errorData);
        } catch (e) {
          console.error('Could not parse error as JSON');
        }
        return false;
      }
      const data = await response.json();
      console.log('Lyrics data:', data);
      console.log('Lyrics found:', !!data.lyrics);
      return !!data.lyrics;
    } catch (error) {
      console.error('Error checking lyrics:', error);
      return false;
    }
  };

  const handleSongSelect = async (song: any) => {
    setIsValidatingLyrics(true);
    setLyricError('');

    const hasLyrics = await checkLyricsAvailability(song.song_title, song.artist);

    if (!hasLyrics) {
      setIsValidatingLyrics(false);
      setLyricError("We couldn’t find lyrics for this song. Try a different one.");
      return;
    }

    setSongData({
      song_title: song.song_title,
      artist: song.artist,
      album_art_url: song.album_art_url,
      spotify_track_id: song.spotify_track_id,
      background_color: song.background_color,
    });
    // Clear selected lyrics and reflection when changing songs
    setSelectedLines([]);
    setReflectionText('');
    setIsValidatingLyrics(false);

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
    if (!songData || selectedLines.length === 0 || isSubmitting) return;

    setIsSubmitting(true);

    onSubmit({
      ...songData,
      lyric_excerpt: getSortedLyricText(selectedLines),
      for_name: forName,
      reflection_text: reflectionText,
      card_type: 'lyric',
    });
  };

  return (
    <>
      {/* Simple linear progress bar */}
      <div className="w-full py-8">
        <div className="max-w-md mx-auto px-6">
          {/* Progress bar container - rounded rectangle */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            {/* Filled portion */}
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%`, backgroundColor: '#808080' }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        {/* Step 1: Centered song selection */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto mt-6 sm:mt-8">
            <div className="text-center mb-8 sm:mb-12 px-4">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Select a Song</h2>
              <p className="text-base sm:text-lg" style={{ color: '#B3B3B3' }}>
                Find the song that reminds you of someone
              </p>
            </div>
            <SpotifySearch
              onSelectTrack={handleSongSelect}
              isValidating={isValidatingLyrics}
              validationError={lyricError}
              onClearError={() => setLyricError('')}
            />
          </div>
        )}

        {/* Step 2: Who are you thinking of? */}
        {step === 2 && songData && (
          <div>
            {/* Content container - same as Step 1 */}
            <div className="max-w-2xl mx-auto mt-6 sm:mt-8">
              <div className="relative text-center mb-8 sm:mb-12 px-4">
                {/* Back button - desktop only, aligned with logo center */}
                <button
                  onClick={() => setStep(1)}
                  className="hidden md:block absolute md:-left-[240px] lg:-left-[280px] xl:-left-[320px] top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full"
                  aria-label="Back"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Who are you thinking of?</h2>
              </div>

              <div className="max-w-xl mx-auto space-y-4 sm:space-y-6 px-4">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-full focus:outline-none text-[16px] sm:text-lg text-center"
                  style={{
                    backgroundColor: 'var(--color-input-bg)',
                    borderColor: 'var(--color-input-border)',
                    color: 'var(--color-text-secondary)',
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                  placeholder="Mom, Sarah, my best friend..."
                  autoFocus
                />

                <div className="flex justify-center">
                  <button
                    onClick={handleNameSubmit}
                    disabled={!tempName.trim()}
                    className="px-8 sm:px-12 py-3 sm:py-4 rounded-full disabled:cursor-not-allowed transition-colors font-semibold text-sm sm:text-base shadow-md"
                    style={{
                      backgroundColor: 'rgba(128, 128, 128, 0.3)',
                      color: tempName.trim() ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Lyric Selection - 2 column with preview */}
        {step === 3 && songData && (
          <div>
            {/* Centered title section - matching steps 1 and 2 */}
            <div className="max-w-2xl mx-auto mt-6 sm:mt-8">
              <div className="relative text-center mb-8 sm:mb-12 px-4">
                {/* Back button - desktop only, aligned with logo center */}
                <button
                  onClick={() => setStep(2)}
                  className="hidden md:block absolute md:-left-[240px] lg:-left-[280px] xl:-left-[320px] top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full"
                  aria-label="Back"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Select lyrics</h2>
                <p className="text-base sm:text-lg" style={{ color: '#B3B3B3' }}>
                  Click up to 4 lines that remind you of {forName}
                </p>
              </div>
            </div>

            {/* Content grid - lyrics and preview side by side */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 lg:gap-24 xl:gap-36 items-start">
                {/* Left: Lyric Selector */}
                <div className="flex justify-end">
                  <div className="w-full max-w-xl">
                    <LyricSelector
                      songTitle={songData.song_title}
                      artist={songData.artist}
                      selectedLines={selectedLines}
                      onSelectionChange={setSelectedLines}
                      onConfirm={handleLyricsConfirm}
                    />
                  </div>
                </div>

                {/* Right: Preview - no header, aligned with lyrics box */}
                <div className="hidden lg:flex justify-start">
                  <div className="w-full max-w-xl">
                    {/* Spacer to align with grey box (matches selection counter height + margin) */}
                    <div className="mb-6 text-sm" style={{ visibility: 'hidden' }}>
                      Spacer
                    </div>
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
            </div>
          </div>
        )}

        {/* Mobile preview - only show if lines selected */}
        {step === 3 && songData && selectedLines.length > 0 && (
          <div className="lg:hidden mt-8 px-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Preview</h2>
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
          <div>
            {/* Back button section - matching steps 2 and 3 structure */}
            <div className="max-w-2xl mx-auto mt-6 sm:mt-8 mb-6 sm:mb-8">
              <div className="relative px-4">
                {/* Back button - desktop only, aligned with title sections */}
                <button
                  onClick={() => setStep(3)}
                  className="hidden md:block absolute md:-left-[240px] lg:-left-[280px] xl:-left-[320px] top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full"
                  aria-label="Back"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Expanded card - matches RecordModal structure */}
            <div className="max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-4">
              <div
                className="rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto"
                style={{
                  backgroundColor: songData.background_color,
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                {/* Two-panel content */}
                <div className="flex flex-col md:flex-row mb-6 sm:mb-8 relative">
                  {/* Left panel: Song info + Lyrics */}
                  <div className="md:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col">
                    {/* Album art + Song info */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-black/20 rounded-sm flex-shrink-0 overflow-hidden">
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
                          {cleanSongTitle(songData.song_title)}
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

                  {/* Horizontal divider for mobile */}
                  <div className="md:hidden h-px bg-black/20 my-4"></div>

                  {/* Right panel: Inline editing area */}
                  <div className="md:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col">
                    <div className="text-sm sm:text-base font-medium italic text-gray-800 uppercase tracking-wide mb-3 sm:mb-4 text-center">
                      FOR {forName.toUpperCase() || 'YOUR NAME'}
                    </div>

                    {/* Inline textarea - replaces static text */}
                    <textarea
                      value={reflectionText}
                      onChange={(e) => setReflectionText(e.target.value)}
                      placeholder="Why do these lyrics remind you of them? Tell their story..."
                      className="text-[16px] sm:text-base text-gray-900 leading-relaxed overflow-y-auto max-h-[400px] sm:max-h-[500px] bg-transparent border-none focus:outline-none focus:ring-0 resize-none w-full placeholder:text-gray-900 placeholder:italic"
                      style={{ minHeight: '150px' }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center">
                  <div className="text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-900">
                    Posted on {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-900">
                    For {forName || 'Your Name'}
                  </div>
                </div>
              </div>

              {/* Publish button - sticky on mobile, regular on desktop */}
              <div className="mt-6 sm:mt-8 flex justify-center px-4">
                <button
                  onClick={handleSubmit}
                  disabled={reflectionText.trim() === '' || isSubmitting}
                  className="px-8 sm:px-12 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base disabled:cursor-not-allowed transition-colors shadow-md"
                  style={{
                    backgroundColor: 'rgba(128, 128, 128, 0.3)',
                    color: (reflectionText.trim() !== '' && !isSubmitting) ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Record'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
