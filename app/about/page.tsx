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
        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold tracking-tight">
            For the Record
          </h1>
        </div>

        {/* Two-column layout: Text on left, Card on right */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start mb-16">
          {/* Left: Text content */}
          <div className="flex-1 prose max-w-none">
            <p className="text-gray-600 text-lg leading-relaxed mb-6 font-semibold">
              For the Record is an anonymous collection of the lyrics that remind you of someone and the stories behind them.
            </p>

            <p className="text-gray-600 leading-relaxed mb-6">
              Music is special because we get to shape its meaning around our own lives. The same song can mean completely different things to two different people, because we each pour our own memories, moments, and emotions into it. And while music can attach itself to all kinds of experiences, the most powerful version of that is when it attaches to a person. A parent. A friend. A lover, past or present. A stranger who changed your perspective. We all have those songs that seem like they were written for your relationship with someone. For the Record is a place to share the lyrics that bring someone to mind, and to discover the songs other people hold on to and why. As it grows, For the Record hopes to bring people closer through music.
            </p>
          </div>

          {/* Right: Example lyric card */}
          <div className="flex items-center md:sticky md:top-8">
            <div style={{ width: '340px' }}>
              <RecordCard
                record={exampleRecord}
                onClick={() => {}}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
