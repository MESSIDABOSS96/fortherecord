"use client";

import { Record } from "@/types/record";
import { useState, useEffect } from "react";

interface AddRecordModalProps {
  onClose: () => void;
  onSubmit: (record: Omit<Record, "id" | "created_at">) => void;
}

const CARD_COLORS = [
  "#c4a8d8", // purple
  "#8fb5e8", // blue
  "#e88b8b", // red
  "#9fa8b5", // gray
  "#d89b7a", // orange
];

export default function AddRecordModal({
  onClose,
  onSubmit,
}: AddRecordModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    song_title: "",
    artist: "",
    album_art_url: "",
    lyric_excerpt: "",
    for_name: "",
    reflection_text: "",
    background_color: CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)],
  });

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      onSubmit(formData);
      onClose();
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.song_title && formData.artist;
    if (step === 2) return formData.lyric_excerpt;
    if (step === 3) return formData.for_name && formData.reflection_text;
    return false;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 blur-background"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full bg-white rounded-3xl p-8 overflow-hidden"
        style={{ boxShadow: "var(--shadow-lg)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 2L14 14M14 2L2 14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${
                s <= step ? "bg-gray-900" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Song Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Select a song</h2>
                <p className="text-gray-600">
                  Tell us about the song that reminds you of someone
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Song Title *
                </label>
                <input
                  type="text"
                  value={formData.song_title}
                  onChange={(e) =>
                    setFormData({ ...formData, song_title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g., 505"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Artist *
                </label>
                <input
                  type="text"
                  value={formData.artist}
                  onChange={(e) =>
                    setFormData({ ...formData, artist: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g., Arctic Monkeys"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Album Art URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.album_art_url}
                  onChange={(e) =>
                    setFormData({ ...formData, album_art_url: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Lyrics */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Select lyrics</h2>
                <p className="text-gray-600">
                  Which lyrics from this song remind you of them?
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Lyric Excerpt *
                </label>
                <textarea
                  value={formData.lyric_excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, lyric_excerpt: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-32"
                  placeholder="Paste the lyrics that remind you of them..."
                  required
                />
              </div>
            </div>
          )}

          {/* Step 3: Reflection */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Write your story</h2>
                <p className="text-gray-600">
                  Why do these lyrics remind you of them?
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Who do these lyrics remind you of? *
                </label>
                <input
                  type="text"
                  value={formData.for_name}
                  onChange={(e) =>
                    setFormData({ ...formData, for_name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g., Emma"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Your reflection *
                </label>
                <textarea
                  value={formData.reflection_text}
                  onChange={(e) =>
                    setFormData({ ...formData, reflection_text: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-48"
                  placeholder="Why does this song/lyric remind you of them? Tell their story..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Card Color
                </label>
                <div className="flex gap-3">
                  {CARD_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, background_color: color })
                      }
                      className={`w-12 h-12 rounded-lg transition-all ${
                        formData.background_color === color
                          ? "ring-4 ring-gray-900 ring-offset-2"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={!canProceed()}
              className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {step < 3 ? "Continue" : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
