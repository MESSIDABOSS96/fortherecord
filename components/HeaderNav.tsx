"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function HeaderNav({ onReset, rightAction }: { onReset?: () => void; rightAction?: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fix: Ensure menu closes on route change to prevent "vanishing page" bug if menu stays open
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleNavClick = () => {
    if (onReset) onReset();
    closeMobileMenu();
  };

  return (
    <header className="w-full py-3 sm:py-4 relative z-40">
      <nav className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center h-12 sm:h-14 md:h-16">
          {/* Logo - Left */}
          <div className="flex-shrink-0 justify-self-start">
            <Link href="/" onClick={handleNavClick}>
              <Image
                src="/logo.webp"
                alt="For The Record"
                width={512}
                height={512}
                priority
                className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 -ml-4 -mt-2 object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation - Center (hidden on mobile) */}
          <div className="hidden md:flex gap-6 lg:gap-8 text-sm justify-self-center">
            <Link
              href="/"
              onClick={onReset}
              prefetch={true}
              className={`transition-colors whitespace-nowrap ${pathname === '/'
                ? 'font-bold text-gray-900'
                : 'text-gray-600 hover:text-gray-900 font-medium'
                }`}
            >
              Collection
            </Link>
            <Link
              href="/playlist"
              prefetch={true}
              className={`transition-colors whitespace-nowrap ${pathname === '/playlist'
                ? 'font-bold text-gray-900'
                : 'text-gray-600 hover:text-gray-900 font-medium'
                }`}
            >
              Playlist of the Month
            </Link>
            <Link
              href="/about"
              prefetch={true}
              className={`transition-colors whitespace-nowrap ${pathname === '/about'
                ? 'font-bold text-gray-900'
                : 'text-gray-600 hover:text-gray-900 font-medium'
                }`}
            >
              About
            </Link>
          </div>

          {/* Right side - Add button + Hamburger menu */}
          <div className="flex items-center gap-2 sm:gap-3 justify-self-end flex-nowrap">
            {rightAction ? (
              rightAction
            ) : (
              pathname !== '/add' && (
                <Link
                  href="/add"
                  prefetch={true}
                  className="px-3 xs:px-4 sm:px-6 md:px-8 py-1.5 xs:py-2 sm:py-2.5 md:py-3 bg-transparent border-2 border-gray-900 rounded-full font-semibold text-xs xs:text-sm hover:bg-gray-900 hover:text-white transition-colors shadow-md whitespace-nowrap"
                >
                  Add
                </Link>
              )
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
                  prefetch={true}
                  className={`px-6 py-4 transition-colors ${pathname === '/'
                    ? 'font-bold text-gray-900 bg-gray-100'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  Collection
                </Link>
                <Link
                  href="/playlist"
                  onClick={closeMobileMenu}
                  prefetch={true}
                  className={`px-6 py-4 transition-colors ${pathname === '/playlist'
                    ? 'font-bold text-gray-900 bg-gray-100'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  Playlist of the Month
                </Link>
                <Link
                  href="/about"
                  onClick={closeMobileMenu}
                  prefetch={true}
                  className={`px-6 py-4 transition-colors ${pathname === '/about'
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
