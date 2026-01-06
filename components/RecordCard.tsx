"use client";

import { Record } from "@/types/record";
import { calculateCardSize, CARD_SIZE_CONFIG } from "@/utils/cardSizing";
import { cleanSongTitle } from "@/utils/cleanSongTitle";
import Image from "next/image";

interface RecordCardProps {
  record: Record;
  onClick: () => void;
}

// Main lyric card component
export default function RecordCard({ record, onClick }: RecordCardProps) {
  const cardSize = calculateCardSize(record.lyric_excerpt);
  const sizeConfig = CARD_SIZE_CONFIG[cardSize];

  // Prefetch image on hover/touch to speed up modal opening
  const prefetchImage = () => {
    if (record.album_art_url) {
      // Check if already prefetched
      const existingLink = document.querySelector(`link[href="${record.album_art_url}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'image';
        link.href = record.album_art_url;
        document.head.appendChild(link);
      }
    }
  };

  const handleMouseEnter = prefetchImage;
  const handleTouchStart = () => {
    prefetchImage();
  };

  return (
    <div
      onClick={onClick}
      onTouchStart={handleTouchStart} // Prefetch image on touch + enables :active states on iOS
      onMouseEnter={handleMouseEnter} // Prefetch image on hover
      role="button"
      aria-label={`Read story about ${record.for_name} - ${cleanSongTitle(record.song_title)}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group cursor-pointer rounded-[16px] sm:rounded-[20px] p-4 sm:p-5 md:p-6 transition-all hover:scale-[1.01] hover:shadow-lg active:scale-[0.98] active:shadow-sm md:active:scale-100 md:active:shadow-lg flex flex-col relative"
      style={{
        backgroundColor: record.background_color,
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* Darkening overlay on press - mobile only */}
      <div className="absolute inset-0 bg-black/5 rounded-[16px] sm:rounded-[20px] opacity-0 group-active:opacity-100 md:group-active:opacity-0 transition-opacity pointer-events-none -z-10" />

      {/* Header: Album art + Song info */}
      <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 flex-shrink-0">
        <div className="w-[40px] h-[40px] sm:w-[46px] sm:h-[46px] bg-black/20 rounded-sm flex-shrink-0 overflow-hidden">
          {record.album_art_url ? (
            <Image
              src={record.album_art_url}
              alt={record.song_title}
              width={46}
              height={46}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="3" fill="white" />
              </svg>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-[14px] text-gray-900 truncate leading-tight">
            {cleanSongTitle(record.song_title)}
          </div>
          <div className="text-[12px] text-gray-700 truncate leading-tight mt-1">
            {record.artist}
          </div>
        </div>
      </div>

      {/* Lyric excerpt - full display, no truncation */}
      <div className="text-gray-900 font-bold text-lg sm:text-[20px] leading-[1.35] mb-4 sm:mb-5 flex-1 whitespace-pre-line">
        {record.lyric_excerpt}
      </div>

      {/* For label */}
      <div className="text-[10px] sm:text-[11px] font-medium italic text-gray-900/70 uppercase tracking-wide flex-shrink-0">
        FOR {record.for_name.toUpperCase()}
      </div>
    </div>
  );
}
