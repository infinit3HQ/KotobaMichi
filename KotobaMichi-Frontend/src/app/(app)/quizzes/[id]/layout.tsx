import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const API =
    process.env.NEXT_PUBLIC_API_URL || "https://kotobamichi-api.012140.xyz/v1";
  try {
    const res = await fetch(`${API.replace(/\/$/, "")}/quizzes/${id}`, {
      next: { revalidate: 3600 },
      headers: { "content-type": "application/json" },
    });
    if (!res.ok) throw new Error("not ok");
    const data = (await res.json()) as { title?: string; description?: string | null };
    const title = data.title ? `${data.title}` : `Quiz ${id}`;
    const description = data.description || "Take this quiz to practice Japanese vocabulary.";
    return {
      title,
      description,
      alternates: { canonical: `/quizzes/${id}` },
      openGraph: {
        title: `${title} | KotobaMichi`,
        description,
        url: `/quizzes/${id}`,
        type: "website",
      },
      robots: { index: true, follow: true },
    };
  } catch {
    const title = `Quiz ${id}`;
    const description = "Practice Japanese vocabulary with smart quizzes.";
    return {
      title,
      description,
      alternates: { canonical: `/quizzes/${id}` },
      openGraph: {
        title: `${title} | KotobaMichi`,
        description,
        url: `/quizzes/${id}`,
        type: "website",
      },
      robots: { index: true, follow: true },
    };
  }
}

export default function QuizIdLayout({ children }: { children: React.ReactNode }) {
  return children;
}
