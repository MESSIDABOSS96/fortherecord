"use client";

import Link from 'next/link';
import HeaderNav from '@/components/HeaderNav';
import { SUBMISSIONS_CLOSED_MESSAGE } from '@/lib/records';

export default function AddPage() {
  return (
    <div className="min-h-screen">
      <HeaderNav />

      <main className="flex flex-col items-center justify-center px-6 text-center" style={{ minHeight: '70vh' }}>
        <h1
          className="mb-5"
          style={{
            fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)',
          }}
        >
          Submissions are closed
        </h1>

        <p
          className="mb-3"
          style={{
            maxWidth: '30rem',
            fontSize: '1.0625rem',
            lineHeight: 1.6,
            color: 'var(--color-text-secondary)',
          }}
        >
          {SUBMISSIONS_CLOSED_MESSAGE}
        </p>

        <p
          className="mb-9"
          style={{
            maxWidth: '30rem',
            fontSize: '1.0625rem',
            lineHeight: 1.6,
            color: 'var(--color-text-secondary)',
          }}
        >
          Thank you to everyone who left a song here.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full transition-opacity hover:opacity-80"
          style={{
            padding: '0.875rem 2rem',
            fontSize: '0.9375rem',
            fontWeight: 600,
            backgroundColor: 'var(--color-fab-bg)',
            color: 'var(--color-fab-text)',
          }}
        >
          Read the archive
        </Link>
      </main>
    </div>
  );
}
