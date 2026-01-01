"use client";

import RecordCard from './RecordCard';
import Image from 'next/image';
import { Record } from '@/types/record';

interface RecordPreviewProps {
  songData: {
    song_title: string;
    artist: string;
    album_art_url: string;
    spotify_track_id: string;
    background_color: string;
  };
  lyricExcerpt: string;
  forName: string;
  reflectionText: string;
  showExpandedView?: boolean;
}

export default function RecordPreview({
  songData,
  lyricExcerpt,
  forName,
  reflectionText,
  showExpandedView = true,
}: RecordPreviewProps) {
  // Create mock record for preview
  const previewRecord: Record = {
    id: 'preview',
    ...songData,
    lyric_excerpt: lyricExcerpt || 'Select lyrics to see preview...',
    for_name: forName || 'Your Name',
    reflection_text: reflectionText || 'Your reflection will appear here...',
    created_at: new Date(),
    card_type: 'lyric',
  };

  const formattedDate = previewRecord.created_at.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="sticky top-24">
      <div className="space-y-6">
        {/* Grid Card Preview */}
        <div className="max-w-sm">
          <RecordCard record={previewRecord} onClick={() => { }} />
        </div>

        {/* Expanded Modal Preview */}
        {showExpandedView && (
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 font-medium">
              Expanded View
            </p>
            <div
              className="rounded-3xl overflow-hidden p-8"
              style={{
                backgroundColor: previewRecord.background_color,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div className="flex flex-col md:flex-row mb-8 relative">
                {/* Left panel: Song info + Lyrics */}
                <div className="md:w-1/2 p-8 flex flex-col">
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
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              cx="16"
                              cy="16"
                              r="14"
                              stroke="white"
                              strokeWidth="2"
                            />
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
                    {lyricExcerpt || 'Select lyrics to see preview...'}
                  </div>
                </div>

                {/* Vertical divider */}
                <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4/5 w-px bg-black/20"></div>

                {/* Right panel: Reflection */}
                <div className="md:w-1/2 p-8 flex flex-col">
                  <div className="text-base font-medium italic text-gray-800 uppercase tracking-wide mb-4 text-center">
                    FOR {(forName || 'YOUR NAME').toUpperCase()}
                  </div>
                  <div className="text-gray-900 leading-relaxed">
                    {reflectionText || 'Your reflection will appear here...'}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center">
                <div className="text-sm font-bold uppercase tracking-wide text-gray-900">
                  Posted on {formattedDate}
                </div>
                <div className="text-sm font-bold uppercase tracking-wide text-gray-900">
                  For {forName || 'Your Name'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
