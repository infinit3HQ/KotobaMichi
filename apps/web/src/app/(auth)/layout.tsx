import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Account", template: "%s | KotobaMichi(言葉道)" },
  description: "Sign in or create an account to save progress and build quizzes.",
  robots: { index: false, follow: false },
};

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
