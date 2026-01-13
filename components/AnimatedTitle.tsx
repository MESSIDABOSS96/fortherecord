"use client";

import { useState, useEffect } from "react";

// Module-level flag that resets on full page reload but persists during client-side navigation
let hasAnimatedInThisPageLoad = false;

interface AnimatedTitleProps {
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
  showContent?: boolean;
}

export default function AnimatedTitle({ onAnimationStart, onAnimationComplete, showContent = false }: AnimatedTitleProps) {
  const [shouldAnimate, setShouldAnimate] = useState<boolean | null>(null);
  const [fontLoaded, setFontLoaded] = useState(false);
  const text = "For the Record";
  const subheader = "An archive of lyrics that bring someone to mind";

  // Wait for fonts to load before animating (fixes mobile rendering issues)
  useEffect(() => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setFontLoaded(true);
      });
    } else {
      // Fallback if Font Loading API is not supported
      setFontLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!fontLoaded) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || hasAnimatedInThisPageLoad) {
      // Skip animation for users who prefer reduced motion or already animated
      setShouldAnimate(false);
      onAnimationStart?.();
      onAnimationComplete?.();
      return;
    }

    // Start animation and mark as played
    setShouldAnimate(true);
    hasAnimatedInThisPageLoad = true;
    onAnimationStart?.();

    // Title fades in over 0.5s, then trigger completion
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 500);

    return () => clearTimeout(timer);
  }, [fontLoaded, onAnimationStart, onAnimationComplete]);

  // Don't render anything until we know whether to animate (prevents hydration flash)
  if (shouldAnimate === null || !fontLoaded) {
    return (
      <>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 tracking-tight px-4 font-caveat" style={{ opacity: 0 }}>
          {text}
        </h1>
        <p className="text-sm sm:text-base mb-8 sm:mb-12 md:mb-[60px] px-4 font-merriweather" style={{ color: 'var(--color-text-secondary)', opacity: 0 }}>
          {subheader}
        </p>
      </>
    );
  }

  if (!shouldAnimate) {
    // No animation - show regular text
    return (
      <>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 tracking-tight px-4 font-caveat">
          {text}
        </h1>
        <p className="text-sm sm:text-base mb-8 sm:mb-12 md:mb-[60px] px-4 font-merriweather" style={{ color: 'var(--color-text-secondary)' }}>
          {subheader}
        </p>
      </>
    );
  }

  // Simple, quick fade-in animation
  return (
    <>
      <h1
        className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 tracking-tight px-4 font-caveat animate-fade-in"
        style={{
          animationDelay: '0s',
          animationDuration: '0.5s',
          opacity: 0
        }}
      >
        {text}
      </h1>
      <p
        className="text-sm sm:text-base mb-8 sm:mb-12 md:mb-[60px] px-4 font-merriweather transition-opacity duration-400"
        style={{
          color: 'var(--color-text-secondary)',
          opacity: showContent ? 1 : 0
        }}
      >
        {subheader}
      </p>
    </>
  );
}
