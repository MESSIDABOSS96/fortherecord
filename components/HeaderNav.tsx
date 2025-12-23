import Link from "next/link";
import Image from "next/image";

export default function HeaderNav() {
  return (
    <header className="w-full py-3">
      <nav className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Left: Logo */}
          <div className="justify-self-start -ml-20 mt-3">
            <Link href="/" className="flex items-center group">
              <Image
                src="/logo.svg"
                alt="For The Record"
                width={110}
                height={133}
                className="transition-transform group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Center: Navigation - always centered */}
          <div className="flex gap-8 text-sm">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Collection
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

          {/* Right: Empty (for balance/future actions) */}
          <div></div>
        </div>
      </nav>
    </header>
  );
}
