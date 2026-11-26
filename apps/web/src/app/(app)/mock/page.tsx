import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/atoms/skeleton";
import { PageHeader } from "@/components/molecules/page-header";
import { MockExamCatalog } from "@/components/organisms/mock-exam-catalog";
import { mockExamSummaries } from "@/lib/mock-exam-data";

export const metadata: Metadata = {
  title: "Mock exams",
  description:
    "Timed N1, N2 and N3 mock papers with the real section clocks. Sit the full paper or any single section, in strict or practice mode.",
};

function CatalogFallback() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-9 w-full max-w-md" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export default function MockExamIndexPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="模擬試験"
        title="Mock exams"
        description="Timed N1, N2 and N3 papers with the real section clocks. Sit the full paper in order, or take any single section on its own. Strict mode runs like exam day; practice mode lets you pause and replay the listening."
      />
      <Suspense fallback={<CatalogFallback />}>
        <MockExamCatalog exams={mockExamSummaries()} />
      </Suspense>
    </div>
  );
}
