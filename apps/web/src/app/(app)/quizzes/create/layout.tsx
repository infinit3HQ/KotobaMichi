import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a quiz",
  description: "Build a vocabulary quiz from the words you pick.",
  robots: { index: false, follow: false },
};

export default function QuizCreateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
