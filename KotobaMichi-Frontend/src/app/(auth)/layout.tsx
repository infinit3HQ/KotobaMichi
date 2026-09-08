import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Auth", template: "%s | KotobaMichi(言葉道)" },
  description: "Login or register to save progress and create quizzes.",
  robots: { index: false, follow: false },
};

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
