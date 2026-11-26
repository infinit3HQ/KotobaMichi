export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kotobamichi.012140.xyz";

export const SITE_CONFIG = {
  name: "KotobaMichi(言葉道)",
  shortName: "KotobaMichi",
  description:
    "Free JLPT study from N5 to N1: vocabulary, kanji, grammar, reading and listening drills with spaced review, plus timed N3, N2 and N1 mock exams.",
  url: SITE_URL,
  ogImage: `${SITE_URL}/opengraph-image`,
  creator: "@kotobamichi",
  keywords: [
    "Japanese learning",
    "JLPT N5",
    "JLPT N4",
    "JLPT N3",
    "JLPT N2",
    "JLPT N1",
    "Japanese vocabulary",
    "Kanji study",
    "Hiragana",
    "Katakana",
    "Japanese flashcards",
    "SRS spaced repetition",
    "Japanese listening practice",
    "Speed drills",
    "Japanese quizzes",
    "JLPT mock exam",
    "JLPT past papers",
    "JLPT N1 mock exam",
    "JLPT N2 mock exam",
    "JLPT N3 mock exam",
    "言葉道",
    "日本語勉強",
  ],
  author: {
    name: "KotobaMichi Team",
    url: SITE_URL,
  },
  links: {
    twitter: "https://twitter.com/kotobamichi",
    github: "https://github.com/infinit3HQ/KotobaMichi",
  },
} as const;
