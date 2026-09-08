import type { Metadata } from "next";
import { SITE_CONFIG, SITE_URL } from "@/lib/seo-config";
import { JsonLd } from "@/components/atoms/json-ld";

export const metadata: Metadata = {
  title: "Japanese Vocabulary & Kanji Explorer | JLPT N5–N1",
  description:
    "Explore over 1,000+ Japanese words with furigana, romaji, English definitions, part-of-speech tags, and native audio pronunciation.",
  alternates: {
    canonical: "/words",
  },
  openGraph: {
    title: "Japanese Words & Kanji Explorer | KotobaMichi",
    description:
      "Explore over 1,000+ Japanese words with furigana, romaji, English definitions, and native audio pronunciation.",
    url: `${SITE_URL}/words`,
    type: "website",
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "KotobaMichi Japanese Words & Kanji Explorer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Japanese Words & Kanji Explorer | KotobaMichi",
    description:
      "Explore over 1,000+ Japanese words with furigana, romaji, definitions, and native audio pronunciation.",
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
