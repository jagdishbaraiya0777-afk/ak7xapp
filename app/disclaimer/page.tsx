import Header from '@/components/Header';
import Link from 'next/link';

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Header />
      </div>

      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold">Disclaimer</h1>
        <p className="mt-4 text-white/80">
          This website provides informational content about AK7 App and related platforms. We are not affiliated with the official app or its developers. Content is for informational purposes only and does not constitute professional advice.
        </p>

        <section className="mt-6">
          <h2 className="text-xl font-semibold">Accuracy</h2>
          <p className="mt-2 text-white/80">We strive for accuracy but do not guarantee the completeness or timeliness of any information.</p>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold">No affiliation</h2>
          <p className="mt-2 text-white/80">We are an independent resource and not officially associated with AK7 App or any other platform mentioned.</p>
        </section>

        <div className="mt-8">
          <Link href="/" className="text-amber-300 hover:underline">Back to Home</Link>
        </div>
      </main>
    </div>
  );
}
