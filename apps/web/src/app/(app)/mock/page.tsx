import type { Metadata } from "next";
import { PageHeader } from "@/components/molecules/page-header";
import { MockExamCatalog } from "@/components/organisms/mock-exam-catalog";
import { mockExamSummaries } from "@/lib/mock-exam-data";

export const metadata: Metadata = {
  title: "Mock exams",
  description:
    "Timed N2 and N3 mock papers with the real section clocks. Sit the full paper or any single section.",
};

export default function MockExamIndexPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="模擬試験"
        title="Mock exams"
        description="Timed N2 and N3 papers with the real section clocks. Sit the full paper in order, or take any single section on its own. Each section runs on its own clock and locks when time is up."
      />
      <MockExamCatalog exams={mockExamSummaries()} />
    </div>
  );
}
