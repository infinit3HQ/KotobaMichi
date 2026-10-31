import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";
import { SITE_CONFIG, SITE_URL } from "@/lib/seo-config";
import { JsonLd } from "@/components/atoms/json-ld";
import { LOCALE_COOKIE, parseLocale } from "@/lib/i18n/locale-cookie";

const geistSans = { variable: "--font-geist-sans" } as const;
const geistMono = { variable: "--font-geist-mono" } as const;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0F17" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_CONFIG.name} – Interactive Japanese Language Learning`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  keywords: [...SITE_CONFIG.keywords],
  authors: [{ name: SITE_CONFIG.author.name, url: SITE_CONFIG.author.url }],
  creator: SITE_CONFIG.author.name,
  publisher: SITE_CONFIG.name,
  category: "education",
  classification: "Language Learning Software",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": [process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION] }
      : undefined,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: `${SITE_CONFIG.name} – Interactive Japanese Language Learning`,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} - Master JLPT Vocabulary with Interactive Speed Drills`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} – Interactive Japanese Language Learning`,
    description: SITE_CONFIG.description,
    creator: SITE_CONFIG.creator,
    site: SITE_CONFIG.creator,
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_CONFIG.name,
      description: SITE_CONFIG.description,
      inLanguage: "en-US",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/words?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "EducationalOrganization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_CONFIG.name,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.ico`,
      sameAs: [SITE_CONFIG.links.twitter, SITE_CONFIG.links.github],
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#application`,
      name: SITE_CONFIG.name,
      url: SITE_URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web Browser",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: SITE_CONFIG.description,
      provider: {
        "@id": `${SITE_URL}/#organization`,
      },
      inLanguage: ["en-US", "ja-JP"],
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = parseLocale((await cookies()).get(LOCALE_COOKIE)?.value) ?? "en";
  return (
    <html lang={locale} className={locale === "si" ? "locale-si" : undefined} suppressHydrationWarning>
      <head>
        <JsonLd data={websiteJsonLd} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div suppressHydrationWarning>
          {/* Inject runtime env (generated in Docker) before app if present */}
          <Script src="/env.js" strategy="beforeInteractive" />
        </div>
        {/* App providers and shared layout */}
        <Providers initialLocale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
