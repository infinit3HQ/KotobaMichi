import type { Metadata } from "next";
import { SITE_CONFIG, SITE_URL } from "@/lib/seo-config";
import { JsonLd } from "@/components/atoms/json-ld";

export const metadata: Metadata = {
  title: "Japanese Vocabulary Quizzes",
  description:
    "Take short Japanese vocabulary quizzes shared by other learners, or build your own from the words you are studying.",
  alternates: {
    canonical: "/quizzes",
  },
  openGraph: {
    title: "Japanese Vocabulary Quizzes | KotobaMichi",
    description:
      "Short Japanese vocabulary quizzes from other learners, or your own word lists.",
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
    title: "Japanese Vocabulary Quizzes | KotobaMichi",
    description:
      "Short Japanese vocabulary quizzes from other learners, or your own word lists.",
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
      name: "KotobaMichi Japanese Vocabulary Quizzes",
      description:
        "Short quizzes on Japanese vocabulary meanings across JLPT levels.",
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
