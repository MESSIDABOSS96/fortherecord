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
      <HeaderNav
        hideMenu={true}
        rightAction={
          <button
            onClick={handleCancel}
            className="w-8 h-8 flex items-center justify-center bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        }
      />

      <AddRecordFlow onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
