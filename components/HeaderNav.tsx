import Link from "next/link";
import Image from "next/image";

export default function HeaderNav() {
  return (
    <header className="w-full py-8">
      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo.svg"
              alt="For The Record"
              width={60}
              height={57}
              className="transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Center Navigation */}
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

          {/* Spacer for visual balance */}
          <div className="w-12"></div>
        </div>
      </nav>
    </header>
  );
}
