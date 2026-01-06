"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Record } from "@/types/record";
import { searchRecords, FilterType } from "@/utils/searchRecords";
import { cleanSongTitle } from "@/utils/cleanSongTitle";
import HeaderNav from "@/components/HeaderNav";
import MasonryGrid from "@/components/MasonryGrid";
import RecordModal from "@/components/RecordModal";
import TapHint from "@/components/TapHint";
import CardMetaTags from "@/components/CardMetaTags";

export default function Home() {
  const [records, setRecords] = useState<Record[]>([]);
  const [allRecords, setAllRecords] = useState<Record[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shouldScrollToCard, setShouldScrollToCard] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Share function that can be called directly - includes text/title for proper link preview
  const handleShareRecord = async (record: Record) => {
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

  // Check URL for card ID on mount and when records load
  // Support both old query param format (?card=id) and new route format (/card/id)
  useEffect(() => {
    if (allRecords.length > 0) {
      let cardId: string | null = null;
      
      // Check for new route format first (/card/id)
      const pathMatch = window.location.pathname.match(/^\/card\/([^/]+)$/);
      if (pathMatch) {
        cardId = pathMatch[1];
      } else {
        // Fall back to query param format (?card=id)
        const urlParams = new URLSearchParams(window.location.search);
        cardId = urlParams.get('card');
      }
      
      if (cardId) {
        const record = allRecords.find(r => r.id === cardId);
        if (record) {
          setSelectedRecord(record);
          setShouldScrollToCard(true); // Mark that we should scroll when modal opens
        }
      }
    }
  }, [allRecords]);

  // Scroll to card when it's opened from URL or when modal closes
  useEffect(() => {
    if (selectedRecord && shouldScrollToCard) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const cardElement = document.querySelector(`[data-card-id="${selectedRecord.id}"]`);
        if (cardElement) {
          cardElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
        setShouldScrollToCard(false); // Reset flag
      }, 100);
    }
  }, [selectedRecord, shouldScrollToCard]);

  // Scroll to card when modal closes
  const handleCloseModal = () => {
    if (selectedRecord) {
      // Small delay to ensure modal is closed
      setTimeout(() => {
        const cardElement = document.querySelector(`[data-card-id="${selectedRecord.id}"]`);
        if (cardElement) {
          cardElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 100);
    }
    setSelectedRecord(null);
  };

  // Fetch records function
  const fetchRecords = useCallback(async () => {
    try {
      const response = await fetch('/api/records');
      if (!response.ok) {
        throw new Error('Failed to fetch records');
      }

      const data = await response.json();

      // Convert created_at strings back to Date objects
      // Only keep lyric cards (filter out any non-lyric cards that might remain)
      const recordsWithDates = data
        .filter((r: any) => r.card_type === 'lyric' || !r.card_type)
        .map((r: any) => ({
          ...r,
          cardType: r.card_type || r.cardType,
          created_at: new Date(r.created_at)
        }));

      // Save unfiltered records to state
      setAllRecords(recordsWithDates);
      setRecords(recordsWithDates);
    } catch (error) {
      console.error('Error fetching records:', error);
      // Set empty state on error
      setAllRecords([]);
      setRecords([]);
    }
  }, []);

  // Load records from API on mount
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Refetch records when window regains focus (user returns from /add page)
  useEffect(() => {
    const handleFocus = () => {
      fetchRecords();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchRecords]);

  // Memoized filtered records with debouncing
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredRecords = useMemo(() => {
    return searchRecords(allRecords, debouncedQuery, activeFilter);
  }, [allRecords, debouncedQuery, activeFilter]);

  useEffect(() => {
    setRecords(filteredRecords);
  }, [filteredRecords]);

  // Handle reset to initial state (memoized)
  const handleReset = useCallback(() => {
    setSearchQuery('');
    setActiveFilter('all');
    setSelectedRecord(null);
  }, []);

  return (
    <div className="min-h-screen">
      <CardMetaTags record={selectedRecord} />
      <HeaderNav onReset={handleReset} onMenuToggle={setIsMenuOpen} />

      <main className="max-w-7xl mx-auto px-6 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-16 pb-for-fab">
        {/* Title and Search */}
        <div className="text-center mb-10 sm:mb-12 md:mb-14">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 tracking-tight px-4">For the Record</h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 md:mb-[60px] px-4">An archive of lyrics that bring someone to mind</p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto mb-4 px-4">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search by person, song, lyric, or story"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-[#f5f3f0] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-[16px] placeholder:text-sm sm:placeholder:text-base placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Filter pills - only show when searching */}
          {searchQuery && (
            <div className="flex flex-wrap justify-center gap-2 mb-4 px-4">
              {(['all', 'songs', 'lyrics', 'stories', 'people'] as FilterType[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={
                    activeFilter === filter
                      ? "px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-full bg-gray-900 text-white font-semibold cursor-pointer"
                      : "px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-full border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  }
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Record count */}
          <p className="text-sm text-gray-600">
            {searchQuery
              ? `${records.length} record${records.length !== 1 ? 's' : ''} found`
              : `${allRecords.length} Records Archived`
            }
          </p>
        </div>

        {/* Masonry Grid with empty state */}
        {searchQuery && records.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-2">No records found for &quot;{searchQuery}&quot;</p>
            <p className="text-sm text-gray-400">Try different keywords or change your filter</p>
          </div>
        ) : (
          <MasonryGrid 
            records={records} 
            onCardClick={(record) => {
              setShouldScrollToCard(false); // Don't scroll on normal clicks
              setSelectedRecord(record);
            }}
            onCardLongPress={(record) => {
              handleShareRecord(record);
            }}
          />
        )}
      </main>

      {/* Modals */}
      {selectedRecord && (
        <RecordModal
          record={selectedRecord}
          onClose={handleCloseModal}
        />
      )}

      {/* First-time tap hint - mobile only */}
      <TapHint
        onCardOpened={!!selectedRecord}
        isMenuOpen={isMenuOpen}
        isSearching={!!searchQuery.trim()}
        isOnHomePage={pathname === '/'}
      />
    </div>
  );
}
