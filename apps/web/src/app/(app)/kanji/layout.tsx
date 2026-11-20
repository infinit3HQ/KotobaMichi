import type { Metadata } from "next";
import { SITE_CONFIG, SITE_URL } from "@/lib/seo-config";
import { JsonLd } from "@/components/atoms/json-ld";

export const metadata: Metadata = {
  title: "JLPT Kanji Flip Cards | N5–N2",
  description:
    "Study JLPT kanji with flip cards. See the character, then reveal the meaning, readings, radicals, and example words.",
  alternates: {
    canonical: "/kanji",
  },
  openGraph: {
    title: "JLPT Kanji Flip Cards | KotobaMichi",
    description:
      "Flip through JLPT kanji with meanings, readings, radicals, and example words.",
    url: `${SITE_URL}/kanji`,
    type: "website",
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "KotobaMichi Kanji Explorer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JLPT Kanji Flip Cards | KotobaMichi",
    description: "Flip through JLPT kanji with meanings, readings, and radicals.",
  },
};

const kanjiJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Kanji Explorer", item: `${SITE_URL}/kanji` },
      ],
    },
  ],
};

export default function KanjiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={kanjiJsonLd} />
      {children}
    </>
  );
}
