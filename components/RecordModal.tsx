"use client";

import { Record } from "@/types/record";
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
        className="relative max-w-3xl w-full rounded-3xl overflow-hidden"
        style={{
          backgroundColor: record.background_color,
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 2L14 14M14 2L2 14"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="flex flex-col md:flex-row">
          {/* Left panel: Song info + Lyrics */}
          <div className="md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-black/10">
            {/* Album art + Song info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-black/20 rounded-xl flex-shrink-0 overflow-hidden">
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
                  {record.song_title}
                </div>
                <div className="text-gray-700">{record.artist}</div>
              </div>
            </div>

            {/* Lyric excerpt */}
            <div className="text-gray-900 font-bold text-2xl leading-snug whitespace-pre-wrap">
              {record.lyric_excerpt}
            </div>
          </div>

          {/* Right panel: Reflection */}
          <div className="md:w-1/2 p-8 flex flex-col">
            <div className="text-xs font-medium italic text-gray-800 uppercase tracking-wide mb-4">
              FOR {record.for_name.toUpperCase()}
            </div>
            <div className="text-gray-900 leading-relaxed flex-1">
              {record.reflection_text}
            </div>
            <div className="mt-6 pt-6 border-t border-black/10 text-xs text-gray-700 text-center uppercase tracking-wide">
              Posted on {formattedDate}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
