"use client";

import { Record } from "@/types/record";
import { cleanSongTitle } from "@/utils/cleanSongTitle";
import Image from "next/image";
import { useEffect } from "react";

interface RecordModalProps {
  record: Record;
  onClose: () => void;
}

export default function RecordModal({ record, onClose }: RecordModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const formattedDate = record.created_at.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 blur-background"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full rounded-3xl overflow-hidden flex flex-col p-8"
        style={{
          backgroundColor: record.background_color,
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-6 h-6 rounded-full border-2 border-black hover:bg-black/10 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 2L14 14M14 2L2 14"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Content box */}
        <div className="flex flex-col md:flex-row mb-8 relative">
          {/* Left panel: Song info + Lyrics */}
          <div className="md:w-1/2 p-8 flex flex-col">
            {/* Album art + Song info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-black/20 rounded-sm flex-shrink-0 overflow-hidden">
                {record.album_art_url ? (
                  <Image
                    src={record.album_art_url}
                    alt={record.song_title}
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
                  {cleanSongTitle(record.song_title)}
                </div>
                <div className="text-gray-700">{record.artist}</div>
              </div>
            </div>

            {/* Lyric excerpt */}
            <div className="text-gray-900 font-bold text-2xl leading-snug whitespace-pre-wrap">
              {record.lyric_excerpt}
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4/5 w-px bg-black/20"></div>

          {/* Right panel: Reflection */}
          <div className="md:w-1/2 p-8 flex flex-col">
            <div className="text-base font-medium italic text-gray-800 uppercase tracking-wide mb-4 text-center">
              FOR {record.for_name.toUpperCase()}
            </div>
            <div className="text-gray-900 leading-relaxed overflow-y-auto flex-1">
              {record.reflection_text}
            </div>
          </div>
        </div>

        {/* Footer - outside the bordered box */}
        <div className="text-center">
          <div className="text-sm font-bold uppercase tracking-wide text-gray-900">
            Posted on {formattedDate}
          </div>
          <div className="text-sm font-bold uppercase tracking-wide text-gray-900">
            For {record.for_name}
          </div>
        </div>
      </div>
    </div>
  );
}
