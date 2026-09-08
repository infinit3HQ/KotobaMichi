import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1/";
  try {
    const res = await fetch(`${API.replace(/\/$/, "")}/quizzes/${id}`, {
      next: { revalidate: 3600 },
      headers: { "content-type": "application/json" },
    });
    if (!res.ok) throw new Error("not ok");
    const data = (await res.json()) as { title?: string; description?: string | null };
    return {
      title: data.title ? `${data.title}` : `Quiz ${id}`,
      description: data.description || "Take this quiz to practice Japanese vocabulary.",
      alternates: { canonical: `/quizzes/${id}` },
      robots: { index: true, follow: true },
    };
  } catch {
    return {
      title: `Quiz ${id}`,
      description: "Practice Japanese vocabulary with smart quizzes.",
      alternates: { canonical: `/quizzes/${id}` },
      robots: { index: true, follow: true },
    };
  }
}

export default function QuizIdLayout({ children }: { children: React.ReactNode }) {
  return children;
}
