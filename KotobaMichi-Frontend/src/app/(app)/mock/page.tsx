import type { Metadata } from "next";
import { MockExamCatalog } from "@/components/organisms/mock-exam-catalog";

export const metadata: Metadata = {
  title: "Mock exam",
  description: "Timed N3 mock sittings with the real section clocks.",
};

export default function MockExamIndexPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-4">
      <header>
        <p className="font-jp text-sm text-primary">模擬試験</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Mock exam</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          A full sitting, not a quiz. Vocabulary gets 30 minutes, grammar and reading share 70, and listening
          gets 40. The clock locks each block.
        </p>
      </header>
      <MockExamCatalog />
    </div>
  );
}
