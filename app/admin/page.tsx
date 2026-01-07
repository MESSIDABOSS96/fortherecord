"use client";

import { useState, useEffect } from 'react';
import { Record } from '@/types/record';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    try {
      const storedRecords = localStorage.getItem('records');
      if (storedRecords) {
        const userRecords = JSON.parse(storedRecords);
        const recordsWithDates = userRecords.map((r: any) => ({
          ...r,
          created_at: new Date(r.created_at)
        }));
        setRecords(recordsWithDates);
      }
    } catch (error) {
      console.error('Error loading records:', error);
    }
  };

  const deleteRecord = (index: number) => {
    const updatedRecords = records.filter((_, i) => i !== index);
    localStorage.setItem('records', JSON.stringify(updatedRecords));
    setRecords(updatedRecords);
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to delete ALL user records? This cannot be undone.')) {
      localStorage.removeItem('records');
      setRecords([]);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold font-caveat">Record Manager</h1>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-700"
          >
            Back to Home
          </button>
        </div>

        <div className="mb-4 flex gap-4">
          <button
            onClick={loadRecords}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Clear All Records
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Song</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Artist</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">For</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Created</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No user records found in localStorage
                  </td>
                </tr>
              ) : (
                records.map((record, index) => (
                  <tr key={`${record.id}-${index}`} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{index}</td>
                    <td className="px-4 py-3 text-sm font-medium">{record.song_title}</td>
                    <td className="px-4 py-3 text-sm">{record.artist}</td>
                    <td className="px-4 py-3 text-sm">{record.for_name}</td>
                    <td className="px-4 py-3 text-sm">
                      {record.created_at.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{record.id}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${record.song_title}" for ${record.for_name}?`)) {
                            deleteRecord(index);
                          }
                        }}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>Total records: {records.length}</p>
          <p className="mt-2">
            Note: This only shows user-created records stored in localStorage.
            Seed records are not shown here and cannot be deleted.
          </p>
        </div>
      </div>
    </div>
  );
}
