"use client";

import { useState, useEffect } from "react";

// Module-level flag that resets on full page reload but persists during client-side navigation
let hasAnimatedInThisPageLoad = false;

export default function AnimatedTitle() {
  const [shouldAnimate, setShouldAnimate] = useState<boolean | null>(null);
  const text = "For the Record";

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Skip animation for users who prefer reduced motion
      setShouldAnimate(false);
      return;
    }

    // Check if animation has already played during this page load
    // On full reload, this module reloads and the flag resets to false
    // On client-side navigation, the module stays loaded and the flag persists
    if (!hasAnimatedInThisPageLoad) {
      // Play animation and mark as played
      setShouldAnimate(true);
      hasAnimatedInThisPageLoad = true;
    } else {
      // Already animated during this page load (client-side navigation)
      setShouldAnimate(false);
    }
  }, []);

  // Don't render anything until we know whether to animate (prevents hydration flash)
  if (shouldAnimate === null) {
    return (
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 tracking-tight px-4 font-caveat" style={{ opacity: 0 }}>
        For the Record
      </h1>
    );
  }

  if (!shouldAnimate) {
    // No animation - show regular text
    return (
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 tracking-tight px-4 font-caveat">
        For the Record
      </h1>
    );
  }

  return (
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 tracking-tight px-4 font-caveat">
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="animate-write-in"
          style={{
            animationDelay: `${index * 0.05}s`,
            opacity: 0,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h1>
  );
}
