"use client";

import { useState, useEffect } from "react";

interface AnimatedTitleProps {
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
  showContent?: boolean;
}

export default function AnimatedTitle({ onAnimationStart, onAnimationComplete, showContent = false }: AnimatedTitleProps) {
  const [isReady, setIsReady] = useState(false);
  const text = "For the Record";
  const subheader = "An archive of lyrics that bring someone to mind";

  useEffect(() => {
    setIsReady(true);
    onAnimationStart?.();

    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 400);

    return () => clearTimeout(timer);
  }, [onAnimationStart, onAnimationComplete]);

  if (!isReady) {
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
