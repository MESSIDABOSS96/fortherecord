"use client";

import { useEffect, useState } from "react";

const HINT_DISMISSED_KEY = "ftr_tap_hint_dismissed";

interface TapHintProps {
  onCardOpened?: boolean;
  isMenuOpen?: boolean;
  isSearching?: boolean;
  isOnHomePage?: boolean;
}

export default function TapHint({ onCardOpened, isMenuOpen, isSearching, isOnHomePage }: TapHintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isPermanentlyDismissed, setIsPermanentlyDismissed] = useState(false);

  useEffect(() => {
    // Check if hint was previously dismissed
    const wasDismissed = localStorage.getItem(HINT_DISMISSED_KEY);

    if (!wasDismissed) {
      // Show hint after 800ms delay
      setShouldRender(true);
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    } else {
      setIsPermanentlyDismissed(true);
    }
  }, []);

  // Show/hide based on user context (menu, search, page)
  useEffect(() => {
    // Don't show if permanently dismissed
    if (isPermanentlyDismissed || !shouldRender) return;

    // Hide if: menu is open, user is searching, or not on home page
    const shouldHide = isMenuOpen || isSearching || !isOnHomePage;

    setIsVisible(!shouldHide);
  }, [isMenuOpen, isSearching, isOnHomePage, isPermanentlyDismissed, shouldRender]);

  // Permanently dismiss when card is opened
  useEffect(() => {
    if (onCardOpened && isVisible) {
      setIsVisible(false);
      setIsPermanentlyDismissed(true);
      localStorage.setItem(HINT_DISMISSED_KEY, "true");
      // Remove from DOM after fade-out animation
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [onCardOpened, isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(HINT_DISMISSED_KEY, "true");
    // Remove from DOM after fade-out animation
    setTimeout(() => setShouldRender(false), 300);
  };

  if (!shouldRender) return null;

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 md:hidden transition-opacity duration-300"
      style={{
        bottom: "calc(5.5rem + var(--safe-area-inset-bottom))",
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div
        className="bg-gray-900 text-white rounded-full shadow-lg px-4 py-2.5 flex items-center gap-2.5 animate-slide-up"
        role="status"
        aria-live="polite"
      >
        {/* Simple tap/push icon */}
        <div className="flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {/* Outer ripple circles (tap effect) */}
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" opacity="0.3" />
            <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1.5" opacity="0.5" />
            {/* Center dot (tap point) */}
            <circle cx="12" cy="12" r="3" fill="white" />
            {/* Directional arrow pointing inward */}
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          </svg>
        </div>

        {/* Message */}
        <div className="text-sm font-medium whitespace-nowrap">
          Tap any card to read its story
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          aria-label="Dismiss hint"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M2 2L14 14M14 2L2 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
