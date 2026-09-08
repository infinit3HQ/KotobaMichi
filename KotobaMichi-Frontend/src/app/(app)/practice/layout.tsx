import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Practice Dojo | KotobaMichi",
  description: "Fast-track your Japanese learning with speed sprints, listening challenges, kana soundboard, and SRS flashcards.",
  alternates: { canonical: "/practice" },
};

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
