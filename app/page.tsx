"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Record } from "@/types/record";
import { searchRecords, FilterType } from "@/utils/searchRecords";
import HeaderNav from "@/components/HeaderNav";
import MasonryGrid from "@/components/MasonryGrid";
import RecordModal from "@/components/RecordModal";
import TapHint from "@/components/TapHint";

export default function Home() {
  const [records, setRecords] = useState<Record[]>([]);
  const [allRecords, setAllRecords] = useState<Record[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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
          <MasonryGrid records={records} onCardClick={setSelectedRecord} />
        )}
      </main>

      {/* Modals */}
      {selectedRecord && (
        <RecordModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
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
