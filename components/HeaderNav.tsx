import Link from "next/link";
import Image from "next/image";

export default function HeaderNav() {
  return (
    <header className="w-full py-6">
      <nav className="max-w-7xl ml-0 mr-auto pr-6 pl-6">
        <div className="relative flex items-center">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo-v2.svg"
              alt="For The Record"
              width={110}
              height={122}
              className="transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Center Navigation - Absolutely centered */}
          <div className="absolute left-1/2 -translate-x-1/2 flex gap-8 text-sm">
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
        </div>
      </nav>
    </header>
  );
}
