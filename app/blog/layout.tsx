import Link from 'next/link';
import { ReactNode } from 'react';
import Header from '@/components/Header';

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,201,87,0.06),transparent_35%),linear-gradient(180deg,#0b1020_0%,#0b1020_45%,#050816_100%)] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Header />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <nav className="mb-6 text-sm text-white/70" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="hover:text-amber-300">
                Home
              </Link>
            </li>
            <li>
              <span className="text-white/40">/</span>
            </li>
            <li>
              <Link href="/blog" className="text-white">
                Blog
              </Link>
            </li>
          </ol>
        </nav>

        <main className="min-h-screen">{children}</main>
      </div>

      <footer className="mt-12 border-t border-white/8 bg-white/3">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">About AK7 App</h3>
              <p className="text-sm text-white/70">Your resource for AK7 app guides, EK7 game strategies, and gaming insights.</p>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-white/80 hover:text-white">Home</Link>
                </li>
                <li>
                  <Link href="/blog" className="text-white/80 hover:text-white">All Posts</Link>
                </li>
                <li>
                  <Link href="/disclaimer" className="text-white/80 hover:text-white">Disclaimer</Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-white/80 hover:text-white">Privacy Policy</Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">Legal &amp; Compliance</h3>
              <div className="space-y-3 text-sm text-white/70">
                <p className="flex items-start gap-2"><span className="text-red-500">⚠️</span><span>18+ Only. Play responsibly.</span></p>
                <p className="flex items-start gap-2"><span className="text-yellow-400">ℹ️</span><span>This is an informational website. We are not affiliated with the official app.</span></p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/6 pt-8 text-center">
            <p className="text-sm text-white/60">© {new Date().getFullYear()} AK7 App. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
