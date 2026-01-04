"use client";

import { useRouter } from 'next/navigation';
import AddRecordFlow from '@/components/AddRecordFlow';
import HeaderNav from '@/components/HeaderNav';
import { Record } from '@/types/record';
import { useState } from 'react';

export default function AddPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const handleCancel = () => {
    router.push('/');
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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
        leftAction={currentStep > 1 ? (
          <button
            onClick={handleBack}
            className="w-11 h-11 flex items-center justify-center text-gray-900 hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200 md:hidden"
            aria-label="Back"
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          // Empty spacer on step 1 to hide logo
          <div className="w-11 h-11 md:hidden" />
        )}
        rightAction={
          <button
            onClick={handleCancel}
            className="w-11 h-11 flex items-center justify-center text-gray-900 hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200"
            aria-label="Close"
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        }
      />

      <AddRecordFlow
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
      />
    </div>
  );
}
