import HeaderNav from "@/components/HeaderNav";

export default function PlaylistPage() {
  return (
    <div className="min-h-screen">
      <HeaderNav />
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">THIS MONTH&apos;S RECORDS</h1>
          <p className="text-gray-600">
            A monthly playlist pulled from the stories in our archive
          </p>
        </div>

        {/* Spotify Embed Placeholder */}
        <div className="bg-gray-900 rounded-3xl overflow-hidden" style={{ boxShadow: "var(--shadow-lg)" }}>
          <div className="aspect-[16/9] flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-white/20"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              <p className="text-white/60 text-sm">Spotify embed placeholder</p>
              <p className="text-white/40 text-xs mt-2">
                Integration coming soon
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder track list */}
        <div className="mt-8 space-y-2">
          {[
            { title: "Weird Fishes / Arpeggi", artist: "Radiohead", time: "05:18" },
            { title: "Easy On Me", artist: "Adele", time: "03:44" },
            { title: "Eyes Without a Face", artist: "Billy Idol", time: "04:59" },
          ].map((track, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="text-gray-400 w-6 text-center">{i + 1}</div>
              <div className="flex-1">
                <div className="font-medium">{track.title}</div>
                <div className="text-sm text-gray-600">{track.artist}</div>
              </div>
              <div className="text-sm text-gray-500">{track.time}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
