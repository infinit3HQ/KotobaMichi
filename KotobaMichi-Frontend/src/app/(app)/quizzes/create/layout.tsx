import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Quiz",
  description: "Create a custom quiz from your selected words.",
  robots: { index: false, follow: false },
};

export default function QuizCreateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
