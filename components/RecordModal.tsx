"use client";

import { Record } from "@/types/record";
import { cleanSongTitle } from "@/utils/cleanSongTitle";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";

interface RecordModalProps {
  record: Record;
  onClose: () => void;
}

export default function RecordModal({ record, onClose }: RecordModalProps) {
  // Animation state
  const [isAnimatingIn, setIsAnimatingIn] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Lock scroll when modal is open (handles iOS properly)
  useScrollLock(true);

  // Copy link to clipboard
  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/card/${record.id}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setShowShareMenu(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Still show toast even if copy failed in some edge cases
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }
  };

  // Share functionality - link only, OG image provides preview
  const handleShare = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    const shareUrl = `${window.location.origin}/card/${record.id}`;
    const shareText = `${cleanSongTitle(record.song_title)} by ${record.artist} — For ${record.for_name}`;

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // On mobile, use Web Share API with link only
    if (isMobile) {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        try {
          await navigator.share({
            title: shareText,
            text: shareText,
            url: shareUrl,
          });
          return;
        } catch (err: any) {
          if (err?.name === 'AbortError' || err?.message?.includes('cancel')) {
            return;
          }
          console.error('Web Share API error:', err);
          // On iOS, don't show fallback
          if (isIOS) return;
        }
      }

      // Mobile fallback: copy to clipboard
      await handleCopyLink();
    } else {
      // On desktop, copy link directly and show toast
      await handleCopyLink();
    }
  };

  // Update URL when modal opens - use new route format
  useEffect(() => {
    const newUrl = `/card/${record.id}`;
    window.history.pushState({}, '', newUrl);

    // Clean up URL when modal closes - return to home
    return () => {
      window.history.replaceState({}, '', '/');
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

  // Detect mobile viewport and reduced motion preference
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Clear initial animation after it completes
  useEffect(() => {
    if (!prefersReducedMotion && isAnimatingIn) {
      const timer = setTimeout(() => setIsAnimatingIn(false), 700);
      return () => clearTimeout(timer);
    } else if (prefersReducedMotion) {
      setIsAnimatingIn(false);
    }
  }, [prefersReducedMotion, isAnimatingIn]);

  const formattedDate = record.created_at.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 blur-background ${!prefersReducedMotion ? 'animate-backdrop-fade' : ''}`}
      onClick={onClose}
    >
      {/* Card container with flip-in animation */}
      <div
        className={`relative max-w-4xl w-full ${!prefersReducedMotion && isAnimatingIn ? 'animate-flip-in' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col p-6 sm:p-8"
          style={{
            backgroundColor: record.background_color,
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {/* Close button - smaller and black */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-70"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Content box */}
          <div className="flex flex-col md:flex-row relative">
            {/* Left panel: Song info + Lyrics */}
            <div className="md:w-1/2 md:pr-8 flex flex-col mb-6 md:mb-0">
              {/* Album art + Song info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-black/20 rounded-sm flex-shrink-0 overflow-hidden">
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
                  <div className="font-bold text-lg sm:text-xl text-gray-900">
                    {cleanSongTitle(record.song_title)}
                  </div>
                  <div className="text-gray-700 text-sm sm:text-base">{record.artist}</div>
                </div>
              </div>

              {/* Lyric excerpt */}
              <div className="text-gray-900 font-bold text-xl sm:text-2xl leading-snug whitespace-pre-wrap">
                {record.lyric_excerpt}
              </div>
            </div>

            {/* Vertical divider - desktop only */}
            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4/5 w-px bg-black/20"></div>

            {/* Right panel: Reflection */}
            <div className="md:w-1/2 md:pl-8 flex flex-col border-t md:border-t-0 border-black/10 pt-6 md:pt-0">
              <div className="text-sm sm:text-base font-bold text-gray-900 mb-6 text-center">
                For {record.for_name}
              </div>
              <div className="text-gray-900 leading-relaxed text-sm sm:text-base text-center">
                {record.reflection_text}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center justify-center mt-6">
            <div className="text-xs sm:text-sm tracking-wide text-gray-900/70">
              Posted on {formattedDate}
            </div>
            <div className="font-bold text-gray-900 text-sm sm:text-base mt-1">
              fortherecord.fm
            </div>
          </div>

          {/* Share button - aligned with X button horizontally, footer text vertically */}
          <button
            onClick={handleShare}
            className="absolute bottom-3 sm:bottom-5 right-3 sm:right-4 w-10 h-10 flex items-center justify-center rounded-full transition-opacity hover:opacity-70"
            aria-label="Share"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 100 115"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="m89.75 46.293c-0.023438 1.9531-0.83203 3.8164-2.25 5.1641l-23.293 23.25c-2.0547 2.1172-5.2031 2.7461-7.9141 1.5859-2.7305-1.1094-4.5117-3.7656-4.5-6.7109v-7.582c-12.91 0.84766-24.535 8.1055-30.961 19.332-0.96484 1.8203-2.8555 2.957-4.9141 2.9609-0.49219-0.011719-0.98438-0.082031-1.4609-0.21094-2.4531-0.62891-4.168-2.8398-4.1641-5.375v-3.25c0.003906-11.336 4.3047-22.246 12.035-30.535 7.7344-8.2891 18.32-13.34 29.629-14.129v-7.793c-0.011719-2.9453 1.7734-5.6016 4.5-6.707 2.7148-1.1641 5.8633-0.53516 7.918 1.582l23.125 23.25c1.418 1.3477 2.2266 3.2109 2.25 5.168z" fill="black"/>
            </svg>
          </button>
        </div>
      </div>

      {/* iOS-styled toast notification */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        style={{
          opacity: showToast ? 1 : 0,
          transform: `translate(-50%, -50%) scale(${showToast ? 1 : 0.9})`,
          transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
        }}
      >
        <div
          className="rounded-2xl px-6 py-3 shadow-2xl"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <p className="text-white text-sm font-medium">Link copied to clipboard</p>
        </div>
      </div>

      {/* Desktop share menu */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowShareMenu(false)}
        >
          <div
            className="rounded-2xl p-2 shadow-2xl min-w-[200px]"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCopyLink}
              className="w-full text-left px-6 py-3 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
