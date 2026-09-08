import type { Metadata } from "next";
import { SITE_CONFIG, SITE_URL } from "@/lib/seo-config";
import { JsonLd } from "@/components/atoms/json-ld";

export const metadata: Metadata = {
  title: "Interactive Practice Dojo – Speed Sprint, Kana Soundboard & 3D SRS",
  description:
    "Accelerate your Japanese fluency with 60-second speed sprints, native audio speech listening trainer, kana soundboard, and 3D spaced repetition flashcards.",
  alternates: {
    canonical: "/practice",
  },
  openGraph: {
    title: "Interactive Practice Dojo | KotobaMichi",
    description:
      "Accelerate your Japanese fluency with 60-second speed sprints, native audio speech listening trainer, kana soundboard, and 3D SRS flashcards.",
    url: `${SITE_URL}/practice`,
    type: "website",
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "KotobaMichi Interactive Practice Dojo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Interactive Practice Dojo | KotobaMichi",
    description:
      "Accelerate your Japanese fluency with 60-second speed sprints, native audio speech listening trainer, kana soundboard, and 3D SRS flashcards.",
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
      name: "Interactive Japanese Practice Dojo",
      description:
        "High-speed drills, listening practice, and spaced repetition flashcards for Japanese learners.",
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
