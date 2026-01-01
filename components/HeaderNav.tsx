"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HeaderNav({ onReset }: { onReset?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleNavClick = () => {
    if (onReset) onReset();
    closeMobileMenu();
  };

  return (
    <header className="w-full py-3 relative">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <div className="flex-shrink-0 md:-ml-16 lg:-ml-20">
            <Link href="/" onClick={handleNavClick} className="flex items-center group">
              <Image
                src="/logo.svg"
                alt="For The Record"
                width={110}
                height={133}
                priority
                className="transition-transform group-hover:scale-105 w-20 sm:w-24 md:w-28"
              />
            </Link>
          </div>

          {/* Desktop Navigation - Center (hidden on mobile) */}
          <div className="hidden md:flex gap-6 lg:gap-8 text-sm absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="/"
              onClick={onReset}
              prefetch={true}
              className={`transition-colors whitespace-nowrap ${
                pathname === '/'
                  ? 'font-bold text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 font-medium'
              }`}
            >
              Collection
            </Link>
            <Link
              href="/playlist"
              prefetch={true}
              className={`transition-colors whitespace-nowrap ${
                pathname === '/playlist'
                  ? 'font-bold text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 font-medium'
              }`}
            >
              Playlist of the Month
            </Link>
            <Link
              href="/about"
              prefetch={true}
              className={`transition-colors whitespace-nowrap ${
                pathname === '/about'
                  ? 'font-bold text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 font-medium'
              }`}
            >
              About
            </Link>
          </div>

          {/* Right side - Add button + Hamburger */}
          <div className="flex items-center gap-3">
            {/* Add button */}
            {pathname !== '/add' && (
              <button
                onClick={() => router.push('/add')}
                className="px-4 sm:px-6 md:px-8 py-2 md:py-3 bg-transparent border-2 border-gray-900 rounded-full font-semibold text-xs sm:text-sm hover:bg-gray-900 hover:text-white transition-colors shadow-md"
              >
                Add
              </button>
            )}

            {/* Hamburger Menu Button - Mobile only */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-900 hover:text-gray-600 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 top-16"
            onClick={closeMobileMenu}
          >
            <div
              className="bg-white w-full max-w-sm ml-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="flex flex-col py-4">
                <Link
                  href="/"
                  onClick={handleNavClick}
                  className={`px-6 py-4 transition-colors ${
                    pathname === '/'
                      ? 'font-bold text-gray-900 bg-gray-100'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Collection
                </Link>
                <Link
                  href="/playlist"
                  onClick={closeMobileMenu}
                  className={`px-6 py-4 transition-colors ${
                    pathname === '/playlist'
                      ? 'font-bold text-gray-900 bg-gray-100'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Playlist of the Month
                </Link>
                <Link
                  href="/about"
                  onClick={closeMobileMenu}
                  className={`px-6 py-4 transition-colors ${
                    pathname === '/about'
                      ? 'font-bold text-gray-900 bg-gray-100'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  About
                </Link>
              </nav>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
