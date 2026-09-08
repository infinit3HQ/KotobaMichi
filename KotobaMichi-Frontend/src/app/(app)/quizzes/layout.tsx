import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quizzes",
  description: "Practice with smart quizzes to strengthen your vocabulary.",
  alternates: { canonical: "/quizzes" },
};

export default function QuizzesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
