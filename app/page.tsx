"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Record } from "@/types/record";
import { seedRecords } from "@/data/seedRecords";
import { distributeNonLyricCards } from "@/utils/cardDistribution";
import { searchRecords, FilterType } from "@/utils/searchRecords";
import HeaderNav from "@/components/HeaderNav";
import MasonryGrid from "@/components/MasonryGrid";
import RecordModal from "@/components/RecordModal";

export default function Home() {
  const [records, setRecords] = useState<Record[]>([]);
  const [allRecords, setAllRecords] = useState<Record[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const router = useRouter();

  // Load records from localStorage on mount and distribute non-lyric cards
  useEffect(() => {
    // Load from localStorage and merge with seed data
    let allRecords = seedRecords;

    try {
      const storedRecords = localStorage.getItem('records');
      if (storedRecords) {
        const userRecords = JSON.parse(storedRecords);

        // Convert created_at strings back to Date objects
        const recordsWithDates = userRecords.map((r: any) => ({
          ...r,
          created_at: new Date(r.created_at)
        }));

        // MERGE: User records first, then seed records
        allRecords = [...recordsWithDates, ...seedRecords];
      }
    } catch (error) {
      // If localStorage is corrupted, clear it and use seed data
      console.error('Error parsing localStorage:', error);
      localStorage.removeItem('records');
    }

    // Save unfiltered records to state
    setAllRecords(allRecords);

    // Separate lyric and non-lyric cards
    const lyricCards = allRecords.filter((r: Record) => r.cardType === 'lyric' || !r.cardType);
    const nonLyricCards = allRecords.filter((r: Record) => r.cardType && r.cardType !== 'lyric');

    // Distribute non-lyric cards among lyric cards intelligently
    const distributed = distributeNonLyricCards(lyricCards, nonLyricCards, {
      targetRatio: 0.25,  // 25% non-lyric cards
      minSpacing: 3,      // Minimum 3 cards between same type
      columnCount: 4      // Desktop: 4 columns for even distribution
    });

    setRecords(distributed);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      // Filter records based on search query and active filter
      const filtered = searchRecords(allRecords, searchQuery, activeFilter);

      // Separate lyric and non-lyric cards
      const lyricCards = filtered.filter((r: Record) => r.cardType === 'lyric' || !r.cardType);
      const nonLyricCards = filtered.filter((r: Record) => r.cardType && r.cardType !== 'lyric');

      // Distribute non-lyric cards among lyric cards intelligently
      const distributed = distributeNonLyricCards(lyricCards, nonLyricCards, {
        targetRatio: 0.25,  // 25% non-lyric cards
        minSpacing: 3,      // Minimum 3 cards between same type
        columnCount: 4      // Desktop: 4 columns for even distribution
      });

      setRecords(distributed);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, activeFilter, allRecords]);

  // Handle reset to initial state
  const handleReset = () => {
    setSearchQuery('');
    setActiveFilter('all');
    setSelectedRecord(null);
  };

  return (
    <div className="min-h-screen">
      <HeaderNav onReset={handleReset} />

      <main className="max-w-7xl mx-auto px-6 pb-16">
        {/* Title and Search */}
        <div className="text-center mb-14">
          <h1 className="text-6xl font-bold mb-6 tracking-tight">FOR THE RECORD</h1>

          {/* Search bar */}
          <div className="max-w-xl mx-auto mb-4">
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
                placeholder="Search songs, lyrics, people, or stories…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Filter pills - only show when searching */}
          {searchQuery && (
            <div className="flex justify-center gap-2 mb-4">
              {(['all', 'songs', 'lyrics', 'stories', 'people'] as FilterType[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={
                    activeFilter === filter
                      ? "px-4 py-1.5 text-sm rounded-full bg-gray-900 text-white font-semibold cursor-pointer"
                      : "px-4 py-1.5 text-sm rounded-full border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
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

        {/* Add button (absolute position) */}
        <button
          onClick={() => router.push('/add')}
          className="absolute top-10 right-10 px-8 py-3 bg-transparent border-2 border-gray-900 rounded-full font-semibold text-sm hover:bg-gray-900 hover:text-white transition-colors z-40 shadow-md"
        >
          Add
        </button>

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
    </div>
  );
}
