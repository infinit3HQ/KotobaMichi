export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kotobamichi.012140.xyz";

export const SITE_CONFIG = {
  name: "KotobaMichi(言葉道)",
  shortName: "KotobaMichi",
  description:
    "Master Japanese vocabulary, kanji, and JLPT intuitively with interactive speed sprint drills, native speech listening trainer, kana soundboard, and 3D SRS flashcards.",
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
