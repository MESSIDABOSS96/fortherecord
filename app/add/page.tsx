"use client";

import { useRouter } from 'next/navigation';
import AddRecordFlow from '@/components/AddRecordFlow';
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
    <div className="min-h-screen bg-gray-50">
      {/* Cancel button - fixed top right */}
      <button
        onClick={handleCancel}
        className="fixed top-10 right-10 px-6 py-2.5 bg-white border-2 border-gray-300 rounded-full font-medium text-sm hover:border-gray-900 transition-colors z-50"
      >
        Cancel
      </button>

      <AddRecordFlow onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
