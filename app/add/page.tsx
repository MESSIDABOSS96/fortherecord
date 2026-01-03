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
    try {
      // Create record with ID and timestamp
      const newRecord: Record = {
        ...recordData,
        id: Date.now().toString(),
        created_at: new Date(),
      };

      // Save to database via API
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRecord),
      });

      if (!response.ok) {
        throw new Error('Failed to create record');
      }

      // Navigate back to home
      router.push('/');
    } catch (error) {
      console.error('Error creating record:', error);
      alert('Failed to create record. Please try again.');
    }
  };

  return (
    <div className="min-h-screen">
      <HeaderNav />

      {/* Cancel Button */}
      <button
        onClick={handleCancel}
        className="absolute top-14 right-4 px-3 py-1.5 sm:top-10 sm:right-10 sm:px-8 sm:py-3 bg-transparent border-2 border-gray-900 rounded-full font-semibold text-xs sm:text-sm hover:bg-gray-900 hover:text-white transition-colors z-40 shadow-md"
      >
        Cancel
      </button>

      <AddRecordFlow onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
