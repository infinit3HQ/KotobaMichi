import type { Metadata } from "next";
import Script from "next/script";
// Removed Google Fonts to avoid network fetch during build
import "./globals.css";
import Providers from "./providers";

const geistSans = { variable: "--font-geist-sans" } as const;
const geistMono = { variable: "--font-geist-mono" } as const;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "KotobaMichi(言葉道) – Language Learning",
    template: "%s | KotobaMichi(言葉道)",
  },
  description:
    "Learn Japanese vocabulary and kanji with smart quizzes, word explorer, and gentle progress tracking.",
  keywords: [
    "Japanese",
    "JLPT",
    "vocabulary",
    "kanji",
    "language learning",
    "quizzes",
  ],
  authors: [{ name: "KotobaMichi" }],
  creator: "KotobaMichi",
  category: "education",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "KotobaMichi(言葉道)",
    description:
      "Learn Japanese vocabulary and kanji with smart quizzes and a clean word explorer.",
    url: "/",
    siteName: "KotobaMichi(言葉道)",
  },
  twitter: {
    card: "summary_large_image",
    title: "KotobaMichi(言葉道)",
    description:
      "Learn Japanese vocabulary and kanji with smart quizzes and a clean word explorer.",
    creator: "@kotobamichi",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div suppressHydrationWarning>
          {/* Inject runtime env (generated in Docker) before app if present */}
          <Script src="/env.js" strategy="beforeInteractive" />
        </div>
        {/* App providers and shared layout */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
