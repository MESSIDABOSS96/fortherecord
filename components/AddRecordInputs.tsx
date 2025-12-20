"use client";

interface AddRecordInputsProps {
  forName: string; // Keep for potential display, but don't show input
  reflectionText: string;
  onForNameChange: (value: string) => void; // Keep for interface compatibility
  onReflectionChange: (value: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

export default function AddRecordInputs({
  forName,
  reflectionText,
  onForNameChange,
  onReflectionChange,
  onSubmit,
  canSubmit,
}: AddRecordInputsProps) {
  return (
    <div className="space-y-6">
      {/* Reflection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Your reflection *
        </label>
        <textarea
          value={reflectionText}
          onChange={(e) => onReflectionChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-48"
          placeholder="Why does this song/lyric remind you of them? Tell their story..."
        />
        <p className="text-xs text-gray-500 mt-1">
          {reflectionText.length} characters
        </p>
      </div>

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
      >
        Publish Record
      </button>
    </div>
  );
}
