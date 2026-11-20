import type { Metadata } from "next";
import { SITE_CONFIG, SITE_URL } from "@/lib/seo-config";
import { JsonLd } from "@/components/atoms/json-ld";

export const metadata: Metadata = {
  title: "Practice Dojo – JLPT Drills, Flashcards and Kana",
  description:
    "Short Japanese drills for JLPT N5 to N1: a 60-second word sprint, spaced-repetition flashcards, a kana chart with audio, and kanji, grammar, listening and reading practice.",
  alternates: {
    canonical: "/practice",
  },
  openGraph: {
    title: "Practice Dojo | KotobaMichi",
    description:
      "Short Japanese drills for JLPT N5 to N1: a 60-second word sprint, spaced-repetition flashcards, a kana chart with audio, and kanji, grammar, listening and reading practice.",
    url: `${SITE_URL}/practice`,
    type: "website",
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "KotobaMichi Practice Dojo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Practice Dojo | KotobaMichi",
    description:
      "Short Japanese drills for JLPT N5 to N1: a 60-second word sprint, spaced-repetition flashcards, a kana chart with audio, and kanji, grammar, listening and reading practice.",
  },
};

const practiceJsonLd = {
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
          name: "Practice Dojo",
          item: `${SITE_URL}/practice`,
        },
      ],
    },
    {
      "@type": "Course",
      name: "Japanese Practice Dojo",
      description:
        "Vocabulary, kanji, grammar, listening and reading drills with spaced-repetition flashcards for Japanese learners.",
      provider: {
        "@type": "EducationalOrganization",
        name: SITE_CONFIG.name,
        url: SITE_URL,
      },
      educationalLevel: "Beginner to Advanced (JLPT N5-N1)",
      inLanguage: ["en-US", "ja-JP"],
      isAccessibleForFree: true,
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
      },
    },
  ],
};

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={practiceJsonLd} />
      {children}
    </>
  );
}
