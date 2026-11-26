import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MockExamSession } from "@/components/organisms/mock-exam-session";
import { examLabel } from "@/lib/exam-plan";
import { getMockExam, MOCK_EXAMS } from "@/lib/mock-exam-data";

export function generateStaticParams() {
  return MOCK_EXAMS.map((exam) => ({ id: exam.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const exam = getMockExam(id);
  if (!exam) return { title: "Mock exam", robots: { index: false } };
  const label = examLabel(exam.id);
  const title = `JLPT ${label} Mock Exam`;
  const minutes = exam.sections.reduce((sum, section) => sum + section.minutes, 0);
  const description = `Free timed JLPT ${label} mock exam: ${exam.sections.length} sections, ${minutes} minutes, with the listening audio. Sit it in strict exam mode or pausable practice mode and see your score for each section.`;
  return {
    title,
    description,
    alternates: { canonical: `/mock/${exam.id}` },
    openGraph: { title: `${title} | KotobaMichi`, description, url: `/mock/${exam.id}`, type: "website" },
    twitter: { card: "summary_large_image", title: `${title} | KotobaMichi`, description },
  };
}

export default async function MockExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = getMockExam(id);
  if (!exam) notFound();
  return <MockExamSession exam={exam} />;
}
