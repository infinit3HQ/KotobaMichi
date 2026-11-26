"use client";

import { PageHeader } from "@/components/molecules/page-header";
import { ProtectedRoute } from "@/components/organisms/protected-route";
import { MistakeReview } from "@/components/organisms/review/mistake-review";
import { useLoopText } from "@/hooks/use-loop-text";

export default function ReviewPage() {
  const text = useLoopText();
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl space-y-6 sm:space-y-8">
        <PageHeader eyebrow="復習" title={text.review.title} description={text.review.description} />
        <MistakeReview />
      </div>
    </ProtectedRoute>
  );
}
