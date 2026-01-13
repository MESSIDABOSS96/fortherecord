"use client";

import { Record } from "@/types/record";
import { cleanSongTitle } from "@/utils/cleanSongTitle";
import { useEffect, useState } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useRouter } from "next/navigation";

interface RecordModalProps {
  record: Record;
  onClose: () => void;
}

export default function RecordModal({ record, onClose }: RecordModalProps) {
  const router = useRouter();

  // Animation state
  const [isAnimating, setIsAnimating] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Lock scroll when modal is open (handles iOS properly)
  useScrollLock(true);

  // Share functionality - includes text/title for proper link preview
  const handleShare = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    const shareUrl = `${window.location.origin}/card/${record.id}`;
    const shareText = `${cleanSongTitle(record.song_title)} by ${record.artist} — For ${record.for_name}`;
    
    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // On iOS, always use Web Share API if available - never show prompt
    if (isIOS && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: shareText,
          text: shareText,
          url: shareUrl,
        });
        return; // Successfully shared, exit early
      } catch (err: any) {
        // User cancelled - don't show any fallback on iOS
        if (err?.name === 'AbortError' || err?.message?.includes('cancel')) {
          return;
        }
        // For other errors on iOS, silently fail (don't show prompt)
        console.error('Web Share API error on iOS:', err);
        return;
      }
    }
    
    // For non-iOS or if Web Share API not available, try Web Share API first
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
    
    // Fallback: copy to clipboard (non-iOS only)
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        return;
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
    
    // Final fallback: show URL in prompt (non-iOS only)
    if (!isIOS) {
      prompt('Copy this link:', shareUrl);
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

  // Trigger flip animation on mobile
  useEffect(() => {
    if (isMobile && !prefersReducedMotion) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isMobile, prefersReducedMotion]);

  const formattedDate = record.created_at.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 blur-background ${isMobile && !prefersReducedMotion ? 'animate-backdrop-fade' : ''}`}
      onClick={onClose}
    >
      <div
        className={`relative max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl w-full rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col p-6 sm:p-8 md:p-10 max-h-[90vh] overflow-y-auto ${isMobile && !prefersReducedMotion && isAnimating ? 'animate-flip-in' : ''}`}
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

        {/* Main content - centered story */}
        <div className="flex flex-col items-center justify-center min-h-[40vh] py-6 sm:py-8">
          <div className="text-sm sm:text-base font-medium italic text-gray-800 uppercase tracking-wide mb-6 sm:mb-8 text-center">
            FOR {record.for_name.toUpperCase()}
          </div>

          <div className="text-base sm:text-lg md:text-xl text-gray-900 leading-relaxed text-center max-w-2xl px-4">
            {record.reflection_text}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-10 relative">
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
              style={{ color: '#ffffff' }}
            >
              <path d="m89.75 46.293c-0.023438 1.9531-0.83203 3.8164-2.25 5.1641l-23.293 23.25c-2.0547 2.1172-5.2031 2.7461-7.9141 1.5859-2.7305-1.1094-4.5117-3.7656-4.5-6.7109v-7.582c-12.91 0.84766-24.535 8.1055-30.961 19.332-0.96484 1.8203-2.8555 2.957-4.9141 2.9609-0.49219-0.011719-0.98438-0.082031-1.4609-0.21094-2.4531-0.62891-4.168-2.8398-4.1641-5.375v-3.25c0.003906-11.336 4.3047-22.246 12.035-30.535 7.7344-8.2891 18.32-13.34 29.629-14.129v-7.793c-0.011719-2.9453 1.7734-5.6016 4.5-6.707 2.7148-1.1641 5.8633-0.53516 7.918 1.582l23.125 23.25c1.418 1.3477 2.2266 3.2109 2.25 5.168z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
