import Link from "next/link";

export default function HeaderNav() {
  return (
    <header className="w-full py-8">
      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gray-900 rounded-md flex items-center justify-center transition-transform group-hover:scale-105">
              <svg
                width="28"
                height="28"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="16" cy="16" r="13" stroke="white" strokeWidth="2" />
                <circle cx="16" cy="16" r="5" fill="white" />
              </svg>
            </div>
          </Link>

          {/* Center Navigation */}
          <div className="flex gap-8 text-sm">
            <Link
              href="/archive"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Archive
            </Link>
            <Link
              href="/playlist"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Playlist of the Month
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              About
            </Link>
          </div>

          {/* Spacer for visual balance */}
          <div className="w-12"></div>
        </div>
      </nav>
    </header>
  );
}
