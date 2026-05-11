import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from '@/components/Header';
import { HomepageSchema } from "@/components/HomepageSchema";

export const metadata: Metadata = {
  title: "ak7x App — Download ak7x APK | ak7x Games",
  description:
    "Download the ak7x app for Android. Get the official ak7x APK, play ak7x games, and enjoy fast secure access. Free ak7x app download — install in minutes.",
  alternates: {
    canonical: "https://ak7x.games",
  },
  openGraph: {
    title: "ak7x App — Download ak7x APK | ak7x Games",
    description:
      "Download the ak7x app for Android. Get the official ak7x APK, play ak7x games, and enjoy fast secure access. Free ak7x app download — install in minutes.",
    url: "https://ak7x.games",
    siteName: "ak7x App",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ak7x App — Download ak7x APK | ak7x Games",
    description:
      "Download the ak7x app for Android. Get the official ak7x APK, play ak7x games, and enjoy fast secure access. Free ak7x app download — install in minutes.",
  },
};

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
      <HomepageSchema />
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
                  alt="ak7x App official logo"
                  width={320}
                  height={320}
                  priority
                  className="h-72 w-72 rounded-[2.5rem] border border-white/10 bg-white/5 p-3 shadow-2xl shadow-black/30 sm:h-80 sm:w-80 md:h-96 md:w-96"
                />
                <Link
                  href="https://in.ak7x.xyz?shareCode=KFA0RN&source=invite&mn=fcts01&xbetEvent=6kxak"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-linear-to-r from-amber-300 via-orange-400 to-rose-500 px-6 text-sm font-bold text-slate-950 shadow-lg shadow-orange-500/30 transition-transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40"
                >
                  Download ak7x APK
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
                    Download ak7x App — Free APK for Android
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

        <section aria-label="About ak7x App" className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 pb-8 text-white/85 backdrop-blur">
          <h2 className="text-2xl font-black text-white">What is the ak7x App?</h2>
          <p className="mt-4 text-sm leading-8 sm:text-base">
            The <strong>ak7x app</strong> is a fast, lightweight Android application designed for players who want quick mobile access to their favourite games. Whether you are searching for the <strong>ak7x game</strong>, exploring <strong>ak7x games</strong>, or looking for a reliable <strong>ak7x app download</strong>, this is your official resource hub.
          </p>
          <p className="mt-4 text-sm leading-8 sm:text-base">
            Built for Android, the app delivers a clean interface, secure account control, and smooth navigation for daily use. Players use the <strong>ak7x app</strong> to move quickly between wallet access, promotions, and games without the delays of a browser session.
          </p>
        </section>

        <section aria-label="How to download ak7x APK" className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-6 pb-8 text-white/85 backdrop-blur">
          <h2 className="text-2xl font-black text-white">How to Complete Your ak7x APK Download</h2>
          <p className="mt-4 text-sm leading-8 sm:text-base">
            Getting started with the <strong>ak7x apk download</strong> takes less than five minutes on Android devices:
          </p>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-8 sm:text-base">
            <li><strong>Step 1 — Download the APK:</strong> Tap the official Download button on this page to get the latest <strong>ak7x app download</strong> file directly to your device.</li>
            <li><strong>Step 2 — Allow installation:</strong> Go to Settings, then Security, and enable installs from your browser or file manager as a one-time step for APK installs outside the Play Store.</li>
            <li><strong>Step 3 — Install and open:</strong> Open the downloaded file, tap Install, and wait for the <strong>ak7x game</strong> app icon to appear on your home screen.</li>
            <li><strong>Step 4 — Sign in and play:</strong> Log in with your account or register a new one. Your wallet, promotions, and <strong>ak7x games</strong> are all available from the main dashboard.</li>
          </ol>
        </section>

        <section aria-label="ak7x App features" className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-6 pb-8 text-white/85 backdrop-blur">
          <h2 className="text-2xl font-black text-white">ak7x App Features</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-8 sm:text-base">
            <li><strong>Fast APK install</strong> — lightweight file and quick setup on most Android devices</li>
            <li><strong>Secure account control</strong> — safe login with a clean, reliable interface</li>
            <li><strong>Wallet access</strong> — check balance and manage funds from the app dashboard</li>
            <li><strong>Promotions hub</strong> — view active offers and bonuses without opening a browser</li>
            <li><strong>Smooth navigation</strong> — mobile-first layout keeps every section one tap away</li>
            <li><strong>Regular updates</strong> — consistent performance improvements across supported devices</li>
          </ul>
        </section>

        <section aria-label="Frequently Asked Questions" className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-6 pb-8 text-white/85 backdrop-blur">
          <h2 className="text-2xl font-black text-white">Frequently Asked Questions</h2>

          <div className="mt-4" itemScope itemType="https://schema.org/Question">
            <h3 className="text-lg font-bold text-white" itemProp="name">What is the ak7x game?</h3>
            <div itemScope itemType="https://schema.org/Answer">
              <p className="mt-2 text-sm leading-8 sm:text-base" itemProp="text">
                The ak7x game is an online gaming platform available as a mobile app for Android devices. Players use the ak7x app to access games, manage their wallet, and join promotions through a clean interface.
              </p>
            </div>
          </div>

          <div className="mt-4" itemScope itemType="https://schema.org/Question">
            <h3 className="text-lg font-bold text-white" itemProp="name">Is the ak7x APK download safe?</h3>
            <div itemScope itemType="https://schema.org/Answer">
              <p className="mt-2 text-sm leading-8 sm:text-base" itemProp="text">
                Yes. Download the ak7x APK only from this official page. Always avoid third-party mirrors when downloading any APK.
              </p>
            </div>
          </div>

          <div className="mt-4" itemScope itemType="https://schema.org/Question">
            <h3 className="text-lg font-bold text-white" itemProp="name">Which Android version is needed for the ak7x app?</h3>
            <div itemScope itemType="https://schema.org/Answer">
              <p className="mt-2 text-sm leading-8 sm:text-base" itemProp="text">
                The ak7x app is compatible with Android 5.0 and above and runs smoothly on most mid-range devices.
              </p>
            </div>
          </div>

          <div className="mt-4" itemScope itemType="https://schema.org/Question">
            <h3 className="text-lg font-bold text-white" itemProp="name">How do I update the ak7x app?</h3>
            <div itemScope itemType="https://schema.org/Answer">
              <p className="mt-2 text-sm leading-8 sm:text-base" itemProp="text">
                Visit this page to check for the latest ak7x APK version, download the new file, and install it over your current app version.
              </p>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 py-6 text-sm text-white/55">
          <p>ak7x App - Copyright © 2026</p>
          <p className="mt-3">
            <strong className="text-white/80">Our platforms:</strong>{' '}
            <a href="https://ak7-apk.com/" target="_blank" rel="noopener" className="text-amber-300 hover:text-amber-200">
              ak7 APK
            </a>{' '}
            ·{' '}
            <a href="https://goplay11-apk.com/" target="_blank" rel="noopener" className="text-amber-300 hover:text-amber-200">
              GoPlay11 Fantasy App
            </a>{' '}
            ·{' '}
            <a href="https://habetapk.com/" target="_blank" rel="noopener" className="text-amber-300 hover:text-amber-200">
              Habet App
            </a>{' '}
            ·{' '}
            <a href="https://www.dhan7.xyz/" target="_blank" rel="noopener" className="text-amber-300 hover:text-amber-200">
              Dhan7
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
