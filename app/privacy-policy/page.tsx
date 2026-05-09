import Header from '@/components/Header';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Header />
      </div>

      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-4 text-white/80">
          We respect your privacy. This page explains what data we collect and how we use it.
        </p>

        <section className="mt-6">
          <h2 className="text-xl font-semibold">Information Collection</h2>
          <p className="mt-2 text-white/80">We may collect analytics data to improve the site. We do not sell personal information.</p>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold">Cookies</h2>
          <p className="mt-2 text-white/80">We use cookies for analytics and basic UX improvements. You can opt out via your browser.</p>
        </section>

        <div className="mt-8">
          <Link href="/" className="text-amber-300 hover:underline">Back to Home</Link>
        </div>
      </main>
    </div>
  );
}
