"use client";

import { useRouter } from 'next/navigation';
import AddRecordFlow from '@/components/AddRecordFlow';
import HeaderNav from '@/components/HeaderNav';
import { Record } from '@/types/record';

export default function AddPage() {
  const router = useRouter();

  const handleCancel = () => {
    router.push('/');
  };

  const handleSubmit = async (recordData: Omit<Record, 'id' | 'created_at'>) => {
    // Create record with ID and timestamp
    const newRecord: Record = {
      ...recordData,
      id: Date.now().toString(),
      created_at: new Date(),
    };

    // Store in localStorage temporarily
    const existingRecords = localStorage.getItem('records');
    const records = existingRecords ? JSON.parse(existingRecords) : [];
    localStorage.setItem('records', JSON.stringify([newRecord, ...records]));

    // Navigate back to home
    router.push('/');
  };

  return (
    <div className="min-h-screen">
      <HeaderNav />

      {/* Cancel Button */}
      <button
        onClick={handleCancel}
        className="absolute top-10 right-10 px-8 py-3 bg-transparent border-2 border-gray-900 rounded-full font-semibold text-sm hover:bg-gray-900 hover:text-white transition-colors z-40 shadow-md"
      >
        Cancel
      </button>

      <AddRecordFlow onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
