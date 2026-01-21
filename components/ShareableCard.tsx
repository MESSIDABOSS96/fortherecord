"use client";

import { Record } from "@/types/record";
import { cleanSongTitle } from "@/utils/cleanSongTitle";
import Image from "next/image";
import { forwardRef } from "react";

interface ShareableCardProps {
  record: Record;
}

// Shareable card component - renders expanded modal layout without buttons
// This is used for image capture via html2canvas for Instagram/social sharing
const ShareableCard = forwardRef<HTMLDivElement, ShareableCardProps>(
  ({ record }, ref) => {
    const formattedDate = record.created_at.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <div
        ref={ref}
        className="w-[800px] rounded-3xl overflow-hidden flex flex-col p-8"
        style={{
          backgroundColor: record.background_color,
          // Use fixed dimensions for consistent capture
          minHeight: "500px",
        }}
      >
        {/* Content box - two column layout */}
        <div className="flex flex-row relative flex-1">
          {/* Left panel: Song info + Lyrics */}
          <div className="w-1/2 pr-8 flex flex-col">
            {/* Album art + Song info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-black/20 rounded-sm flex-shrink-0 overflow-hidden">
                {record.album_art_url ? (
                  <img
                    src={record.album_art_url}
                    alt={record.song_title}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
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
                  {cleanSongTitle(record.song_title)}
                </div>
                <div className="text-gray-700 text-base">{record.artist}</div>
              </div>
            </div>

            {/* Lyric excerpt */}
            <div className="text-gray-900 font-bold text-2xl leading-snug whitespace-pre-wrap">
              {record.lyric_excerpt}
            </div>
          </div>

          {/* Vertical divider */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4/5 w-px bg-black/20"></div>

          {/* Right panel: Reflection */}
          <div className="w-1/2 pl-8 flex flex-col">
            <div className="text-base font-bold text-gray-900 mb-6 text-center">
              For {record.for_name}
            </div>
            <div className="text-gray-900 leading-relaxed text-base text-center">
              {record.reflection_text}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center justify-center mt-6">
          <div className="text-sm tracking-wide text-gray-900/70">
            Posted on {formattedDate}
          </div>
          <div className="font-bold text-gray-900 text-base mt-1">
            fortherecord.fm
          </div>
        </div>
      </div>
    );
  }
);

ShareableCard.displayName = "ShareableCard";

export default ShareableCard;
