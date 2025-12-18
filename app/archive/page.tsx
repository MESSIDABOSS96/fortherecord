import HeaderNav from "@/components/HeaderNav";
import Link from "next/link";

export default function ArchivePage() {
  return (
    <div className="min-h-screen">
      <HeaderNav />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-6">Archive</h1>
        <p className="text-gray-600 mb-8">
          Browse through all the records that have been shared.
        </p>
        <div className="bg-gray-100 rounded-2xl p-12 text-center">
          <p className="text-gray-500 mb-4">Archive view coming soon...</p>
          <Link
            href="/"
            className="text-gray-900 underline hover:no-underline"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
