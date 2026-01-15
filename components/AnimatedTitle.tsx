"use client";

import { useState, useEffect } from "react";

const ANIMATION_KEY = "ftr_title_animated";

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

    // Check if already animated this session (persists across client-side nav, resets on reload)
    const hasAnimated = sessionStorage.getItem(ANIMATION_KEY) === "true";

    if (prefersReducedMotion || hasAnimated) {
      // Skip animation for users who prefer reduced motion or already animated this session
      setShouldAnimate(false);
      onAnimationStart?.();
      onAnimationComplete?.();
      return;
    }

    // Start animation and mark as played for this session
    setShouldAnimate(true);
    sessionStorage.setItem(ANIMATION_KEY, "true");
    onAnimationStart?.();

    // Letter stagger completes, then trigger completion quickly
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 400);

    return () => clearTimeout(timer);
  }, [fontLoaded, onAnimationStart, onAnimationComplete]);

  // Don't render anything until we know whether to animate (prevents hydration flash)
  if (shouldAnimate === null || !fontLoaded) {
    return (
      <>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 tracking-tight px-4" style={{ opacity: 0 }}>
          {text}
        </h1>
        <p className="text-sm sm:text-base mb-8 sm:mb-12 md:mb-[60px] px-4 font-light" style={{ color: 'var(--color-text-secondary)', opacity: 0 }}>
          {subheader}
        </p>
      </>
    );
  }

  if (!shouldAnimate) {
    // No animation - show regular text
    return (
      <>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 tracking-tight px-4">
          {text}
        </h1>
        <p className="text-sm sm:text-base mb-8 sm:mb-12 md:mb-[60px] px-4 font-light" style={{ color: 'var(--color-text-secondary)' }}>
          {subheader}
        </p>
      </>
    );
  }

  // Letter stagger animation
  return (
    <>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 tracking-tight px-4">
        {text.split('').map((char, index) => (
          <span
            key={index}
            className="animate-write-in"
            style={{
              animationDelay: `${index * 40}ms`
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>
      <p
        className="text-sm sm:text-base mb-8 sm:mb-12 md:mb-[60px] px-4 font-light transition-opacity duration-400"
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
