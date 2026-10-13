import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MockExamSession } from "@/components/organisms/mock-exam-session";
import { MOCK_EXAMS } from "@/lib/mock-exam";

export function generateStaticParams() {
  return MOCK_EXAMS.map((exam) => ({ id: exam.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const exam = MOCK_EXAMS.find((item) => item.id === id);
  return { title: exam?.title ?? "Mock exam" };
}

export default async function MockExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = MOCK_EXAMS.find((item) => item.id === id);
  if (!exam) notFound();
  return <MockExamSession exam={exam} />;
}
