import Link from "next/link";
import Image from "next/image";

export default function HeaderNav() {
  return (
    <header className="w-full py-8">
      <nav className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-3 items-center">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center group justify-start">
            <Image
              src="/logo.svg"
              alt="For The Record"
              width={100}
              height={95}
              className="transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Center Navigation */}
          <div className="flex gap-8 text-sm justify-center">
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

          {/* Empty right column for balance */}
          <div></div>
        </div>
      </nav>
    </header>
  );
}
