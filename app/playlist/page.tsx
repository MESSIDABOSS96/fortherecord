"use client";

import HeaderNav from "@/components/HeaderNav";

export default function PlaylistPage() {
  return (
    <div className="min-h-screen">
      <HeaderNav />

      <main className="max-w-7xl mx-auto px-6 pt-6 sm:pt-8 md:pt-10 pb-12 pb-for-fab">
        {/* Title Section */}
        <div className="text-center mb-10">
          <h1 className="text-6xl font-bold mb-4 tracking-tight font-caveat">
            Playlist of the Month
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-8">
            A playlist of every song added to the collection this month
          </p>
        </div>

        {/* Current Month Playlist Embed */}
        <div className="mb-16 max-w-4xl mx-auto">
          <iframe
            title="Spotify Playlist"
            style={{ borderRadius: '12px' }}
            src="https://open.spotify.com/embed/playlist/7KXqbZ9Vp6fxezmgehPhb2?utm_source=generator"
            width="100%"
            height="580"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />

          {/* Fallback link if embed fails */}
          <div className="mt-4 text-center">
            <a
              href="https://open.spotify.com/playlist/7KXqbZ9Vp6fxezmgehPhb2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Open playlist in Spotify
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
