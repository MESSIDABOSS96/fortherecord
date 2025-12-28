"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from 'next/navigation';

export default function HeaderNav({ onReset }: { onReset?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="w-full py-3">
      <nav className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Left: Logo */}
          <div className="justify-self-start -ml-20 mt-3">
            <Link href="/" onClick={onReset} className="flex items-center group">
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
              onClick={onReset}
              className={`transition-colors ${
                pathname === '/'
                  ? 'font-bold text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 font-medium'
              }`}
            >
              Collection
            </Link>
            <Link
              href="/playlist"
              className={`transition-colors ${
                pathname === '/playlist'
                  ? 'font-bold text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 font-medium'
              }`}
            >
              Playlist of the Month
            </Link>
            <Link
              href="/about"
              className={`transition-colors ${
                pathname === '/about'
                  ? 'font-bold text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 font-medium'
              }`}
            >
              About
            </Link>
          </div>

          {/* Right: Empty (for balance) */}
          <div></div>
        </div>

        {/* Add button (absolute position) */}
        {pathname !== '/add' && (
          <button
            onClick={() => router.push('/add')}
            className="absolute top-10 right-10 px-8 py-3 bg-transparent border-2 border-gray-900 rounded-full font-semibold text-sm hover:bg-gray-900 hover:text-white transition-colors z-40 shadow-md"
          >
            Add
          </button>
        )}
      </nav>
    </header>
  );
}
