"use client";

import HeaderNav from "@/components/HeaderNav";
import RecordCard from "@/components/RecordCard";
import { Record } from "@/types/record";

export default function AboutPage() {
  const exampleRecord: Record = {
    id: 'about-example',
    for_name: 'the Record',
    song_title: 'For the Record',
    artist: 'Anonymous',
    album_art_url: '/logo.svg',
    spotify_track_id: undefined,
    lyric_excerpt: 'Music reminds me of you',
    reflection_text: '',
    background_color: '#E2E4E6',
    created_at: new Date(),
  };

  return (
    <div className="min-h-screen">
      <HeaderNav />
      <main className="max-w-5xl mx-auto px-6 pb-12">
        {/* Title and subheading */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 tracking-tight">
            FOR THE RECORD
          </h1>
          <p className="text-xl text-gray-600 mb-8">An archive of lyrics that bring someone to mind</p>
        </div>

        {/* New blurb content */}
        <div className="prose max-w-none mb-12 text-center">
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            For the Record is an anonymous collection of the lyrics that remind you of someone and the stories behind them.
          </p>

          <p className="text-gray-600 leading-relaxed mb-6">
            Music is special because we get to shape its meaning around our own lives. The same song can mean completely different things to two different people, because we each pour our own memories, moments, and emotions into it.
          </p>

          <p className="text-gray-600 leading-relaxed mb-6">
            And while music can attach itself to all kinds of experiences, the most powerful version of that is when it attaches to a person. A parent. A friend. A lover, past or present. A stranger who changed your perspective. We all have those songs that seem like they were written for your relationship with someone.
          </p>

          <p className="text-gray-600 leading-relaxed mb-6">
            For the Record is a platform to share a song, the lyrics that matter, and the person they bring to mind. Or scroll through the collection and discover the songs people hold on to and why.
          </p>

          <p className="text-gray-600 leading-relaxed mb-6">
            As it grows, For the Record becomes a place to feel understood through someone else&apos;s story and more connected to each other through music.
          </p>
        </div>

        {/* Example lyric card */}
        <div className="flex justify-center">
          <div style={{ minWidth: '320px' }}>
            <RecordCard
              record={exampleRecord}
              onClick={() => {}}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
