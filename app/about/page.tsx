import HeaderNav from "@/components/HeaderNav";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <HeaderNav />
      <main className="max-w-3xl mx-auto px-6 pb-12">
        <h1 className="text-4xl font-bold mb-6">About For the Record</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            For the Record is an anonymous collection of songs, lyrics, and the
            stories behind why they remind us of the people in our lives.
          </p>

          <p className="text-gray-600 leading-relaxed mb-6">
            Sometimes a lyric hits differently. It captures a feeling, a moment,
            or a person in a way that stays with you. This is a space to share
            those connections—the songs that make you think of someone, and the
            stories of why.
          </p>

          <p className="text-gray-600 leading-relaxed mb-6">
            No profiles. No likes. No comments. Just honest reflections, shared
            anonymously.
          </p>

          <div className="mt-12 p-8 bg-gray-100 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">How it works</h2>
            <ol className="space-y-4 text-gray-700">
              <li>
                <strong>1. Pick a song</strong> that reminds you of someone
              </li>
              <li>
                <strong>2. Select the lyrics</strong> that capture why
              </li>
              <li>
                <strong>3. Write your story</strong> about what it means
              </li>
              <li>
                <strong>4. Share it</strong> anonymously with the community
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
