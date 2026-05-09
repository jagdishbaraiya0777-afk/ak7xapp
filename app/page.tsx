import Image from "next/image";
import Link from "next/link";
import Header from '@/components/Header';

export default function Home() {
  const features = [
    {
      title: "Quick Android access",
      description:
        "Open the app quickly and move between key sections without extra friction.",
    },
    {
      title: "Smooth navigation",
      description:
        "A mobile-first layout keeps wallet, promotions, and games easy to reach.",
    },
    {
      title: "Secure account control",
      description:
        "Keep login and account management simple with a clear, reliable interface.",
    },
  ];

  const steps = [
    "Download the APK from the official button below.",
    "Allow installs from your browser or file manager if prompted.",
    "Open the app, sign in, and start using the mobile experience.",
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,201,87,0.16),transparent_35%),linear-gradient(180deg,#0b1020_0%,#111827_45%,#050816_100%)] text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <Header />

        <section className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div className="max-w-2xl">
            <div className="flex flex-col items-start gap-6 text-left">
              <div className="flex flex-col items-start gap-5">
                <div className="inline-flex items-center rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-medium text-amber-100">
                  English
                </div>
                <Image
                  src="/icon-512.png"
                  alt="ak7x App logo"
                  width={320}
                  height={320}
                  priority
                  className="h-72 w-72 rounded-[2.5rem] border border-white/10 bg-white/5 p-3 shadow-2xl shadow-black/30 sm:h-80 sm:w-80 md:h-96 md:w-96"
                />
                <Link
                  href="https://cp7.me/BYPZW8/30i50zd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-linear-to-r from-amber-300 via-orange-400 to-rose-500 px-6 text-sm font-bold text-slate-950 shadow-lg shadow-orange-500/30 transition-transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40"
                >
                  Download APK
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white/90 transition-colors hover:border-amber-300/40 hover:bg-amber-300/10 hover:text-amber-200"
                >
                  Read the Blog
                </Link>
              </div>

              <div className="space-y-5">
                <div className="space-y-3">
                  <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                    ak7x App for fast mobile access in Mexico
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
                    A cleaner Android experience for players who want quicker
                    access, easier navigation, and a more reliable daily app
                    flow across wallet, promotions, and games.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ["Quick", "Android Access"],
                    ["Smooth", "Mobile Navigation"],
                    ["Secure", "Account Control"],
                  ].map(([label, value]) => (
                    <div
                      key={value}
                      className="rounded-2xl border border-white/10 bg-white/6 px-4 py-4 backdrop-blur"
                    >
                      <div className="text-2xl font-black text-amber-300">
                        {label}
                      </div>
                      <div className="mt-1 text-sm text-white/70">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-4xl bg-linear-to-br from-amber-400/20 via-orange-400/10 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="aspect-4/5 rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.22),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))] p-5">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/45">
                  <span>ak7x App</span>
                  <span>Android</span>
                </div>
                <div className="mt-6 rounded-3xl border border-white/10 bg-white/6 p-5">
                  <p className="text-sm font-semibold text-amber-200">
                    Designed for everyday use
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/70">
                    The app keeps the key actions close at hand so players can
                    get in, manage their account, and return to play without
                    unnecessary delays.
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                      Login
                    </p>
                    <p className="mt-2 text-sm text-white/80">
                      Fast access with a simple account flow.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                      Wallet
                    </p>
                    <p className="mt-2 text-sm text-white/80">
                      Check your balance and move faster.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl border border-white/10 bg-linear-to-r from-amber-300/15 to-rose-500/15 p-4 text-sm leading-7 text-white/75">
                  Built to feel quick on modern Android devices and easy to use
                  from the first tap.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 pb-8 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/10 backdrop-blur"
            >
              <h2 className="text-lg font-semibold text-white">
                {feature.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/68">
                {feature.description}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 pb-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
              Download steps
            </p>
            <h2 className="mt-3 text-2xl font-black text-white">
              Install and start in a few minutes
            </h2>
            <div className="mt-6 space-y-4">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-2xl bg-black/20 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-300 font-black text-slate-950">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-7 text-white/75">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(251,191,36,0.10),rgba(255,255,255,0.04))] p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
              Why it stands out
            </p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-white/72">
              <p>
                The landing page is tuned for a mobile-first audience, with the
                logo and download CTA placed before anything else in the hero.
              </p>
              <p>
                The rest of the page keeps the messaging simple and direct so
                visitors can understand the app, its benefits, and how to get
                started without searching around.
              </p>
              <p>
                The root layout now exposes the manifest and icon assets, so the
                site is ready for install prompts and proper favicon handling.
              </p>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 py-6 text-sm text-white/55">
          ak7x App - Copyright © 2026
        </footer>
      </main>
    </div>
  );
}
