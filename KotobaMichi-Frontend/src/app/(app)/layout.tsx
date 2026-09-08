import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "App", template: "%s | KotobaMichi(言葉道)" },
  description: "Explore words, take quizzes, and view your results.",
};

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
