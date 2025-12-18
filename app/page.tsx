"use client";

import { useState } from "react";
import { Record } from "@/types/record";
import { seedRecords } from "@/data/seedRecords";
import HeaderNav from "@/components/HeaderNav";
import MasonryGrid from "@/components/MasonryGrid";
import RecordModal from "@/components/RecordModal";
import AddRecordModal from "@/components/AddRecordModal";

export default function Home() {
  const [records, setRecords] = useState<Record[]>(seedRecords);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddRecord = (newRecordData: Omit<Record, "id" | "created_at">) => {
    const newRecord: Record = {
      ...newRecordData,
      id: Date.now().toString(),
      created_at: new Date(),
    };
    setRecords([newRecord, ...records]);
  };

  return (
    <div className="min-h-screen">
      <HeaderNav />

      <main className="max-w-7xl mx-auto px-6 pb-16">
        {/* Title and Search */}
        <div className="text-center mb-14">
          <h1 className="text-6xl font-bold mb-8 tracking-tight">FOR THE RECORD</h1>

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
                placeholder="Search for a person, a story, a lyric, or a song"
                className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm placeholder:text-gray-500"
                disabled
              />
            </div>
          </div>

          {/* Record count */}
          <p className="text-sm text-gray-600">{records.length} Records Archived</p>
        </div>

        {/* Add button (fixed position) */}
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed top-10 right-10 px-8 py-3 bg-white border-2 border-gray-900 rounded-full font-semibold text-sm hover:bg-gray-900 hover:text-white transition-colors z-40 shadow-md"
        >
          Add
        </button>

        {/* Masonry Grid */}
        <MasonryGrid records={records} onCardClick={setSelectedRecord} />
      </main>

      {/* Modals */}
      {selectedRecord && (
        <RecordModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      {showAddModal && (
        <AddRecordModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddRecord}
        />
      )}
    </div>
  );
}
