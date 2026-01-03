"use client";

import HeaderNav from "@/components/HeaderNav";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <HeaderNav />
      <main className="max-w-6xl mx-auto px-6 pt-6 sm:pt-8 md:pt-10 pb-12">
        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold tracking-tight">
            For the Record
          </h1>
        </div>

        {/* Two-column layout: Text on left, Card on right */}
        <div className="flex flex-col md:flex-row gap-16 md:gap-20 items-center mb-16">
          {/* Left: Text content - pushed more left */}
          <div className="flex-[1.2] prose max-w-none md:-ml-8">
            <p className="text-gray-600 text-lg leading-relaxed mb-6 font-semibold">
              For the Record is an anonymous collection of lyrics that bring someone to mind, and the stories behind them.
            </p>

            <p className="text-gray-600 leading-relaxed mb-6">
              Music is special because we get to shape its meaning around our own lives. The same song can mean completely different things to two different people, because we each pour our own memories, moments, and emotions into it.
            </p>

            <p className="text-gray-600 leading-relaxed mb-6">
              And while music can attach itself to all kinds of experiences, the most powerful version of that is when it attaches to a person. A parent. A friend. A lover, past or present. A stranger who changed your perspective. We all have those songs that seem like they were written for your relationship with someone.
            </p>

            <p className="text-gray-600 leading-relaxed mb-6">
              For the Record is a place to share a lyric that reminds you of someone, and to discover the songs other people hold on to and why. As it grows, For the Record hopes to bring people closer through music.
            </p>
          </div>

          {/* Right: Custom About page card - aligned with center of text */}
          <div className="flex items-center flex-shrink-0 md:mr-8 md:-mt-12">
            <div
              className="rounded-[16px] sm:rounded-[20px] p-4 sm:p-5 md:p-6 flex flex-col"
              style={{
                width: '340px',
                backgroundColor: '#D94446',
                boxShadow: "var(--shadow-md)",
              }}
            >
              {/* Header: Album art (logo) + Song info */}
              <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 flex-shrink-0">
                <div className="w-[46px] h-[46px] sm:w-[52px] sm:h-[52px] bg-transparent rounded-sm flex-shrink-0 overflow-hidden">
                  <Image
                    src="/logo.webp"
                    alt="For the Record"
                    width={512}
                    height={512}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[14px] text-gray-900 truncate leading-tight">
                    For the Record
                  </div>
                  <div className="text-[12px] text-gray-700 truncate leading-tight mt-1">
                    Anonymous
                  </div>
                </div>
              </div>

              {/* Lyric excerpt */}
              <div className="text-gray-900 font-bold text-lg sm:text-[20px] leading-[1.35] mb-4 sm:mb-5 flex-1 whitespace-pre-line">
                Music reminds me of you
              </div>

              {/* For label */}
              <div className="text-[10px] sm:text-[11px] font-medium italic text-gray-900/70 uppercase tracking-wide flex-shrink-0">
                FOR THE RECORD
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
