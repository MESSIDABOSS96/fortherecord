"use client";

import { Record } from "@/types/record";
import { calculateCardSize, CARD_SIZE_CONFIG } from "@/utils/cardSizing";
import { cleanSongTitle } from "@/utils/cleanSongTitle";
import Image from "next/image";
import { useRef, useState } from "react";

interface RecordCardProps {
  record: Record;
  onClick: () => void;
  onLongPress?: () => void;
}

// Main lyric card component
export default function RecordCard({ record, onClick, onLongPress }: RecordCardProps) {
  const cardSize = calculateCardSize(record.lyric_excerpt);
  const sizeConfig = CARD_SIZE_CONFIG[cardSize];
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCopying, setIsCopying] = useState(false);

  // Prefetch image on hover/touch to speed up modal opening
  const prefetchImage = () => {
    if (record.album_art_url) {
      // Check if already prefetched
      const existingLink = document.querySelector(`link[href="${record.album_art_url}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'image';
        link.href = record.album_art_url;
        document.head.appendChild(link);
      }
    }
  };

  const handleMouseEnter = prefetchImage;
  const handleTouchStart = () => {
    prefetchImage();
  };

  // Long press handler
  const handleTouchStartLongPress = (e: React.TouchEvent) => {
    prefetchImage();
    isLongPress.current = false;

    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (onLongPress) {
        onLongPress();
      }
    }, 500); // 500ms for long press
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click if it was a long press
    if (isLongPress.current) {
      e.preventDefault();
      e.stopPropagation();
      isLongPress.current = false;
      return;
    }
    onClick();
  };

  const handleContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cardRef.current || isCopying) return;

    // Check if clipboard API is available
    if (!navigator.clipboard || !window.ClipboardItem) {
      console.warn('Clipboard API not supported. Image copying is not available.');
      return;
    }

    setIsCopying(true);

    try {
      // Dynamically import html2canvas only on client side
      const html2canvas = (await import('html2canvas')).default;
      
      // Convert card to canvas with optimized settings
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: record.background_color || null, // Use card background
        scale: 2, // Higher quality for better image
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
        windowWidth: cardRef.current.scrollWidth,
        windowHeight: cardRef.current.scrollHeight,
      });

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('Failed to create image blob');
          setIsCopying(false);
          return;
        }

        try {
          // Copy to clipboard
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);

          // Show visual feedback
          const originalTitle = cardRef.current?.getAttribute('title');
          if (cardRef.current) {
            cardRef.current.setAttribute('title', 'Copied to clipboard!');
            setTimeout(() => {
              if (cardRef.current) {
                cardRef.current.setAttribute('title', originalTitle || 'Right-click to copy as image');
              }
            }, 2000);
          }
        } catch (err) {
          console.error('Failed to copy to clipboard:', err);
          // Fallback: download the image
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${cleanSongTitle(record.song_title)}-${record.for_name}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          // Show feedback for download
          const originalTitle = cardRef.current?.getAttribute('title');
          if (cardRef.current) {
            cardRef.current.setAttribute('title', 'Image downloaded!');
            setTimeout(() => {
              if (cardRef.current) {
                cardRef.current.setAttribute('title', originalTitle || 'Right-click to copy as image');
              }
            }, 2000);
          }
        } finally {
          setIsCopying(false);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Failed to generate card image:', error);
      setIsCopying(false);
    }
  };

  return (
    <div
      ref={cardRef}
      data-card-id={record.id}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStartLongPress} // Long press detection + prefetch
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchCancel={handleTouchEnd}
      onMouseEnter={handleMouseEnter} // Prefetch image on hover
      role="button"
      aria-label={`Read story about ${record.for_name} - ${cleanSongTitle(record.song_title)}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group cursor-pointer rounded-[16px] sm:rounded-[20px] p-4 sm:p-5 md:p-6 transition-all hover:scale-[1.01] hover:shadow-lg active:scale-[0.98] active:shadow-sm md:active:scale-100 md:active:shadow-lg flex flex-col relative select-none"
      style={{
        backgroundColor: record.background_color,
        boxShadow: "var(--shadow-md)",
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
      title={isCopying ? "Copying..." : "Right-click to copy as image"}
    >
      {/* Darkening overlay on press - mobile only */}
      <div className="absolute inset-0 bg-black/5 rounded-[16px] sm:rounded-[20px] opacity-0 group-active:opacity-100 md:group-active:opacity-0 transition-opacity pointer-events-none -z-10" />

      {/* Header: Album art + Song info */}
      <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 flex-shrink-0">
        <div className="w-[40px] h-[40px] sm:w-[46px] sm:h-[46px] bg-black/20 rounded-sm flex-shrink-0 overflow-hidden">
          {record.album_art_url ? (
            <Image
              src={record.album_art_url}
              alt={record.song_title}
              width={46}
              height={46}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="3" fill="white" />
              </svg>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 select-none" style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
          <div className="font-bold text-[14px] text-gray-900 truncate leading-tight">
            {cleanSongTitle(record.song_title)}
          </div>
          <div className="text-[12px] text-gray-700 truncate leading-tight mt-1">
            {record.artist}
          </div>
        </div>
      </div>

      {/* Lyric excerpt - full display, no truncation */}
      <div 
        className="text-gray-900 font-bold text-lg sm:text-[20px] leading-[1.35] mb-4 sm:mb-5 flex-1 whitespace-pre-line select-none"
        style={{
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
      >
        {record.lyric_excerpt}
      </div>

      {/* For label */}
      <div 
        className="text-[10px] sm:text-[11px] font-medium italic text-gray-900/70 uppercase tracking-wide flex-shrink-0 select-none"
        style={{
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
      >
        FOR {record.for_name.toUpperCase()}
      </div>
    </div>
  );
}
