export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f3f0]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600 animate-pulse">Loading Playlist...</p>
      </div>
    </div>
  );
}
