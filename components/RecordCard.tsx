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

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-[20px] p-6 transition-all hover:scale-[1.01] hover:shadow-lg flex flex-col"
      style={{
        backgroundColor: record.background_color,
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* Header: Album art + Song info */}
      <div className="flex items-center gap-3 mb-5 flex-shrink-0">
        <div className="w-[46px] h-[46px] bg-black/20 rounded-sm flex-shrink-0 overflow-hidden">
          {record.album_art_url ? (
            <Image
              src={record.album_art_url}
              alt={record.song_title}
              width={46}
              height={46}
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
      <div className="text-gray-900 font-bold text-[20px] leading-[1.35] mb-5 flex-1 whitespace-pre-line">
        {record.lyric_excerpt}
      </div>

      {/* For label */}
      <div className="text-[11px] font-medium italic text-gray-900/70 uppercase tracking-wide flex-shrink-0">
        FOR {record.for_name.toUpperCase()}
      </div>
    </div>
  );
}
