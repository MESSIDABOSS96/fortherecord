"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useScrollLock } from '@/hooks/useScrollLock';

export default function HeaderNav({ onReset, leftAction, rightAction, hideMenu = false, hideOnMobile = false, onMenuToggle }: { onReset?: () => void; leftAction?: React.ReactNode; rightAction?: React.ReactNode; hideMenu?: boolean; hideOnMobile?: boolean; onMenuToggle?: (isOpen: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lock scroll when mobile menu is open
  useScrollLock(isMobileMenuOpen);

  // Fix: Ensure menu closes on route change to prevent "vanishing page" bug if menu stays open
  useEffect(() => {
    setIsMobileMenuOpen(false);
    onMenuToggle?.(false);
  }, [pathname, onMenuToggle]);

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onMenuToggle?.(newState);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    onMenuToggle?.(false);
  };

  const handleNavClick = () => {
    if (onReset) onReset();
    closeMobileMenu();
  };

  return (
    <>
      <header className={`w-full py-3 sm:py-4 relative z-40 ${hideOnMobile ? 'hidden md:block' : ''}`}>
        <nav className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center h-12 sm:h-14 md:h-16">
            {/* Logo - Left (or leftAction on mobile if provided) */}
            <div className="flex-shrink-0 justify-self-start">
              {leftAction ? (
                <>
                  {/* Show leftAction on mobile, logo on desktop */}
                  <div className="md:hidden">{leftAction}</div>
                  <Link href="/" onClick={handleNavClick} className="hidden md:block">
                    <Image
                      src="/logo.webp"
                      alt="For The Record"
                      width={512}
                      height={512}
                      priority
                      className="h-24 w-24 -ml-4 -mt-2 object-contain"
                    />
                  </Link>
                </>
              ) : (
                <Link href="/" onClick={handleNavClick}>
                  <Image
                    src="/logo.webp"
                    alt="For The Record"
                    width={512}
                    height={512}
                    priority
                    className="h-14 w-14 sm:h-16 sm:w-16 md:h-24 md:w-24 md:-ml-4 md:-mt-2 object-contain"
                  />
                </Link>
              )}
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
                    className="hidden md:inline-flex px-3 xs:px-4 sm:px-6 md:px-8 py-1.5 xs:py-2 sm:py-2.5 md:py-3 bg-transparent border-2 border-gray-900 rounded-full font-semibold text-xs xs:text-sm hover:bg-gray-900 hover:text-white transition-colors shadow-md whitespace-nowrap"
                  >
                    Add
                  </Link>
                )
              )}

              {/* Hamburger Menu Button - Mobile only */}
              {!hideMenu && (
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
              )}
            </div>
          </div>

          {/* iOS-style Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div
              className="md:hidden fixed inset-0 z-40"
              style={{
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
              }}
              onClick={closeMobileMenu}
            >
              <div className="h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Menu Header - Logo left (same position as normal header), X right */}
                <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                  <div className="flex items-center justify-between h-12 sm:h-14">
                    <Link href="/" onClick={handleNavClick}>
                      <Image
                        src="/logo.webp"
                        alt="For The Record"
                        width={512}
                        height={512}
                        priority
                        className="h-14 w-14 object-contain"
                      />
                    </Link>
                    <button
                      onClick={closeMobileMenu}
                      className="w-10 h-10 flex items-center justify-center text-gray-900"
                      aria-label="Close menu"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Menu Items - Centered, simple text */}
                <nav className="flex flex-col items-center gap-8 pt-12">
                  <Link
                    href="/"
                    onClick={handleNavClick}
                    prefetch={true}
                    className={`text-2xl transition-colors ${pathname === '/'
                      ? 'font-bold text-gray-900'
                      : 'text-gray-700'
                      }`}
                  >
                    Collection
                  </Link>
                  <Link
                    href="/playlist"
                    onClick={closeMobileMenu}
                    prefetch={true}
                    className={`text-2xl transition-colors ${pathname === '/playlist'
                      ? 'font-bold text-gray-900'
                      : 'text-gray-700'
                      }`}
                  >
                    Playlist of the Month
                  </Link>
                  <Link
                    href="/about"
                    onClick={closeMobileMenu}
                    prefetch={true}
                    className={`text-2xl transition-colors ${pathname === '/about'
                      ? 'font-bold text-gray-900'
                      : 'text-gray-700'
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

      {/* Floating Action Button - Mobile only, hidden on /add page */}
      {pathname !== '/add' && (
        <button
          onClick={() => router.push('/add')}
          onTouchEnd={(e) => {
            e.preventDefault();
            router.push('/add');
          }}
          className="md:hidden fixed w-16 h-16 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 active:bg-gray-700 transition-colors z-50 p-4"
          style={{
            bottom: `calc(12px + var(--safe-area-inset-bottom))`,
            right: `calc(12px + var(--safe-area-inset-right))`,
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
          }}
          aria-label="Add new record"
        >
          <Image 
            src="/custom.square.and.pencil.svg" 
            alt="Add" 
            width={28} 
            height={28}
            className="w-7 h-7"
          />
        </button>
      )}
    </>
  );
}
