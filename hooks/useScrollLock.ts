import { useEffect } from 'react';

/**
 * Hook to lock body scroll when a modal/overlay is open
 * Handles iOS Safari quirks by using position:fixed technique
 *
 * @param isLocked - Whether scroll should be locked
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    // Save current scroll position
    const scrollY = window.scrollY;
    const body = document.body;

    // Store original styles to restore later
    const originalStyles = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    // Lock scroll using position:fixed technique (works better on iOS)
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    // Cleanup: restore scroll position and styles
    return () => {
      // Restore original styles
      body.style.position = originalStyles.position;
      body.style.top = originalStyles.top;
      body.style.width = originalStyles.width;
      body.style.overflow = originalStyles.overflow;

      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}
