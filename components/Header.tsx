"use client"

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="mx-auto w-full max-w-6xl px-4">
      <div className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 py-3 px-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-amber-300 via-orange-400 to-rose-500 text-lg font-black text-slate-950 shadow-lg shadow-amber-500/25 sm:h-16 sm:w-16">
            <Image src="/icon-512.png" alt="ak7x logo" width={64} height={64} className="rounded-xl" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold tracking-[0.25em] text-amber-300 uppercase">
              ak7x App
            </p>
            <p className="text-xs text-white/60">Mobile access made simple</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-4 text-sm">
            <Link href="/" className="text-white/90 transition-colors hover:text-amber-300">
              Home
            </Link>
            <Link href="/blog" className="text-white/90 transition-colors hover:text-amber-300">
              Blog
            </Link>
            <Link href="/disclaimer" className="text-white/70 transition-colors hover:text-amber-300">
              Disclaimer
            </Link>
            <a
              href="https://cp7.me/BYPZW8/30i50zd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-amber-300 via-orange-400 to-rose-500 px-4 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-orange-500/30"
            >
              Download
            </a>
          </nav>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
            className="inline-flex items-center justify-center rounded-md p-2 text-white md:hidden"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="mt-2 rounded-lg border border-white/8 bg-white/5 p-4 backdrop-blur md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/" className="text-white/90 block px-2 py-2 rounded hover:bg-white/3">
              Home
            </Link>
            <Link href="/blog" className="text-white/90 block px-2 py-2 rounded hover:bg-white/3">
              Blog
            </Link>
            <Link href="/disclaimer" className="text-white/90 block px-2 py-2 rounded hover:bg-white/3">
              Disclaimer
            </Link>
            <a
              href="https://cp7.me/BYPZW8/30i50zd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-amber-300 via-orange-400 to-rose-500 px-4 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-orange-500/30"
            >
              Download
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
