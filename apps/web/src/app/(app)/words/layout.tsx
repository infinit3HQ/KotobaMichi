import type { Metadata } from "next";
import { SITE_CONFIG, SITE_URL } from "@/lib/seo-config";
import { JsonLd } from "@/components/atoms/json-ld";
import { CATALOG_STATS, formatCount } from "@/lib/catalog-stats";

const WORD_COUNT = formatCount(CATALOG_STATS.words);

export const metadata: Metadata = {
  title: "JLPT Japanese Vocabulary | N5–N1",
  description:
    `Browse ${WORD_COUNT} JLPT Japanese words from N5 to N1 with readings, romaji, English meanings, and audio pronunciation.`,
  alternates: {
    canonical: "/words",
  },
  openGraph: {
    title: "JLPT Japanese Vocabulary | KotobaMichi",
    description:
      `Browse ${WORD_COUNT} JLPT Japanese words with readings, romaji, English meanings, and audio pronunciation.`,
    url: `${SITE_URL}/words`,
    type: "website",
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "KotobaMichi Japanese vocabulary",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JLPT Japanese Vocabulary | KotobaMichi",
    description:
      `Browse ${WORD_COUNT} JLPT Japanese words with readings, romaji, meanings, and audio pronunciation.`,
  },
};

const wordsJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Words Explorer",
          item: `${SITE_URL}/words`,
        },
      ],
    },
    {
      "@type": "DefinedTermSet",
      name: "JLPT Japanese Vocabulary Lexicon",
      description:
        "Curated lexicon of Japanese words and kanji categorized by JLPT level with audio pronunciation and meanings.",
      inLanguage: ["ja", "en"],
      publisher: {
        "@type": "EducationalOrganization",
        name: SITE_CONFIG.name,
        url: SITE_URL,
      },
    },
  ],
};

export default function WordsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={wordsJsonLd} />
      {children}
    </>
  );
}
