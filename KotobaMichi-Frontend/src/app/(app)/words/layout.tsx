import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Words Explorer",
  description: "Browse and search Japanese words with kana, kanji, and meanings.",
  alternates: { canonical: "/words" },
};

export default function WordsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
