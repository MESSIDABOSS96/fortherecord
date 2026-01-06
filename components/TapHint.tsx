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
        {/* Hand tap icon */}
        <div className="flex-shrink-0">
          <svg width="19" height="25" viewBox="0 0 19 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <g clipPath="url(#clip0_752_107)">
              <path d="M4.88972 0C2.18751 0 0 2.18749 0 4.87725C0 6.04356 0.402569 7.11861 1.08752 7.95923C1.24299 8.16032 1.44407 8.2391 1.6327 8.2391C2.11766 8.2391 2.51772 7.67535 2.11766 7.18002C1.58817 6.5633 1.28087 5.75965 1.28087 4.87725C1.28087 2.89214 2.88392 1.28297 4.88972 1.28297C6.87273 1.28297 8.4819 2.89425 8.4819 4.87725C8.4819 4.93956 8.4819 4.99553 8.4819 5.09502C8.4819 5.52614 8.79281 5.72511 9.09128 5.72511C9.40853 5.72511 9.72347 5.50733 9.74418 5.16537C9.75453 5.08869 9.75453 5.00991 9.75453 4.87725C9.75453 2.18749 7.57738 0 4.88972 0Z" fill="white" fillOpacity="0.85"/>
              <path d="M14.3742 21.0378C18.3588 19.5885 19.6835 16.2862 18.132 12.0223L17.4865 10.2644C16.9051 8.64676 15.7733 7.94283 14.901 8.2668C14.7016 8.34158 14.6268 8.47864 14.7016 8.66555L14.9863 9.44697C15.1128 9.81809 14.9988 10.0733 14.7685 10.1521C14.5301 10.2329 14.2791 10.1271 14.1423 9.75389L13.9573 9.23625C13.6187 8.28921 12.7838 7.89046 11.9614 8.18953C11.5876 8.3266 11.4775 8.53844 11.5897 8.86031L11.9741 9.91586C12.1109 10.2891 11.9865 10.5318 11.7688 10.6231C11.5303 10.704 11.2773 10.596 11.1425 10.2249L10.7913 9.2441C10.3946 8.17455 9.59714 7.90041 8.79964 8.18703C8.45073 8.31162 8.324 8.54839 8.42582 8.8578L9.18612 10.9352C9.32089 11.3084 9.19648 11.5511 8.9787 11.632C8.74023 11.7211 8.4872 11.605 8.35245 11.2421L5.82136 4.28011C5.57214 3.59477 4.96386 3.31448 4.39066 3.52632C3.77817 3.7464 3.51227 4.34855 3.76149 5.02144L7.46691 15.2181C7.56027 15.4775 7.45024 15.6581 7.29035 15.7204C7.13679 15.7785 6.97904 15.7246 6.77774 15.5109L4.26928 12.8241C3.89333 12.4233 3.50705 12.332 3.09814 12.4856C2.47299 12.712 2.21996 13.2892 2.41721 13.8147C2.48987 14.0181 2.59992 14.1779 2.70382 14.3089L5.79664 18.1996C8.41355 21.4704 11.4448 22.1111 14.3742 21.0378Z" fill="white" fillOpacity="0.85"/>
            </g>
            <defs>
              <clipPath id="clip0_752_107">
                <rect width="18.7639" height="24.8284" fill="white"/>
              </clipPath>
            </defs>
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
