import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ak7x.games"),
  title: {
    default: "ak7x App — Download ak7x APK | ak7x Games",
    template: "%s | ak7x App",
  },
  description:
    "Download the ak7x app for Android. Get the official ak7x APK, play ak7x games, and enjoy fast secure access. Free ak7x app download in minutes.",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "16x16 32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "ak7x App — Download ak7x APK | ak7x Games",
    description:
      "Download the ak7x app for Android with secure access, fast navigation, and smooth gameplay.",
    url: "https://ak7x.games",
    siteName: "ak7x App",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ak7x App — Download ak7x APK | ak7x Games",
    description:
      "Download the ak7x app for Android with secure access, fast navigation, and smooth gameplay.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`min-h-full flex flex-col bg-[radial-gradient(circle_at_top,rgba(255,201,87,0.16),transparent_35%),linear-gradient(180deg,#0b1020_0%,#111827_45%,#050816_100%)] text-white`}>
        {children}
      </body>
    </html>
  );
}
