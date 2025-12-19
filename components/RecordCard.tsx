"use client";

import { Record } from "@/types/record";
import { calculateCardSize, CARD_SIZE_CONFIG } from "@/utils/cardSizing";
import Image from "next/image";

interface RecordCardProps {
  record: Record;
  onClick: () => void;
}

// Component for lyric-type cards
function LyricCard({ record, onClick }: RecordCardProps) {
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
            {record.song_title}
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

// Component for logo-type cards
function LogoCard({ record, onClick }: RecordCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl p-8 transition-all hover:scale-[1.01] hover:shadow-lg flex flex-col items-center justify-center min-h-[220px]"
      style={{
        backgroundColor: record.background_color,
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* Vinyl icon */}
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-4"
      >
        <circle cx="32" cy="32" r="30" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx="32" cy="32" r="20" stroke="#1a1a1a" strokeWidth="1" />
        <circle cx="32" cy="32" r="8" fill="#1a1a1a" />
      </svg>

      {/* Logo text */}
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-1">
          Songs Remind
        </div>
        <div className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Me of You
        </div>
      </div>
    </div>
  );
}

// Component for vinyl-type cards
function VinylCard({ record, onClick }: RecordCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl p-8 transition-all hover:scale-[1.01] hover:shadow-lg flex items-center justify-center min-h-[280px]"
      style={{
        backgroundColor: record.background_color,
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* Vinyl record graphic */}
      <svg
        width="180"
        height="180"
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="90" cy="90" r="88" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
        <circle cx="90" cy="90" r="70" stroke="#444" strokeWidth="1" />
        <circle cx="90" cy="90" r="50" stroke="#444" strokeWidth="1" />
        <circle cx="90" cy="90" r="30" stroke="#444" strokeWidth="1" />
        <circle cx="90" cy="90" r="15" fill="#666" />
        <circle cx="90" cy="90" r="6" fill="#1a1a1a" />
      </svg>
    </div>
  );
}

// Component for image-type cards
function ImageCard({ record, onClick }: RecordCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl p-8 transition-all hover:scale-[1.01] hover:shadow-lg flex items-center justify-center min-h-[200px]"
      style={{
        backgroundColor: record.background_color,
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 mb-2" style={{ fontStyle: 'italic' }}>
          FOR THE RECORD
        </div>
        <div className="text-sm text-gray-600">
          {record.song_title || "Image Card"}
        </div>
      </div>
    </div>
  );
}

// Main RecordCard component with type routing
export default function RecordCard({ record, onClick }: RecordCardProps) {
  const cardType = record.cardType || 'lyric';

  switch (cardType) {
    case 'lyric':
      return <LyricCard record={record} onClick={onClick} />;
    case 'logo':
      return <LogoCard record={record} onClick={onClick} />;
    case 'vinyl':
      return <VinylCard record={record} onClick={onClick} />;
    case 'image':
      return <ImageCard record={record} onClick={onClick} />;
    default:
      return <LyricCard record={record} onClick={onClick} />;
  }
}
