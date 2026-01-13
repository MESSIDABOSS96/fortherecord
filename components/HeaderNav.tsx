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
                  <Link href="/" onClick={handleNavClick} className="hidden md:block md:-ml-12 lg:-ml-16">
                    <Image
                      src="/logo.webp"
                      alt="For the Record"
                      width={96}
                      height={96}
                      priority
                      className="h-20 w-20 object-contain"
                    />
                  </Link>
                </>
              ) : (
                <Link href="/" onClick={handleNavClick} className="md:-ml-12 lg:-ml-16">
                  <Image
                    src="/logo.webp"
                    alt="For the Record"
                    width={96}
                    height={96}
                    priority
                    className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain"
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
                className={`transition-colors whitespace-nowrap ${pathname === '/' ? 'font-bold' : 'font-medium'}`}
                style={{ color: pathname === '/' ? 'var(--color-nav-text-active)' : 'var(--color-nav-text)' }}
              >
                Collection
              </Link>
              <Link
                href="/playlist"
                prefetch={true}
                className={`transition-colors whitespace-nowrap ${pathname === '/playlist' ? 'font-bold' : 'font-medium'}`}
                style={{ color: pathname === '/playlist' ? 'var(--color-nav-text-active)' : 'var(--color-nav-text)' }}
              >
                Playlist of the Month
              </Link>
              <Link
                href="/about"
                prefetch={true}
                className={`transition-colors whitespace-nowrap ${pathname === '/about' ? 'font-bold' : 'font-medium'}`}
                style={{ color: pathname === '/about' ? 'var(--color-nav-text-active)' : 'var(--color-nav-text)' }}
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
                    className="hidden md:inline-flex px-3 xs:px-4 sm:px-6 md:px-8 py-1.5 xs:py-2 sm:py-2.5 md:py-3 rounded-full font-semibold text-xs xs:text-sm transition-colors whitespace-nowrap hover:bg-white hover:text-black"
                    style={{
                      backgroundColor: 'var(--color-page-bg)',
                      color: 'var(--color-text-primary)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--color-text-primary)'
                    }}
                  >
                    Add
                  </Link>
                )
              )}

              {/* Hamburger Menu Button - Mobile only */}
              {!hideMenu && (
                <button
                  onClick={toggleMobileMenu}
                  className="md:hidden p-2 transition-colors"
                  style={{ color: 'var(--color-nav-text-active)' }}
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
                backgroundColor: 'var(--color-nav-mobile-overlay)',
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
                        alt="For the Record"
                        width={56}
                        height={56}
                        priority
                        className="h-14 w-14"
                      />
                    </Link>
                    <button
                      onClick={closeMobileMenu}
                      className="w-10 h-10 flex items-center justify-center"
                      style={{ color: 'var(--color-nav-text-active)' }}
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
                    className={`text-2xl transition-colors ${pathname === '/' ? 'font-bold' : ''}`}
                    style={{ color: pathname === '/' ? 'var(--color-nav-text-active)' : 'var(--color-nav-text)' }}
                  >
                    Collection
                  </Link>
                  <Link
                    href="/playlist"
                    onClick={closeMobileMenu}
                    prefetch={true}
                    className={`text-2xl transition-colors ${pathname === '/playlist' ? 'font-bold' : ''}`}
                    style={{ color: pathname === '/playlist' ? 'var(--color-nav-text-active)' : 'var(--color-nav-text)' }}
                  >
                    Playlist of the Month
                  </Link>
                  <Link
                    href="/about"
                    onClick={closeMobileMenu}
                    prefetch={true}
                    className={`text-2xl transition-colors ${pathname === '/about' ? 'font-bold' : ''}`}
                    style={{ color: pathname === '/about' ? 'var(--color-nav-text-active)' : 'var(--color-nav-text)' }}
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
          className="md:hidden fixed w-16 h-16 rounded-full flex items-center justify-center transition-colors z-50 p-4"
          style={{
            bottom: `calc(12px + var(--safe-area-inset-bottom))`,
            right: `calc(12px + var(--safe-area-inset-right))`,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            color: '#ffffff',
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
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </button>
      )}
    </>
  );
}
