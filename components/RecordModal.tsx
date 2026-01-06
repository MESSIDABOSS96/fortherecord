"use client";

import { Record } from "@/types/record";
import { cleanSongTitle } from "@/utils/cleanSongTitle";
import Image from "next/image";
import { useEffect } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useRouter } from "next/navigation";

interface RecordModalProps {
  record: Record;
  onClose: () => void;
}

export default function RecordModal({ record, onClose }: RecordModalProps) {
  const router = useRouter();
  
  // Lock scroll when modal is open (handles iOS properly)
  useScrollLock(true);

  // Share functionality
  const handleShare = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    const shareUrl = `${window.location.origin}?card=${record.id}`;
    const shareText = `${cleanSongTitle(record.song_title)} by ${record.artist} - For ${record.for_name}`;
    
    // Try Web Share API first (mobile/iOS) - must be called from user gesture
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: shareText,
          text: shareText,
          url: shareUrl,
        });
        return; // Successfully shared, exit early
      } catch (err: any) {
        // User cancelled - don't show fallback
        if (err?.name === 'AbortError' || err?.message?.includes('cancel')) {
          return;
        }
        // For other errors, log and fall through to clipboard fallback
        console.log('Web Share API error (falling back):', err);
      }
    }
    
    // Fallback: copy to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        return;
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
    
    // Final fallback: show URL in prompt (only if both above fail)
    prompt('Copy this link:', shareUrl);
  };

  // Update URL when modal opens
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('card', record.id);
    window.history.pushState({}, '', url.toString());
    
    // Clean up URL when modal closes
    return () => {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('card');
      window.history.replaceState({}, '', cleanUrl.toString());
    };
  }, [record.id]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);


  const formattedDate = record.created_at.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 blur-background"
      onClick={onClose}
    >
      <div
        className="relative max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl w-full rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: record.background_color,
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center transition-opacity hover:opacity-70"
          aria-label="Close"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 2L14 14M14 2L2 14"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeOpacity="0.6"
            />
          </svg>
        </button>

        {/* Content box */}
        <div className="flex flex-col md:flex-row mb-6 sm:mb-8 relative">
          {/* Left panel: Song info + Lyrics */}
          <div className="md:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col">
            {/* Album art + Song info */}
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-black/20 rounded-sm flex-shrink-0 overflow-hidden">
                {record.album_art_url ? (
                  <Image
                    src={record.album_art_url}
                    alt={record.song_title}
                    width={64}
                    height={64}
                    priority
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
                <div className="font-bold text-lg sm:text-xl text-gray-900">
                  {cleanSongTitle(record.song_title)}
                </div>
                <div className="text-sm sm:text-base text-gray-700">{record.artist}</div>
              </div>
            </div>

            {/* Lyric excerpt */}
            <div className="text-gray-900 font-bold text-xl sm:text-2xl leading-snug whitespace-pre-wrap">
              {record.lyric_excerpt}
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4/5 w-px bg-black/20"></div>

          {/* Horizontal divider for mobile */}
          <div className="md:hidden h-px bg-black/20 my-4"></div>

          {/* Right panel: Reflection */}
          <div className="md:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col">
            <div className="text-sm sm:text-base font-medium italic text-gray-800 uppercase tracking-wide mb-3 sm:mb-4 text-center">
              FOR {record.for_name.toUpperCase()}
            </div>
            <div className="text-sm sm:text-base text-gray-900 leading-relaxed overflow-y-auto flex-1 text-center">
              {record.reflection_text}
            </div>
          </div>
        </div>

        {/* Footer - outside the bordered box */}
        <div className="text-center mt-6 sm:mt-8 md:mt-4 relative">
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-900">
            Posted on {formattedDate}
          </div>

          {/* Share button - mobile only, aligned with footer text */}
          <button
            onClick={handleShare}
            className="md:hidden absolute -right-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center z-10"
            aria-label="Share"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 100 115"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-900"
            >
              <path d="m89.75 46.293c-0.023438 1.9531-0.83203 3.8164-2.25 5.1641l-23.293 23.25c-2.0547 2.1172-5.2031 2.7461-7.9141 1.5859-2.7305-1.1094-4.5117-3.7656-4.5-6.7109v-7.582c-12.91 0.84766-24.535 8.1055-30.961 19.332-0.96484 1.8203-2.8555 2.957-4.9141 2.9609-0.49219-0.011719-0.98438-0.082031-1.4609-0.21094-2.4531-0.62891-4.168-2.8398-4.1641-5.375v-3.25c0.003906-11.336 4.3047-22.246 12.035-30.535 7.7344-8.2891 18.32-13.34 29.629-14.129v-7.793c-0.011719-2.9453 1.7734-5.6016 4.5-6.707 2.7148-1.1641 5.8633-0.53516 7.918 1.582l23.125 23.25c1.418 1.3477 2.2266 3.2109 2.25 5.168z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
