import type { Metadata } from "next";
import { SITE_CONFIG, SITE_URL } from "@/lib/seo-config";
import { JsonLd } from "@/components/atoms/json-ld";

export const metadata: Metadata = {
  title: "Interactive Japanese Quizzes & Flashcard Reviews",
  description:
    "Test and reinforce your Japanese knowledge with adaptive quizzes, instant answer validation, and spaced repetition tracking.",
  alternates: {
    canonical: "/quizzes",
  },
  openGraph: {
    title: "Japanese Quizzes & Flashcard Reviews | KotobaMichi",
    description:
      "Test and reinforce your Japanese knowledge with adaptive quizzes and spaced repetition tracking.",
    url: `${SITE_URL}/quizzes`,
    type: "website",
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "KotobaMichi Japanese Quizzes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Japanese Quizzes & Flashcard Reviews | KotobaMichi",
    description:
      "Test and reinforce your Japanese knowledge with adaptive quizzes and spaced repetition tracking.",
  },
};

const quizzesJsonLd = {
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
          name: "Quizzes",
          item: `${SITE_URL}/quizzes`,
        },
      ],
    },
    {
      "@type": "Quiz",
      name: "KotobaMichi Japanese Mastery Quizzes",
      description:
        "Adaptive quizzes for testing Japanese vocabulary, readings, and meanings across JLPT tiers.",
      educationalLevel: "JLPT N5 to N1",
      typicalAgeRange: "10-99",
      learningResourceType: "Quiz",
      isAccessibleForFree: true,
      provider: {
        "@type": "EducationalOrganization",
        name: SITE_CONFIG.name,
        url: SITE_URL,
      },
    },
  ],
};

export default function QuizzesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={quizzesJsonLd} />
      {children}
    </>
  );
}
